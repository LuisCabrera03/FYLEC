from flask import Blueprint, request, jsonify
from sqlalchemy import or_, func
import random
import time
import logging
from models import db, Producto
producto_bp = Blueprint('producto', __name__)

@producto_bp.route('/api/productos', methods=['GET'])
def obtener_productos_por_subcategoria():
    subcategoria = request.args.get('subcategoria')
    search = request.args.get('search')
    if subcategoria:
        productos = Producto.query.filter_by(subcategoria=subcategoria).all()
    elif search:
        productos_buscados = Producto.query.filter(or_(Producto.nombre.ilike(f'%{search}%'), Producto.descripcion.ilike(f'%{search}%'))).all()
        productos_relacionados = Producto.query.filter(or_(Producto.categoria.in_([p.categoria for p in productos_buscados]), Producto.subcategoria.in_([p.subcategoria for p in productos_buscados]))).all()
        productos = productos_buscados + productos_relacionados
    else:
        productos = Producto.query.all()
    return jsonify({'productos': [producto.serialize() for producto in productos]}), 200

@producto_bp.route('/api/productos/<int:id>', methods=['GET'])
def obtener_producto_por_id(id):
    producto = Producto.query.get_or_404(id)
    return jsonify({'producto': producto.serialize()}), 200

@producto_bp.route('/api/agregar-producto', methods=['POST'])
def agregar_producto():
    data = request.json
    nuevo_producto = Producto(
        codigo=data['codigo'],
        nombre=data['nombre'],
        marca=data['marca'],
        descripcion=data['descripcion'],
        cantidad=data['cantidad'],
        categoria=data['categoria'],
        subcategoria=data['subcategoria'], 
        precio=data['precio'],
        descuento=data['descuento'],
        imgUrl=data['imgUrl']
    )
    db.session.add(nuevo_producto)
    db.session.commit()
    return jsonify({'message': 'Producto agregado correctamente'}), 201

@producto_bp.route('/api/actualizar-producto/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    producto = Producto.query.get_or_404(id)
    data = request.json
    producto.codigo = data.get('codigo', producto.codigo)
    producto.nombre = data.get('nombre', producto.nombre)
    producto.marca = data.get('marca', producto.marca)
    producto.descripcion = data.get('descripcion', producto.descripcion)
    producto.cantidad = data.get('cantidad', producto.cantidad)
    producto.categoria = data.get('categoria', producto.categoria)
    producto.subcategoria = data.get('subcategoria', producto.subcategoria)
    producto.precio = data.get('precio', producto.precio)
    producto.descuento = data.get('descuento', producto.descuento)
    producto.imgUrl = data.get('imgUrl', producto.imgUrl)
    db.session.commit()
    return jsonify({'message': 'Producto actualizado correctamente'}), 200

@producto_bp.route('/api/eliminar-producto/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado correctamente'}), 200

@producto_bp.route('/api/productos-min-precio', methods=['GET'])
def obtener_productos_min_precio():
    try:
        productos_min_precio = db.session.query(Producto).order_by(Producto.precio).limit(4).all()
        productos_serializados = [producto.serialize() for producto in productos_min_precio]
        return jsonify({'productosMinPrecio': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@producto_bp.route('/api/productos-mas-descuento', methods=['GET'])
def obtener_productos_mas_descuento():
    try:
        productos_mas_descuento = db.session.query(Producto).filter(Producto.descuento.isnot(None)).order_by(Producto.descuento.desc()).limit(4).all()
        productos_serializados = [producto.serialize() for producto in productos_mas_descuento]
        return jsonify({'productosMasDescuento': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@producto_bp.route('/api/productos-mas-nuevos', methods=['GET'])
def obtener_productos_mas_nuevos():
    try:
        productos_mas_nuevos = db.session.query(Producto).order_by(Producto.id.desc()).limit(4).all()
        productos_serializados = [producto.serialize() for producto in productos_mas_nuevos]
        return jsonify({'productosMasNuevos': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@producto_bp.route('/api/productos-aleatorios', methods=['GET'])
def obtener_productos_aleatorios():
    try:
        productos_aleatorios = db.session.query(Producto).order_by(func.rand()).limit(3).all()
        productos_serializados = [producto.serialize() for producto in productos_aleatorios]
        return jsonify({'productosAleatorios': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# Variable global para la oferta relámpago
tiempo_inicio_oferta_relampago = None

@producto_bp.route('/api/oferta-relampago', methods=['GET'])
def obtener_oferta_relampago():
    global tiempo_inicio_oferta_relampago

    try:
        if tiempo_inicio_oferta_relampago is None:
            logging.info("Inicializando tiempo de inicio de la oferta relámpago.")
            tiempo_inicio_oferta_relampago = time.time()
        else:
            tiempo_actual = time.time()
            tiempo_transcurrido = tiempo_actual - tiempo_inicio_oferta_relampago
            logging.info(f"Tiempo transcurrido desde la última oferta relámpago: {tiempo_transcurrido} segundos.")
            if tiempo_transcurrido >= 600:
                logging.info("Reiniciando tiempo de inicio de la oferta relámpago.")
                tiempo_inicio_oferta_relampago = tiempo_actual

        productos = db.session.query(Producto).all()
        if not productos:
            return jsonify({'error': 'No hay productos disponibles para la oferta relámpago'}), 500

        producto_aleatorio = random.choice(productos)
        descuento_aleatorio = random.uniform(10, 37)
        precio_descuento = producto_aleatorio.precio * (1 - descuento_aleatorio / 100)
        
        oferta_relampago = {
            'id': producto_aleatorio.id,
            'nombre': producto_aleatorio.nombre,
            'descripcion': producto_aleatorio.descripcion,
            'categoria': producto_aleatorio.categoria,
            'precio': round(precio_descuento, 2),
            'descuento': round(descuento_aleatorio, 2),
            'imgUrl': producto_aleatorio.imgUrl
        }
        return jsonify({'oferta': oferta_relampago}), 200
    except Exception as e:
        logging.error(f"Error al obtener la oferta relámpago: {str(e)}")
        return jsonify({'error': str(e)}), 500