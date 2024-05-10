import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

function Factura() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false); // Nuevo estado para controlar si el usuario ha iniciado sesión

    useEffect(() => {
        const obtenerFacturas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/facturas', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFacturas(response.data.facturas);
                setLoggedIn(true); // Actualizamos el estado loggedIn a true cuando obtenemos las facturas
            } catch (error) {
                console.error('Error al obtener las facturas:', error);
            } finally {
                setLoading(false);
            }
        };

        obtenerFacturas();
    }, []);

    return (
        <>
            <div className='carrito-container'>
                <h1 className='encabezado'>Tus Compras</h1>
                {loading ? (
                    <p>Cargando facturas...</p>
                ) : (
                    <div className='lista-carrito'>
                        {facturas.length === 0 ? (
                            <div className="carro-vacio">
                                <span><FontAwesomeIcon icon={faScrewdriverWrench} className='llave' /></span>
                                <p className='producto'>¡Ups! Parece que aún no has realizado ninguna compra, pero no te preocupes, ¡tenemos muchas opciones esperándote! Explora nuestro catálogo y descubre todo lo que necesitas para tus proyectos. Estamos aquí para ayudarte a hacer realidad tus sueños de manera fácil y emocionante. ¡No dudes en comenzar a llenar tu carrito con las herramientas y materiales que necesitas para triunfar!</p>
                                {!loggedIn && <button onClick={() => window.location.href = '/login'} className='btn-iniciar-sesion'>Iniciar Sesión</button>} {/* Mostrar el botón de iniciar sesión solo si el usuario no ha iniciado sesión */}
                            </div>) : (
                            <div>
                                {facturas.map((factura) => (
                                    <div key={factura.id} className='item-carrito'>
                                        <div className='detalle-item'>
                                            <div className="carrito-img">
                                                <img src={factura.producto.imgUrl} alt="Imagen del producto" />
                                            </div>
                                            <div className="nombre">
                                                <p> <b>{factura.producto.nombre}</b></p>
                                                <p>Cantidad: {factura.cantidad}</p>
                                                <p>Precio Pagado: ${factura.producto.precio * factura.cantidad}</p>
                                            </div>
                                            <div className="carrito-info">
                                                <p>Nombre: {factura.nombre}</p>
                                                <p>Correo: {factura.correo}</p>
                                                <p>Dirección: {factura.direccion}, {factura.municipio}, {factura.departamento}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                )}

            </div>

        </>
    );
}

export default Factura;
