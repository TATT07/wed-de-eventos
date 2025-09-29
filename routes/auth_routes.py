from flask import render_template, request, session, jsonify, Blueprint, redirect, url_for
from firebase_manager import firebase_manager
from utils.error_utils import translate_error_message

auth_bp = Blueprint('auth_routes', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            
            if not email or not password:
                return jsonify({'success': False, 'message': 'Email y contraseña son requeridos'})
            
            result = firebase_manager.login_user(email, password)
            
            if result['success']:
                user_data = result['data']
                session['user'] = {
                    'uid': user_data['localId'],
                    'email': user_data['email'],
                    'idToken': user_data['idToken'],
                    'refreshToken': user_data.get('refreshToken', '')
                }
                return jsonify({'success': True, 'message': '¡Login exitoso! Redirigiendo...'})
            else:
                error_message = translate_error_message(result['error'])
                return jsonify({'success': False, 'message': error_message})
            
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error del servidor: {str(e)}'})
    
    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            confirm_password = data.get('confirm_password', '').strip()
            
            if not email or not password:
                return jsonify({'success': False, 'message': 'Email y contraseña son requeridos'})
            
            if password != confirm_password:
                return jsonify({'success': False, 'message': 'Las contraseñas no coinciden'})
            
            if len(password) < 6:
                return jsonify({'success': False, 'message': 'La contraseña debe tener al menos 6 caracteres'})
            
            result = firebase_manager.register_user(email, password)
            
            if result['success']:
                return jsonify({'success': True, 'message': '¡Usuario registrado exitosamente! Ya puedes iniciar sesión.'})
            else:
                error_message = translate_error_message(result['error'])
                return jsonify({'success': False, 'message': error_message})
            
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error del servidor: {str(e)}'})
    
    return render_template('register.html')

@auth_bp.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('main_routes.index'))