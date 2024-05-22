from datetime import date
from . import db

class Administrador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    contraseña = db.Column(db.String(255), nullable=False)
    fecha_ingreso = db.Column(db.String(10), default=date.today, nullable=False)
    rol = db.Column(db.Integer, default=1, nullable=False)

    def __repr__(self):
        return f"<Administrador {self.nombre}>"
