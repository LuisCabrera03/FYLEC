import os

# Clase de configuración para la aplicación
class Config:
    # Cadena de conexión a la base de datos MySQL utilizando el conector pymysql
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/dtfylec'
    
    # Clave secreta utilizada por Flask-JWT-Extended para crear y verificar tokens JWT
    JWT_SECRET_KEY = 'super-secretoLOL'
    
    # Configuración de CORS para permitir solicitudes desde el origen http://localhost:5173
    CORS_RESOURCES = {r"/api/*": {"origins": "http://localhost:5173"}}
