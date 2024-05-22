from datetime import date
from . import db

class Factura(db.Model):
    __tablename__ = 'factura'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    producto_id = db.Column(db.Integer, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    nombre = db.Column(db.String(255), nullable=False)
    correo = db.Column(db.String(255), nullable=False)
    direccion = db.Column(db.String(255), nullable=False)
    departamento = db.Column(db.Text, nullable=False)
    municipio = db.Column(db.Text, nullable=False)
    tarjeta = db.Column(db.String(255), nullable=False)
    fecha_factura = db.Column(db.Date, nullable=False, default=date.today)
    estado = db.Column(db.String(255), nullable=False, default='esperando')

    def serialize(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'producto_id': self.producto_id,
            'cantidad': self.cantidad,
            'nombre': self.nombre,
            'correo': self.correo,
            'direccion': self.direccion,
            'departamento': self.departamento,
            'municipio': self.municipio,
            'tarjeta': self.tarjeta,
            'fecha_factura': self.fecha_factura.strftime('%Y-%m-%d'),
            'estado': self.estado
        }
