from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Factura, Producto

factura_bp = Blueprint('factura', __name__)

@factura_bp.route('/api/completar-compra', methods=['POST'])
@jwt_required()
def completar_compra():
    try:
        data = request.json
        producto_id = data.get('producto_id')
        cantidad_comprada = data.get('cantidad')

        if not producto_id or not cantidad_comprada:
            return jsonify({'error': 'Se requieren el ID del producto y la cantidad comprada'}), 400

        producto = Producto.query.get(producto_id)

        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404

        if producto.cantidad < cantidad_comprada:
            return jsonify({'error': f'No hay suficiente cantidad de {producto.nombre} en stock'}), 400

        producto.cantidad -= cantidad_comprada
        db.session.commit()

        return jsonify({'message': f'Se han comprado {cantidad_comprada} unidades de {producto.nombre}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@factura_bp.route('/api/crear-factura', methods=['POST'])
def crear_factura():
    try:
        data = request.json
        nueva_factura = Factura(
            usuario_id=data['usuario_id'],
            producto_id=data['producto_id'],
            cantidad=data['cantidad'],
            nombre=data['nombre'],
            correo=data['correo'],
            direccion=data['direccion'],
            departamento=data['departamento'],
            municipio=data['municipio'],
            tarjeta=data['tarjeta']
        )
        db.session.add(nueva_factura)
        db.session.commit()
        return jsonify({'message': 'Factura creada correctamente'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@factura_bp.route('/api/facturas', methods=['GET'])
@jwt_required()
def obtener_facturas_usuario():
    try:
        usuario_id = get_jwt_identity()
        facturas = Factura.query.filter_by(usuario_id=usuario_id).all()
        detalles_facturas = []

        for factura in facturas:
            producto = Producto.query.get(factura.producto_id)
            detalle_factura = {
                'id': factura.id,
                'usuario_id': factura.usuario_id,
                'producto': {
                    'nombre': producto.nombre,
                    'marca': producto.marca,
                    'descripcion': producto.descripcion,
                    'cantidad': producto.cantidad,
                    'categoria': producto.categoria,
                    'subcategoria': producto.subcategoria,
                    'precio': producto.precio,
                    'imgUrl': producto.imgUrl
                },
                'cantidad': factura.cantidad,
                'nombre': factura.nombre,
                'correo': factura.correo,
                'direccion': factura.direccion,
                'departamento': factura.departamento,
                'municipio': factura.municipio,
                'tarjeta': factura.tarjeta,
                'fecha_factura': factura.fecha_factura.strftime('%Y-%m-%d'),
                'estado': factura.estado
            }
            detalles_facturas.append(detalle_factura)

        return jsonify({'facturas': detalles_facturas}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@factura_bp.route('/api/comprastotal', methods=['GET'])
def obtener_facturas_totales():
    try:
        facturas = Factura.query.all()
        detalles_facturas = []

        for factura in facturas:
            producto = Producto.query.get(factura.producto_id)
            detalle_factura = {
                'id': factura.id,
                'usuario_id': factura.usuario_id,
                'producto': {
                    'nombre': producto.nombre,
                    'marca': producto.marca,
                    'descripcion': producto.descripcion,
                    'cantidad': producto.cantidad,
                    'categoria': producto.categoria,
                    'subcategoria': producto.subcategoria,
                    'precio': producto.precio,
                    'imgUrl': producto.imgUrl
                },
                'cantidad': factura.cantidad,
                'nombre': factura.nombre,
                'correo': factura.correo,
                'direccion': factura.direccion,
                'departamento': factura.departamento,
                'municipio': factura.municipio,
                'tarjeta': factura.tarjeta,
                'fecha_factura': factura.fecha_factura.strftime('%Y-%m-%d'),
                'estado': factura.estado
            }
            detalles_facturas.append(detalle_factura)

        return jsonify({'facturas': detalles_facturas}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@factura_bp.route('/api/comprastotal/<int:id>', methods=['PUT'])
def actualizar_estado_factura(id):
    try:
        data = request.get_json()
        nuevo_estado = data.get('estado')

        if not nuevo_estado:
            return jsonify({'error': 'Estado es requerido'}), 400

        factura = Factura.query.get(id)

        if not factura:
            return jsonify({'error': 'Factura no encontrada'}), 404

        factura.estado = nuevo_estado
        db.session.commit()

        return jsonify({'mensaje': 'Estado actualizado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
