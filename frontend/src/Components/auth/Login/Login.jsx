import { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const Login = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({ correo: '', contraseña: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verifyToken', {
          method: 'GET',
          credentials: 'include', // Importante para enviar la cookie con la solicitud
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
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
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para que las cookies se gestionen automáticamente
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsLoggedIn(true);
        history.push('/');
      } else {
        const errorMessage = await response.json();
        setError(errorMessage.error);
        toast.error(errorMessage.error);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      toast.error('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include', // Importante para eliminar la cookie en el servidor
      });
      setIsLoggedIn(false);
      history.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='login'>
      <ToastContainer />
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
                    <label htmlFor="correo">Correo Electrónico</label>
                    <input 
                      type="email" 
                      id="correo" 
                      name="correo" 
                      value={formData.correo} 
                      onChange={handleChange} 
                      required 
                      placeholder="Tu correo electrónico" 
                    />
                  </div>
                  <div className="form-group-custom">
                    <label htmlFor="contraseña">Contraseña</label>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      id="contraseña" 
                      name="contraseña" 
                      value={formData.contraseña} 
                      onChange={handleChange} 
                      required 
                      placeholder="Tu contraseña" 
                    />
                    <div className="show-password">
                      <input 
                        type="checkbox" 
                        id="showPassword" 
                        checked={showPassword} 
                        onChange={togglePasswordVisibility} 
                      />
                      <label htmlFor="showPassword">Mostrar Contraseña</label>
                    </div>
                  </div>
                  {error && <p className="error-custom">{error}</p>}
                  <button type="submit" className="custom-button">Ingresar</button>
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
            <button onClick={() => history.push('/crearcuenta')}>Crear Cuenta</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
