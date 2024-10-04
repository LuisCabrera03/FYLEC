import { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import './Productos.css';

function Productos() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const subcategoria = searchParams.get('subcategoria');
    const searchTerm = searchParams.get('search');
    const categoria = searchParams.get('categoria');
    const [productos, setProductos] = useState([]);
    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRelacionados, setLoadingRelacionados] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const history = useHistory();

    const productosPorPagina = 24;

    useEffect(() => {
        const obtenerProductos = async () => {
            setLoading(true);
            try {
                let response;
                if (categoria) {
                    response = await axios.get(`http://localhost:5000/api/productos?categoria=${categoria}`);
                } else if (subcategoria) {
                    response = await axios.get(`http://localhost:5000/api/productos?subcategoria=${subcategoria}`);
                } else if (searchTerm) {
                    response = await axios.get(`http://localhost:5000/api/productos?search=${searchTerm}`);
                } else {
                    response = await axios.get('http://localhost:5000/api/productos');
                }
                setProductos(response.data.productos);
                setTotalPages(Math.ceil(response.data.productos.length / productosPorPagina));
            } catch (error) {
                console.error('Error al obtener productos:', error);
            } finally {
                setLoading(false);
            }
        };

        obtenerProductos();
    }, [subcategoria, searchTerm, categoria]);

    useEffect(() => {
        const obtenerProductosRelacionados = async () => {
            if (subcategoria) {
                setLoadingRelacionados(true);
                try {
                    const response = await axios.get(`http://localhost:5000/api/productos?subcategoria=${subcategoria}`);
                    if (response.data.productos.length > 0) {
                        await obtenerProductosRelacionadosPorCategoria(response.data.productos[0].categoria);
                    }
                } catch (error) {
                    console.error('Error al obtener productos relacionados:', error);
                } finally {
                    setLoadingRelacionados(false);
                }
            }
        };

        obtenerProductosRelacionados();
    }, [subcategoria]);

    const obtenerProductosRelacionadosPorCategoria = async (categoria) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/productos?categoria=${categoria}`);
            setProductosRelacionados(response.data.productos);
        } catch (error) {
            console.error('Error al obtener productos relacionados:', error);
        }
    };

    const redirectToDetail = (productId) => {
        history.push(`/detalle/${productId}`);
    };

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const productosPaginados = productos.slice((page - 1) * productosPorPagina, page * productosPorPagina);

    return (
        <div className='container-products'>
            <div className="productos">
                {subcategoria && <p className='encabezado'>{subcategoria}</p>}
                {searchTerm && <p className='encabezado'>Buscando productos relacionados con: {searchTerm}</p>}
                {loading ? (
                    <div className="loading-spinner">
                        <CircularProgress color="primary" size={60} thickness={4.5} />
                    </div>
                ) : (
                    <>
                        <div className="product-cards2">
                            {productosPaginados.map((producto, index) => (
                                <div key={`${producto.id}-${index}`} className="product-card" onClick={() => redirectToDetail(producto.id)}>
                                    <p className='categoria'>{producto.categoria}</p>
                                    <img src={producto.imgUrl} alt={producto.nombre} />
                                    <p>{producto.nombre}</p>
                                    <h3>${producto.precio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                    {producto.descuento > 0 && (
                                        <div>
                                            <p>Descuento: {producto.descuento}%</p>
                                            <p>
                                                Valor con descuento: $
                                                {(
                                                    producto.precio *
                                                    (1 - producto.descuento / 100)
                                                ).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={handleChangePage} 
                            color="primary" 
                            className="pagination"
                        />
                    </>
                )}
                {productosRelacionados.length > 0 && (
                    <div>
                        <p className='encabezado'>Productos Relacionados</p>
                        {loadingRelacionados ? (
                            <div className="loading-spinner">
                                <CircularProgress color="primary" size={60} thickness={4.5} />
                            </div>
                        ) : (
                            <div className="product-cards2">
                                {productosRelacionados.map((producto, index) => (
                                    <div key={`${producto.id}-${index}`} className="product-card" onClick={() => redirectToDetail(producto.id)}>
                                        <p className='categoria'>{producto.categoria}</p>
                                        <img src={producto.imgUrl} alt={producto.nombre} />
                                        <p className='nombre'>{producto.nombre}</p>
                                        <h3>${producto.precio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        {producto.descuento > 0 && (
                                            <p>Descuento: {producto.descuento}%</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Productos;
