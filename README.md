# Documentación del Proyecto Flask - Sistema de Gestión de Eventos
## Descripción General

Este proyecto es una aplicación web desarrollada con Flask que permite la gestión y visualización de eventos. Los usuarios pueden registrarse, iniciar sesión, crear eventos, y explorar eventos existentes. La aplicación utiliza Firebase para autenticación y almacenamiento de datos.


## Estructura del Proyecto

```
proyecto/
├── app.py                 
├── firebase_config.py    
├── templates/            
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── eventos.html
│   └── dashboard.html
└── static/             
```

### Dependencias Principales

- **Flask:** Framework web principal
- **Firebase Admin SDK:** Para integración con Firebase
- **Python-dotenv:** Manejo de variables de entorno (asumido)

### Configuración
#### Variables de Entorno
```
app.secret_key='tu_clave_secreta_muy_segura_aqui_12345'  # Clave para sesiones
```

#### Configuración Firebase

El proyecto requiere un archivo **firebase_config.py** que maneje la conexión con Firebase para:

- Autenticación de usuarios

- Almacenamiento en Firestore para el guardado de los eventos


#### Funcionalidades Principales

1. Autenticación y Autorización
Rutas Públicas (sin autenticación)
python

```
ALLOWED_ROUTES = ['index', 'eventos', 'login', 'register', 'static', 'api_events']
```

#### Middleware de Autenticación

```
@app.before_request
def check_auth():
    """Verifica si el usuario está autenticado para rutas protegidas"""
```

#### Sistema de Login/Registro

- **Registro:** Validación de email, contraseña y confirmación
- **Login:** Autenticación con Firebase
- **Traducción de errores:** Mensajes de error de Firebase en español

#### Gestión de Eventos
**Características:**
- Creación de eventos con imagen
- Listado público de eventos
- Gestión personal de eventos (dashboard)
- Categorización y búsqueda
- API RESTful para operaciones CRUD

#### Campos de Evento:
```
event_data = {
    'title', 'description', 'location', 'date', 'time',
    'organizer', 'category', 'price', 'maxAttendees',
    'creatorId', 'creatorEmail', 'imageUrl'
}
```

### Ejecución del Proyecto

1. Se debe crear un entorno vitual de Python dentro de la carpeta raiz del proyecto:

```
python -m venv venv
```

2. Se debe activar el entorno virtual:

```
venv\Scripts\activate
```

3. Instalar las dependencias que estan almacenadas dentro del archivo **requirements.txt**

```
pip install -r requirements.txt
```

4. Ejecutar dentro de la carpeta raiz del proyecto desde la terminal con el comando:

```
python app.py
```

#### La aplicación se ejecuta en:
- **Host:** 0.0.0.0 (accesible desde cualquier IP)
- **Puerto:** 5000
- **Modo:** Debug activado