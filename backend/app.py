from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime
import random
import time
from sqlalchemy import func
from datetime import datetime, timedelta
from flask_bcrypt import generate_password_hash
from email_validator import validate_email, EmailNotValidError
from flask_bcrypt import check_password_hash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets



app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/dtfylec'
app.config['JWT_SECRET_KEY'] = 'super-secreto'
db = SQLAlchemy(app)
jwt = JWTManager(app)

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
        
# crea cuenta ----------------------------------------------------------------- 
import resend
from datetime import datetime as dt  # Cambio en la importación de datetime
import logging

# Configura la API key de resend
resend.api_key = "re_CHo3m5FG_5qBRhXpE4G9navFmXgun537e"

@app.route('/api/crear-cuenta', methods=['POST'])
def crear_cuenta():
    try:
        data = request.json
        
        # Validar campos obligatorios
        required_fields = ['nombre', 'correo', 'contraseña', 'fechaNacimiento', 'tipoDocumento', 'numeroDocumento', 'sexo', 'direccion']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'El campo "{field}" es obligatorio'}), 400
        
        # Validar formato de correo electrónico
        try:
            validate_email(data['correo'])
        except EmailNotValidError:
            return jsonify({'error': 'El formato del correo electrónico es inválido'}), 400
        
        # Verificar si el correo electrónico ya está en uso
        usuario_existente = Usuario.query.filter_by(correo=data['correo']).first()
        if usuario_existente:
            return jsonify({'error': 'El correo electrónico ya está en uso'}), 400
        
        # Verificar longitud de contraseña
        if len(data['contraseña']) < 8 or len(data['contraseña']) > 50:
            return jsonify({'error': 'La longitud de la contraseña debe estar entre 8 y 50 caracteres'}), 400
        
        # Validar formato de número de documento (ejemplo)
        if data['tipoDocumento'] == 'cedula' and not data['numeroDocumento'].isdigit():
            return jsonify({'error': 'El número de documento debe contener solo dígitos'}), 400
        
        # Validar fecha de nacimiento
        try:
            fecha_nacimiento = dt.strptime(data['fechaNacimiento'], '%Y-%m-%d')  # Uso de dt en lugar de datetime
            if fecha_nacimiento > dt.now() or fecha_nacimiento < dt.now() - timedelta(days=365*100):
                return jsonify({'error': 'La fecha de nacimiento no es válida'}), 400
        except ValueError:
            return jsonify({'error': 'Formato de fecha de nacimiento no válido'}), 400
        
        # Generar hash de la contraseña
        contraseña_hash = generate_password_hash(data['contraseña']).decode('utf-8')
        
        # Crear el nuevo usuario
        nuevo_usuario = Usuario(
            nombre=data['nombre'], 
            correo=data['correo'], 
            contraseña=contraseña_hash,
            fecha_nacimiento=data['fechaNacimiento'],
            tipo_documento=data['tipoDocumento'],
            numero_documento=data['numeroDocumento'],
            sexo=data['sexo'],
            departamento=data.get('departamento'),
            municipio=data.get('municipio'),
            direccion=data.get('direccion')
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        
        # Enviar correo electrónico de confirmación
        try:
            r = resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": data['correo'],
                "subject": "Confirmación de cuenta en FYLEC",
                "html":  """
            <h1>¡Bienvenido!</h1>
            <p>Estimado Usuario,</p>
            <p>Su cuenta en FYLEC ha sido creada exitosamente. ¡Bienvenido a nuestra comunidad!</p>
            <p>Atentamente,</p>
            <p>El equipo de FYLEC</p>
            <a href="https://imgur.com/RO42hZ9"><img src="https://i.imgur.com/RO42hZ9.png" title="source: imgur.com" /></a>    
            """
            })
            if r.get('status') == 'success':
                return jsonify({'message': 'Usuario creado correctamente. Se ha enviado un correo electrónico de confirmación.'}), 201
            else:
                # Si no se puede enviar el correo, igualmente se considera que el usuario se creó correctamente
                return jsonify({'message': 'Usuario creado correctamente. No se pudo enviar el correo electrónico de confirmación.'}), 201
        except Exception as e:
            logging.error(f"Error al enviar correo electrónico de confirmación: {str(e)}")
            return jsonify({'error': 'No se pudo enviar el correo electrónico de confirmación.'}), 500
    except Exception as e:
        logging.error(f"Error al crear la cuenta del usuario: {str(e)}")
        return jsonify({'error': 'Se produjo un error al procesar la solicitud.'}), 500

# login ----------------------------------------------------------------------------------------------------------------------------------
@app.route('/api/login', methods=['POST'])
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
    

@app.route('/api/verifyToken', methods=['OPTIONS'])
def handle_preflight():
    response = jsonify()
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response, 200

@app.route('/api/verifyToken', methods=['GET'])  
def verify_token():
    token = request.headers.get('Authorization').split(" ")[1]  
    if token == "tu_token_valido":  
        return jsonify({'message': 'Token válido'}), 200
    else:
        return jsonify({'error': 'Token inválido'}), 401
    
# admin----------------------------------------------------------------------------------------------------------------------------- 

#obtener la informacion de los usuarios
@app.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        usuarios = Usuario.query.all()
        detalles_usuarios = [usuario.serialize() for usuario in usuarios]
        return jsonify({'usuarios': detalles_usuarios}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
#optener totalidad de productos----------------------------------------------------------------
@app.route('/api/comprastotal', methods=['GET'])
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
                'fecha_factura': factura.fecha_factura.strftime('%Y-%m-%d') # Formatear la fecha como YYYY-MM-DD
            }
            detalles_facturas.append(detalle_factura)

        return jsonify({'facturas': detalles_facturas}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

class Administrador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    contraseña = db.Column(db.String(255), nullable=False)
    fecha_ingreso = db.Column(db.String(10), default=datetime.utcnow().strftime('%Y-%m-%d'), nullable=False)
    rol = db.Column(db.Integer, default=1, nullable=False)
    def __repr__(self):
        return f"<Administrador {self.nombre}>"
    
#login del admin--------------------------------------------------------
@app.route('/api/admin-login', methods=['POST'])
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

#rol de admin--------------------------------------------------------

@app.route('/api/rol-admin', methods=['GET'])
@jwt_required()
def obtener_rol_admin():
    try:
        usuario_id = get_jwt_identity()
        administrador = Administrador.query.get(usuario_id)
        
        if administrador and administrador.rol == 1:
            # Si el usuario es un administrador con rol 1, devuelve el rol
            return jsonify({'rol': 'Administrador'}), 200
        else:
            # Si el usuario no es encontrado o no tiene el rol correcto, devuelve un error
            return jsonify({'error': 'Acceso denegado'}), 403
    except Exception as e:
        # Manejar cualquier excepción que pueda ocurrir
        return jsonify({'error': str(e)}), 500

# Ruta para obtener todos los administradores
@app.route('/api/administradores', methods=['GET'])
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

# Ruta para agregar un nuevo administrador
@app.route('/api/administradores', methods=['POST'])
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
    }})

# Ruta para actualizar un administrador existente
@app.route('/api/administradores/<int:id>', methods=['PUT'])
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
    }})

# Ruta para eliminar un administrador existente
@app.route('/api/administradores/<int:id>', methods=['DELETE'])
def eliminar_administrador(id):
    admin = Administrador.query.get(id)
    if admin is None:
        return jsonify({'mensaje': 'No se encontró el administrador'}), 404
    db.session.delete(admin)
    db.session.commit()
    return jsonify({'mensaje': 'Administrador eliminado exitosamente'})
# Perfil--------------------------------------------------------
@app.route('/api/profile', methods=['GET'])
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

@app.route('/api/actualizar-perfil', methods=['PUT'])
@jwt_required()
def actualizar_perfil():
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(usuario_id)
    datos = request.json
    usuario.actualizar(datos)
    db.session.commit()
    return jsonify({'message': 'Perfil actualizado correctamente'}), 200

@app.route('/api/cambiar-contraseña', methods=['PUT'])
@jwt_required()
def cambiar_contraseña():
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(usuario_id)
    data = request.json

    # Verificar si la contraseña anterior coincide
    if not check_password_hash(usuario.contraseña, data.get('passwordAnterior')):
        return jsonify({'error': 'La contraseña anterior es incorrecta'}), 400

    # Verificar si las contraseñas nuevas coinciden
    if data.get('passwordNueva') != data.get('confirmarPassword'):
        return jsonify({'error': 'Las contraseñas nuevas no coinciden'}), 400

    # Actualizar la contraseña
    nueva_contraseña = generate_password_hash(data.get('passwordNueva'))
    usuario.contraseña = nueva_contraseña
    db.session.commit()

    return jsonify({'message': 'Contraseña cambiada correctamente'}), 200

# Definición del modelo Producto------------------------------------------------------
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

# Ruta para agregar un nuevo producto----------------------------------------
@app.route('/api/agregar-producto', methods=['POST'])
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

from sqlalchemy import or_

# Ruta para obtener productos por subcategoría-----------------------------
@app.route('/api/productos', methods=['GET'])
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

@app.route('/api/subcategorias', methods=['GET'])
def obtener_subcategorias():
    try:
        categoria = request.args.get('categoria')
        subcategorias = []

        if categoria:
            productos = Producto.query.filter_by(categoria=categoria).all()
            subcategorias = list(set([producto.subcategoria for producto in productos]))

        return jsonify({'subcategorias': subcategorias}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Ruta para obtener un producto por su ID
@app.route('/api/productos/<int:id>', methods=['GET'])
def obtener_producto_por_id(id):
    producto = Producto.query.get_or_404(id)
    return jsonify({'producto': producto.serialize()}), 200

# Ruta para actualizar un producto por su ID
@app.route('/api/actualizar-producto/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    producto = Producto.query.get_or_404(id)
    data = request.json
    producto.codigo = data.get('codigo', producto.codigo)
    producto.nombre = data.get('nombre', producto.nombre)
    producto.marca = data.get('marca', producto.marca)
    producto.descripcion = data.get('descripcion', producto.descripcion)
    producto.cantidad = data.get('cantidad', producto.cantidad)
    producto.categoria = data.get('categoria', producto.categoria)
    producto.subcategoria = data.get('subcategoria', producto.subcategoria)  # Actualizar la subcategoría
    producto.precio = data.get('precio', producto.precio)
    producto.descuento = data.get('descuento', producto.descuento)
    producto.imgUrl = data.get('imgUrl', producto.imgUrl)
    db.session.commit()
    return jsonify({'message': 'Producto actualizado correctamente'}), 200

# Ruta para eliminar un producto por su ID
@app.route('/api/eliminar-producto/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado correctamente'}), 200



# Esta ruta devuelve los productos con el precio mínimo de la semana -----------------------------------
@app.route('/api/productos-min-precio', methods=['GET'])
def obtener_productos_min_precio():
    try:
        # Consulta para obtener los productos con el precio mínimo de la semana
        productos_min_precio = db.session.query(Producto).order_by(Producto.precio).limit(4).all()
        # Serializar los productos y devolverlos como respuesta
        productos_serializados = []
        for producto in productos_min_precio:
            producto_serializado = producto.serialize()
            # Agregar la URL de la imagen al producto serializado
            producto_serializado['imgUrl'] = producto.imgUrl
            productos_serializados.append(producto_serializado)
        return jsonify({'productosMinPrecio': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    # Esta ruta devuelve los productos con el mayor descuento
@app.route('/api/productos-mas-descuento', methods=['GET'])
def obtener_productos_mas_descuento():
    try:
        # Consulta para obtener los productos con el mayor descuento
        productos_mas_descuento = db.session.query(Producto).filter(Producto.descuento.isnot(None)).order_by(Producto.descuento.desc()).limit(4).all()
        # Serializar los productos y devolverlos como respuesta
        productos_serializados = []
        for producto in productos_mas_descuento:
            producto_serializado = producto.serialize()
            # Agregar la URL de la imagen al producto serializado
            producto_serializado['imgUrl'] = producto.imgUrl
            productos_serializados.append(producto_serializado)
        return jsonify({'productosMasDescuento': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Esta ruta devuelve los 5 productos más nuevos 
@app.route('/api/productos-mas-nuevos', methods=['GET'])
def obtener_productos_mas_nuevos():
    try:
        # Consulta para obtener los 5 productos más nuevos
        productos_mas_nuevos = db.session.query(Producto).order_by(Producto.id.desc()).limit(4).all()
        # Serializar los productos y devolverlos como respuesta
        productos_serializados = []
        for producto in productos_mas_nuevos:
            producto_serializado = producto.serialize()
            # Agregar la URL de la imagen al producto serializado
            producto_serializado['imgUrl'] = producto.imgUrl
            productos_serializados.append(producto_serializado)
        return jsonify({'productosMasNuevos': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ofertas relampago -------------------------------------------------------------------------------
tiempo_inicio_oferta_relampago = None

@app.route('/api/oferta-relampago', methods=['GET'])
def obtener_oferta_relampago():
    global tiempo_inicio_oferta_relampago

    try:
        if tiempo_inicio_oferta_relampago is None:
            # Si no hay un tiempo de inicio almacenado, establecerlo
            tiempo_inicio_oferta_relampago = time.time()
        else:
            # Comprobar si el tiempo de la oferta ha expirado (10 minutos)
            tiempo_actual = time.time()
            tiempo_transcurrido = tiempo_actual - tiempo_inicio_oferta_relampago
            if tiempo_transcurrido >= 600:
                # Si ha pasado más de 10 minutos, generar una nueva oferta
                tiempo_inicio_oferta_relampago = tiempo_actual

        # Seleccionar un producto aleatorio ---------------- mas visitados --------------------------------
        producto_aleatorio = random.choice(db.session.query(Producto).all())
        # Generar un descuento aleatorio entre 10% y 37%
        descuento_aleatorio = random.uniform(10, 37)
        # Aplicar el descuento al precio del producto
        precio_descuento = producto_aleatorio.precio * (1 - descuento_aleatorio / 100)
        # Serializar la oferta relámpago
        oferta_relampago = {
            'id': producto_aleatorio.id,
            'nombre': producto_aleatorio.nombre,
            'descripcion': producto_aleatorio.descripcion,
            'categoria': producto_aleatorio.categoria,
            'precio': round(precio_descuento, 2),  # Redondear a 2 decimales
            'descuento': round(descuento_aleatorio, 2),  # Redondear a 2 decimales
            'imgUrl': producto_aleatorio.imgUrl  # Tomar la URL de la imagen de la base de datos
        }
        return jsonify({'oferta': oferta_relampago}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/productos-aleatorios', methods=['GET'])
def obtener_productos_aleatorios():
    try:
        # Consulta para obtener productos aleatorios de la base de datos
        productos_aleatorios = db.session.query(Producto).order_by(func.rand()).limit(3).all()
        # Serializar los productos y devolverlos como respuesta
        productos_serializados = [producto.serialize() for producto in productos_aleatorios]
        return jsonify({'productosAleatorios': productos_serializados}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


#carritoo de compras  ------------------------------------------------------------------

# Define el modelo CarritoCompras
class CarritoCompras(db.Model):
    __tablename__ = 'carritocompras'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    producto_id = db.Column(db.Integer, nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)

# Ruta para agregar un producto al carrito
@app.route('/api/agregar-al-carrito', methods=['POST'])
def agregar_al_carrito():
    try:
        data = request.json
        usuario_id = data['usuario_id']
        producto_id = data['producto_id']
        cantidad = data['cantidad']

        # Verificar si el producto ya está en el carrito del usuario
        item_existente = CarritoCompras.query.filter_by(usuario_id=usuario_id, producto_id=producto_id).first()

        if item_existente:
            # Si el producto ya está en el carrito, simplemente actualiza la cantidad
            item_existente.cantidad += cantidad
            db.session.commit()
            return jsonify({'message': 'Cantidad del producto actualizada correctamente'}), 200
        else:
            # Si el producto no está en el carrito, agrégalo como un nuevo elemento
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

# Ruta para obtener el carrito de compras de un usuario----
@app.route('/api/carrito', methods=['GET'])
@jwt_required()  # Asegura que el usuario esté autenticado
def obtener_carrito():
    try:
        # Obtiene el usuario actual a partir del token
        usuario_id = get_jwt_identity()

        # Busca los elementos del carrito del usuario actual
        carrito = CarritoCompras.query.filter_by(usuario_id=usuario_id).all()

        # Lista para almacenar los detalles de los productos en el carrito
        detalles_carrito = []

        # Itera sobre los elementos del carrito para obtener detalles de los productos
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

# Ruta para eliminar un producto del carrito
@app.route('/api/carrito/<int:item_id>', methods=['DELETE'])
@jwt_required()  # Asegura que el usuario esté autenticado
def eliminar_item_carrito(item_id):
    try:
        # Obtiene el usuario actual a partir del token
        usuario_id = get_jwt_identity()

        # Busca el elemento del carrito por su ID y el ID del usuario actual
        item = CarritoCompras.query.filter_by(id=item_id, usuario_id=usuario_id).first()

        # Si el elemento existe, elimínalo
        if item:
            db.session.delete(item)
            db.session.commit()
            return jsonify({'message': 'Producto eliminado del carrito correctamente'}), 200
        else:
            return jsonify({'error': 'Elemento del carrito no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    # Ruta para vaciar el carrito
@app.route('/api/carrito/vaciar', methods=['DELETE'])
@jwt_required()  # Asegura que el usuario esté autenticado
def vaciar_carrito():
    try:
        # Obtiene el usuario actual a partir del token
        usuario_id = get_jwt_identity()

        # Busca todos los elementos del carrito del usuario actual
        carrito = CarritoCompras.query.filter_by(usuario_id=usuario_id).all()

        # Elimina todos los elementos del carrito
        for item in carrito:
            db.session.delete(item)
        db.session.commit()

        return jsonify({'message': 'Carrito vaciado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

    
# Ruta para actualizar la cantidad de un producto en el carrito
@app.route('/api/carrito/<int:item_id>', methods=['PUT'])
@jwt_required()  # Asegura que el usuario esté autenticado
def actualizar_cantidad_item_carrito(item_id):
    try:
        # Obtiene el usuario actual a partir del token
        usuario_id = get_jwt_identity()

        # Busca el elemento del carrito por su ID y el ID del usuario actual
        item = CarritoCompras.query.filter_by(id=item_id, usuario_id=usuario_id).first()

        if not item:
            return jsonify({'error': 'Elemento del carrito no encontrado'}), 404

        # Verifica si la solicitud contiene el campo "cantidad" en el cuerpo JSON
        if 'cantidad' not in request.json:
            return jsonify({'error': 'Falta el parámetro "cantidad" en la solicitud'}), 400

        # Obtiene la nueva cantidad del producto del cuerpo JSON de la solicitud
        nueva_cantidad = request.json['cantidad']

        # Valida que la nueva cantidad sea un entero positivo
        if not isinstance(nueva_cantidad, int) or nueva_cantidad <= 0:
            return jsonify({'error': 'La cantidad debe ser un entero positivo'}), 400

        # Actualiza la cantidad del producto en el carrito
        item.cantidad = nueva_cantidad
        db.session.commit()

        return jsonify({'message': 'Cantidad del producto actualizada correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    



    #compra de productoos -----------------------------------------------------------------------------------
@app.route('/api/completar-compra', methods=['POST'])
@jwt_required()  # Asegura que el usuario esté autenticado
def completar_compra():
    try:
        # Obtener los datos de la compra desde la solicitud JSON
        data = request.json
        producto_id = data.get('producto_id')
        cantidad_comprada = data.get('cantidad')

        # Verificar si se proporcionaron todos los datos necesarios
        if not producto_id or not cantidad_comprada:
            return jsonify({'error': 'Se requieren el ID del producto y la cantidad comprada'}), 400

        # Obtener el producto de la base de datos
        producto = Producto.query.get(producto_id)

        # Verificar si el producto existe
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404

        # Verificar si hay suficiente cantidad del producto en stock para completar la compra
        if producto.cantidad < cantidad_comprada:
            return jsonify({'error': f'No hay suficiente cantidad de {producto.nombre} en stock'}), 400

        # Reducir la cantidad de productos en la base de datos
        producto.cantidad -= cantidad_comprada

        # Confirmar los cambios en la base de datos
        db.session.commit()

        return jsonify({'message': f'Se han comprado {cantidad_comprada} unidades de {producto.nombre}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#factura_------------------------
import datetime  

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
    fecha_factura = db.Column(db.Date, nullable=False, default=datetime.date.today())  

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
            'fecha_factura': self.fecha_factura.strftime('%Y-%m-%d') 
        }
# Función para crear una factura
@app.route('/api/crear-factura', methods=['POST'])
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
    
    
    
# Función para obtener las facturas de un usuario--------------------------------------------------
@app.route('/api/facturas', methods=['GET'])
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
                'tarjeta': factura.tarjeta
            }
            detalles_facturas.append(detalle_factura)

        return jsonify({'facturas': detalles_facturas}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    




# Punto de entrada para ejecutar la aplicación Flask
if __name__ == '__main__':
    app.run(debug=True)
