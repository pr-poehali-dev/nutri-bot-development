"""
GET  / — получить профиль пользователя по сессионному токену
POST / — сохранить/обновить профиль (норма КБЖУ, параметры тела)
"""

import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p91567892_nutri_bot_developmen')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}


def get_user_id(cur, token: str) -> int | None:
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Session-Token') or headers.get('x-session-token')

    if not token:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'No session token'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    user_id = get_user_id(cur, token)
    if not user_id:
        cur.close()
        conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Invalid or expired session'})}

    method = event.get('httpMethod')

    if method == 'GET':
        cur.execute(
            f"""
            SELECT gender, age, height_cm, weight_kg, activity_factor, goal,
                   calories_goal, protein_goal, fat_goal, carbs_goal, updated_at
            FROM {SCHEMA}.profiles WHERE user_id = %s
            """,
            (user_id,)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Profile not found'})}

        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({
                'gender': row[0],
                'age': row[1],
                'height_cm': row[2],
                'weight_kg': float(row[3]),
                'activity_factor': float(row[4]),
                'goal': row[5],
                'calories_goal': row[6],
                'protein_goal': row[7],
                'fat_goal': row[8],
                'carbs_goal': row[9],
                'updated_at': str(row[10]),
            })
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')

        gender = body.get('gender', 'male')
        age = int(body.get('age', 25))
        height_cm = int(body.get('height_cm', 170))
        weight_kg = float(body.get('weight_kg', 70))
        activity_factor = float(body.get('activity_factor', 1.375))
        goal = body.get('goal', 'keep')
        calories_goal = int(body.get('calories_goal', 2000))
        protein_goal = int(body.get('protein_goal', 150))
        fat_goal = int(body.get('fat_goal', 65))
        carbs_goal = int(body.get('carbs_goal', 200))

        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.profiles
                (user_id, gender, age, height_cm, weight_kg, activity_factor, goal,
                 calories_goal, protein_goal, fat_goal, carbs_goal, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                gender = EXCLUDED.gender,
                age = EXCLUDED.age,
                height_cm = EXCLUDED.height_cm,
                weight_kg = EXCLUDED.weight_kg,
                activity_factor = EXCLUDED.activity_factor,
                goal = EXCLUDED.goal,
                calories_goal = EXCLUDED.calories_goal,
                protein_goal = EXCLUDED.protein_goal,
                fat_goal = EXCLUDED.fat_goal,
                carbs_goal = EXCLUDED.carbs_goal,
                updated_at = NOW()
            """,
            (user_id, gender, age, height_cm, weight_kg, activity_factor, goal,
             calories_goal, protein_goal, fat_goal, carbs_goal)
        )
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'success': True, 'calories_goal': calories_goal})
        }

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
