import stripe
import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Factura, Producto

factura_bp = Blueprint('factura', __name__)

# Configuración de Stripe
stripe.api_key = "sk_test_51Psyo109C819tqXimat7BZhKErMNijDY2Ki3UfzksWq9SRmqWs54FKd3w6Aq4Prwlevz7kIaWvfnkbciENKehqfM00DZt8AkXX"

@factura_bp.route('/api/iniciar-transaccion', methods=['POST'])
@jwt_required()
def iniciar_transaccion():
    try:
        data = request.json
        usuario_id = get_jwt_identity()
        productos = data.get('productos')

        if not productos or not isinstance(productos, list):
            return jsonify({'error': 'La lista de productos es requerida'}), 400

        monto_total = 0
        for item in productos:
            producto = Producto.query.get(item['producto_id'])
            if not producto:
                return jsonify({'error': f'Producto con ID {item["producto_id"]} no encontrado'}), 404
            monto_total += producto.precio * item['cantidad']

        if monto_total < 200:
            return jsonify({'error': 'El monto total debe ser al menos 200 COP para poder procesarse.'}), 400

        monto_total_str = int(monto_total * 100)  # Convertir a centavos para Stripe
        referencia = f"Compra_{usuario_id}_{int(time.time())}"

        # Crear un PaymentIntent en Stripe
        intent = stripe.PaymentIntent.create(
            amount=monto_total_str,
            currency='cop',
            description='Compra en FYLEC',
            metadata={
                'reference': referencia,
                'user_id': usuario_id
            }
        )

        return jsonify({'clientSecret': intent['client_secret']}), 200

    except stripe.error.StripeError as e:
        return jsonify({'error': f'Stripe error: {e.user_message}'}), 400
    except Exception as e:
        print(f"Error en el backend: {str(e)}")
        return jsonify({'error': 'Error interno en el servidor. Por favor revisa los datos enviados.'}), 500

@factura_bp.route('/api/completar-compra', methods=['POST'])
@jwt_required()
def completar_compra():
    try:
        data = request.json
        usuario_id = get_jwt_identity()
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

        nueva_factura = Factura(
            usuario_id=usuario_id,
            producto_id=producto_id,
            cantidad=cantidad_comprada,
            nombre=data.get('nombre'),
            correo=data.get('correo'),
            direccion=data.get('direccion'),
            departamento=data.get('departamento'),
            municipio=data.get('municipio'),
            tarjeta=data.get('tarjeta')
        )
        db.session.add(nueva_factura)
        db.session.commit()

        return jsonify({'message': f'Se han comprado {cantidad_comprada} unidades de {producto.nombre} y la factura ha sido creada'}), 200
    except Exception as e:
        print(f"Error en completar-compra: {str(e)}")
        return jsonify({'error': str(e)}), 500

@factura_bp.route('/api/crear-factura', methods=['POST'])
@jwt_required()
def crear_factura():
    try:
        data = request.json
        print("Datos recibidos para crear factura:", data)  # Depuración

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
        print(f"Error en crear-factura: {str(e)}")  # Log detallado del error
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
        print(f"Error en obtener-facturas-usuario: {str(e)}")
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
