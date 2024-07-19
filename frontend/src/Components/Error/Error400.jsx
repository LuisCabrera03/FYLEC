import  'react';
import image from '../../assets/img404.png'; // Imagen específica para el error 400

function Error400() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          Error 400<br />
          Solicitud incorrecta<br />
          por favor, revisa tu petición
        </p>
        <img className="imgerror" src={image} alt="error400" />
      </div>
      <div>
        <button className='btn-comprar' onClick={() => window.location.href = '/'}>Volver al inicio</button>
      </div>
    </div>
  );
}

export default Error400;
