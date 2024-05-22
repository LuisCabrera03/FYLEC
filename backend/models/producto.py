from . import db

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
