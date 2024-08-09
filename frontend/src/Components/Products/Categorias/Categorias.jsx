import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

function Categorias() {
    const [categoria, setCategoria] = useState('');
    const [subcategorias, setSubcategorias] = useState([]);
    const [productosPorSubcategoria, setProductosPorSubcategoria] = useState({});
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoriaParam = params.get('categoria');
        const subcategoriasParam = params.get('subcategorias') ? params.get('subcategorias').split(',').map(decodeURIComponent) : [];

        setCategoria(categoriaParam);
        setSubcategorias(subcategoriasParam);

        if (subcategoriasParam.length > 0) {
            fetchProductosPorSubcategorias(subcategoriasParam);
        } else if (categoriaParam) {
            fetchSubcategorias(categoriaParam);
        } else {
            fetchAllProducts();
        }
    }, [location]);

    const fetchSubcategorias = async (categoria) => {
        try {
            const response = await fetch(`http://localhost:5000/api/subcategorias?categoria=${encodeURIComponent(categoria)}`);
            const data = await response.json();
            setSubcategorias(data.subcategorias || []);
            const inicialProductosPorSubcategoria = {};
            data.subcategorias.forEach(subcategoria => {
                inicialProductosPorSubcategoria[subcategoria] = [];
            });
            setProductosPorSubcategoria(inicialProductosPorSubcategoria);
            data.subcategorias.forEach(subcategoria => {
                fetchProductosPorSubcategoria(subcategoria);
            });
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchProductosPorSubcategorias = async (subcategorias) => {
        const productosPorSubcategoria = {};

        for (const subcategoria of subcategorias) {
            try {
                const response = await fetch(`http://localhost:5000/api/productos?subcategoria=${encodeURIComponent(subcategoria)}`);
                const data = await response.json();
                productosPorSubcategoria[subcategoria] = data.productos || [];
            } catch (error) {
                console.error(`Error fetching products for ${subcategoria}:`, error);
            }
        }

        setProductosPorSubcategoria(productosPorSubcategoria);
    };

    const fetchProductosPorSubcategoria = async (subcategoria) => {
        try {
            const response = await fetch(`http://localhost:5000/api/productos?subcategoria=${encodeURIComponent(subcategoria)}`);
            const data = await response.json();
            setProductosPorSubcategoria(prevState => ({
                ...prevState,
                [subcategoria]: data.productos || []
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/productos`);
            const data = await response.json();
            setProductosPorSubcategoria({ "Todos los productos": data.productos || [] });
        } catch (error) {
            console.error('Error fetching all products:', error);
        }
    };

    const redirectToDetail = (productId) => {
        history.push(`/detalle/${productId}`);
    };

    return (
        <>
            <div className='container-products'>
                <div className="productos">
                    {Object.entries(productosPorSubcategoria).map(([subcategoria, productos], index) => (
                        <div key={index}>
                            <div className='encabezado'>{categoria ? `${categoria} - ${subcategoria}` : subcategoria}</div>
                            <div className='product-cards2'>
                                {productos.map((producto, index) => (
                                    <li key={index} className='product-card' onClick={() => redirectToDetail(producto.id)}>
                                        <p className='categoria'>{producto.categoria}</p>
                                        <img src={producto.imgUrl} alt={producto.nombre} />
                                        <p>{producto.nombre}</p>
                                        <h3>${producto.precio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        {producto.descuento > 0 && (
                                            <p>Descuento: {producto.descuento}%</p>
                                        )}
                                    </li>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Categorias;
