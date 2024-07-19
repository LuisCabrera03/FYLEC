import  'react';
import image from '../../assets/img404.png'; // Imagen específica para el error 500

function Error500() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          Error 500<br />
          Error interno del servidor<br />
          por favor, intenta de nuevo más tarde
        </p>
        <img className="imgerror" src={image} alt="error500" />
      </div>
      <div>
        <button className='btn-comprar' onClick={() => window.location.href = '/'}>Volver al inicio</button>
      </div>
    </div>
  );
}

export default Error500;
