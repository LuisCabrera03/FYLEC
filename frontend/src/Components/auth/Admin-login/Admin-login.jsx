import  { useState } from 'react';
import { useHistory } from 'react-router-dom';

const AdminLogin = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({ email: '', contraseña: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { token } = await response.json();
        // Almacenar el token en localStorage
        localStorage.setItem('adminToken', token); // Aquí almacenamos el token como 'adminToken'
        // Redireccionar al componente Admin después del inicio de sesión exitoso
        history.push('/admin');
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className='login'>
      <div className="login-container-custom">
        <div className="campos">
          <h2 className='login-titulo'>Login de Administrador</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Tu correo electrónico" />
            </div>
            <div className="form-group-custom">
              <label htmlFor="contraseña">Contraseña</label>
              <input type="password" id="contraseña" name="contraseña" value={formData.contraseña} onChange={handleChange} required placeholder="Tu contraseña" />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="custom-button" >Iniciar Sesión</button>
          </form>
          
        </div>
        <div className="bienvenida">
        <p><strong>¡Bienvenido al corazón de la ferretería!</strong></p>
  <p>Preparados para hacer que tu experiencia administrativa sea más <em>eficiente</em> y <em>exitosa</em>.</p>
  <p>Por favor, ingresa tus credenciales para desbloquear todo su potencial.</p>
          </div>
      </div>
    </div>
  );
};

export default AdminLogin;
