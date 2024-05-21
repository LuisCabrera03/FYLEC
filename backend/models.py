import datetime
from flask_sqlalchemy import SQLAlchemy

# Crear una instancia de SQLAlchemy
db = SQLAlchemy()

# Definir el modelo de la tabla 'usuarios'
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

    # Método para serializar el objeto Usuario en un diccionario
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

    # Método para actualizar los atributos del objeto Usuario
    def actualizar(self, datos):
        for key, value in datos.items():
            setattr(self, key, value)
        db.session.commit()

# Definir el modelo de la tabla 'administradores'
class Administrador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    contraseña = db.Column(db.String(255), nullable=False)
    fecha_ingreso = db.Column(db.String(10), default=datetime.date.today, nullable=False)
    rol = db.Column(db.Integer, default=1, nullable=False)

    # Representación en cadena del objeto Administrador
    def __repr__(self):
        return f"<Administrador {self.nombre}>"

# Definir el modelo de la tabla 'productos'
class Producto(db.Model):
    __tablename__ = 'productos'
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), nullable=False, unique=True)
    nombre = db.Column(db.String(100), nullable=False)
    marca = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    cantidad = db.Column(db.Integer, nullable=False)
    categoria = db.Column(db.String(50))
    subcategoria = db.Column(db.String(100))
    precio = db.Column(db.Float)
    descuento = db.Column(db.Float)
    imgUrl = db.Column(db.String(255))

    # Método para serializar el objeto Producto en un diccionario
    def serialize(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'marca': self.marca,
            'descripcion': self.descripcion,
            'cantidad': self.cantidad,
            'categoria': self.categoria,
            'subcategoria': self.subcategoria,
            'precio': self.precio,
            'descuento': self.descuento,
            'imgUrl': self.imgUrl
        }

# Definir el modelo de la tabla 'factura'
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
    fecha_factura = db.Column(db.Date, nullable=False, default=datetime.date.today)
    estado = db.Column(db.String(255), nullable=False, default='esperando')

    # Método para serializar el objeto Factura en un diccionario
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

# Definir el modelo de la tabla 'carritocompras'
class CarritoCompras(db.Model):
    __tablename__ = 'carritocompras'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    producto_id = db.Column(db.Integer, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)

    # Método para serializar el objeto CarritoCompras en un diccionario
    def serialize(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'producto_id': self.producto_id,
            'cantidad': self.cantidad
        }
