from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, CarritoCompras, Producto

carrito_bp = Blueprint('carrito', __name__)

@carrito_bp.route('/api/agregar-al-carrito', methods=['POST'])
def agregar_al_carrito():
    try:
        data = request.json
        usuario_id = data['usuario_id']
        producto_id = data['producto_id']
        cantidad = data['cantidad']

        item_existente = CarritoCompras.query.filter_by(usuario_id=usuario_id, producto_id=producto_id).first()

        if item_existente:
            item_existente.cantidad += cantidad
            db.session.commit()
            return jsonify({'message': 'Cantidad del producto actualizada correctamente'}), 200
        else:
            nuevo_item = CarritoCompras(
                usuario_id=usuario_id,
                producto_id=producto_id,
                cantidad=cantidad
            )
            db.session.add(nuevo_item)
            db.session.commit()
            return jsonify({'message': 'Producto agregado al carrito correctamente'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@carrito_bp.route('/api/carrito', methods=['GET'])
@jwt_required()
def obtener_carrito():
    try:
        usuario_id = get_jwt_identity()
        carrito = CarritoCompras.query.filter_by(usuario_id=usuario_id).all()
        detalles_carrito = []

        for item in carrito:
            producto = Producto.query.get(item.producto_id)
            detalle_item = {
                'id': item.id,
                'producto': producto.serialize(),
                'cantidad': item.cantidad
            }
            detalles_carrito.append(detalle_item)

        return jsonify({'carrito': detalles_carrito}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@carrito_bp.route('/api/carrito/<int:item_id>', methods=['DELETE'])
@jwt_required()
def eliminar_item_carrito(item_id):
    try:
        usuario_id = get_jwt_identity()
        item = CarritoCompras.query.filter_by(id=item_id, usuario_id=usuario_id).first()

        if item:
            db.session.delete(item)
            db.session.commit()
            return jsonify({'message': 'Producto eliminado del carrito correctamente'}), 200
        else:
            return jsonify({'error': 'Elemento del carrito no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@carrito_bp.route('/api/carrito/vaciar', methods=['DELETE'])
@jwt_required()
def vaciar_carrito():
    try:
        usuario_id = get_jwt_identity()
        carrito = CarritoCompras.query.filter_by(usuario_id=usuario_id).all()

        for item in carrito:
            db.session.delete(item)
        db.session.commit()

        return jsonify({'message': 'Carrito vaciado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@carrito_bp.route('/api/carrito/<int:item_id>', methods=['PUT'])
@jwt_required()
def actualizar_cantidad_item_carrito(item_id):
    try:
        usuario_id = get_jwt_identity()
        item = CarritoCompras.query.filter_by(id=item_id, usuario_id=usuario_id).first()

        if not item:
            return jsonify({'error': 'Elemento del carrito no encontrado'}), 404

        if 'cantidad' not in request.json:
            return jsonify({'error': 'Falta el parámetro "cantidad" en la solicitud'}), 400

        nueva_cantidad = request.json['cantidad']

        if not isinstance(nueva_cantidad, int) or nueva_cantidad <= 0:
            return jsonify({'error': 'La cantidad debe ser un entero positivo'}), 400

        item.cantidad = nueva_cantidad
        db.session.commit()

        return jsonify({'message': 'Cantidad del producto actualizada correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
