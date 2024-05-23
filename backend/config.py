# config.py
import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/dtfylec'
    JWT_SECRET_KEY = 'super-secretoLOL'
    CORS_RESOURCES = {r"/api/*": {"origins": "http://localhost:5173"}}
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_SECURE = True  
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_REFRESH_COOKIE_PATH = '/api/token/refresh'
    JWT_COOKIE_SAMESITE = 'Lax'
