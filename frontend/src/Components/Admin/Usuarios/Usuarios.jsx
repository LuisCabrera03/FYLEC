import { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
} from '@fortawesome/free-solid-svg-icons';
import {
    Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Modal, IconButton
} from '@mui/material';

const Usuarios = () => {
    const history = useHistory();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [ordenCampo, setOrdenCampo] = useState('id');
    const [ordenAscendente, setOrdenAscendente] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const [usuariosPorPagina, setUsuariosPorPagina] = useState(5);
    const [modalOpen, setModalOpen] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // Estado para el usuario seleccionado

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            history.push('/login');
        } else {
            obtenerUsuarios();
        }
    }, [history]);

    const obtenerUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/usuarios');
            setUsuarios(response.data.usuarios);
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            setError('Hubo un error al obtener los usuarios. Por favor, inténtalo de nuevo más tarde.');
            setLoading(false);
        }
    };

    const handleFiltroNombreChange = (event) => {
        setFiltroNombre(event.target.value);
        setPaginaActual(1);
    };

    const handleOrdenChange = (campo) => {
        if (campo === ordenCampo) {
            setOrdenAscendente(!ordenAscendente);
        } else {
            setOrdenCampo(campo);
            setOrdenAscendente(true);
        }
    };

    const ordenarUsuarios = (a, b) => {
        const campo = ordenCampo;
        const ascendente = ordenAscendente ? 1 : -1;
        return a[campo] > b[campo] ? ascendente : -ascendente;
    };

    const filtrarUsuarios = (usuario) => {
        return usuario.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    };

    const paginar = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const handleUsuarioClick = (usuario) => {
        setUsuarioSeleccionado(usuario); // Guardar el usuario seleccionado
        setModalOpen(true); // Abrir el modal
    };

    const handleCloseModal = () => {
        setModalOpen(false); // Cerrar el modal
        setUsuarioSeleccionado(null); // Limpiar el usuario seleccionado
    };

    const indexOfLastUsuario = paginaActual * usuariosPorPagina;
    const indexOfFirstUsuario = indexOfLastUsuario - usuariosPorPagina;
    const usuariosFiltrados = usuarios.filter(filtrarUsuarios).sort(ordenarUsuarios);
    const usuariosActuales = usuariosFiltrados.slice(indexOfFirstUsuario, indexOfLastUsuario);

    const totalPages = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="h4">Panel de Administración - Usuarios</Typography>
            </Box>

            <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                <FormControl variant="outlined" size="small">
                    <InputLabel id="usuarios-por-pagina-label">Usuarios por Página</InputLabel>
                    <Select
                        labelId="usuarios-por-pagina-label"
                        value={usuariosPorPagina}
                        onChange={(e) => setUsuariosPorPagina(Number(e.target.value))}
                        label="Usuarios por Página"
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Filtrar Por Nombre"
                    variant="outlined"
                    size="small"
                    value={filtroNombre}
                    onChange={handleFiltroNombreChange}
                    InputProps={{
                        endAdornment: (
                            <IconButton>
                                <FontAwesomeIcon icon={faSearch} />
                            </IconButton>
                        )
                    }}
                />
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={3}>
                    <p>Cargando...</p>
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ marginTop: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell onClick={() => handleOrdenChange('id')}>
                                    ID {ordenCampo === 'id' && (ordenAscendente ? '▲' : '▼')}
                                </TableCell>
                                <TableCell onClick={() => handleOrdenChange('nombre')}>
                                    Nombre {ordenCampo === 'nombre' && (ordenAscendente ? '▲' : '▼')}
                                </TableCell>
                                <TableCell onClick={() => handleOrdenChange('correo')}>
                                    Email {ordenCampo === 'correo' && (ordenAscendente ? '▲' : '▼')}
                                </TableCell>
                                <TableCell onClick={() => handleOrdenChange('sexo')}>
                                    Sexo {ordenCampo === 'sexo' && (ordenAscendente ? '▲' : '▼')}
                                </TableCell>
                                <TableCell onClick={() => handleOrdenChange('tipo_documento')}>
                                    Tipo de documento {ordenCampo === 'tipo_documento' && (ordenAscendente ? '▲' : '▼')}
                                </TableCell>
                                <TableCell onClick={() => handleOrdenChange('numero_documento')}>
                                    Número de documento {ordenCampo === 'numero_documento' && (ordenAscendente ? '▲' : '▼')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuariosActuales.map((usuario) => (
                                <TableRow key={usuario.id} onClick={() => handleUsuarioClick(usuario)} style={{ cursor: 'pointer' }}>
                                    <TableCell>{usuario.id}</TableCell>
                                    <TableCell>{usuario.nombre}</TableCell>
                                    <TableCell>{usuario.correo}</TableCell>
                                    <TableCell>{usuario.sexo}</TableCell>
                                    <TableCell>{usuario.tipo_documento}</TableCell>
                                    <TableCell>{usuario.numero_documento}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {totalPages > 1 && (
                <Box mt={3} display="flex" justifyContent="center">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <Button
                            key={index + 1}
                            onClick={() => paginar(index + 1)}
                            variant={paginaActual === index + 1 ? 'contained' : 'outlined'}
                            color="primary"
                            size="small"
                            sx={{ margin: 0.5 }}
                        >
                            {index + 1}
                        </Button>
                    ))}
                </Box>
            )}

            {/* Modal para mostrar la información del usuario */}
            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="modal-usuario-title"
                aria-describedby="modal-usuario-description"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                    {usuarioSeleccionado && (
                        <>
                            <Typography id="modal-usuario-title" variant="h6" component="h2">
                                Información del Usuario
                            </Typography>
                            <Typography sx={{ mt: 2 }}>ID: {usuarioSeleccionado.id}</Typography>
                            <Typography>Nombre: {usuarioSeleccionado.nombre}</Typography>
                            <Typography>Email: {usuarioSeleccionado.correo}</Typography>
                            <Typography>Sexo: {usuarioSeleccionado.sexo}</Typography>
                            <Typography>Tipo de documento: {usuarioSeleccionado.tipo_documento}</Typography>
                            <Typography>Número de documento: {usuarioSeleccionado.numero_documento}</Typography>
                            <Typography>Contraseña: {usuarioSeleccionado.password}</Typography>
                        </>
                    )}
                </Box>
            </Modal>
        </Container>
    );
};

export default Usuarios;
