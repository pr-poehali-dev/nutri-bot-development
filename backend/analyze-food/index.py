"""
Анализ фото еды через GPT-4 Vision.
Принимает base64-изображение, возвращает детальный состав КБЖУ,
список ингредиентов и комментарий нутрициолога.
"""

import json
import os
import base64
import urllib.request
import urllib.error

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

PROMPT = """Ты опытный нутрициолог и диетолог. Тебе прислали фото еды.

Твоя задача — максимально точно определить:
1. Название блюда (на русском)
2. Все видимые ингредиенты с примерным весом каждого
3. Общий вес порции
4. КБЖУ на всю порцию: калории, белки (г), жиры (г), углеводы (г)
5. Краткий комментарий нутрициолога (1-2 предложения)

Используй реальные данные из баз питания (USDA, российские таблицы калорийности).
Если блюдо домашнее — определи ингредиенты визуально и рассчитай КБЖУ по составу.
Если на фото несколько блюд — считай суммарно всё что видишь на тарелке/столе.
Если фото нечёткое — давай приблизительную оценку, не отказывайся от анализа.

Отвечай СТРОГО в формате JSON (без markdown, без ```):
{
  "dish": "название блюда",
  "weight": "примерный вес порции, например: ~350 г",
  "calories": число,
  "protein": число,
  "fat": число,
  "carbs": число,
  "ingredients": [
    {"name": "ингредиент", "weight": "вес в г", "calories": число}
  ],
  "comment": "комментарий нутрициолога"
}"""


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}

    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return {'statusCode': 503, 'headers': CORS, 'body': json.dumps({'error': 'OpenAI API key not configured'})}

    body = json.loads(event.get('body') or '{}')
    image_b64 = body.get('image')
    image_url = body.get('image_url')

    if not image_b64 and not image_url:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'No image provided'})}

    # Определяем content для image
    if image_b64:
        # Определяем mime-тип по сигнатуре
        raw = base64.b64decode(image_b64[:16])
        if raw[:3] == b'\xff\xd8\xff':
            mime = 'image/jpeg'
        elif raw[:8] == b'\x89PNG\r\n\x1a\n':
            mime = 'image/png'
        elif raw[:6] in (b'GIF87a', b'GIF89a'):
            mime = 'image/gif'
        else:
            mime = 'image/jpeg'
        image_content = {
            'type': 'image_url',
            'image_url': {'url': f'data:{mime};base64,{image_b64}', 'detail': 'high'}
        }
    else:
        image_content = {
            'type': 'image_url',
            'image_url': {'url': image_url, 'detail': 'high'}
        }

    payload = json.dumps({
        'model': 'gpt-4o',
        'messages': [
            {
                'role': 'user',
                'content': [
                    image_content,
                    {'type': 'text', 'text': PROMPT}
                ]
            }
        ],
        'max_tokens': 800,
        'temperature': 0.3,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        openai_data = json.loads(resp.read().decode('utf-8'))

    raw_text = openai_data['choices'][0]['message']['content'].strip()

    # Чистим если вдруг есть markdown-обёртка
    if raw_text.startswith('```'):
        lines = raw_text.split('\n')
        raw_text = '\n'.join(lines[1:-1] if lines[-1].strip() == '```' else lines[1:])

    result = json.loads(raw_text)

    # Гарантируем числовые поля
    for field in ('calories', 'protein', 'fat', 'carbs'):
        result[field] = int(round(float(result.get(field, 0))))

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps(result, ensure_ascii=False)
    }
