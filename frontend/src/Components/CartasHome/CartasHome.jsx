import { useState, useEffect } from 'react';
import axios from 'axios';
import './CartasHome.css';
import { useHistory } from 'react-router-dom';

import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGreaterThan,
    faLessThan,
} from "@fortawesome/free-solid-svg-icons";

const CartasHome = () => {
    const [productos, setProductos] = useState([]);
    const [filtroActual, setFiltroActual] = useState('precioMinimo');
    const [ofertaRelampago, setOfertaRelampago] = useState(null);
    const [tiempoRestante, setTiempoRestante] = useState(10 * 60); // 10 minutos en segundos
    const [productosAleatorios, setProductosAleatorios] = useState([]);
    const history = useHistory();

    const obtenerProductosAleatorios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/productos-aleatorios');
            return response.data.productosAleatorios;
        } catch (error) {
            console.error('Error al obtener productos aleatorios:', error);
            return [];
        }
    };

    const mostrarSiguienteProductos = async () => {
        const nuevosProductos = await obtenerProductosAleatorios();
        setProductosAleatorios(nuevosProductos);
    };

    useEffect(() => {
        switch (filtroActual) {
            case 'precioMinimo':
                obtenerProductosMinPrecio();
                break;
            case 'mayorDescuento':
                obtenerProductosMasDescuento();
                break;
            case 'masNuevos':
                obtenerProductosMasNuevos();
                break;
            default:
                obtenerProductosMinPrecio();
                break;
        }
        obtenerOfertaRelampago();
        const interval = setInterval(() => {
            setTiempoRestante(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [filtroActual]);

    const obtenerProductosMinPrecio = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/productos-min-precio');
            setProductos(response.data.productosMinPrecio);
        } catch (error) {
            console.error('Error al obtener productos con el precio mínimo:', error);
        }
    };

    const obtenerProductosMasDescuento = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/productos-mas-descuento');
            setProductos(response.data.productosMasDescuento);
        } catch (error) {
            console.error('Error al obtener productos con mayor descuento:', error);
        }
    };

    const obtenerProductosMasNuevos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/productos-mas-nuevos');
            setProductos(response.data.productosMasNuevos);
        } catch (error) {
            console.error('Error al obtener productos más nuevos:', error);
        }
    };

    const obtenerOfertaRelampago = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/oferta-relampago');
            setOfertaRelampago(response.data.oferta);
        } catch (error) {
            console.error('Error al obtener la oferta relámpago:', error);
        }
    };

    const handleClickFiltro = (filtro) => {
        setFiltroActual(filtro);
    };

    useEffect(() => {
        console.log("Ejecutando useEffect");

        const obtenerProductoEnOferta = async () => {
            try {
                console.log("Obteniendo producto en oferta");
                const ofertaGuardada = localStorage.getItem('ofertaRelampago');
                console.log("Oferta guardada:", ofertaGuardada);
                if (ofertaGuardada) {
                    const oferta = JSON.parse(ofertaGuardada);
                    // Actualizar el tiempo de inicio de la oferta relámpago si existe una oferta guardada
                    const tiempoInicio = Math.floor(Date.now() / 1000);
                    localStorage.setItem('tiempoInicio', tiempoInicio.toString());
                    console.log("Tiempo de inicio actualizado:", tiempoInicio);

                    setOfertaRelampago(oferta);
                } else {
                    console.log("Obteniendo nueva oferta de la API");
                    const response = await axios.get('http://localhost:5000/api/oferta-relampago');
                    const nuevaOferta = response.data.oferta;
                    setOfertaRelampago(nuevaOferta);
                    localStorage.setItem('ofertaRelampago', JSON.stringify(nuevaOferta));
                    // Establecer el tiempo de inicio cuando se guarda una nueva oferta en el almacenamiento local
                    const tiempoInicio = Math.floor(Date.now() / 1000);
                    localStorage.setItem('tiempoInicio', tiempoInicio.toString());
                    console.log("Nueva oferta guardada:", nuevaOferta);
                }
            } catch (error) {
                console.error('Error al obtener la oferta relámpago:', error);
            }
        };

        const tiempoInicioGuardado = localStorage.getItem('tiempoInicio');
        console.log("Tiempo de inicio guardado:", tiempoInicioGuardado);
        let timeoutId;

        const actualizarTiempoRestante = () => {
            console.log("Actualizando tiempo restante");
            const tiempoInicio = parseInt(tiempoInicioGuardado, 10);
            console.log("Tiempo de inicio:", tiempoInicio);
            const tiempoActual = Math.floor(Date.now() / 1000);
            console.log("Tiempo actual:", tiempoActual);
            const tiempoTranscurrido = tiempoActual - tiempoInicio;
            console.log("Tiempo transcurrido:", tiempoTranscurrido);
            const tiempoRestanteCalculado = Math.max(10 * 60 - tiempoTranscurrido, 0);
            console.log("Tiempo restante calculado:", tiempoRestanteCalculado);
            setTiempoRestante(tiempoRestanteCalculado);

            if (tiempoRestanteCalculado === 0) {
                console.log("Tiempo restante llegó a cero, obteniendo nueva oferta");
                obtenerProductoEnOferta(); // Obtener un nuevo producto en oferta al llegar a cero
                localStorage.setItem('tiempoInicio', Math.floor(Date.now() / 1000).toString()); // Reiniciar contador
            }

            const tiempoSiguienteSegundo = (tiempoInicio + tiempoTranscurrido + 1) * 1000;
            console.log("Tiempo hasta siguiente segundo:", tiempoSiguienteSegundo);
            const tiempoHastaSiguienteSegundo = tiempoSiguienteSegundo - Date.now();
            console.log("Tiempo hasta siguiente segundo calculado:", tiempoHastaSiguienteSegundo);
            timeoutId = setTimeout(actualizarTiempoRestante, tiempoHastaSiguienteSegundo);
        };

        obtenerProductoEnOferta();

        if (!tiempoInicioGuardado) {
            console.log("Tiempo de inicio no está definido, estableciendo tiempo de inicio");
            localStorage.setItem('tiempoInicio', Math.floor(Date.now() / 1000).toString()); // Establecer tiempo de inicio si no está definido
        } else {
            console.log("Tiempo de inicio definido, actualizando tiempo restante");
            actualizarTiempoRestante();
        }

        return () => clearTimeout(timeoutId);
    }, []);


    useEffect(() => {
        obtenerProductosAleatorios().then(productos => setProductosAleatorios(productos));
    }, []);
    
    const redirectToDetail = (productId) => {
        history.push(`/detalle/${productId}`);
    };

    return (
        <div className='cartas-home'>
            <div className="container3">
                <div className="encabezado">
                    <button className={`min-price-button ${filtroActual === 'precioMinimo' ? 'selected' : ''}`} onClick={() => handleClickFiltro('precioMinimo')}>Lo mejor de la semana</button>
                    <button className={filtroActual === 'mayorDescuento' ? 'selected' : ''} onClick={() => handleClickFiltro('mayorDescuento')}>DESTACADOS</button>
                    <button className={filtroActual === 'masNuevos' ? 'selected' : ''} onClick={() => handleClickFiltro('masNuevos')}>MÁS NUEVOS</button>
                </div>
                <div className="product-cards">
                    {productos.map(producto => (
                        <div key={producto.id} className="product-card" onClick={() => redirectToDetail(producto.id)}>
                            <p className='categorias'>{producto.categoria}</p>
                            <img src={producto.imgUrl} alt={producto.nombre} />
                            <p className='nombre'>{producto.nombre}</p>
                            <b >Precio original: ${(producto.precio).toLocaleString('es-CO', { maximumFractionDigits: 2 })}</b>
                            {producto.descuento !== 0 && (
                                <h4>
                                    <p>Precio con descuento: ${(producto.precio * (1 - producto.descuento / 100)).toLocaleString('es-CO', { maximumFractionDigits: 2 })}</p>
                                    <p>Descuento: {producto.descuento.toFixed(2)}%</p>
                                </h4>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="container4">
                <div className="list-product">
                    <div className="encabezado">
                        <h4>Más visitados</h4>
                        <button onClick={mostrarSiguienteProductos}><FontAwesomeIcon icon={faLessThan} size="1x" className="icons3" /></button>
                        <button onClick={mostrarSiguienteProductos}><FontAwesomeIcon icon={faGreaterThan} size="1x" className="icons3" /></button>
                    </div>
                    <div className="list-container">
                        {productosAleatorios.map(producto => (
                            <CSSTransition key={producto.id} timeout={500} classNames="fade" onClick={() => redirectToDetail(producto.id)}>
                                <div className="producto">
                                    <div className="list-img">
                                        <img src={producto.imgUrl} alt={producto.nombre} />
                                    </div>
                                    <div className="list-desc">
                                        <p className='categorias'>{producto.categoria}</p>
                                        <p className='nombre'>{producto.nombre}</p>
                                        <p className='precio'>Precio: ${(producto.precio).toLocaleString('es-CO', { maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </CSSTransition>
                        ))}
                    </div>
                </div>

                <div className='oferta'>
                    <div className="encabezado">
                        <h2>Ofertas Relámpago</h2>
                        <p>Tiempo restante: {Math.floor(tiempoRestante / 60)}Minutos {tiempoRestante % 60} Segundos </p>
                    </div>
                    <div className="oferta-container">
                        {ofertaRelampago && (
                            <div className="oferta-relampago" onClick={() => redirectToDetail(ofertaRelampago.id)}>
                                <div className='container-img'><img src={ofertaRelampago.imgUrl} alt={ofertaRelampago.nombre} /></div>
                                <div className='desc-oferta'>
                                    <p className='categoria-oferta'>{ofertaRelampago.categoria}</p>
                                    <p className='categoria-nombre'>{ofertaRelampago.nombre} <small className='oferta-descuento'>{ofertaRelampago.descuento.toFixed(2)}%</small></p>
                                    <p className='descrip-oferta'>{ofertaRelampago.descripcion}</p>
                                    <p className='precio-oferta'>{(ofertaRelampago.precio * (1 - ofertaRelampago.descuento / 100)).toLocaleString('es-CO', { maximumFractionDigits: 3 })} <del>${ofertaRelampago.precio.toLocaleString('es-CO', { maximumFractionDigits: 3 })}</del></p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartasHome;
