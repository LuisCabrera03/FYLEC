import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
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
    const [usuario, setUsuario] = useState(null);
    const history = useHistory();

    // Función para obtener el perfil del usuario
    const obtenerPerfilUsuario = useCallback(async () => {
        const cachedUser = JSON.parse(localStorage.getItem("user"));
        if (cachedUser) {
            setUsuario(cachedUser);
            setLoggedIn(true);
            return cachedUser;
        }

        try {
            const token = localStorage.getItem('token');
            if (token) {
                const { data } = await axios.get('http://localhost:5000/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsuario(data.usuario);
                setLoggedIn(true);
                localStorage.setItem("user", JSON.stringify(data.usuario));  // Cachear usuario
                return data.usuario;
            } else {
                setLoggedIn(false);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error("Token inválido o expirado. Redirigiendo a la página de login.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                history.push("/login");
            } else {
                console.error("Error al obtener el perfil del usuario:", error.message);
            }
            setLoggedIn(false);
        }
        return null;
    }, [history]);

    // Función para obtener los elementos del carrito
    const obtenerCarrito = useCallback(async () => {
        try {
            const usuarioData = await obtenerPerfilUsuario();
            if (usuarioData) {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:5000/api/carrito', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCarrito(data.carrito);
                calcularTotal(data.carrito);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error("Token inválido o expirado. Redirigiendo a la página de login.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                history.push("/login");
            } else {
                console.error('Error al obtener el carrito:', error);
            }
        } finally {
            setLoading(false);
        }
    }, [obtenerPerfilUsuario, history]);

    useEffect(() => {
        obtenerCarrito();
    }, [obtenerCarrito]);

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
                headers: { Authorization: `Bearer ${token}` }
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
                headers: { Authorization: `Bearer ${token}` }
            });
            setCarrito([]);
            setTotal(0);
        } catch (error) {
            console.error('Error al vaciar carrito:', error);
        }
    };

    const handlePagar = () => {
        if (carrito.length > 0) {
            const items = carrito.map(item => `${item.producto.id}-${item.cantidad}`).join('&');
            history.push(`/compra/${items}`);
        }
    };

    const handleCantidadChange = async (itemId, newCantidad) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/carrito/${itemId}`, {
                cantidad: newCantidad
            }, {
                headers: { Authorization: `Bearer ${token}` }
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
                                <p>Total: ${total.toFixed(2)}</p>
                            </div>
                            <div className='acciones'>
                                <button onClick={confirmarVaciarCarrito} className='btn-vaciar'>Vaciar Carrito</button>
                                <button onClick={handlePagar} className='btn-pagar'>Pagar</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CarritoCompras;
