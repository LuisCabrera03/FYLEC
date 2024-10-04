import React, { PureComponent } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faComments,
  faShieldAlt,
  faBoxOpen,
  faSeedling,
  faHardHat,
  faTractor,
  faHammer,
  faTools,
  faUserShield,
  faTrowel,
  faUserTie,
  faToolbox,
} from "@fortawesome/free-solid-svg-icons";

import Categorias from "../Products/Categorias/Categorias";
import CartasHome from "../Products/CartasHome/CartasHome";

class Home extends PureComponent {
  state = {
    loading: true,
    error: false,
  };

  componentDidMount() {
    this.loadContent();
  }

  loadContent = () => {
    // Verificar si los datos están en localStorage
    const cachedCartasHome = localStorage.getItem("CartasHome");
    const cachedCategorias = localStorage.getItem("Categorias");

    if (cachedCartasHome && cachedCategorias) {
      // Si los datos están en localStorage, los usamos
      this.setState({ loading: false, error: false });
    } else {
      // Si no, los cargamos y los guardamos en localStorage
      Promise.allSettled([this.simulateLoading("CartasHome"), this.simulateLoading("Categorias")])
        .then((results) => {
          const hasError = results.some((result) => result.status === "rejected");
          if (hasError) {
            this.setState({ error: true });
            setTimeout(() => window.location.reload(), 2000); // Recarga automática después de 2 segundos si hay error
          } else {
            // Guardamos los datos en localStorage
            localStorage.setItem("CartasHome", JSON.stringify("CartasHomeData"));
            localStorage.setItem("Categorias", JSON.stringify("CategoriasData"));
            this.setState({ loading: false, error: false });
          }
        });
    }
  };

  simulateLoading = (componentName) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const error = Math.random() > 0.8;
        error ? reject(new Error(`Error al cargar ${componentName}`)) : resolve();
      }, 2000);
    });
  };

  render() {
    const { loading } = this.state;

    if (loading) {
      return (
        <div className="loading-container">
          <CircularProgress color="primary" size={60} thickness={4.5} />
        </div>
      );
    }

    return (
      <>
        <div className="container">
          <h3>Saluda</h3>
          <h2>
            LA MEJOR <br /> FERRETERÍA
          </h2>
        </div>
        <div className="servicios">
          {this.renderItem(faTruck, "SERVICIO DE ENTREGA", "Quédate en casa, nosotros te llevamos lo que necesitas 24/7")}
          {this.renderItem(faComments, "ASESOR EN LÍNEA", "¿Alguna duda? Estamos encantados de atenderte.")}
          {this.renderItem(faShieldAlt, "COMPRA SEGURA", "Todas nuestras compras son ultra seguras.")}
          {this.renderItem(faBoxOpen, "GRAN PORTAFOLIO", "Tenemos todo lo que necesitas.")}
        </div>
        <div className="categorias-icon">
          {this.renderItem(faSeedling, "Agrónomo")}
          {this.renderItem(faTractor, "Agricultor")}
          {this.renderItem(faHardHat, "Minero")}
          {this.renderItem(faHammer, "Soldador")}
          {this.renderItem(faTools, "Pulidor")}
          {this.renderItem(faUserShield, "Operativo")}
          {this.renderItem(faToolbox, "Carpintero")}
          {this.renderItem(faTrowel, "Albañil")}
          {this.renderItem(faUserTie, "Obrero")}
          {this.renderItem(faTools, "Jardinero")}
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

  renderItem(icon, title, description = "") {
    return (
      <div>
        <FontAwesomeIcon icon={icon} size={description ? "2x" : "1x"} className={description ? "icons" : "icons2"} />
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>
    );
  }
}

export default Home;
