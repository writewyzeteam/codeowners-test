# Backend API - User Management
from flask import Flask, jsonify, request
from database.connection import get_db
from security.auth.jwt_handler import create_token, verify_token
from functools import wraps

app = Flask(__name__)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        user_id = verify_token(token.replace('Bearer ', ''))
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated

@app.route('/api/users', methods=['GET'])
@require_auth
def get_users():
    db = get_db()
    # SQL injection vulnerability
    user_filter = request.args.get('filter', '')
    query = f'SELECT * FROM users WHERE username LIKE "%{user_filter}%"'
    users = db.execute(query).fetchall()
    return jsonify(users)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # SQL injection vulnerability
    db = get_db()
    user = db.execute(
        f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    ).fetchone()
    
    if user:
        token = create_token(user['id'])
        return jsonify({'token': token})
    return jsonify({'error': 'Invalid credentials'}), 401
