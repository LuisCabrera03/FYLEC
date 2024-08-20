import 'react';
import image from '../../../../assets/img404.png'; // Imagen específica para la página de error 404

function Compra() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          ¡Lo sentimos!<br />
          Este módulo no está disponible en este momento.<br />
          Agradecemos tu paciencia.
        </p>
        <img className="imgerror" src={image} alt="Página no encontrada" />
      </div>
      <div>
        <button className='btn-comprar' onClick={() => window.location.href = '/'}>Regresar al inicio</button>
      </div>
    </div>
  );
}

export default Compra;
