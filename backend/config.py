import os
from datetime import timedelta

class Config:
    # Configuración de la base de datos utilizando SQLAlchemy y el conector pymysql
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost/dtfylec')
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Desactivar la modificación de seguimiento de objetos para ahorrar recursos
    
    # Clave secreta utilizada por Flask-JWT-Extended para crear y verificar tokens JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secretoLOL')
    
    # Configurar el tiempo de expiración del token de acceso
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)  # El token será válido durante 30 días
    
    # Habilitar JWT en cookies y configurar la ruta y seguridad de la cookie
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_CSRF_PROTECT = False  # Desactivar la protección CSRF para las cookies (activar en producción)
    JWT_COOKIE_SECURE = False  # No usar HTTPS en el entorno local
    JWT_ACCESS_COOKIE_PATH = '/'  # La cookie estará disponible en toda la aplicación
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=365)  # El token de refresco será válido durante 365 días
    JWT_COOKIE_SAMESITE = 'Lax'  # Configurar la política de SameSite como Lax para entorno local
    
    # Configuración de CORS para permitir solicitudes desde el frontend (http://localhost:5173)
    CORS_RESOURCES = {r"/api/*": {"origins": "http://localhost:5173"}}
    CORS_SUPPORTS_CREDENTIALS = True  # Permitir el envío de cookies y credenciales en las solicitudes
    
    # Otras configuraciones adicionales
    DEBUG = True  # Activar modo de depuración (desactivar en producción)
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave_secreta_flask')  # Clave secreta para sesiones Flask y otros usos generales
