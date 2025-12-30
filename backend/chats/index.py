import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления чатами'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            user_id = event.get('headers', {}).get('X-User-Id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing X-User-Id header'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT 
                    c.id as chat_id,
                    u.id as user_id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    u.avatar_url,
                    (SELECT text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
                FROM chats c
                JOIN chat_participants cp1 ON cp1.chat_id = c.id AND cp1.user_id = %s
                JOIN chat_participants cp2 ON cp2.chat_id = c.id AND cp2.user_id != %s
                JOIN users u ON u.id = cp2.user_id
                WHERE u.id NOT IN (SELECT blocked_id FROM blocked_users WHERE blocker_id = %s)
                ORDER BY last_message_time DESC NULLS LAST
            """, (user_id, user_id, user_id))
            
            chats = []
            for row in cur.fetchall():
                chat = dict(row)
                chats.append(chat)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chats': chats}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user1_id = body.get('user1Id')
            user2_id = body.get('user2Id')
            
            if not all([user1_id, user2_id]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing user IDs'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT c.id FROM chats c
                JOIN chat_participants cp1 ON cp1.chat_id = c.id AND cp1.user_id = %s
                JOIN chat_participants cp2 ON cp2.chat_id = c.id AND cp2.user_id = %s
                LIMIT 1
            """, (user1_id, user2_id))
            
            existing = cur.fetchone()
            
            if existing:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'chatId': existing['id']}),
                    'isBase64Encoded': False
                }
            
            cur.execute("INSERT INTO chats DEFAULT VALUES RETURNING id")
            chat_id = cur.fetchone()['id']
            
            cur.execute("INSERT INTO chat_participants (chat_id, user_id) VALUES (%s, %s), (%s, %s)", 
                       (chat_id, user1_id, chat_id, user2_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chatId': chat_id}),
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
