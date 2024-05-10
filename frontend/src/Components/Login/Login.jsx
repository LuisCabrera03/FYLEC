import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({ email: '', contraseña: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Nuevo estado para indicar carga
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:5000/api/verifyToken', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.ok) {
            setIsLoggedIn(true);
          } else if (response.status === 401) { // Manejo específico para token no autorizado
            setIsLoggedIn(false);
            localStorage.removeItem('token'); // Eliminar el token inválido
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Error al verificar token:', error);
          setIsLoggedIn(false); // Manejo de errores al verificar el token
        }
      } else {
        setIsLoggedIn(false);
      }
    };
  
    checkLoggedIn();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Indicar carga al iniciar sesión
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { token, userId } = await response.json();
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        setIsLoggedIn(true);
        history.push('/');
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false); // Detener indicador de carga
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
  };

  const handleCreateAccount = () => {
    history.push('/crearcuenta');
  };

  const handleForgotPassword = () => {
    history.push('/forgotpassword');
  };

  return (
    <div className='login'>
      <div className="login-container-custom">
        <div className="campos">
          <h2 className='login-titulo'>Iniciar Sesión</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="custom-button">Cerrar Sesión</button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group-custom">
                    <label htmlFor="email">Correo Electrónico</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Tu correo electronico" />
                  </div>
                  <div className="form-group-custom">
                    <label htmlFor="contraseña">Contraseña</label>
                    <input type="password" id="contraseña" name="contraseña" value={formData.contraseña} onChange={handleChange} required placeholder="Tu contraseña" />
                  </div>
                  {error && <p className="error-custom">{error}</p>}
                  <button type="submit" className="custom-button" >Ingresar</button>
                </form>
              )}

              <Link to="/forgotpassword" className="forgot-password">¿Olvidaste tu contraseña?</Link>

              <Link to="/admin-login" className="btn-admin">
                <button>Acceder como Administrador</button>
              </Link>
            </>
          )}
        </div>
        <div className="bienvenida">

          <div className="btn-crear">
            <p>¡Únete y construye con nosotros!</p>
            <button onClick={handleCreateAccount} >Crear Cuenta</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
