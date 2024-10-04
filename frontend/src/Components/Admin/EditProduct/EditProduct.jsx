import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Grid, TextField, Button, Card, CardContent, Table, TableBody,
    TableCell, TableHead, TableRow, TableContainer, Typography, Avatar
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const EditProduct = () => {
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
    const [cargando, setCargando] = useState(true);

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
    }, []);

    const obtenerProductos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/productos');
            setProductos(response.data.productos);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            toast.error('Error al obtener productos');
        }
    };

    const actualizarProducto = async () => {
        try {
            const precioLimpio = precio.replace(/\./g, '').replace(',', '.');
            const precioDecimal = parseFloat(precioLimpio);
            if (isNaN(precioDecimal)) {
                toast.error('El precio no es válido.');
                return;
            }

            await axios.put(`http://localhost:5000/api/actualizar-producto/${idProductoEditar}`, {
                codigo,
                nombre,
                marca,
                descripcion,
                cantidad,
                categoria,
                subcategoria,
                precio: precioDecimal,
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
            setPrecio(producto.precio.toString());
            setDescuento(producto.descuento.toString());
            setImgUrl(producto.imgUrl);
            setEditando(true);
            setIdProductoEditar(id);

            const formElement = document.querySelector('.product-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        if (isNaN(precioDecimal)) {
            return '0,00';
        }
        return precioDecimal.toLocaleString('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
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

    const indexOfLastProducto = paginaActual * productosPorPagina;
    const indexOfFirstProducto = indexOfLastProducto - productosPorPagina;
    const productosPaginados = productosFiltrados.slice(indexOfFirstProducto, indexOfLastProducto);

    return (
        <Container maxWidth="lg">
            <ToastContainer />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            {editando ? (
                                <div className="product-form">
                                    <Typography variant="h6">Editar Producto</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField label="Código del Producto" fullWidth value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField label="Nombre del Producto" fullWidth value={nombre} onChange={(e) => setNombre(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField label="Marca del Producto" fullWidth value={marca} onChange={(e) => setMarca(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField label="Cantidad de Productos" type="number" fullWidth value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField label="Precio del Producto" fullWidth value={precio} onChange={(e) => setPrecio(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField label="Descuento (%)" type="number" fullWidth value={descuento} onChange={(e) => setDescuento(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField label="Descripción del Producto" fullWidth multiline rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField label="URL de la Imagen del Producto" fullWidth value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
                                        </Grid>
                                        {imgUrl && (
                                            <Grid item xs={6}>
                                                <Avatar alt="Product Image" src={imgUrl} sx={{ width: 100, height: 100, margin: 'auto' }} />
                                            </Grid>
                                        )}
                                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                            <Button variant="contained" color="primary" onClick={actualizarProducto} sx={{ marginRight: 1 }}>
                                                Actualizar Producto
                                            </Button>
                                            <Button variant="contained" color="secondary" onClick={limpiarCampos}>
                                                Limpiar Campos
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Listado de Productos</Typography>
                            <TextField label="Buscar" fullWidth value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} sx={{ marginBottom: 2 }} />
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Id</TableCell>
                                            <TableCell>Código</TableCell>
                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Cantidad</TableCell>
                                            <TableCell>Categoría</TableCell>
                                            <TableCell>Subcategoría</TableCell>
                                            <TableCell>Precio</TableCell>
                                            <TableCell>Editar</TableCell>
                                            <TableCell>Eliminar</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {productosPaginados.map(producto => (
                                            <TableRow key={producto.id}>
                                                <TableCell>{producto.id}</TableCell>
                                                <TableCell>{producto.codigo}</TableCell>
                                                <TableCell>{producto.nombre}</TableCell>
                                                <TableCell>{producto.cantidad}</TableCell>
                                                <TableCell>{producto.categoria}</TableCell>
                                                <TableCell>{producto.subcategoria}</TableCell>
                                                <TableCell>{formatPriceForDisplay(producto.precio)}</TableCell>
                                                <TableCell>
                                                    <Button variant="outlined" color="primary" onClick={() => editarProducto(producto.id)}>
                                                        Editar
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outlined" color="secondary" onClick={() => eliminarProducto(producto.id)}>
                                                        Eliminar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <div className="pagination">
                                {[...Array(Math.ceil(productosFiltrados.length / productosPorPagina))].map((_, index) => (
                                    <Button key={index} onClick={() => paginar(index + 1)} className={index + 1 === paginaActual ? 'active' : ''}>
                                        {index + 1}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default EditProduct;
