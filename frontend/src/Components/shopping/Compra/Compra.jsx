import   'react';
import image from '../../../assets/img404.png'; // Imagen específica para la página de error 404

function Compra() {
  return (
    <div className="error404">
      <div className="content">
        <p>
        ¡Ay caramba!<br />
          Parece que este módulo decidió tomar unas vacaciones. 🏖️<br />
          Estamos trabajando para convencerlo de que vuelva.<br></br> Mientras tanto, agradecemos tu paciencia.
        </p>
        <img className="imgerror" src={image} alt="Página no encontrada" />
      </div>
      <div>
        <button className='btn-comprar' onClick={() => window.location.href = '/'}>Regresar al inicio </button>
      </div>
    </div>
  );
}

export default Compra;
