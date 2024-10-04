import  { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Box, Button, Typography, Paper, RadioGroup, FormControlLabel, Radio, Divider, Grid, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';

const CheckoutForm = ({ clientSecret, productos, usuario }) => {
    const stripe = useStripe();
    const elements = useElements();
    const history = useHistory();
    const [paymentMethod, setPaymentMethod] = useState('card');
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            toast.error("Stripe no está completamente cargado.");
            return;
        }

        try {
            let paymentIntent;

            if (paymentMethod === 'card') {
                const cardElement = elements.getElement(CardElement);
                const { error, paymentIntent: result } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                    },
                });

                if (error) {
                    console.error('Stripe Error:', error.message);
                    toast.error('Error al procesar el pago con tarjeta.');
                    return;
                }

                paymentIntent = result;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('Pago exitoso');
                toast.success('¡Pago realizado con éxito!');

                try {
                    const token = localStorage.getItem('token');

                    const facturaData = {
                        usuario_id: usuario.id || null,
                        producto_id: productos.map(p => p.id).join(','),
                        cantidad: productos.reduce((total, p) => total + p.cantidad, 0),
                        nombre: usuario.nombre || 'Nombre no disponible',
                        correo: usuario.correo || 'Correo no disponible',
                        direccion: usuario.direccion || 'Dirección no disponible',
                        departamento: usuario.departamento || 'Departamento no disponible',
                        municipio: usuario.municipio || 'Municipio no disponible',
                        tarjeta: 'No disponible',
                    };

                    const response = await axios.post(
                        'http://localhost:5000/api/crear-factura',
                        facturaData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response && response.data) {
                        toast.success('Factura creada exitosamente');
                        history.push('/factura', { state: { factura: response.data } });
                    } else {
                        throw new Error('No se pudo crear la factura.');
                    }
                } catch (saveError) {
                    console.error('Error al guardar la factura:', saveError.message);
                    toast.error('Error al guardar la factura.');
                }
            }
        } catch (error) {
            console.error('Error en el procesamiento de la transacción:', error.message);
            toast.error('Error en el procesamiento de la transacción.');
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                padding: isMobile ? 2 : 4,
                width: '100%',
                maxWidth: 600,
                margin: 'auto',
                marginTop: isMobile ? 2 : 4,
                backgroundColor: '#f7f9fc',
                boxShadow: 5,
                borderRadius: 2,
            }}
        >
            <Typography variant="h5" component="h2" color="primary" align="center" gutterBottom>
                Información de Envío
            </Typography>

            <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={12}>
                    <Typography variant="body1"><strong>Nombre:</strong> {usuario.nombre || 'Nombre no disponible'}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1"><strong>Correo:</strong> {usuario.correo || 'Correo no disponible'}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1"><strong>Dirección:</strong> {usuario.direccion || 'Dirección no disponible'}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1"><strong>Departamento:</strong> {usuario.departamento || 'Departamento no disponible'}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1"><strong>Municipio:</strong> {usuario.municipio || 'Municipio no disponible'}</Typography>
                </Grid>
            </Grid>

            <Typography variant="h5" component="h2" color="primary" align="center" gutterBottom>
                Información de Pago
            </Typography>

            <Divider sx={{ marginBottom: 2 }} />

            <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ marginBottom: 2, display: 'flex', justifyContent: 'space-around' }}
            >
                <FormControlLabel
                    value="card"
                    control={<Radio color="primary" />}
                    label={<Typography variant="body1">Tarjeta de crédito/débito</Typography>}
                />
            </RadioGroup>

            <Divider sx={{ marginBottom: 2 }} />

            {paymentMethod === 'card' && (
                <Paper sx={{ p: isMobile ? 1 : 2, backgroundColor: '#ffffff', boxShadow: '0px 3px 6px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: isMobile ? '14px' : '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </Paper>
            )}

            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!stripe}
                size="large"
                sx={{ mt: 2, fontWeight: 'bold', textTransform: 'none' }}
                fullWidth
            >
                Pagar
            </Button>
        </Box>
    );
};

// Definir PropTypes para validar las props
CheckoutForm.propTypes = {
    clientSecret: PropTypes.string.isRequired,
    productos: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        cantidad: PropTypes.number.isRequired,
    })).isRequired,
    usuario: PropTypes.shape({
        id: PropTypes.number,
        nombre: PropTypes.string,
        correo: PropTypes.string,
        direccion: PropTypes.string,
        departamento: PropTypes.string,
        municipio: PropTypes.string,
    }).isRequired,
};

export default CheckoutForm;
