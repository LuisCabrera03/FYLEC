import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/dtfylec'
    JWT_SECRET_KEY = 'super-secreto'
    CORS_RESOURCES = {r"/api/*": {"origins": "http://localhost:5173"}}
