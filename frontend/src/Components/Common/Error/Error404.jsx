import   'react';
import './Error404.css';
import image from '../../../assets/img404.png'; // Imagen específica para el error 400

function Error404() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          Error 404<br />
          La página que estás<br />
          buscando<br />
          no existe.
        </p>
        <img className="imgerror" src={image} alt="error404" />
      </div>
      <div>
        <button className='btn-comprar' onClick={() => window.location.href = '/'}>Volver al inicio</button>
      </div>
    </div>
  );
}

export default Error404;
