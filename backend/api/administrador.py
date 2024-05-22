from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, Administrador

administrador_bp = Blueprint('administrador', __name__)

@administrador_bp.route('/api/admin-login', methods=['POST'])
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

@administrador_bp.route('/api/rol-admin', methods=['GET'])
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

@administrador_bp.route('/api/administradores', methods=['GET'])
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

@administrador_bp.route('/api/administradores', methods=['POST'])
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

@administrador_bp.route('/api/administradores/<int:id>', methods=['PUT'])
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

@administrador_bp.route('/api/administradores/<int:id>', methods=['DELETE'])
def eliminar_administrador(id):
    admin = Administrador.query.get(id)
    if admin is None:
        return jsonify({'mensaje': 'No se encontró el administrador'}), 404
    db.session.delete(admin)
    db.session.commit()
    return jsonify({'mensaje': 'Administrador eliminado exitosamente'}), 200
