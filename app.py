from flask import Flask
from routes.main_routes import main_bp
from routes.auth_routes import auth_bp
from routes.event_routes import event_bp
from middleware.auth_middleware import check_auth

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_muy_segura_aqui_12345'

# Registrar blueprints
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(event_bp)

# Configurar middleware
app.before_request(check_auth)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)