import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench, faSearch } from "@fortawesome/free-solid-svg-icons";
import ProgressBar from './ProgressBar';
import './Factura.css';

function Factura() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('todos');

    useEffect(() => {
        const fetchFacturas = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No se encontró el token');
                }
                const response = await axios.get('http://localhost:5000/api/facturas', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const sortedFacturas = response.data.facturas.sort((a, b) => b.id - a.id); // Ordenar de más reciente a más antiguo
                setFacturas(sortedFacturas);
                setLoggedIn(true);
            } catch (error) {
                console.error('Error al obtener las facturas:', error);
                if (error.message === 'No se encontró el token') {
                    setLoggedIn(false);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFacturas();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const filteredFacturas = facturas.filter(factura => {
        return (filter === 'todos' || factura.estado === filter) &&
            (factura.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                factura.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <div className='carrito-container'>
            <h1 className='encabezado'>Tus Compras</h1>
            <div className="factura-search">
                <select value={filter} onChange={handleFilterChange} className='filtro-paginacion'>
                    <option value="todos">Todos</option>
                    <option value="esperando">Esperando</option>
                    <option value="enviando">Enviando</option>
                    <option value="recibido">Recibido</option>
                    <option value="entregado">Entregado</option>
                </select>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
            {loading ? (
                <p>Cargando facturas...</p>
            ) : (
                <div className='lista-carrito'>
                    {filteredFacturas.length === 0 ? (
                        <div className="carro-vacio">
                            <FontAwesomeIcon icon={faScrewdriverWrench} className='llave' />
                            <p className='producto'>
                                ¡Ups! Parece que aún no has realizado ninguna compra, pero no te preocupes, ¡tenemos muchas opciones esperándote!
                                Explora nuestro catálogo y descubre todo lo que necesitas para tus proyectos.
                                Estamos aquí para ayudarte a hacer realidad tus sueños de manera fácil y emocionante.
                                ¡No dudes en comenzar a llenar tu carrito con las herramientas y materiales que necesitas para triunfar!
                            </p>
                            {!loggedIn && (
                                <button onClick={() => window.location.href = '/login'} className='btn-iniciar-sesion'>
                                    Iniciar Sesión
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredFacturas.map((factura) => (
                            <div key={factura.id} className='item-carrito'>
                                <div className='detalle-item'>
                                    <div className="carrito-img">
                                        <img src={factura.producto.imgUrl} alt="Imagen del producto" />
                                    </div>
                                    <div className="nombre">
                                        <p><b>{factura.producto.nombre}</b></p>
                                        <p>Cantidad: {factura.cantidad}</p>
                                        <p>Precio Pagado: ${factura.producto.precio * factura.cantidad}</p>
                                        <ProgressBar currentState={factura.estado} /> 
                                    </div>
                                    <div className="carrito-info">
                                        <p>Nombre: {factura.nombre}</p>
                                        <p>Correo: {factura.correo}</p>
                                        <p>Dirección: {factura.direccion}, {factura.municipio}, {factura.departamento}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Factura;
