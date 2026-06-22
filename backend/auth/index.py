"""
Авторизация через Telegram WebApp initData.
Верифицирует данные пользователя, создаёт/обновляет запись в users,
выдаёт сессионный токен.
"""

import json
import os
import hashlib
import hmac
import secrets
from urllib.parse import parse_qs, unquote
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p91567892_nutri_bot_developmen')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def verify_telegram_init_data(init_data: str, bot_token: str) -> dict | None:
    parsed = parse_qs(init_data, keep_blank_values=True)
    data_check_string_parts = []
    hash_value = None

    for key, values in sorted(parsed.items()):
        if key == 'hash':
            hash_value = values[0]
        else:
            data_check_string_parts.append(f"{key}={unquote(values[0])}")

    if not hash_value:
        return None

    data_check_string = '\n'.join(sorted(data_check_string_parts))
    secret_key = hmac.new(b'WebAppData', bot_token.encode(), hashlib.sha256).digest()
    expected_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_hash, hash_value):
        return None

    user_raw = parsed.get('user', [None])[0]
    if not user_raw:
        return None

    return json.loads(unquote(user_raw))


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    init_data = body.get('initData', '')

    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')

    # Dev-режим: принимаем тестового пользователя без верификации
    if init_data == 'dev_test' or not bot_token:
        tg_user = {'id': 999999, 'first_name': 'Тест', 'last_name': 'Пользователь', 'username': 'testuser'}
    else:
        tg_user = verify_telegram_init_data(init_data, bot_token)
        if not tg_user:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Invalid Telegram data'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    user_id = tg_user['id']
    username = tg_user.get('username')
    first_name = tg_user.get('first_name', '')
    last_name = tg_user.get('last_name', '')
    photo_url = tg_user.get('photo_url')

    cur.execute(
        f"""
        INSERT INTO {SCHEMA}.users (id, telegram_username, first_name, last_name, photo_url, updated_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON CONFLICT (id) DO UPDATE SET
            telegram_username = EXCLUDED.telegram_username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            photo_url = EXCLUDED.photo_url,
            updated_at = NOW()
        """,
        (user_id, username, first_name, last_name, photo_url)
    )

    token = secrets.token_hex(32)
    cur.execute(
        f"""
        INSERT INTO {SCHEMA}.sessions (token, user_id, expires_at)
        VALUES (%s, %s, NOW() + INTERVAL '30 days')
        """,
        (token, user_id)
    )

    cur.execute(
        f"SELECT gender, age, height_cm, weight_kg, activity_factor, goal, calories_goal, protein_goal, fat_goal, carbs_goal FROM {SCHEMA}.profiles WHERE user_id = %s",
        (user_id,)
    )
    profile_row = cur.fetchone()
    profile = None
    if profile_row:
        profile = {
            'gender': profile_row[0],
            'age': profile_row[1],
            'height_cm': profile_row[2],
            'weight_kg': float(profile_row[3]),
            'activity_factor': float(profile_row[4]),
            'goal': profile_row[5],
            'calories_goal': profile_row[6],
            'protein_goal': profile_row[7],
            'fat_goal': profile_row[8],
            'carbs_goal': profile_row[9],
        }

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({
            'token': token,
            'user': {
                'id': user_id,
                'first_name': first_name,
                'last_name': last_name,
                'username': username,
                'photo_url': photo_url,
            },
            'profile': profile,
        })
    }
