import { Component } from "react";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Categorias from "../Categorias/Categorias";
import {
  faTruck,
  faComments,
  faShieldAlt,
  faBoxOpen,
  faUserGraduate,
  faSeedling,
  faHardHat,
  faHammer,
  faTools,
  faUserShield,
  faUserSecret,
  faUserTie,
  faToolbox,
} from "@fortawesome/free-solid-svg-icons";

// Importa el componente CartasHome
import CartasHome from "../CartasHome/CartasHome";

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <div className="container">
          <h3>Saluda</h3>
          <h2>
            LA MEJOR <br></br>FERRETERÍA
          </h2>
        </div>
        <div className="servicios">
          <div>
            <FontAwesomeIcon icon={faTruck} size="2x" className="icons" />
            <h4>SERVICIO DE ENTREGA</h4>
            <p>Quédate en casa, nosotros te llevamos lo que necesitas 24/7</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faComments} size="2x" className="icons" />
            <h4>ASESOR EN LÍNEA</h4>
            <p>¿Alguna duda? Estamos encantados de atenderte.</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faShieldAlt} size="2x" className="icons" />
            <h4>COMPRA SEGURA</h4>
            <p>Todas nuestras compras son ultra seguras.</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faBoxOpen} size="2x" className="icons" />
            <h4>GRAN PORTAFOLIO</h4>
            <p>Tenemos todo lo que necesitas.</p>
          </div>
        </div>
        <div className="categorias-icon">
          <div>
            <FontAwesomeIcon
              icon={faUserGraduate}
              size="1x"
              className="icons2"
            />
            <p>Agrónomo</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faSeedling} size="1x" className="icons2" />
            <p>Agricultor</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faHardHat} size="1x" className="icons2" />
            <p>Minero</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faHammer} size="1x" className="icons2" />
            <p>Soldador</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faTools} size="1x" className="icons2" />
            <p>Pulidor</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faUserShield} size="1x" className="icons2" />
            <p>Operativo</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faToolbox} size="1x" className="icons2" />
            <p>Carpintero</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faUserSecret} size="1x" className="icons2" />
            <p>Albañil</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faUserTie} size="1x" className="icons2" />
            <p>Obrero</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faTools} size="1x" className="icons2" />
            <p>Jardinero</p>
          </div>
        </div>
        <div className="container2">
          <h2>40%</h2>
          <h3>
            SIERRAS <br></br>ELÉCTRICAS
          </h3>
        </div>
        
        {/* Container 3 */}
        <div className="container3">
          {/* Renderiza el componente CartasHome sin botones de selección */}
          <CartasHome />
        </div>

        {/* <div className="container5">
          <div className="martillo"><h2>15%</h2> <h3>MARTILLOS</h3></div>
          <div className="tornillo"><h2>35%</h2><h3>TORNILLOS</h3></div>
          <div className="linterna"><h2>25%</h2><h3>LINTERNAS</h3></div>
        </div> */}

        {/* 05/04/2024 */}
        <div className="container6">
        <Categorias />
        
        </div>

      </>
    );
  }
}

export default Home;
