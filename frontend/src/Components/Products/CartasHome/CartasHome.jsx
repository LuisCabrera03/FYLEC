import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
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
    const [tiempoRestante, setTiempoRestante] = useState(10 * 60); // 10 minutos
    const [productosAleatorios, setProductosAleatorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingOferta, setLoadingOferta] = useState(true);
    const history = useHistory();

    const obtenerProductosAleatorios = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/productos-aleatorios');
            return response.data.productosAleatorios;
        } catch (error) {
            console.error('Error al obtener productos aleatorios:', error);
            return [];
        }
    }, []);

    const mostrarSiguienteProductos = useCallback(async () => {
        const nuevosProductos = await obtenerProductosAleatorios();
        setProductosAleatorios(nuevosProductos);
    }, [obtenerProductosAleatorios]);

    useEffect(() => {
        const obtenerProductos = async () => {
            setLoading(true);
            try {
                switch (filtroActual) {
                    case 'precioMinimo':
                        await obtenerProductosMinPrecio();
                        break;
                    case 'mayorDescuento':
                        await obtenerProductosMasDescuento();
                        break;
                    case 'masNuevos':
                        await obtenerProductosMasNuevos();
                        break;
                    default:
                        await obtenerProductosMinPrecio();
                        break;
                }
                const nuevosProductosAleatorios = await obtenerProductosAleatorios();
                setProductosAleatorios(nuevosProductosAleatorios);
            } catch (error) {
                console.error('Error al obtener productos:', error);
            } finally {
                setLoading(false);
            }
        };

        const obtenerOferta = async () => {
            setLoadingOferta(true);
            try {
                await obtenerOfertaRelampago();
            } catch (error) {
                console.error('Error al obtener la oferta relámpago:', error);
            } finally {
                setLoadingOferta(false);
            }
        };

        obtenerProductos();
        obtenerOferta();

        const interval = setInterval(() => {
            setTiempoRestante(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [filtroActual, obtenerProductosAleatorios]);

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

    const redirectToDetail = (productId) => {
        history.push(`/detalle/${productId}`);
    };

    return (
        <div className='cartas-home'>
            {loading ? (
                <div className="loading-spinner">
                    <CircularProgress color="primary" size={60} thickness={4.5} />
                </div>
            ) : (
                <>
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
                                    <p className='precio'>${producto.precio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    {producto.descuento !== 0 && (
                                        <b>
                                            <p>Precio con descuento: ${(producto.precio * (1 - producto.descuento / 100)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </b>
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
                                                <p className='precio'>${producto.precio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    </CSSTransition>
                                ))}
                            </div>
                        </div>

                        <div className='oferta'>
                            <div className="encabezado">
                                <h2>Ofertas Relámpago</h2>
                                <p>Tiempo restante: {Math.floor(tiempoRestante / 60)} Minutos {tiempoRestante % 60} Segundos </p>
                            </div>
                            {loadingOferta ? (
                                <div className="loading-spinner">
                                    <CircularProgress color="primary" size={60} thickness={4.5} />
                                </div>
                            ) : (
                                <div className="oferta-container">
                                    {ofertaRelampago && (
                                        <div className="oferta-relampago" onClick={() => redirectToDetail(ofertaRelampago.id)}>
                                            <div className='container-img'><img src={ofertaRelampago.imgUrl} alt={ofertaRelampago.nombre} /></div>
                                            <div className='desc-oferta'>
                                                <p className='categoria-oferta'>{ofertaRelampago.categoria}</p>
                                                <p className='categoria-nombre'>{ofertaRelampago.nombre} <small className='oferta-descuento'>{ofertaRelampago.descuento.toFixed(2)}%</small></p>
                                                <p className='descrip-oferta'>{ofertaRelampago.descripcion}</p>
                                                <p className='precio-oferta'>${(ofertaRelampago.precio * (1 - ofertaRelampago.descuento / 100)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <del>${ofertaRelampago.precio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</del></p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartasHome;
