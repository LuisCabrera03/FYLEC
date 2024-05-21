from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes import api

app = Flask(__name__)
app.config.from_object(Config)

# Configuración de CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Inicialización de la base de datos y JWT
db.init_app(app)
jwt = JWTManager(app)

# Registro del Blueprint para las rutas API
app.register_blueprint(api)

# Punto de entrada para ejecutar la aplicación Flask
if __name__ == '__main__':
    app.run(debug=True)
