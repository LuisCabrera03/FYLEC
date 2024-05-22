from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .usuario import Usuario
from .administrador import Administrador
from .producto import Producto
from .factura import Factura
from .carrito_compras import CarritoCompras
