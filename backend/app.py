from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, Usuario, Administrador, Producto, Factura, CarritoCompras
from api import api

app = Flask(__name__)
app.config.from_object(Config)

# Configuración de CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Inicialización de la base de datos y JWT
db.init_app(app)
jwt = JWTManager(app)

# Registro del Blueprint para las rutas API
app.register_blueprint(api)

# Manejadores de errores
@app.errorhandler(400)
def bad_request_error(error):
    return jsonify({"error": "Bad Request"}), 400

@app.errorhandler(401)
def unauthorized_error(error):
    return jsonify({"error": "Unauthorized"}), 401

@app.errorhandler(403)
def forbidden_error(error):
    return jsonify({"error": "Forbidden"}), 403

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Not Found"}), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": "Internal Server Error"}), 500

@app.errorhandler(503)
def service_unavailable_error(error):
    return jsonify({"error": "Service Unavailable"}), 503

# Punto de entrada para ejecutar la aplicación Flask
if __name__ == '__main__':
    app.run(debug=True)
