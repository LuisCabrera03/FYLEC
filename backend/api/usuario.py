import os
import resend
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import datetime as dt
import logging
import re
from models import db, Usuario
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Configuración de Blueprint y Limiter
usuario_bp = Blueprint('usuario', __name__)
limiter = Limiter(key_func=get_remote_address, default_limits=["5 per minute"])

# Configuración de la API de Resend
resend.api_key = "re_KRJhQFH1_8jrgZWYCD474NTWptRaFtNsx"

# Función para enviar correo electrónico de bienvenida
def send_welcome_email(correo, nombre):
    params = {
        "from": "Acme <onboarding@resend.dev>",  
        "to": [correo],
        "subject": "Bienvenido a nuestro servicio",
        "html": f"<strong>Hola {nombre}, ¡bienvenido a nuestro servicio!</strong><p>Estamos encantados de tenerte con nosotros.</p><p>Saludos,<br>El equipo de soporte.</p>"
    }
    try:
        resend.Emails.send(params)
        return True
    except Exception as e:
        logging.error(f"Error al enviar el correo: {str(e)}")
        return False

# Función de validación genérica
def validate_input(data, required_fields, validators=None):
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f'El campo "{field}" es obligatorio'
    
    if validators:
        for validator in validators:
            valid, message = validator(data)
            if not valid:
                return False, message

    return True, ''

# Validación de contraseña
def is_valid_password(data):
    password = data.get('contraseña')
    if not (8 <= len(password) <= 50 and
            any(char.isdigit() for char in password) and
            any(char.isupper() for char in password) and
            any(char.islower() for char in password) and
            any(char in '!@#$%^&*()' for char in password)):
        return False, 'La contraseña debe contener entre 8 y 50 caracteres, incluyendo al menos un número, una letra mayúscula, una letra minúscula y un símbolo especial'
    return True, ''

# Validación de edad y tipo de documento
def validate_age_and_document(data):
    try:
        fecha_nacimiento = dt.strptime(data['fechaNacimiento'], '%Y-%m-%d')
    except ValueError:
        return False, 'Formato de fecha de nacimiento no válido'

    edad = (dt.now() - fecha_nacimiento).days // 365
    if data['tipoDocumento'] == 'TI':
        return False, 'No se permite el registro con Tarjeta de Identidad.'
    elif data['tipoDocumento'] in ['CC', 'CE'] and edad < 18:
        return False, 'Debes tener al menos 18 años para registrarte con este tipo de documento.'
    return True, ''

# Validación de email
def validate_email_syntax(data):
    regex = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    if not re.match(regex, data['correo']):
        return False, 'El formato del correo electrónico es inválido'
    return True, ''

@usuario_bp.route('/api/crear-cuenta', methods=['POST'])
@limiter.limit("5 per minute")
def crear_cuenta():
    try:
        data = request.json
        required_fields = ['nombre', 'correo', 'contraseña', 'fechaNacimiento', 'tipoDocumento', 'numeroDocumento', 'sexo', 'direccion']
        validators = [validate_email_syntax, is_valid_password, validate_age_and_document]
        
        valid, message = validate_input(data, required_fields, validators)
        if not valid:
            return jsonify({'error': message}), 400

        if Usuario.query.filter_by(correo=data['correo']).first():
            return jsonify({'error': 'El correo electrónico ya está en uso'}), 400

        contraseña_hash = generate_password_hash(data['contraseña']).decode('utf-8')
        nuevo_usuario = Usuario(
            nombre=data['nombre'], 
            correo=data['correo'], 
            contraseña=contraseña_hash,
            fecha_nacimiento=dt.strptime(data['fechaNacimiento'], '%Y-%m-%d'),
            tipo_documento=data['tipoDocumento'],
            numero_documento=data['numeroDocumento'],
            sexo=data['sexo'],
            departamento=data.get('departamento'),
            municipio=data.get('municipio'),
            direccion=data.get('direccion')
        )
        db.session.add(nuevo_usuario)
        db.session.commit()

        if not send_welcome_email(data['correo'], data['nombre']):
            logging.warning('Usuario creado, pero no se pudo enviar el correo electrónico')
        return jsonify({'message': 'Usuario creado correctamente y correo electrónico enviado'}), 201
    except Exception as e:
        logging.error(f"Error al crear la cuenta del usuario: {str(e)}")
        return jsonify({'error': 'Se produjo un error al procesar la solicitud.'}), 500

@usuario_bp.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.json
    correo = data.get('correo')
    contraseña = data.get('contraseña')

    if not correo or not contraseña:
        return jsonify({'error': 'El correo electrónico y la contraseña son obligatorios'}), 400

    usuario = Usuario.query.filter_by(correo=correo).first()

    if usuario and check_password_hash(usuario.contraseña, contraseña):
        token_de_sesion = create_access_token(identity=usuario.id)
        return jsonify({'token': token_de_sesion, 'userId': usuario.id}), 200
    return jsonify({'error': 'Credenciales incorrectas'}), 401

@usuario_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        if usuario:
            return jsonify({'usuario': usuario.serialize()}), 200
        return jsonify({'error': 'Usuario no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@usuario_bp.route('/api/actualizar-perfil', methods=['PUT'])
@jwt_required()
def actualizar_perfil():
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        datos = request.json

        if 'correo' in datos and not validate_email_syntax(datos):
            return jsonify({'error': 'El formato del correo electrónico es inválido'}), 400

        usuario_existente = Usuario.query.filter_by(correo=datos.get('correo')).first()
        if usuario_existente and usuario_existente.id != usuario_id:
            return jsonify({'error': 'El correo electrónico ya está en uso'}), 400

        usuario.actualizar(datos)
        db.session.commit()
        return jsonify({'message': 'Perfil actualizado correctamente'}), 200
    except Exception as e:
        logging.error(f"Error al actualizar el perfil: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@usuario_bp.route('/api/cambiar-contrasena', methods=['OPTIONS', 'PUT'])
@jwt_required()
def cambiar_contraseña():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight'}), 200
    try:
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)
        data = request.json

        if not check_password_hash(usuario.contraseña, data.get('passwordAnterior')):
            return jsonify({'error': 'La contraseña anterior es incorrecta'}), 400

        if data.get('passwordNueva') != data.get('confirmarPassword'):
            return jsonify({'error': 'Las contraseñas nuevas no coinciden'}), 400

        valid, message = is_valid_password(data)
        if not valid:
            return jsonify({'error': message}), 400

        usuario.contraseña = generate_password_hash(data.get('passwordNueva')).decode('utf-8')
        db.session.commit()
        return jsonify({'message': 'Contraseña cambiada correctamente'}), 200
    except Exception as e:
        logging.error(f"Error al cambiar la contraseña: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@usuario_bp.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        usuarios = Usuario.query.all()
        detalles_usuarios = [usuario.serialize() for usuario in usuarios]
        return jsonify({'usuarios': detalles_usuarios}), 200
    except Exception as e:
        logging.error(f"Error al obtener usuarios: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500
