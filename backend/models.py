from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(100), nullable=False, unique=True)
    contraseña = db.Column(db.String(100), nullable=False)
    fecha_nacimiento = db.Column(db.Date)
    tipo_documento = db.Column(db.String(20), nullable=False)
    numero_documento = db.Column(db.String(20), nullable=False)
    sexo = db.Column(db.String(20))
    departamento = db.Column(db.String(100))
    municipio = db.Column(db.String(100))
    direccion = db.Column(db.String(255))
