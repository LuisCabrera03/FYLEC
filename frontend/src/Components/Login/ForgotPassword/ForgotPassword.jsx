import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const ForgotPassword = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({ email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Aquí puedes manejar la respuesta si es exitosa
        history.push('/reset-password-success'); // Redirigir a una página de éxito
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      setError('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password">
      <h2>¿Olvidaste tu contraseña?</h2>
      <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Correo'}</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
