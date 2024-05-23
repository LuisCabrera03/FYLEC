from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from email_validator import validate_email, EmailNotValidError
from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import datetime as dt, timedelta
import logging
from models import db, Usuario

usuario_bp = Blueprint('usuario', __name__)

def validate_required_fields(data, required_fields):
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f'El campo "{field}" es obligatorio'
    return True, ''

@usuario_bp.route('/api/crear-cuenta', methods=['POST'])
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

@usuario_bp.route('/api/login', methods=['POST'])
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

@usuario_bp.route('/api/profile', methods=['GET'])
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

@usuario_bp.route('/api/actualizar-perfil', methods=['PUT'])
@jwt_required()
def actualizar_perfil():
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(usuario_id)
    datos = request.json
    usuario.actualizar(datos)
    db.session.commit()
    return jsonify({'message': 'Perfil actualizado correctamente'}), 200

@usuario_bp.route('/api/cambiar-contraseña', methods=['PUT'])
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

@usuario_bp.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        usuarios = Usuario.query.all()
        detalles_usuarios = [usuario.serialize() for usuario in usuarios]
        return jsonify({'usuarios': detalles_usuarios}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
