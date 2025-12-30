import json
import os
import psycopg2
import hashlib
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления профилем пользователя и поиска'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            search_query = query_params.get('search', '').strip()
            user_id = event.get('headers', {}).get('X-User-Id')
            
            if search_query:
                if not search_query.startswith('@'):
                    search_query = '@' + search_query
                
                if user_id:
                    cur.execute(
                        "SELECT id, username, first_name, last_name, avatar_url FROM users WHERE username ILIKE %s AND id != %s AND id NOT IN (SELECT blocked_id FROM blocked_users WHERE blocker_id = %s) LIMIT 20",
                        (search_query + '%', user_id, user_id)
                    )
                else:
                    cur.execute(
                        "SELECT id, username, first_name, last_name, avatar_url FROM users WHERE username ILIKE %s LIMIT 20",
                        (search_query + '%',)
                    )
                
                users = [dict(row) for row in cur.fetchall()]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing search query'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('userId')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing userId'}),
                    'isBase64Encoded': False
                }
            
            update_fields = []
            params = []
            
            if 'username' in body:
                username = body['username'].strip()
                if not username.startswith('@'):
                    username = '@' + username
                update_fields.append('username = %s')
                params.append(username)
            
            if 'firstName' in body:
                update_fields.append('first_name = %s')
                params.append(body['firstName'])
            
            if 'lastName' in body:
                update_fields.append('last_name = %s')
                params.append(body['lastName'])
            
            if 'email' in body:
                update_fields.append('email = %s')
                params.append(body['email'])
            
            if 'avatarUrl' in body:
                update_fields.append('avatar_url = %s')
                params.append(body['avatarUrl'])
            
            if 'language' in body:
                update_fields.append('language = %s')
                params.append(body['language'])
            
            if 'theme' in body:
                update_fields.append('theme = %s')
                params.append(body['theme'])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(user_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s RETURNING id, username, email, first_name, last_name, avatar_url, language, theme"
            
            cur.execute(query, params)
            user = cur.fetchone()
            conn.commit()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': dict(user)}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'block':
                blocker_id = body.get('blockerId')
                blocked_id = body.get('blockedId')
                
                if not all([blocker_id, blocked_id]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing blocker or blocked ID'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (blocker_id, blocked_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'unblock':
                blocker_id = body.get('blockerId')
                blocked_id = body.get('blockedId')
                
                if not all([blocker_id, blocked_id]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing blocker or blocked ID'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "DELETE FROM blocked_users WHERE blocker_id = %s AND blocked_id = %s",
                    (blocker_id, blocked_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
