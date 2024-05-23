import 'react';
import image from '../../assets/img404.png'; // Imagen específica para el error 403

function Error403() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          Error 403<br />
          Prohibido<br />
          no tienes permiso para acceder a esta página
        </p>
        <img className="imgerror" src={image} alt="error403" />
      </div>
      <div>
        <button className='btn-comprar' onClick={() => window.location.href = '/'}>Volver al inicio</button>
      </div>
    </div>
  );
}

export default Error403;
