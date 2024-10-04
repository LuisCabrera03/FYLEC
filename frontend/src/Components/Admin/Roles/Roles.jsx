import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Box, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Typography, InputLabel, FormControl, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Search } from '@mui/icons-material';

const Roles = () => {
    const [administradores, setAdministradores] = useState([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [rol, setRol] = useState(1);
    const [editandoId, setEditandoId] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

    useEffect(() => {
        obtenerAdministradores();
    }, []);

    const obtenerAdministradores = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/administradores');
            setAdministradores(response.data.administradores);
        } catch (error) {
            console.error('Error al obtener los administradores:', error);
        }
    };

    const agregarAdministrador = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/administradores', {
                nombre: nombre,
                email: email,
                contraseña: contraseña,
                rol: rol
            });
            setAdministradores([...administradores, response.data.administrador]);
            limpiarFormulario();
            Swal.fire({
                icon: 'success',
                title: 'Administrador agregado correctamente',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error('Error al agregar administrador:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Hubo un error al agregar el administrador',
            });
        }
    };

    const editarAdministrador = async (id) => {
        try {
            const response = await axios.put(`http://127.0.0.1:5000/api/administradores/${id}`, {
                nombre: nombre,
                email: email,
                contraseña: contraseña,
                rol: rol
            });
            const index = administradores.findIndex(admin => admin.id === id);
            const nuevosAdministradores = [...administradores];
            nuevosAdministradores[index] = response.data.administrador;
            setAdministradores(nuevosAdministradores);
            limpiarFormulario();
            setEditandoId(null);
        } catch (error) {
            console.error('Error al editar administrador:', error);
        }
    };

    const eliminarAdministrador = async (id) => {
        try {
            Swal.fire({
                title: '¿Estás seguro?',
                text: 'No podrás revertir esta acción',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminarlo',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await axios.delete(`http://127.0.0.1:5000/api/administradores/${id}`);
                    setAdministradores(administradores.filter(admin => admin.id !== id));
                    Swal.fire('Eliminado', 'El administrador ha sido eliminado.', 'success');
                }
            });
        } catch (error) {
            console.error('Error al eliminar administrador:', error);
            Swal.fire('Error', 'Hubo un error al eliminar el administrador', 'error');
        }
    };

    const limpiarFormulario = () => {
        setNombre('');
        setEmail('');
        setContraseña('');
        setRol(1);
        setEditandoId(null);
    };

    const editarAdministradorClick = (admin) => {
        setNombre(admin.nombre);
        setEmail(admin.email);
        setContraseña(admin.contraseña);
        setRol(admin.rol);
        setEditandoId(admin.id);
    };

    const submitHandler = (e) => {
        e.preventDefault();
        if (editandoId === null) {
            agregarAdministrador();
        } else {
            editarAdministrador(editandoId);
        }
    };

    const buscarAdministradores = () => {
        return administradores.filter(admin => {
            const nombreMatches = admin.nombre.toLowerCase().includes(busqueda.toLowerCase());
            const emailMatches = admin.email.toLowerCase().includes(busqueda.toLowerCase());
            const idMatches = admin.id.toString().includes(busqueda.toLowerCase());
            return nombreMatches || emailMatches || idMatches;
        });
    };

    const filtrarAdministradores = (administradores) => {
        let resultadosFiltrados = [...administradores];
        if (filtroRol !== '') {
            resultadosFiltrados = resultadosFiltrados.filter(admin => admin.rol.toString() === filtroRol);
        }
        return resultadosFiltrados;
    };

    const administradoresFiltrados = filtrarAdministradores(busqueda !== '' ? buscarAdministradores() : administradores);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Gestión de Roles
            </Typography>

            <form onSubmit={submitHandler}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Contraseña"
                            type={showPassword ? 'text' : 'password'}
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={togglePasswordVisibility}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={rol}
                                onChange={(e) => setRol(parseInt(e.target.value))}
                            >
                                <MenuItem value={1}>Administrador</MenuItem>
                                <MenuItem value={2}>Proveedor</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" type="submit">
                            {editandoId === null ? 'Agregar' : 'Editar'}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Box sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Filtrar por Rol</InputLabel>
                            <Select
                                value={filtroRol}
                                onChange={(e) => setFiltroRol(e.target.value)}
                                label="Filtrar por Rol"
                            >
                                <MenuItem value="">Todos los Roles</MenuItem>
                                <MenuItem value={1}>Administrador</MenuItem>
                                <MenuItem value={2}>Proveedor</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Buscar por Nombre, Email o ID"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton>
                                            <Search />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>ID</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Fecha de Ingreso</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {administradoresFiltrados.map((admin, index) => (
                            <TableRow key={admin.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{admin.id}</TableCell>
                                <TableCell>{admin.nombre}</TableCell>
                                <TableCell>{admin.email}</TableCell>
                                <TableCell>{admin.rol === 1 ? 'Administrador' : 'Proveedor'}</TableCell>
                                <TableCell>{new Date(admin.fecha_ingreso).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => editarAdministradorClick(admin)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => eliminarAdministrador(admin.id)}
                                        sx={{ ml: 2 }}
                                    >
                                        Eliminar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Roles;
