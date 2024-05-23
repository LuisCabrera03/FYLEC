import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGreaterThan,
    faSquarePlus,
    faSquareMinus,
    faStar,
    faStarHalfAlt,
    faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { BarLoader } from "react-spinners";

import "./Detalle.css";

function Detalle({ match }) {
    const [producto, setProducto] = useState(null);
    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const [cantidad, setCantidad] = useState(1);
    const [mensajeError, setMensajeError] = useState("");
    const [zoom, setZoom] = useState(false);
    const [posicionZoom, setPosicionZoom] = useState({ x: 0, y: 0 });
    const [calificacion, setCalificacion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [usuarioId, setUsuarioId] = useState(null);
    const [sesionIniciada, setSesionIniciada] = useState(false);
    const [existenciasAgotadas, setExistenciasAgotadas] = useState(false);
    const [enCarrito, setEnCarrito] = useState(false);
    const [mostrarAnimacion, setMostrarAnimacion] = useState(false);

    const history = useHistory();

    useEffect(() => {
        const obtenerUsuarioId = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await axios.get("http://localhost:5000/api/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUsuarioId(response.data.usuario.id);
                    setSesionIniciada(true);
                }
            } catch (error) {
                // No mostrar error si la autenticación falla
                setSesionIniciada(false);
            }
        };

        obtenerUsuarioId();
    }, []);

    useEffect(() => {
        const obtenerProducto = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/productos/${match.params.id}`);
                setProducto(response.data.producto);

                if (response.data.producto && response.data.producto.subcategoria) {
                    obtenerProductosRelacionados(response.data.producto.subcategoria);
                }

                const calificacionAleatoria = Math.floor(Math.random() * 3) + 3;
                setCalificacion(calificacionAleatoria);

                if (response.data.producto.cantidad === 0) {
                    setExistenciasAgotadas(true);
                }

                if (sesionIniciada) {
                    const token = localStorage.getItem("token");
                    if (token) {
                        const responseCarrito = await axios.get("http://localhost:5000/api/carrito", {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const productosEnCarrito = responseCarrito.data.carrito.map(item => item.producto.id);
                        setEnCarrito(productosEnCarrito.includes(response.data.producto.id));
                    }
                }

                setLoading(false);
                window.scrollTo(0, 0);
            } catch (error) {
                console.error("Error al cargar el producto:", error);
                setLoading(false);
                setMensajeError("Error al cargar el producto. Por favor, inténtalo de nuevo.");
            }
        };

        obtenerProducto();
    }, [match.params.id, sesionIniciada]);

    const obtenerProductosRelacionados = async (subcategoria) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/productos?subcategoria=${subcategoria}`);
            const productosFiltrados = response.data.productos.filter(p => p.id !== parseInt(match.params.id));
            setProductosRelacionados(productosFiltrados);
        } catch (error) {
            console.error("Error al obtener productos relacionados:", error);
        }
    };

    const handleCantidadChange = (event) => {
        let newCantidad = parseInt(event.target.value);
        newCantidad = Math.max(1, Math.min(newCantidad, producto.cantidad));
        setCantidad(newCantidad);
        setMensajeError("");
    };

    const aumentarCantidad = () => {
        if (cantidad < producto.cantidad) {
            setCantidad(cantidad + 1);
            setMensajeError("");
        } else {
            setMensajeError("No puedes superar el máximo de existencias");
        }
    };

    const disminuirCantidad = () => {
        setCantidad(cantidad > 1 ? cantidad - 1 : cantidad);
        setMensajeError("");
    };

    const handleComprar = () => {
        if (!sesionIniciada) {
            setMensajeError("Debes iniciar sesión para comprar este producto.");
            return;
        }
        history.push(`/compra/${producto.id}/${cantidad}`);
    };

    const handleAgregarAlCarrito = async () => {
        if (!sesionIniciada) {
            setMensajeError("Debes iniciar sesión para agregar este producto al carrito.");
            return;
        }
        if (cantidad > producto.cantidad) {
            setMensajeError("No puedes seleccionar más productos de los disponibles.");
            return;
        }
        try {
            const data = { usuario_id: usuarioId, producto_id: producto.id, cantidad };
            await axios.post("http://localhost:5000/api/agregar-al-carrito", data);
            setEnCarrito(true);
            mostrarAnimacionTemporal();
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
        }
    };

    const mostrarAnimacionTemporal = () => {
        setMostrarAnimacion(true);
        setTimeout(() => setMostrarAnimacion(false), 2000);
    };

    const handleMouseEnter = () => setZoom(true);

    const handleMouseLeave = () => setZoom(false);

    const handleMouseMove = (event) => {
        const { left, top, width, height } = event.target.getBoundingClientRect();
        const x = (event.clientX - left) / width;
        const y = (event.clientY - top) / height;
        setPosicionZoom({ x, y });
    };

    const handleStarClick = (rating) => setCalificacion(rating);

    const renderStar = (index) => {
        if (index <= calificacion) {
            return <FontAwesomeIcon icon={faStar} onClick={() => handleStarClick(index)} />;
        } else if (index - 0.5 === calificacion) {
            return <FontAwesomeIcon icon={faStarHalfAlt} onClick={() => handleStarClick(index)} />;
        } else {
            return <FontAwesomeIcon icon={faStar} opacity="0.5" onClick={() => handleStarClick(index)} />;
        }
    };

    const handleProductoRelacionadoClick = async (productoSeleccionado) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/productos/${productoSeleccionado.id}`);
            setProducto(response.data.producto);
            setCantidad(1);

            if (response.data.producto.cantidad === 0) {
                setExistenciasAgotadas(true);
            } else {
                setExistenciasAgotadas(false);
            }

            if (sesionIniciada) {
                const token = localStorage.getItem("token");
                if (token) {
                    const responseCarrito = await axios.get("http://localhost:5000/api/carrito", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const productosEnCarrito = responseCarrito.data.carrito.map(item => item.producto.id);
                    setEnCarrito(productosEnCarrito.includes(response.data.producto.id));
                }
            }

            obtenerProductosRelacionados(response.data.producto.subcategoria);
            setLoading(false);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Error al cargar el producto:", error);
            setLoading(false);
            setMensajeError("Error al cargar el producto relacionado. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <div className="detalle">
            {loading ? (
                <div className="spinner-container">
                    <BarLoader color={"#36D7B7"} loading={loading} className="spiner" />
                </div>
            ) : producto ? (
                <div>
                    <div className="encabezado">
                        <p>
                            {producto.categoria}{" "}
                            <small>
                                <FontAwesomeIcon icon={faGreaterThan} size="xs" />{" "}
                                {producto.subcategoria}
                                <FontAwesomeIcon icon={faGreaterThan} size="xs" />{" "}
                                {producto.nombre}
                                <FontAwesomeIcon icon={faGreaterThan} size="xs" />{" "}
                                {producto.codigo}{" "}
                            </small>
                        </p>
                    </div>

                    <div className="detalle-container">
                        <div
                            className="image-container"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img
                                src={producto.imgUrl}
                                alt={producto.nombre}
                                style={{
                                    transform: `scale(${zoom ? 2 : 1})`,
                                    transformOrigin: `${posicionZoom.x * 100}% ${posicionZoom.y * 100}%`,
                                }}
                            />
                            {zoom && (
                                <div
                                    className="zoom-window"
                                    style={{
                                        left: posicionZoom.x * 100 + "%",
                                        top: posicionZoom.y * 100 + "%",
                                    }}
                                ></div>
                            )}
                        </div>
                        <div className="detalle-info">
                            <div className="categoria-nombre">
                                {producto.nombre}
                                <p className="categoria-oferta">Marca: {producto.marca}</p>
                            </div>
                            <small className="categoria-oferta">
                                Existencias: {producto.cantidad} Ref.: {producto.codigo}
                            </small>
                            <div className="estrellas">
                                {[...Array(5)].map((_, index) => (
                                    <span key={index}>{renderStar(index + 1)}</span>
                                ))}
                            </div>
                            <p className="precio-oferta">
                                Valor Unitario: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(producto.precio * cantidad)}
                            </p>

                            {producto.descuento > 0 && (
                                <div>
                                    <p>Descuento: {producto.descuento}%</p>
                                    <p>
                                        Valor Unitario con descuento: $
                                        {(
                                            producto.precio *
                                            (1 - producto.descuento / 100)
                                        ).toLocaleString("es-CO", { maximumFractionDigits: 3 })}
                                    </p>
                                </div>
                            )}
                            <div className="cantidad">
                                <button onClick={disminuirCantidad}>
                                    <FontAwesomeIcon icon={faSquareMinus} />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={producto.cantidad}
                                    value={cantidad}
                                    onChange={handleCantidadChange}
                                />
                                <button onClick={aumentarCantidad}>
                                    <FontAwesomeIcon icon={faSquarePlus} />
                                </button>
                            </div>
                            {enCarrito ? (
                                <p style={{ color: "green" }}>¡Producto ya está en el carrito!</p>
                            ) : existenciasAgotadas ? (
                                <p style={{ color: "red" }}>¡Producto agotado!</p>
                            ) : (
                                <div className="btns">
                                    <button
                                        className={`btn-comprar ${producto.cantidad === 0 ? "disabled" : ""}`}
                                        onClick={handleComprar}
                                        disabled={producto.cantidad === 0}
                                    >
                                        Comprar
                                    </button>
                                    <button
                                        className={`btn-carrito ${producto.cantidad === 0 ? "disabled" : ""}`}
                                        onClick={handleAgregarAlCarrito}
                                        disabled={producto.cantidad === 0}
                                    >
                                        Agregar al Carrito
                                    </button>
                                </div>
                            )}
                            {mensajeError && <p style={{ color: "red" }}>{mensajeError}</p>}
                        </div>
                    </div>
                    <div className="detalle-container">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Marca:</td>
                                    <td>{producto.marca}</td>
                                </tr>
                                <tr>
                                    <td>Existencias:</td>
                                    <td>{producto.cantidad}</td>
                                </tr>
                                <tr>
                                    <td>Descripción:</td>
                                    <td>{producto.descripcion}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p>Error: No se pudo cargar el producto</p>
            )}
            {mostrarAnimacion && (
                <div className="animation-container">
                    <FontAwesomeIcon icon={faCheckCircle} className="animation-icon" />
                    <p className="animation-text">Producto agregado al carrito</p>
                </div>
            )}
            <div className="container-products">
                <div className="encabezado">
                    <p>Quizás te pueda interesar</p>
                </div>
                <div className="product-cards">
                    {productosRelacionados.map((producto) => (
                        <div
                            key={producto.id}
                            className="product-card"
                            onClick={() => handleProductoRelacionadoClick(producto)}
                        >
                            <p>Nombre: {producto.nombre}</p>
                            <p>Categoría: {producto.categoria}</p>
                            <p>Precio: ${producto.precio}</p>
                            <img src={producto.imgUrl} alt={producto.nombre} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

Detalle.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
    }).isRequired,
};

export default Detalle;
