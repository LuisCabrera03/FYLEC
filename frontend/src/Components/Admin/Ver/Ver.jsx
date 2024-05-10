import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faTimes,
    faArrowUp,
    faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Ver = () => {
    const history = useHistory();
    const [productos, setProductos] = useState([]);
    const [codigo, setCodigo] = useState('');
    const [nombre, setNombre] = useState('');
    const [marca, setMarca] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [categoria, setCategoria] = useState('');
    const [subcategoria, setSubcategoria] = useState('');
    const [precio, setPrecio] = useState('');
    const [descuento, setDescuento] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const [editando, setEditando] = useState(false);
    const [idProductoEditar, setIdProductoEditar] = useState(null);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [productosPorPagina] = useState(5);
    const [ordenAscendente, setOrdenAscendente] = useState(true);
    const [mostrarAdminPagina,] = useState(false);
    const [cargando, setCargando] = useState(true);

    const opcionesCategoria = ["Herramientas Manuales", "Herramientas eléctricas", 'Ferretería general', 'Pintura y acabados', 'Electricidad', 'Fontanería', 'Jardinería y exteriores', 'Seguridad y protección', "Materiales de Construcción"];
    const opcionesSubcategoria = {
        "Herramientas Manuales": ["Destornilladores", "Llaves (fijas, ajustables, de tubo)", "Alicates (de corte, de punta, de presión)", 'Martillos (de carpintero, de bola, de goma)', 'Sierras (para madera, para metal)', 'Cinceles', 'Gatos y prensas'],
        "Herramientas eléctricas": ["Taladros", "Sierra circular", "Amoladoras", 'Lijadoras', 'Sierras caladoras', 'Pistolas de calor', 'Soldadoras'],
        "Ferretería general": ["Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)", "Bisagras y cerraduras", "Pomos y manijas", 'Cadenas y candados', 'Escaleras y andamios', 'Carretillas y carros de mano', 'Soportes y colgadores'],
        "Pintura y acabados": ["Pinturas (interior, exterior, esmaltes, aerosoles)", "Rodillos y brochas", "Cintas de enmascarar", 'Masillas y selladores', 'Lijas y papel de lija', 'Impermeabilizantes'],
        "Electricidad": ["Cables eléctricos", "Interruptores y enchufes", "Lámparas y bombillas", 'Extensiones y enrolladores', 'Tubos y accesorios para instalaciones eléctricas', 'Cajas de conexiones'],
        "Fontanería": ["Tuberías y accesorios (cobre, PVC, PPR)", "Grifos y accesorios de baño y cocina", "Sanitarios y accesorios de fontanería", 'Bombas de agua', 'Herramientas para fontanería (llaves de tubo, cortatubos)', 'Fosas sépticas y sistemas de tratamiento de aguas'],
        "Jardinería y exteriores": ["Herramientas de jardinería (pala, rastrillo, podadoras)", "Mangueras y aspersores", "Fertilizantes y pesticidas", "Macetas y jardineras", "Barbacoas y accesorios para exteriores", 'Sistemas de riego'],
        "Seguridad y protección": ["Sistemas de alarma y vigilancia", "Cerrajería de seguridad (cerrojos, mirillas digitales)", "Extintores y sistemas contra incendios", 'Equipos de protección personal (cascos, guantes, gafas)', 'Señalización de seguridad', 'Cajas fuertes y armeros'],
        "Materiales de Construcción": ["Herramientas de Construcción", "Materiales de Albañilería", "Materiales de Acabado", "Carpintería y Madera", "Plomería y Fontanería", "Electricidad", "Techos y Cubiertas"],
    };

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            history.push('/login');
        }
        obtenerProductos();
    }, [history]);

    useEffect(() => {
        filtrarProductos();
    }, [productos, terminoBusqueda]);

    useEffect(() => {
        setTimeout(() => {
            setCargando(false);
        }, 2000);
    }, [mostrarAdminPagina]);

    const obtenerProductos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/productos');
            setProductos(response.data.productos);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            toast.error('Error al obtener productos');
        }
    };
    useEffect(() => {
        const formElement = document.querySelector('.product-form');
        if (formElement) {
            // Acción sobre el elemento encontrado
        } else {
            console.error('Elemento .product-form no encontrado');
        }
    }, []);

    const actualizarProducto = async () => {
        try {
            const precioDecimal = parseFloat(precio.replace('.', '').replace(',', '.'));
            const precioRedondeado = Math.round(precioDecimal * 100) / 100;
            const precioFormateado = precioRedondeado.toLocaleString('es-CO', { minimumFractionDigits: 2 });

            await axios.put(`http://localhost:5000/api/actualizar-producto/${idProductoEditar}`, {
                codigo,
                nombre,
                marca,
                descripcion,
                cantidad,
                categoria,
                subcategoria,
                precio: precioFormateado,
                descuento,
                imgUrl
            });
            limpiarCampos();
            obtenerProductos();
            setEditando(false);
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            toast.error('Error al actualizar producto');
        }
    };
    const editarProducto = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/productos/${id}`);
            const producto = response.data.producto;
            setCodigo(producto.codigo);
            setNombre(producto.nombre);
            setMarca(producto.marca);
            setDescripcion(producto.descripcion);
            setCantidad(producto.cantidad);
            setCategoria(producto.categoria);
            setSubcategoria(producto.subcategoria);
            const precioFormateado = formatPriceForDisplay(producto.precio);
            setPrecio(precioFormateado);
            setDescuento(producto.descuento);
            setImgUrl(producto.imgUrl);
            setEditando(true);
            setIdProductoEditar(id);

            // Comprobación de existencia del elemento
            const formElement = document.querySelector('.product-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                console.error('Elemento .product-form no encontrado');
            }
        } catch (error) {
            console.error('Error al obtener producto para editar:', error);
            toast.error('Error al obtener producto para editar');
        }
    };

    const eliminarProducto = async (id) => {
        try {
            confirmAlert({
                title: 'Confirmar eliminación',
                message: '¿Estás seguro de que deseas eliminar este producto?',
                buttons: [
                    {
                        label: 'Sí',
                        onClick: async () => {
                            await axios.delete(`http://localhost:5000/api/eliminar-producto/${id}`);
                            obtenerProductos();
                            toast.success('Producto eliminado exitosamente');
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => { }
                    }
                ]
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            toast.error('Error al eliminar producto');
        }
    };

    const limpiarCampos = () => {
        setCodigo('');
        setNombre('');
        setMarca('');
        setDescripcion('');
        setCantidad('');
        setCategoria('');
        setSubcategoria('');
        setPrecio('');
        setDescuento('');
        setImgUrl('');
        setIdProductoEditar(null);
    };

    const formatPriceForDisplay = (price) => {
        const precioDecimal = parseFloat(price);
        const precioRedondeado = Math.round(precioDecimal * 100) / 100;
        const precioFormateado = precioRedondeado.toLocaleString('es-CO', { minimumFractionDigits: 3 });
        return precioFormateado;
    };
    const handlePrecioChange = (e) => {
        const inputPrecio = e.target.value;
        // Eliminar caracteres que no sean dígitos o puntos decimales
        const cleanedPrecio = inputPrecio.replace(/[^\d.]/g, '');
        // Obtener el precio formateado
        const precioFormateado = cleanedPrecio
            .replace(/\./g, '') // Eliminar puntos existentes
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Agregar puntos de separación de miles
        // Actualizar el estado del precio
        setPrecio(precioFormateado);
    };
    const filtrarProductos = () => {
        const termino = terminoBusqueda.toLowerCase();
        const productosFiltrados = productos.filter(producto => {
            return producto.nombre.toLowerCase().includes(termino) || producto.codigo.toLowerCase().includes(termino);
        });
        setProductosFiltrados(productosFiltrados);
    };

    const paginar = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const ordenarProductos = (campo) => {
        const productosOrdenados = [...productosFiltrados];
        productosOrdenados.sort((a, b) => {
            const valorA = a[campo];
            const valorB = b[campo];
            if (valorA < valorB) {
                return ordenAscendente ? -1 : 1;
            }
            if (valorA > valorB) {
                return ordenAscendente ? 1 : -1;
            }
            return 0;
        });
        setProductosFiltrados(productosOrdenados);
        setOrdenAscendente(!ordenAscendente);
    };
    const cerrarSesion = () => {
        confirmAlert({
            title: 'Confirmación',
            message: '¿Estás seguro de que deseas cerrar la sesión?',
            buttons: [
                {
                    label: 'Sí',
                    onClick: () => {
                        localStorage.removeItem('adminToken');
                        history.push('/login');
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };
    const navegarACrud = () => {
        history.push("/admin");
    };
    const indexOfLastProducto = paginaActual * productosPorPagina;
    const indexOfFirstProducto = indexOfLastProducto - productosPorPagina;
    const productosPaginados = productosFiltrados.slice(indexOfFirstProducto, indexOfLastProducto);

    return (
        <div className='admin'>
            <ToastContainer />
            <div className="header">
                <div className="header-sliderbar">
                    <button className="logout-btn" onClick={navegarACrud}>
                        inicio
                    </button>
                    <h1>Panel de Administración</h1>
                </div>

                <button className="logout-btn" onClick={cerrarSesion}>
                    Cerrar Sesión
                </button>
            </div>
            <div className="main-content">
                {cargando ? (
                    <div className="loader">Cargando...</div>
                ) : (
                    mostrarAdminPagina ? null : (
                        <div>
                            {editando && (
                                <div className='absolute'>
                                    <div className="product-form">
                                        <h3>Editar Producto</h3>
                                        <span>Código del Producto </span>
                                        <input type="text" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                                        <span>Nombre del Producto </span>
                                        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                                        <span>Marca del Producto</span>
                                        <input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
                                        <span>Descripción del Producto </span>

                                        <textarea
                                            placeholder="Descripción"
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                        />
                                        <span>Cantidad de Productos </span>

                                        <input type="number" placeholder="Cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                                        <fieldset>
                                            <legend>Categoria del Producto</legend>
                                            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                                                <option value="">Selecciona una categoría</option>
                                                {opcionesCategoria.map((opcion, index) => (
                                                    <option key={index} value={opcion}>{opcion}</option>
                                                ))}
                                            </select>
                                        </fieldset>
                                        <fieldset>
                                            <legend>Selecciona una Subcategoría</legend>
                                            <select value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)}>
                                                <option value="">Selecciona una subcategoría</option>
                                                {categoria && opcionesSubcategoria[categoria] && opcionesSubcategoria[categoria].map((opcion, index) => (
                                                    <option key={index} value={opcion}>{opcion}</option>
                                                ))}
                                            </select>
                                        </fieldset>

                                        <span>Precio del Producto</span>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Precio"
                                                value={precio}
                                                onChange={handlePrecioChange}
                                            />

                                        </div>
                                        <span>Descuento del Producto %</span>
                                        <input type="number" placeholder="Descuento (%)" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
                                        <span>URL de la Imagen del Producto</span>

                                        <input type="text" placeholder="URL de la imagen" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />

                                        {imgUrl && (
                                            <div className="carrito-img">

                                                <img src={imgUrl} alt="Preview" className="preview-image" />
                                            </div>
                                        )}
                                        <button className="update-btn" onClick={actualizarProducto}>
                                            <FontAwesomeIcon icon={faSearch} /> Actualizar Producto
                                        </button>
                                        <button className="clear-btn" onClick={limpiarCampos}>
                                            <FontAwesomeIcon icon={faTimes} /> Limpiar Campos
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="table-container">
                                <div className="product-list">
                                    <h3>Tus Productos</h3>
                                    <div className="search-bar">
                                        <input type="text" placeholder="Buscar por nombre o código" value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} />
                                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Id</th>

                                                <th onClick={() => ordenarProductos('codigo')}>
                                                    Código{' '}
                                                    {ordenAscendente ? (
                                                        <FontAwesomeIcon icon={faArrowUp} />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faArrowDown} />
                                                    )}
                                                </th>
                                                <th onClick={() => ordenarProductos('nombre')}>
                                                    Nombre{' '}
                                                    {ordenAscendente ? (
                                                        <FontAwesomeIcon icon={faArrowUp} />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faArrowDown} />
                                                    )}
                                                </th>
                                                <th>Cantidad</th>
                                                <th>Categoría</th>
                                                <th>Subcategoría</th>
                                                <th>Precio</th>
                                                <th>Imagen</th>
                                                <th>Editar</th>
                                                <th>Eliminar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productosPaginados.map(producto => (
                                                <tr key={producto.id}>
                                                    <td>{producto.id}</td>
                                                    <td>{producto.codigo}</td>
                                                    <td>{producto.nombre}</td>
                                                    <td>{producto.cantidad}</td>
                                                    <td>{producto.categoria}</td>
                                                    <td>{producto.subcategoria}</td>
                                                    <td>{formatPriceForDisplay(producto.precio)}</td>
                                                    <td><img src={producto.imgUrl} alt={producto.nombre} className="product-image" /></td>
                                                    <td className='edit-btn-td'>
                                                        <button className="edit-btn" onClick={() => editarProducto(producto.id)}>Editar</button>
                                                    </td>
                                                    <td className='delete-btn-td'>
                                                        <button className="delete-btn" onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>


                                    </table>
                                    <div className="pagination">
                                        {[...Array(Math.ceil(productosFiltrados.length / productosPorPagina))].map((_, index) => (
                                            <button key={index} onClick={() => paginar(index + 1)} className={index + 1 === paginaActual ? 'active' : ''}>
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Ver;
