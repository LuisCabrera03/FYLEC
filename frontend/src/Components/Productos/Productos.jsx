import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Productos.css'
import { useHistory } from 'react-router-dom';


function Productos() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const subcategoria = searchParams.get('subcategoria');
    const searchTerm = searchParams.get('search');
    const categoria = searchParams.get('categoria');
    const [productos, setProductos] = useState([]);
    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const history = useHistory();

    useEffect(() => {
        const obtenerProductos = async () => {
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
            } catch (error) {
                console.error('Error al obtener productos:', error);
            }
        };

        obtenerProductos();
    }, [subcategoria, searchTerm, categoria]);

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                let response;
                if (searchTerm) {
                    const categoriaRelacionada = buscarCategoriaRelacionada(searchTerm);
                    if (categoriaRelacionada) {
                        await obtenerProductosPorCategoria(categoriaRelacionada);
                    } else {
                        response = await axios.get(`http://localhost:5000/api/productos?search=${searchTerm}`);
                        setProductos(response.data.productos);
                    }
                } else if (subcategoria) {
                    response = await axios.get(`http://localhost:5000/api/productos?subcategoria=${subcategoria}`);
                    if (response.data.productos.length > 0) {
                        await obtenerProductosRelacionados(response.data.productos[0].categoria);
                    }
                    setProductos(response.data.productos);
                } else {
                    response = await axios.get('http://localhost:5000/api/productos');
                    setProductos(response.data.productos);
                }
            } catch (error) {
                console.error('Error al obtener productos:', error);
            }
        };

        obtenerProductos();
    }, [searchTerm]);

    const buscarCategoriaRelacionada = (termino) => {
        const categoriasConocidas = [
            'Herramientas Manuales',
            'Herramientas eléctricas',
            'Ferretería general',
            'Pintura y acabados',
            'Electricidad',
            'Fontanería',
            'Jardinería y exteriores',
            'Seguridad y protección',
            'Materiales de Construcción',
            'Otros'
        ];
        const terminoNormalizado = termino.toLowerCase();
        const categoriaEncontrada = categoriasConocidas.find(categoria =>
            categoria.toLowerCase().includes(terminoNormalizado)
        );
        return categoriaEncontrada || null;
    };

    const obtenerProductosPorCategoria = async (categoria) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/productos?categoria=${categoria}`);
            setProductos(response.data.productos);
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
        }
    };

    const obtenerProductosRelacionados = async (categoria) => {
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

    return (
        <div className='container-products'>
            <div className="productos">
                {subcategoria && <p className='encabezado'>{subcategoria}</p>}
                {searchTerm && <p className='encabezado'>Buscando productos relacionados con: {searchTerm}</p>}
                <div className="product-cards2">
                    {productos.map((producto, index) => (
                        <div key={`${producto.id}-${index}`} className="product-card" onClick={() => redirectToDetail(producto.id)}>
                            <p className='categoria'>{producto.categoria}</p>
                            <img src={producto.imgUrl} alt={producto.nombre} />
                            <p>{producto.nombre}</p>
                            <h3>${producto.precio}</h3>
                            {producto.descuento > 0 && (
                                <div>
                                    <p>Descuento: {producto.descuento}%</p>
                                    <p>
                                        Valor con descuento: $
                                        {(
                                            producto.precio *
                                            (1 - producto.descuento / 100)
                                        ).toLocaleString("es-CO", { maximumFractionDigits: 3 })}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {productosRelacionados.length > 0 && (
                    <div>
                        <p className='encabezado'>Productos Relacionados</p>
                        <div className="product-cards2">
                            {productosRelacionados.map((producto, index) => (
                                <div key={`${producto.id}-${index}`} className="product-card" onClick={() => redirectToDetail(producto.id)}>
                                    <p className='categoria'>{producto.categoria}</p>
                                    <img src={producto.imgUrl} alt={producto.nombre} />
                                    <p className='nombre'>{producto.nombre}</p>
                                    <h3>${producto.precio}</h3>
                                    {producto.descuento && (
                                        <p>Descuento: {producto.descuento}%</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
        
    );
}

export default Productos;