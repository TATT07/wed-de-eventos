from flask import render_template, Blueprint

main_bp = Blueprint('main_routes', __name__)

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/eventos')
def eventos():
    return render_template('eventos.html')