import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Perfil.css';
import { useHistory } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUserPen } from "@fortawesome/free-solid-svg-icons";

const Perfil = () => {
  const history = useHistory();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    departamento: '',
    municipio: '',
    direccion: '',
    fecha_nacimiento: '',
    tipo_documento: '',
    numero_documento: '',
    sexo: '',
    passwordAnterior: '',
    passwordNueva: '',
    confirmarPassword: ''
  });

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  const retriesRef = useRef(0);

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el perfil');
      }

      const responseData = await response.json();

      if (!responseData || !responseData.usuario) {
        throw new Error('Error al obtener el perfil: Datos de perfil no válidos');
      }

      setProfile(responseData.usuario);
      setFormData(responseData.usuario);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener el perfil:', error.message);
      setError(error.message);
      setIsLoading(false);

      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current++;
        setTimeout(fetchProfileData, RETRY_DELAY);
      } else {
        history.push('/login');
      }
    }
  }, [history]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/');
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData(profile); // Esto asegura que el formulario tenga los datos actuales al iniciar la edición
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setFormData(profile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let validatedValue = value;

    if (name === 'numero_documento') {
      validatedValue = value.replace(/\D/g, '');
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: validatedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/actualizar-perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      const responseData = await response.json();
      setProfile(responseData.usuario); // Actualiza el perfil con los datos nuevos
      setEditing(false);
      toast.success('Perfil actualizado correctamente');

      setIsLoading(false);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error.message);
      setError('Error al actualizar el perfil');
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cambiar-contraseña', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          passwordAnterior: formData.passwordAnterior,
          passwordNueva: formData.passwordNueva,
          confirmarPassword: formData.confirmarPassword
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al cambiar la contraseña');
      }

      setFormData(prevState => ({
        ...prevState,
        passwordAnterior: '',
        passwordNueva: '',
        confirmarPassword: ''
      }));
      setError('');
      setEditing(false);
      toast.success(responseData.message);

      setIsLoading(false);
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error.message);
      setError(error.message);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const departamentos = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca',
    'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
    'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander',
    'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
  ];

  const municipiosPorDepartamento = {
    'Amazonas': ['Leticia', 'Puerto Nariño', 'La Chorrera', 'Tarapacá', 'Puerto Santander', 'La Pedrera', 'Puerto Arica'],
    // Otros departamentos y municipios aquí
  };

  const handleDepartamentoChange = (e) => {
    const departamento = e.target.value;
    setFormData(prevState => ({
      ...prevState,
      departamento,
      municipio: ''
    }));
  };

  return (
    <div className="container-perfil">
      {isLoading && <p className='loading'>Cargando...</p>}
      {error && <p>{error}</p>}
      {profile && !editing && (
        <div>
          <div className="cabecera-perfil">
            <p className='encabezado'>Mi Perfil</p>
            <div className="cabecera-saludo">
              <button onClick={handleEdit}><FontAwesomeIcon icon={faUserPen} className='icon-edit' /></button>
              <div>
                <p>Hola, <b>{profile.nombre.split(' ')[0]}</b></p>
                <p>Administra y protege tu cuenta</p>
              </div>
              <button onClick={handleLogout}><FontAwesomeIcon icon={faRightFromBracket} className='icon-exit' /></button>
            </div>
          </div>
          <div className="profile-info">
            <div><p>Identificador del Usuario:</p> <p className='info'>{profile.id}</p></div>
            <div><p>Nombre: </p><p className='info'>{profile.nombre}</p ></div>
            <div><p>Correo electrónico: </p> <p className='info'>{profile.correo}</p></div>
            <div><p>Tipo de documento: </p> <p className='info'>{profile.tipo_documento}</p></div>
            <div><p>Número de documento: </p> <p className='info'>{profile.numero_documento}</p></div>
            <div><p>Fecha de nacimiento:</p> <p className='info'>{profile.fecha_nacimiento}</p></div>
            <div><p>Género: </p><p className='info'>{profile.sexo}</p></div>
            <div><p>Departamento: </p><p className='info'>{profile.departamento}</p></div>
            <div><p>Municipio: </p> <p className='info'>{profile.municipio}</p></div>
            <div><p>Dirección: </p><p className='info'>{profile.direccion}</p></div>
          </div>
          <div className="btn-acciones">
            <button onClick={handleEdit} className='btn2-edt'>Editar Perfil</button>
            <button onClick={handleLogout} className='btn2-exit'>Cerrar Sesión</button>
          </div>
        </div>
      )}
      {editing && (
        <div className='login-container-custom2'>

          <form onSubmit={handleSubmit}>
            <fieldset className='input-nombre'>
              <label>Nombre:</label>
              <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} />
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Departamento:</label>
              <select name="departamento" className='select' value={formData.departamento} onChange={handleDepartamentoChange}>
                <option value="">Selecciona tu departamento</option>
                {departamentos.map((depto, index) => (
                  <option key={index} value={depto}>{depto}</option>
                ))}
              </select>
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Municipio:</label>
              <select name="municipio" className='select' value={formData.municipio} onChange={handleChange}>
                <option value="">Selecciona tu municipio</option>
                {municipiosPorDepartamento[formData.departamento]?.map((mun, index) => (
                  <option key={index} value={mun}>{mun}</option>
                ))}
              </select>
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Dirección:</label>
              <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} />
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Fecha de nacimiento:</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleChange} />
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Tipo de documento:</label>
              <select name="tipo_documento" className='select' value={formData.tipo_documento} onChange={handleChange}>
                <option value="">Selecciona tu tipo de documento</option>
                <option value="ti">Tarjeta de Identidad</option>
                <option value="cedula">Cédula de Ciudadanía</option>
              </select>
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Número de documento:</label>
              <input type="text" name="numero_documento" value={formData.numero_documento || ''} onChange={handleChange} />
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Género:</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange}>
                <option value="">Selecciona tu género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Contraseña anterior:</label>
              <input type="password" name="passwordAnterior" value={formData.passwordAnterior || ''} onChange={handleChange} />
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Nueva contraseña:</label>
              <input type="password" name="passwordNueva" value={formData.passwordNueva || ''} onChange={handleChange} />
            </fieldset>
            <fieldset className='input-nombre'>
              <label>Confirmar nueva contraseña:</label>
              <input type="password" name="confirmarPassword" value={formData.confirmarPassword || ''} onChange={handleChange} />
            </fieldset>
            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button type="button" className="button" onClick={handleCancelEdit}>Cancelar</button>
            <button type="button" className="button" onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Perfil;
