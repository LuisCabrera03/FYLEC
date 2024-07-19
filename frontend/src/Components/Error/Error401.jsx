import  'react';
import image from '../../assets/img404.png'; // Imagen específica para el error 401

function Error401() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          Error 401<br />
          No autorizado<br />
          por favor, inicia sesión
        </p>
        <img className="imgerror" src={image} alt="error401" />
      </div>
      <div>
        <button className='btn-comprar' onClick={() => window.location.href = '/login'}>Iniciar sesión</button>
      </div>
    </div>
  );
}

export default Error401;
