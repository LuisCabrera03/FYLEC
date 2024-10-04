import { useState, useEffect } from "react";
import {
    Box, Drawer, AppBar, Toolbar, IconButton, Typography, Button, List, ListItem,
    ListItemIcon, ListItemText, Grid, Card, CardContent, Avatar, ListItemAvatar, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, TextField
} from "@mui/material";
import {
    Menu, Dashboard, People, ShoppingCart, AddBox, ManageAccounts, Logout, Notifications
} from "@mui/icons-material";
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import CreateProduct from "./CreateProduct/CreateProduct";
import EditProduct from "./EditProduct/EditProduct";
import Usuarios from "./Usuarios/Usuarios";
import Ventas from "./Ventas/Ventas";
import Roles from "./Roles/Roles";

Chart.register(...registerables);

const Admin = () => {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [cantidadUsuarios, setCantidadUsuarios] = useState(0);
    const [cantidadProductos, setCantidadProductos] = useState(0);
    const [productos, setProductos] = useState([]);
    const [cantidadProductosComprados, setCantidadProductosComprados] = useState(0);
    const [notificaciones, setNotificaciones] = useState([]);
    const [mostrarAgregar, setMostrarAgregar] = useState(false);
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [tabSeleccionado, setTabSeleccionado] = useState('Dashboard');
    const [topCompradores, setTopCompradores] = useState([]);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        obtenerCantidadUsuarios();
        obtenerCantidadProductos();
        obtenerDatosCompras();
        const interval = setInterval(() => obtenerDatosCompras(), 60000);
        return () => clearInterval(interval);
    }, []);

    const obtenerCantidadUsuarios = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/usuarios');
            setCantidadUsuarios(response.data.usuarios.length);
        } catch (error) {
            console.error('Error al obtener la cantidad de usuarios:', error);
        }
    };

    const obtenerCantidadProductos = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/productos');
            setCantidadProductos(response.data.productos.length);
            setProductos(response.data.productos);
        } catch (error) {
            console.error('Error al obtener la cantidad de productos:', error);
        }
    };

    const obtenerDatosCompras = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/comprastotal');
            const compras = response.data.facturas;
            setCantidadProductosComprados(compras.length);
            const ultimasCompras = compras.slice(-5).reverse();
            setNotificaciones(ultimasCompras);

            const usuariosCompras = {};
            compras.forEach(compra => {
                const usuario = compra.nombre;
                if (usuariosCompras[usuario]) {
                    usuariosCompras[usuario] += Object.keys(compra.producto).length;
                } else {
                    usuariosCompras[usuario] = Object.keys(compra.producto).length;
                }
            });

            const topUsuarios = Object.keys(usuariosCompras)
                .map(usuario => ({ nombre: usuario, compras: usuariosCompras[usuario] }))
                .sort((a, b) => b.compras - a.compras)
                .slice(0, 3);

            setTopCompradores(topUsuarios);
        } catch (error) {
            console.error('Error al obtener los datos de compras:', error);
        }
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
                        window.location.href = '/login';
                    }
                },
                { label: 'No', onClick: () => { } }
            ]
        });
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const handleTabChange = (newValue) => {
        setTabSeleccionado(newValue);
        setMostrarAgregar(false);
        setMostrarEditar(false);
    };

    const handleAgregarProducto = () => {
        setMostrarAgregar(true);
        setMostrarEditar(false);
    };

    const handleEditarProducto = () => {
        setMostrarAgregar(false);
        setMostrarEditar(true);
    };

    const obtenerSaludo = () => {
        const hora = new Date().getHours();
        if (hora < 12) return 'días';
        if (hora < 18) return 'tardes';
        return 'noches';
    };

    const dataBarras = {
        labels: ['Usuarios', 'Productos', 'Ventas'],
        datasets: [
            {
                label: 'Estadísticas',
                data: [cantidadUsuarios, cantidadProductos, cantidadProductosComprados],
                backgroundColor: ['#2D9CDB', '#27AE60', '#EB5757'],
                borderColor: '#FFFFFF',
                borderWidth: 1,
            },
        ],
    };

    const dataLineas = {
        labels: topCompradores.map(comp => comp.nombre),
        datasets: [
            {
                label: 'Top Compradores',
                data: topCompradores.map(comp => comp.compras),
                borderColor: '#6C63FF',
                backgroundColor: 'rgba(108,99,255,0.2)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    const handleProductoClick = (producto) => {
        setProductoSeleccionado(producto);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setProductoSeleccionado(null);
    };

    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#F7F9FB', color: '#333' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1F2937' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    {/* Menú lateral y saludo */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar}>
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" sx={{ marginLeft: '16px', fontWeight: 'bold', color: '#FFF' }}>
                            {`Buenas ${obtenerSaludo()}, Administrador`}
                        </Typography>
                    </Box>

                    {/* Cerrar Sesión */}
                    <Box>
                        <Button color="inherit" onClick={cerrarSesion} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                            <Logout sx={{ marginRight: '8px' }} /> Cerrar Sesión
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>


            <Drawer variant="permanent" open={sidebarVisible} sx={{
                width: sidebarVisible ? 240 : 60,
                flexShrink: 0,
                transition: "width 0.3s ease",
                backgroundColor: '#FFFFFF',
                color: '#333',
                '& .MuiListItemIcon-root': { color: '#2D9CDB' },
                '& .MuiListItemText-primary': { color: '#333' }
            }}>
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItem button onClick={() => handleTabChange('Dashboard')}>
                            <ListItemIcon><Dashboard /></ListItemIcon>
                            <ListItemText primary="Dashboard" sx={{ display: sidebarVisible ? 'block' : 'none' }} />
                        </ListItem>
                        <ListItem button onClick={() => handleTabChange('Productos')}>
                            <ListItemIcon><AddBox /></ListItemIcon>
                            <ListItemText primary="Productos" sx={{ display: sidebarVisible ? 'block' : 'none' }} />
                        </ListItem>
                        <ListItem button onClick={() => handleTabChange('Usuarios')}>
                            <ListItemIcon><People /></ListItemIcon>
                            <ListItemText primary="Usuarios" sx={{ display: sidebarVisible ? 'block' : 'none' }} />
                        </ListItem>
                        <ListItem button onClick={() => handleTabChange('Ventas')}>
                            <ListItemIcon><ShoppingCart /></ListItemIcon>
                            <ListItemText primary="Ventas" sx={{ display: sidebarVisible ? 'block' : 'none' }} />
                        </ListItem>
                        <ListItem button onClick={() => handleTabChange('Roles')}>
                            <ListItemIcon><ManageAccounts /></ListItemIcon>
                            <ListItemText primary="Gestionar Roles" sx={{ display: sidebarVisible ? 'block' : 'none' }} />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        {tabSeleccionado === 'Dashboard' && (
                            <>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ backgroundColor: '#2D9CDB', padding: '20px', textAlign: 'center', color: '#FFF' }}>
                                        <CardContent>
                                            <Typography variant="h6">Usuarios Registrados</Typography>
                                            <Typography variant="h4" sx={{ marginTop: '10px' }}>{cantidadUsuarios}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ backgroundColor: '#27AE60', padding: '20px', textAlign: 'center', color: '#FFF' }}>
                                        <CardContent>
                                            <Typography variant="h6">Productos</Typography>
                                            <Typography variant="h4" sx={{ marginTop: '10px' }}>{cantidadProductos}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ backgroundColor: '#EB5757', padding: '20px', textAlign: 'center', color: '#FFF' }}>
                                        <CardContent>
                                            <Typography variant="h6">Ventas Totales</Typography>
                                            <Typography variant="h4" sx={{ marginTop: '10px' }}>{cantidadProductosComprados}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12}>
                                    <Card sx={{ backgroundColor: '#FFFFFF', padding: '20px', color: '#333' }}>
                                        <CardContent>
                                            <Bar data={dataBarras} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </>
                        )}

                        {tabSeleccionado === 'Productos' && (
                            <>
                                <Grid item xs={12}>
                                    {!mostrarAgregar && !mostrarEditar && (
                                        <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
                                            <Button variant="contained" color="primary" onClick={handleAgregarProducto} sx={{ marginRight: 1 }}>
                                                Agregar Producto
                                            </Button>
                                            <Button variant="contained" color="secondary" onClick={handleEditarProducto}>
                                                Editar Producto
                                            </Button>
                                        </Box>
                                    )}
                                    {mostrarAgregar && <CreateProduct />}
                                    {mostrarEditar && <EditProduct />}
                                </Grid>

                                <Grid item xs={12} sx={{ marginBottom: 2 }}>
                                    <TextField
                                        label="Buscar producto"
                                        variant="outlined"
                                        fullWidth
                                        value={terminoBusqueda}
                                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="productos table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Código</TableCell>
                                                    <TableCell>Nombre</TableCell>
                                                    <TableCell>Marca</TableCell>
                                                    <TableCell>Cantidad</TableCell>
                                                    <TableCell>Categoría</TableCell>
                                                    <TableCell>Precio</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {productosFiltrados.map((producto) => (
                                                    <TableRow key={producto.id} onClick={() => handleProductoClick(producto)} style={{ cursor: 'pointer' }}>
                                                        <TableCell>{producto.codigo}</TableCell>
                                                        <TableCell>{producto.nombre}</TableCell>
                                                        <TableCell>{producto.marca}</TableCell>
                                                        <TableCell>{producto.cantidad}</TableCell>
                                                        <TableCell>{producto.categoria}</TableCell>
                                                        <TableCell>{producto.precio}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </>
                        )}

                        {tabSeleccionado === 'Usuarios' && (
                            <Usuarios />
                        )}
                        {
                            tabSeleccionado === 'Ventas' && (
                                <Ventas />
                            )}
                        {tabSeleccionado === 'Roles' && (
                            <Roles />
                        )}
                        <Modal
                            open={modalOpen}
                            onClose={handleCloseModal}
                            aria-labelledby="modal-product-title"
                            aria-describedby="modal-product-description"
                        >
                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                                {productoSeleccionado && (
                                    <>
                                        <Typography id="modal-product-title" variant="h6" component="h2">
                                            {productoSeleccionado.nombre}
                                        </Typography>
                                        <img src={productoSeleccionado.imgUrl} alt={productoSeleccionado.nombre} style={{ width: '100%', marginTop: '10px' }} />
                                        <Typography id="modal-product-description" sx={{ mt: 2 }}>
                                            Marca: {productoSeleccionado.marca}
                                        </Typography>
                                        <Typography>Categoría: {productoSeleccionado.categoria}</Typography>
                                        <Typography>Precio: {productoSeleccionado.precio}</Typography>
                                        <Typography>Descripción: {productoSeleccionado.descripcion}</Typography>
                                    </>
                                )}
                            </Box>
                        </Modal>

                        {tabSeleccionado === 'Dashboard' && (
                            <>
                                <Grid item xs={12}>
                                    <Card sx={{ backgroundColor: '#FFFFFF', padding: '20px', color: '#333' }}>
                                        <CardContent>
                                            <Typography variant="h6">Notificaciones Recientes</Typography>
                                            <List>
                                                {notificaciones.map((notificacion, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemAvatar>
                                                            <Avatar sx={{ backgroundColor: '#2D9CDB' }}>
                                                                <Notifications sx={{ color: '#FFF' }} />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`${notificacion.nombre} compró ${notificacion.producto.nombre}`}
                                                            secondary={formatDistanceToNow(new Date(notificacion.fecha_factura), { addSuffix: true })}
                                                            sx={{ color: '#333' }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12}>
                                    <Card sx={{ backgroundColor: '#FFFFFF', padding: '20px', color: '#333' }}>
                                        <CardContent>
                                            <Line data={dataLineas} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default Admin;
