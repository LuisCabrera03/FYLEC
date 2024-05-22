from . import db

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

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'correo': self.correo,
            'fecha_nacimiento': str(self.fecha_nacimiento),
            'tipo_documento': self.tipo_documento,
            'numero_documento': self.numero_documento,
            'sexo': self.sexo,
            'departamento': self.departamento,
            'municipio': self.municipio,
            'direccion': self.direccion
        }

    def actualizar(self, datos):
        for key, value in datos.items():
            setattr(self, key, value)
        db.session.commit()
