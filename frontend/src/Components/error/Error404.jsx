import '../error/Error404.css'
import image from '../../assets/img404.png'

function Error404() {
  return (
    <div className="error404">
      <div className="content">
        <p>
          Error 404<br />
          la pagina que estas<br />
          buscando<br />
          no existe y me dio ansiedad
        </p>
        <img className="imgerror" src={image} alt="error404" />
      </div>
      <button>volver al inicio</button>
    </div>
  )
}

export default Error404