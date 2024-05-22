from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from email_validator import validate_email, EmailNotValidError
from flask_bcrypt import generate_password_hash, check_password_hash
import logging
from datetime import datetime as dt, timedelta
import time
import random
import secrets
from sqlalchemy import func, or_
from models import db, Usuario, Administrador, Producto, Factura, CarritoCompras

api = Blueprint('api', __name__)

# Helpers
def validate_required_fields(data, required_fields):
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f'El campo "{field}" es obligatorio'
    return True, ''

# Rutas de Usuario
@api.route('/api/crear-cuenta', methods=['POST'])
def crear_cuenta():
    try:
        data = request.json
        required_fields = ['nombre', 'correo', 'contraseña', 'fechaNacimiento', 'tipoDocumento', 'numeroDocumento', 'sexo', 'direccion']
        valid, message = validate_required_fields(data, required_fields)
        if not valid:
            return jsonify({'error': message}), 400

        try:
            validate_email(data['correo'])
        except EmailNotValidError:
            return jsonify({'error': 'El formato del correo electrónico es inválido'}), 400

        usuario_existente = Usuario.query.filter_by(correo=data['correo']).first()
        if usuario_existente:
            return jsonify({'error': 'El correo electrónico ya está en uso'}), 400

        if len(data['contraseña']) < 8 or len(data['contraseña']) > 50:
            return jsonify({'error': 'La longitud de la contraseña debe estar entre 8 y 50 caracteres'}), 400

        if data['tipoDocumento'] == 'cedula' and not data['numeroDocumento'].isdigit():
            return jsonify({'error': 'El número de documento debe contener solo dígitos'}), 400

        try:
            fecha_nacimiento = dt.strptime(data['fechaNacimiento'], '%Y-%m-%d')
            if fecha_nacimiento > dt.now() or fecha_nacimiento < dt.now() - timedelta(days=365*100):
                return jsonify({'error': 'La fecha de nacimiento no es válida'}), 400
        except ValueError:
            return jsonify({'error': 'Formato de fecha de nacimiento no válido'}), 400

        contraseña_hash = generate_password_hash(data['contraseña']).decode('utf-8')

        nuevo_usuario = Usuario(
            nombre=data['nombre'], 
            correo=data['correo'], 
            contraseña=contraseña_hash,
            fecha_nacimiento=fecha_nacimiento,
            tipo_documento=data['tipoDocumento'],
            numero_documento=data['numeroDocumento'],
            sexo=data['sexo'],
            departamento=data.get('departamento'),
            municipio=data.get('municipio'),
            direccion=data.get('direccion')
        )
        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({'message': 'Usuario creado correctamente'}), 201
    except Exception as e:
        logging.error(f"Error al crear la cuenta del usuario: {str(e)}")
        return jsonify({'error': 'Se produjo un error al procesar la solicitud.'}), 500

@api.route('/api/login', methods=['POST'])
def login():
    data = request.json
    correo = data.get('email')
    contraseña = data.get('contraseña')

    usuario = Usuario.query.filter_by(correo=correo).first()

    if usuario and check_password_hash(usuario.contraseña, contraseña):
        token_de_sesion = create_access_token(identity=usuario.id)
        return jsonify({'token': token_de_sesion, 'userId': usuario.id}), 200
    else:
        return jsonify({'error': 'Credenciales incorrectas'}), 401

@api.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        if usuario:
            return jsonify({'usuario': usuario.serialize()}), 200
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/actualizar-perfil', methods=['PUT'])
@jwt_required()
def actualizar_perfil():
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(usuario_id)
    datos = request.json
    usuario.actualizar(datos)
    db.session.commit()
    return jsonify({'message': 'Perfil actualizado correctamente'}), 200

@api.route('/api/cambiar-contraseña', methods=['PUT'])
@jwt_required()
def cambiar_contraseña():
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(usuario_id)
    data = request.json

    if not check_password_hash(usuario.contraseña, data.get('passwordAnterior')):
        return jsonify({'error': 'La contraseña anterior es incorrecta'}), 400

    if data.get('passwordNueva') != data.get('confirmarPassword'):
        return jsonify({'error': 'Las contraseñas nuevas no coinciden'}), 400

    nueva_contraseña = generate_password_hash(data.get('passwordNueva')).decode('utf-8')
    usuario.contraseña = nueva_contraseña
    db.session.commit()

    return jsonify({'message': 'Contraseña cambiada correctamente'}), 200

@api.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        usuarios = Usuario.query.all()
        detalles_usuarios = [usuario.serialize() for usuario in usuarios]
        return jsonify({'usuarios': detalles_usuarios}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas de Administrador
@api.route('/api/admin-login', methods=['POST'])
def admin_login():
    data = request.json
    correo = data.get('email')
    contraseña = data.get('contraseña')

    administrador = Administrador.query.filter_by(email=correo, contraseña=contraseña).first()

    if administrador:
        token_de_sesion = create_access_token(identity=administrador.id)
        return jsonify({'token': token_de_sesion}), 200
    else:
        return jsonify({'error': 'Credenciales incorrectas'}), 401

@api.route('/api/rol-admin', methods=['GET'])
@jwt_required()
def obtener_rol_admin():
    try:
        usuario_id = get_jwt_identity()
        administrador = Administrador.query.get(usuario_id)
        
        if administrador and administrador.rol == 1:
            return jsonify({'rol': 'Administrador'}), 200
        else:
            return jsonify({'error': 'Acceso denegado'}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/administradores', methods=['GET'])
def obtener_administradores():
    administradores = Administrador.query.all()
    output = []
    for admin in administradores:
        admin_data = {
            'id': admin.id,
            'nombre': admin.nombre,
            'email': admin.email,
            'contraseña': admin.contraseña,
            'fecha_ingreso': admin.fecha_ingreso.strftime("%Y-%m-%d"),
            'rol': admin.rol
        }
        output.append(admin_data)
    return jsonify({'administradores': output})

@api.route('/api/administradores', methods=['POST'])
def agregar_administrador():
    data = request.get_json()
    nuevo_admin = Administrador(nombre=data['nombre'], email=data['email'], contraseña=data['contraseña'], rol=data['rol'])
    db.session.add(nuevo_admin)
    db.session.commit()
    return jsonify({'mensaje': 'Administrador agregado exitosamente', 'administrador': {
        'id': nuevo_admin.id,
        'nombre': nuevo_admin.nombre,
        'email': nuevo_admin.email,
        'contraseña': nuevo_admin.contraseña,
        'fecha_ingreso': nuevo_admin.fecha_ingreso.strftime("%Y-%m-%d"),
        'rol': nuevo_admin.rol
    }}), 201

@api.route('/api/administradores/<int:id>', methods=['PUT'])
def actualizar_administrador(id):
    admin = Administrador.query.get(id)
    if admin is None:
        return jsonify({'mensaje': 'No se encontró el administrador'}), 404
    data = request.get_json()
    admin.nombre = data['nombre']
    admin.email = data['email']
    admin.contraseña = data['contraseña']
    admin.rol = data['rol']
    db.session.commit()
    return jsonify({'mensaje': 'Administrador actualizado exitosamente', 'administrador': {
        'id': admin.id,
        'nombre': admin.nombre,
        'email': admin.email,
        'contraseña': admin.contraseña,
        'fecha_ingreso': admin.fecha_ingreso.strftime("%Y-%m-%d"),
        'rol': admin.rol
    }}), 200

@api.route('/api/administradores/<int:id>', methods=['DELETE'])
def eliminar_administrador(id):
    admin = Administrador.query.get(id)
    if admin is None:
        return jsonify({'mensaje': 'No se encontró el administrador'}), 404
    db.session.delete(admin)
    db.session.commit()
    return jsonify({'mensaje': 'Administrador eliminado exitosamente'}), 200

# Rutas de Producto
@api.route('/api/productos', methods=['GET'])
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

@api.route('/api/productos/<int:id>', methods=['GET'])
def obtener_producto_por_id(id):
    producto = Producto.query.get_or_404(id)
    return jsonify({'producto': producto.serialize()}), 200

@api.route('/api/agregar-producto', methods=['POST'])
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

@api.route('/api/actualizar-producto/<int:id>', methods=['PUT'])
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

@api.route('/api/eliminar-producto/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado correctamente'}), 200

@api.route('/api/productos-min-precio', methods=['GET'])
def obtener_productos_min_precio():
    try:
        productos_min_precio = db.session.query(Producto).order_by(Producto.precio).limit(4).all()
        productos_serializados = [producto.serialize() for producto in productos_min_precio]
        return jsonify({'productosMinPrecio': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/productos-mas-descuento', methods=['GET'])
def obtener_productos_mas_descuento():
    try:
        productos_mas_descuento = db.session.query(Producto).filter(Producto.descuento.isnot(None)).order_by(Producto.descuento.desc()).limit(4).all()
        productos_serializados = [producto.serialize() for producto in productos_mas_descuento]
        return jsonify({'productosMasDescuento': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/productos-mas-nuevos', methods=['GET'])
def obtener_productos_mas_nuevos():
    try:
        productos_mas_nuevos = db.session.query(Producto).order_by(Producto.id.desc()).limit(4).all()
        productos_serializados = [producto.serialize() for producto in productos_mas_nuevos]
        return jsonify({'productosMasNuevos': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas de Carrito de Compras
@api.route('/api/agregar-al-carrito', methods=['POST'])
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

@api.route('/api/carrito', methods=['GET'])
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

@api.route('/api/carrito/<int:item_id>', methods=['DELETE'])
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

@api.route('/api/carrito/vaciar', methods=['DELETE'])
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

@api.route('/api/carrito/<int:item_id>', methods=['PUT'])
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

# Rutas de Factura
@api.route('/api/completar-compra', methods=['POST'])
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

@api.route('/api/crear-factura', methods=['POST'])
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

@api.route('/api/facturas', methods=['GET'])
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

@api.route('/api/comprastotal', methods=['GET'])
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

@api.route('/api/comprastotal/<int:id>', methods=['PUT'])
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

# Rutas de Producto adicionales
@api.route('/api/productos-aleatorios', methods=['GET'])
def obtener_productos_aleatorios():
    try:
        productos_aleatorios = db.session.query(Producto).order_by(func.rand()).limit(3).all()
        productos_serializados = [producto.serialize() for producto in productos_aleatorios]
        return jsonify({'productosAleatorios': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas de Subcategorías
@api.route('/api/subcategorias', methods=['GET'])
def obtener_subcategorias():
    try:
        categoria = request.args.get('categoria')
        if not categoria:
            return jsonify({'error': 'La categoría es obligatoria'}), 400

        # Esto asume que tienes una tabla/modelo Subcategoria con una relación a Producto
        subcategorias = db.session.query(Producto.subcategoria).filter_by(categoria=categoria).distinct().all()
        subcategorias = [subcategoria[0] for subcategoria in subcategorias]  # Convertir la lista de tuplas a lista de cadenas
        return jsonify({'subcategorias': subcategorias}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Variables globales para la oferta relámpago
tiempo_inicio_oferta_relampago = None

@api.route('/api/oferta-relampago', methods=['GET'])
def obtener_oferta_relampago():
    global tiempo_inicio_oferta_relampago

    try:
        if tiempo_inicio_oferta_relampago is None:
            tiempo_inicio_oferta_relampago = time.time()
        else:
            tiempo_actual = time.time()
            tiempo_transcurrido = tiempo_actual - tiempo_inicio_oferta_relampago
            if tiempo_transcurrido >= 600:
                tiempo_inicio_oferta_relampago = tiempo_actual

        producto_aleatorio = random.choice(db.session.query(Producto).all())
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
        return jsonify({'error': str(e)}), 500

# Ruta para manejar solicitudes preflight de CORS
@api.route('/api/verifyToken', methods=['OPTIONS'])
def handle_preflight():
    response = jsonify()
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response, 200
