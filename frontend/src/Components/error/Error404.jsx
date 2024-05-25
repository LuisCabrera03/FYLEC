import   'react';
import './Error404.css';
import image from '../../assets/img404.png';

function Error404() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          Error 404<br />
          La página que estás<br />
          buscando<br />
          no existe y me dio amsiedad
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
