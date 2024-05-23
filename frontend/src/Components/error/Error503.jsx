import  'react';
import image from '../../assets/img404.png'; // Imagen específica para el error 503

function Error503() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          Error 503<br />
          Servicio no disponible<br />
          por favor, intenta de nuevo más tarde
        </p>
        <img className="imgerror" src={image} alt="error503" />
      </div>
      <div>
        <button className='btn-comprar' onClick={() => window.location.href = '/'}>Volver al inicio</button>
      </div>
    </div>
  );
}

export default Error503;
