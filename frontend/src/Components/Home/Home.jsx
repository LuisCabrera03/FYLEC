import { Component } from "react";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

import Categorias from "../Categorias/Categorias";
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
            LA MEJOR <br /> FERRETERÍA
          </h2>
        </div>
        <div className="servicios">
          {this.renderService(faTruck, "SERVICIO DE ENTREGA", "Quédate en casa, nosotros te llevamos lo que necesitas 24/7")}
          {this.renderService(faComments, "ASESOR EN LÍNEA", "¿Alguna duda? Estamos encantados de atenderte.")}
          {this.renderService(faShieldAlt, "COMPRA SEGURA", "Todas nuestras compras son ultra seguras.")}
          {this.renderService(faBoxOpen, "GRAN PORTAFOLIO", "Tenemos todo lo que necesitas.")}
        </div>
        <div className="categorias-icon">
          {this.renderCategory(faUserGraduate, "Agrónomo")}
          {this.renderCategory(faSeedling, "Agricultor")}
          {this.renderCategory(faHardHat, "Minero")}
          {this.renderCategory(faHammer, "Soldador")}
          {this.renderCategory(faTools, "Pulidor")}
          {this.renderCategory(faUserShield, "Operativo")}
          {this.renderCategory(faToolbox, "Carpintero")}
          {this.renderCategory(faUserSecret, "Albañil")}
          {this.renderCategory(faUserTie, "Obrero")}
          {this.renderCategory(faTools, "Jardinero")}
        </div>
        <div className="container2">
          <h2>40%</h2>
          <h3>
            SIERRAS <br /> ELÉCTRICAS
          </h3>
        </div>
        <div className="container3">
          <CartasHome />
        </div>
        <div className="container6">
          <Categorias />
        </div>
      </>
    );
  }

  renderService(icon, title, description) {
    return (
      <div>
        <FontAwesomeIcon icon={icon} size="2x" className="icons" />
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    );
  }

  renderCategory(icon, label) {
    return (
      <div>
        <FontAwesomeIcon icon={icon} size="1x" className="icons2" />
        <p>{label}</p>
      </div>
    );
  }
}

export default Home;
