from flask import render_template, request, session, jsonify, Blueprint
from firebase_manager import firebase_manager
from middleware.auth_middleware import auth_required
from datetime import datetime

event_bp = Blueprint('event_routes', __name__)

@event_bp.route('/dashboard')
@auth_required
def dashboard():
    return render_template('dashboard.html', user=session['user'])

@event_bp.route('/api/my-events')
@auth_required
def api_my_events():
    """API para obtener eventos del usuario actual"""
    print("=== DEBUG: Obteniendo eventos del usuario ===")
    print("Usuario en sesión:", session['user']['uid'])
    
    result = firebase_manager.get_user_events(
        session['user']['uid'], 
        session['user']['idToken']
    )
    
    return jsonify(result)

@event_bp.route('/api/events', methods=['GET', 'POST'])
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
            return jsonify({'success': False, 'message': 'No autenticado'}), 401
        
        try:
            event_data = _parse_event_form_data(request)
            
            # Validar campos requeridos
            validation_result = _validate_event_data(event_data)
            if not validation_result['success']:
                return jsonify(validation_result)
            
            # Procesar imagen
            image_result = _process_event_image(request, event_data)
            if not image_result['success']:
                return jsonify(image_result)
            
            # Crear evento en Firestore - USAR DICCIONARIO DIRECTAMENTE
            print("=== DEBUG: Creando evento en Firestore ===")
            print("Datos del evento:", event_data)
            
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

@event_bp.route('/api/events/<event_id>', methods=['PUT', 'DELETE'])
@auth_required
def api_event_management(event_id):
    """API para actualizar y eliminar eventos - Solo el creador puede modificar"""
    if request.method == 'PUT':
        try:
            event_data = request.get_json()
            result = firebase_manager.update_event(event_id, event_data, session['user']['idToken'])
            return jsonify(result)
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})
    
    elif request.method == 'DELETE':
        result = firebase_manager.delete_event(event_id, session['user']['idToken'])
        return jsonify(result)

def _parse_event_form_data(request):
    """Parsear datos del formulario de evento - DEVOLVER DICCIONARIO"""
    event_data = {
        'title': request.form.get('title', '').strip(),
        'description': request.form.get('description', '').strip(),
        'location': request.form.get('location', '').strip(),
        'date': request.form.get('date', '').strip(),
        'time': request.form.get('time', '').strip(),
        'organizer': request.form.get('organizer', '').strip(),
        'category': request.form.get('category', 'General').strip(),
        'price': request.form.get('price', 'Gratis').strip(),
        'maxAttendees': int(request.form.get('maxAttendees', 100)),
        'creatorId': session['user']['uid'],
        'creatorEmail': session['user']['email'],
        'imageUrl': '',  # Inicialmente vacío
        'status': 'active'
    }
    
    print("=== DEBUG: Datos del evento parseados ===")
    print("Datos:", event_data)
    
    return event_data

def _validate_event_data(event_data):
    """Validar datos del evento"""
    required_fields = ['title', 'description', 'location', 'date', 'time', 'organizer']
    missing_fields = [field for field in required_fields if not event_data.get(field)]
    
    if missing_fields:
        return {
            'success': False, 
            'message': f'Campos requeridos faltantes: {", ".join(missing_fields)}'
        }
    
    return {'success': True}

def _process_event_image(request, event_data):
    """Procesar imagen del evento"""
    if 'image' in request.files:
        image_file = request.files['image']
        if image_file.filename != '' and image_file.content_type.startswith('image/'):
            print("=== DEBUG: Subiendo imagen primero ===")
            # Crear un ID temporal para la imagen
            temp_event_id = f"temp-{int(datetime.utcnow().timestamp())}"
            upload_result = firebase_manager.upload_image(image_file, temp_event_id)
            if upload_result['success']:
                event_data['imageUrl'] = upload_result['imageUrl']
                print("=== DEBUG: Imagen subida exitosamente ===")
                print("URL de imagen:", event_data['imageUrl'])
                return {'success': True}
            else:
                return {'success': False, 'message': 'Error al subir imagen'}
    
    return {'success': True}