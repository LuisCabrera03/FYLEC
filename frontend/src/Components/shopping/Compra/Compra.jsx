import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const stripePromise = loadStripe('pk_test_51Psyo109C819tqXiKPYDwio5avmtUdFzxLQkfYThGSzmO9ZmRImcsh0nwtgvK2bTWUv6Yckhl5Ix90veOCBWPCPt00kLu6NVdx');

const ProductoCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    borderRadius: '8px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
}));

const ImageContainer = styled(Box)({
    width: '100px',
    height: '100px',
    overflow: 'hidden',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
});

const Compra = ({ match }) => {
    const [productos, setProductos] = useState([]);
    const [clientSecret, setClientSecret] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const items = match.params.items;
                const itemsArray = items.split('&').map(item => {
                    const [id, cantidad] = item.split('-');
                    return { id, cantidad: parseInt(cantidad) };
                });

                const productosPromises = itemsArray.map(async (item) => {
                    const response = await axios.get(`http://127.0.0.1:5000/api/productos/${item.id}`);
                    return {
                        ...response.data.producto,
                        cantidad: item.cantidad
                    };
                });

                const productosObtenidos = await Promise.all(productosPromises);
                setProductos(productosObtenidos);
            } catch (error) {
                console.error('Error al obtener los productos:', error);
                toast.error('Error al cargar los productos. Por favor, verifica tu conexión o inténtalo más tarde.');
            }
        };

        obtenerProductos();
    }, [match.params.items]);

    useEffect(() => {
        const obtenerUsuario = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://127.0.0.1:5000/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const usuario = response.data.usuario;
                setUsuario(usuario);
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
            }
        };

        obtenerUsuario();
    }, []);

    useEffect(() => {
        const iniciarTransaccion = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    'http://127.0.0.1:5000/api/iniciar-transaccion',
                    {
                        productos: productos.map(producto => ({
                            producto_id: producto.id,
                            cantidad: producto.cantidad
                        }))
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setClientSecret(response.data.clientSecret);
            } catch (error) {
                if (error.response && error.response.data.error) {
                    toast.error(`Error: ${error.response.data.error}`);
                } else {
                    console.error('Error al iniciar la transacción:', error);
                    toast.error('Error al iniciar la transacción. Inténtalo más tarde.');
                }
            }
        };

        if (productos.length > 0) {
            iniciarTransaccion();
        }
    }, [productos]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ padding: { xs: 2, sm: 4 }, backgroundColor: '#f8f9fa', borderRadius: 2, boxShadow: 1, margin: 'auto', maxWidth: '900px', minHeight: '100vh' }}>
            {productos.length > 0 && clientSecret && usuario ? (
                <>
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#343a40' }}>
                        Resumen de Compra
                    </Typography>
                    <Grid container spacing={2}>
                        {productos.map((producto) => (
                            <Grid item xs={12} key={producto.id}>
                                <ProductoCard>
                                    <ImageContainer>
                                        <img
                                            src={producto.imgUrl}
                                            alt={producto.nombre}
                                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                        />
                                    </ImageContainer>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#495057' }}>
                                            {producto.nombre}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                            Precio Unitario: ${producto.precio}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                            Cantidad: {producto.cantidad}
                                        </Typography>
                                        {producto.descuento > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                                    Descuento: {producto.descuento}%
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                                    Precio con Descuento: $
                                                    {(producto.precio * (1 - producto.descuento / 100)).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </ProductoCard>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ marginTop: 4, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#343a40' }}>
                            Total a Pagar: $
                            {productos.reduce((total, producto) => total + producto.precio * producto.cantidad, 0).toFixed(2)}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleClickOpen}
                            sx={{ paddingX: 4, paddingY: 1.5, borderRadius: 3, fontWeight: 'bold', backgroundColor: '#007bff', '&:hover': { backgroundColor: '#0056b3' } }}
                        >
                            Proceder al Pago
                        </Button>
                    </Box>
                </>
            ) : (
                <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                    No hay productos en tu carrito o hubo un problema al cargar los datos.
                </Typography>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', color: '#495057' }}>Procesar Pago</DialogTitle>
                <DialogContent sx={{ minWidth: '500px' }}>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm clientSecret={clientSecret} productos={productos} usuario={usuario} />
                    </Elements>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    <Button onClick={handleClose} color="secondary" variant="outlined">
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>


            <ToastContainer />
        </Box>
    );
};

export default Compra;
