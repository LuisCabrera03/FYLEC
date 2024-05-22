from flask import Blueprint

api = Blueprint('api', __name__)

from .usuario import usuario_bp
from .administrador import administrador_bp
from .producto import producto_bp
from .factura import factura_bp
from .carrito import carrito_bp

api.register_blueprint(usuario_bp)
api.register_blueprint(administrador_bp)
api.register_blueprint(producto_bp)
api.register_blueprint(factura_bp)
api.register_blueprint(carrito_bp)
