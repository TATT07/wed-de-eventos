from functools import wraps
from flask import session, redirect, url_for, jsonify, request

# Lista de rutas permitidas sin autenticación (usando los nuevos nombres de blueprint)
ALLOWED_ROUTES = ['main_routes.index', 'main_routes.eventos', 'auth_routes.login', 
                 'auth_routes.register', 'static', 'event_routes.api_events']

def check_auth():
    """Middleware para verificar autenticación"""
    if request.endpoint not in ALLOWED_ROUTES and 'user' not in session:
        return redirect(url_for('auth_routes.login'))

def auth_required(f):
    """Decorator para rutas que requieren autenticación"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            if request.headers.get('Content-Type') == 'application/json':
                return jsonify({'success': False, 'message': 'No autenticado'}), 401
            return redirect(url_for('auth_routes.login'))
        return f(*args, **kwargs)
    return decorated_function