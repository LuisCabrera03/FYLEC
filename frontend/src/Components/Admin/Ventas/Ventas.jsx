import { useState, useEffect } from "react";
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Select, MenuItem, Grid, TextField, InputLabel, FormControl, Pagination, useMediaQuery, useTheme
} from '@mui/material';

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [estadoFiltro, setEstadoFiltro] = useState(''); // Filtro de estado
    const [nombreFiltro, setNombreFiltro] = useState(''); // Filtro de nombre
    const [ventasPorPagina, setVentasPorPagina] = useState(5); // Ventas por página
    const [paginaActual, setPaginaActual] = useState(1); // Página actual

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const obtenerVentas = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/comprastotal');
                setVentas(response.data.facturas);
            } catch (error) {
                console.error('Error al obtener los datos de ventas:', error);
            }
        };

        obtenerVentas();
    }, []);

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            await axios.put(`http://localhost:5000/api/comprastotal/${id}`, { estado: nuevoEstado });
            setVentas((ventas) =>
                ventas.map((venta) =>
                    venta.id === id ? { ...venta, estado: nuevoEstado } : venta
                )
            );
        } catch (error) {
            console.error('Error al actualizar el estado de la venta:', error);
        }
    };

    const handleEstadoFiltroChange = (event) => {
        setEstadoFiltro(event.target.value);
    };

    const handleNombreFiltroChange = (event) => {
        setNombreFiltro(event.target.value);
        setPaginaActual(1); // Resetear la paginación cuando cambie el filtro
    };

    // Filtrar ventas por estado y nombre de cliente
    const ventasFiltradas = ventas.filter(venta =>
        (estadoFiltro === '' || venta.estado === estadoFiltro) &&
        (nombreFiltro === '' || venta.nombre.toLowerCase().includes(nombreFiltro.toLowerCase()))
    );

    // Paginación
    const indexOfLastVenta = paginaActual * ventasPorPagina;
    const indexOfFirstVenta = indexOfLastVenta - ventasPorPagina;
    const ventasPaginadas = ventasFiltradas.slice(indexOfFirstVenta, indexOfLastVenta);
    const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina);

    return (
        <Box sx={{ padding: { xs: 2, md: 4 }, width: '100%', boxSizing: 'border-box' }}>
            <Typography variant="h4" component="h2" gutterBottom>
                Ventas
            </Typography>

            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Filtrar por Nombre de Cliente"
                        variant="outlined"
                        value={nombreFiltro}
                        onChange={handleNombreFiltroChange}
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={estadoFiltro}
                            onChange={handleEstadoFiltroChange}
                            label="Estado"
                        >
                            <MenuItem value="">Todos los Estados</MenuItem>
                            <MenuItem value="esperando">Esperando</MenuItem>
                            <MenuItem value="enviando">Enviando</MenuItem>
                            <MenuItem value="recibido">Recibido</MenuItem>
                            <MenuItem value="entregado">Entregado</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Filas por página</InputLabel>
                        <Select
                            value={ventasPorPagina}
                            onChange={(e) => setVentasPorPagina(Number(e.target.value))}
                            label="Filas por página"
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={15}>15</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
                <Table aria-label="ventas table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Venta</TableCell>
                            <TableCell>Nombre Cliente</TableCell>
                            {!isSmallScreen && <TableCell>Correo</TableCell>}
                            {!isSmallScreen && <TableCell>Departamento</TableCell>}
                            <TableCell>Municipio</TableCell>
                            <TableCell>Dirección</TableCell>
                            <TableCell>Producto(s)</TableCell>
                            <TableCell>Cantidad Producto</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Estado Actual</TableCell>
                            <TableCell>Cambiar Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ventasPaginadas.map((venta) => (
                            <TableRow key={venta.id}>
                                <TableCell>{venta.id}</TableCell>
                                <TableCell>{venta.nombre}</TableCell>
                                {!isSmallScreen && <TableCell>{venta.correo}</TableCell>}
                                {!isSmallScreen && <TableCell>{venta.departamento}</TableCell>}
                                <TableCell>{venta.municipio}</TableCell>
                                <TableCell>{venta.direccion}</TableCell>
                                <TableCell>{venta.producto.nombre}</TableCell>
                                <TableCell>{venta.producto.cantidad}</TableCell>
                                <TableCell>{venta.cantidad * venta.producto.precio}</TableCell>
                                <TableCell>{new Date(venta.fecha_factura).toLocaleDateString()}</TableCell>
                                <TableCell>{venta.estado}</TableCell>
                                <TableCell>
                                    <Select
                                        value={venta.estado}
                                        onChange={(e) => handleEstadoChange(venta.id, e.target.value)}
                                        size="small"
                                        variant="outlined"
                                    >
                                        <MenuItem value="esperando">Esperando</MenuItem>
                                        <MenuItem value="enviando">Enviando</MenuItem>
                                        <MenuItem value="recibido">Recibido</MenuItem>
                                        <MenuItem value="entregado">Entregado</MenuItem>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            {totalPaginas > 1 && (
                <Grid container justifyContent="center" sx={{ marginTop: 2 }}>
                    <Pagination
                        count={totalPaginas}
                        page={paginaActual}
                        onChange={(event, value) => setPaginaActual(value)}
                        color="primary"
                    />
                </Grid>
            )}
        </Box>
    );
};

export default Ventas;
