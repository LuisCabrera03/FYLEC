import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Importamos Link desde react-router-dom
import './CarritoCompras.css';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faScrewdriverWrench,
    faSquarePlus,
    faSquareMinus,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

function CarritoCompras() {
    const [carrito, setCarrito] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const obtenerCarrito = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/carrito', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCarrito(response.data.carrito);
                calcularTotal(response.data.carrito);
                setLoggedIn(true);
            } catch (error) {
                console.error('Error al obtener el carrito:', error);
            } finally {
                setLoading(false);
            }
        };

        obtenerCarrito();
    }, []);

    const calcularTotal = (carrito) => {
        let totalCalculado = 0;
        carrito.forEach(item => {
            totalCalculado += item.producto.precio * item.cantidad;
        });
        setTotal(totalCalculado);
    };

    const handleEliminarItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/carrito/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const nuevoCarrito = carrito.filter(item => item.id !== itemId);
            setCarrito(nuevoCarrito);
            calcularTotal(nuevoCarrito);
        } catch (error) {
            console.error('Error al eliminar item del carrito:', error);
        }
    };

    const handleVaciarCarrito = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/carrito/vaciar', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCarrito([]);
            setTotal(0);
        } catch (error) {
            console.error('Error al vaciar carrito:', error);
        }
    };

    // Modificamos handlePagar para enviar información a la página de compra
    const handlePagar = () => {
        if (carrito.length > 0) {
            // Redirigir al usuario a la página de compra con la información del producto y la cantidad
            const items = carrito.map(item => `${item.producto.id}-${item.cantidad}`).join('&');
            window.location.href = `/compra?items=${items}`;
        }
    };

    const handleCantidadChange = async (itemId, newCantidad) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/carrito/${itemId}`, {
                cantidad: newCantidad
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const nuevoCarrito = carrito.map(item => {
                if (item.id === itemId) {
                    return { ...item, cantidad: newCantidad };
                }
                return item;
            });
            setCarrito(nuevoCarrito);
            calcularTotal(nuevoCarrito);
        } catch (error) {
            alert('Error al cambiar cantidad del producto:', error);
        }
    };

    const handleSubirCantidad = (itemId) => {
        const item = carrito.find(item => item.id === itemId);
        if (item) {
            handleCantidadChange(itemId, item.cantidad + 1);
        }
    };

    const handleBajarCantidad = (itemId) => {
        const item = carrito.find(item => item.id === itemId);
        if (item && item.cantidad > 1) {
            handleCantidadChange(itemId, item.cantidad - 1);
        }
    };

    const confirmarVaciarCarrito = () => {
        confirmAlert({
            title: 'Confirmar acción',
            message: '¿Estás seguro de que deseas vaciar el carrito?',
            buttons: [
                {
                    label: 'Sí',
                    onClick: () => handleVaciarCarrito()
                },
                {
                    label: 'No'
                }
            ]
        });
    };

    const confirmarEliminarItem = (itemId) => {
        confirmAlert({
            title: 'Confirmar acción',
            message: '¿Estás seguro de que deseas eliminar este elemento del carrito?',
            buttons: [
                {
                    label: 'Sí',
                    onClick: () => handleEliminarItem(itemId)
                },
                {
                    label: 'No'
                }
            ]
        });
    };

    return (
        <>
            <div className='carrito-container'>
                <div className="encabezado">
                    <h2>Tu Carrito</h2>
                </div>
                {loading ? (
                    <p>Cargando carrito...</p>
                ) : (
                    <div>
                        {carrito.length === 0 ? (
                            <div className="carro-vacio">
                                <span><FontAwesomeIcon icon={faScrewdriverWrench} className='llave' /></span>
                                <p className='producto'>¡Ups! Tu carrito está vacío, ¡pero estamos llenos de opciones para ti! Explora nuestro catálogo y encuentra todo lo que necesitas para tus proyectos. ¡Estamos aquí para ayudarte a construir tus sueños!</p>
                                {!loggedIn && <Link to="/login" className='btn-iniciar-sesion'>Iniciar Sesión</Link>}
                            </div>
                        ) : (
                            <div>
                                <div className='lista-carrito'>
                                    {carrito.map(item => (
                                        <div key={item.id} className='item-carrito'>
                                            <div className='detalle-item'>
                                                <div className="carrito-img">
                                                    <img src={item.producto.imgUrl} alt={item.producto.nombre} />
                                                </div>
                                                <div className="nombre">
                                                    {item.producto.nombre}
                                                </div>
                                                <div className='carrito-info'>
                                                    <div className="cantidad-carrito">
                                                        <button onClick={() => handleBajarCantidad(item.id)}><FontAwesomeIcon icon={faSquareMinus} /></button>
                                                        <input
                                                            type="number"
                                                            value={item.cantidad}
                                                            onChange={(e) => handleCantidadChange(item.id, parseInt(e.target.value))}
                                                            min="1"
                                                        />
                                                        <button onClick={() => handleSubirCantidad(item.id)}><FontAwesomeIcon icon={faSquarePlus} /></button>
                                                    </div>
                                                    <p>Precio Unitario: ${item.producto.precio}</p>
                                                    <p>Subtotal: ${(item.producto.precio * item.cantidad).toFixed(2)}</p>
                                                    <button onClick={() => confirmarEliminarItem(item.id)} className='btn-eliminar'><FontAwesomeIcon icon={faTrash} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className='total'>
                                </div>
                                <div className='acciones'>
                                    <button onClick={confirmarVaciarCarrito} className='btn-vaciar'>Vaciar Carrito</button>
                                    <p>Total: ${total.toFixed(2)}</p>
                                    <Link to="/compra" className='btn-pagar' onClick={handlePagar}>Pagar</Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

        </>
    );
}

export default CarritoCompras;
