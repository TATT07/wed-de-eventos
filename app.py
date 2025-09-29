from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from firebase_config import firebase_manager
import json
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_muy_segura_aqui_12345'

# Lista de rutas permitidas sin autenticación
ALLOWED_ROUTES = ['index', 'eventos', 'login', 'register', 'static', 'api_events']

@app.before_request
def check_auth():
    """Middleware para verificar autenticación"""
    if request.endpoint not in ALLOWED_ROUTES and 'user' not in session:
        return redirect(url_for('login'))

def translate_error_message(error):
    """Traducir mensajes de error de Firebase a español"""
    error_translations = {
        'INVALID_LOGIN_CREDENTIALS': 'Credenciales inválidas',
        'TOO_MANY_ATTEMPTS_TRY_LATER': 'Demasiados intentos. Intenta más tarde',
        'EMAIL_NOT_FOUND': 'Email no registrado',
        'INVALID_PASSWORD': 'Contraseña incorrecta',
        'EMAIL_EXISTS': 'El email ya está registrado',
        'WEAK_PASSWORD': 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres',
        'INVALID_EMAIL': 'Email inválido',
        'MISSING_PASSWORD': 'La contraseña es requerida',
        'MISSING_EMAIL': 'El email es requerido',
        'USER_DISABLED': 'Esta cuenta ha sido deshabilitada'
    }
    
    for key, translation in error_translations.items():
        if key in error:
            return translation
    
    return error

# ===== RUTAS PRINCIPALES =====
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/eventos')
def eventos():
    return render_template('eventos.html')

@app.route('/login', methods=['GET', 'POST'])
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

@app.route('/register', methods=['GET', 'POST'])
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





# ===== DASHBOARD Y GESTIÓN DE EVENTOS =====
@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    
    return render_template('dashboard.html', user=session['user'])

@app.route('/api/my-events')
def api_my_events():
    """API para obtener eventos del usuario actual"""
    if 'user' not in session:
        return jsonify({'success': False, 'message': 'No autenticado'})
    
    print("=== DEBUG: Obteniendo eventos del usuario ===")
    print("Usuario en sesión:", session['user']['uid'])
    
    result = firebase_manager.get_user_events(
        session['user']['uid'], 
        session['user']['idToken']
    )
    
    return jsonify(result)

@app.route('/api/events', methods=['GET', 'POST'])
def api_events():
    """API para obtener y crear eventos"""
    if request.method == 'GET':
        # Pública - cualquiera puede ver eventos
        page = int(request.args.get('page', 1))
        category = request.args.get('category', 'all')
        search = request.args.get('search', '')
        
        result = firebase_manager.get_events(page=page, category=category, search=search)
        return jsonify(result)
    
    elif request.method == 'POST':
        # Protegida - solo usuarios autenticados pueden crear
        if 'user' not in session:
            return jsonify({'success': False, 'message': 'No autenticado'})
        
        try:
            # Obtener datos del formulario
            event_data = {
                'title': request.form.get('title', '').strip(),
                'description': request.form.get('description', '').strip(),
                'location': request.form.get('location', '').strip(),
                'date': request.form.get('date', '').strip(),
                'time': request.form.get('time', '').strip(),
                'organizer': request.form.get('organizer', '').strip(),
                'category': request.form.get('category', 'General').strip(),
                'price': request.form.get('price', 'Gratis').strip(),
                'maxAttendees': request.form.get('maxAttendees', '100'),
                'creatorId': session['user']['uid'],
                'creatorEmail': session['user']['email'],
                'imageUrl': ''  # Inicialmente vacío
            }
            
            print("=== DEBUG: Datos del evento recibidos ===")
            print(event_data)
            
            # Validar campos requeridos
            required_fields = ['title', 'description', 'location', 'date', 'time', 'organizer']
            missing_fields = [field for field in required_fields if not event_data.get(field)]
            
            if missing_fields:
                return jsonify({'success': False, 'message': f'Campos requeridos faltantes: {", ".join(missing_fields)}'})
            
            # PRIMERO: Subir imagen si existe
            image_url = ''
            if 'image' in request.files:
                image_file = request.files['image']
                if image_file.filename != '' and image_file.content_type.startswith('image/'):
                    print("=== DEBUG: Subiendo imagen primero ===")
                    # Crear un ID temporal para la imagen
                    temp_event_id = f"temp-{int(datetime.utcnow().timestamp())}"
                    upload_result = firebase_manager.upload_image(image_file, temp_event_id)
                    if upload_result['success']:
                        image_url = upload_result['imageUrl']
                        event_data['imageUrl'] = image_url
                        print("=== DEBUG: Imagen subida exitosamente ===")
                        print("URL de imagen:", image_url)
            
            # SEGUNDO: Crear el evento en Firestore con todos los datos
            print("=== DEBUG: Creando evento en Firestore ===")
            result = firebase_manager.create_event(event_data, session['user']['idToken'])
            
            print("=== DEBUG: Resultado de crear evento ===")
            print(result)
            
            if result['success']:
                event_id = result['eventId']
                return jsonify({
                    'success': True, 
                    'message': 'Evento creado exitosamente', 
                    'eventId': event_id
                })
            else:
                return jsonify(result)
            
        except Exception as e:
            error_msg = f'Error del servidor: {str(e)}'
            print("=== DEBUG: Excepción en api_events ===")
            print(error_msg)
            return jsonify({'success': False, 'message': error_msg})


@app.route('/api/events/<event_id>', methods=['PUT', 'DELETE'])
def api_event_management(event_id):
    """API para actualizar y eliminar eventos - Solo el creador puede modificar"""
    if 'user' not in session:
        return jsonify({'success': False, 'message': 'No autenticado'})
    
    if request.method == 'PUT':
        try:
            event_data = request.get_json()
            
            print(f"=== DEBUG: Actualizando evento {event_id} ===")
            print("Datos recibidos:", event_data)
            
            # Asegurar que los campos críticos se mantengan
            # Primero, obtener el evento actual para preservar campos importantes
            user_events_result = firebase_manager.get_user_events(
                session['user']['uid'], 
                session['user']['idToken']
            )
            
            if user_events_result['success']:
                current_event = None
                for event in user_events_result['events']:
                    if event['id'] == event_id:
                        current_event = event
                        break
                
                if current_event:
                    # Preservar campos críticos que no vienen en el formulario de edición
                    event_data.setdefault('creatorId', current_event['creatorId'])
                    event_data.setdefault('creatorEmail', current_event['creatorEmail'])
                    event_data.setdefault('imageUrl', current_event.get('imageUrl', ''))
                    event_data.setdefault('price', current_event.get('price', 'Gratis'))
                    event_data.setdefault('category', current_event.get('category', 'General'))
                    event_data.setdefault('maxAttendees', current_event.get('maxAttendees', 100))
            
            # Asegurar que el estado se mantenga como 'active'
            event_data['status'] = 'active'
            
            # Agregar timestamp de actualización
            event_data['updatedAt'] = datetime.utcnow().isoformat() + "Z"
            
            print("=== DEBUG: Datos finales para actualización ===")
            print(event_data)
            
            result = firebase_manager.update_event(event_id, event_data, session['user']['idToken'])
            return jsonify(result)
        except Exception as e:
            print(f"=== DEBUG: Error en actualización: {str(e)}")
            return jsonify({'success': False, 'message': str(e)})
    
    elif request.method == 'DELETE':
        # En lugar de eliminar físicamente, marcar como inactivo
        try:
            event_data = {
                'status': 'inactive',
                'updatedAt': datetime.utcnow().isoformat() + "Z"
            }
            result = firebase_manager.update_event(event_id, event_data, session['user']['idToken'])
            return jsonify(result)
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)