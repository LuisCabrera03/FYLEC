import os
from datetime import timedelta

# Clase de configuración para la aplicación
class Config:
    # Cadena de conexión a la base de datos MySQL utilizando el conector pymysql
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/dtfylec'
    # Clave secreta utilizada por Flask-JWT-Extended para crear y verificar tokens JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secretoLOL!')

    # Configuración de la persistencia del token JWT 
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # Configuración de CORS para permitir solicitudes desde el dominio de producción
    CORS_RESOURCES = {r"/api/*": {"origins": "http://localhost:5173"}}
