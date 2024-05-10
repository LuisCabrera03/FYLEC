import { useState, useEffect } from 'react';
import axios from 'axios';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,

} from '@fortawesome/free-solid-svg-icons';
const Roles = () => {
    const history = useHistory();
    const [administradores, setAdministradores] = useState([]);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [rol, setRol] = useState(1);
    const [editandoId, setEditandoId] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('');
    const [filtroId] = useState('');
    const [filtroFecha] = useState('');

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            history.push('/login');
        }
    }, [history]);

    useEffect(() => {
        obtenerAdministradores();
    }, []);

    const obtenerAdministradores = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/administradores');
            setAdministradores(response.data.administradores);
        } catch (error) {
            console.error('Error al obtener los administradores:', error);
        }
    };

    const agregarAdministrador = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/administradores', {
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
            const response = await axios.put(`http://localhost:5000/api/administradores/${id}`, {
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
            confirmAlert({
                title: 'Confirmación',
                message: '¿Estás seguro de que deseas eliminar este administrador?',
                buttons: [
                    {
                        label: 'Sí',
                        onClick: async () => {
                            await axios.delete(`http://localhost:5000/api/administradores/${id}`);
                            setAdministradores(administradores.filter(admin => admin.id !== id));
                            Swal.fire({
                                icon: 'success',
                                title: 'Administrador eliminado correctamente',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => {}
                    }
                ]
            });
        } catch (error) {
            console.error('Error al eliminar administrador:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Hubo un error al eliminar el administrador',
            });
        }
    };
    const limpiarFormulario = () => {
        setNombre('');
        setEmail('');
        setContraseña('');
        setRol(1);
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

    const cerrarSesion = () => {
        confirmAlert({
            title: 'Confirmación',
            message: '¿Estás seguro de que deseas cerrar la sesión?',
            buttons: [
                {
                    label: 'Sí',
                    onClick: () => {
                        localStorage.removeItem('adminToken');
                        history.push('/login');
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };

    const buscarAdministradores = () => {
        return administradores.filter(admin => {
            const nombreMatches = admin.nombre.toLowerCase().includes(busqueda.toLowerCase());
            const emailMatches = admin.email.toLowerCase().includes(busqueda.toLowerCase());
            const idMatches = admin.id.toString().includes(busqueda.toLowerCase()); // Verificar si la búsqueda coincide con el ID
            return nombreMatches || emailMatches || idMatches; // Incluir la verificación del ID en el retorno
        });
    };


    const filtrarAdministradores = (administradores) => {
        let resultadosFiltrados = [...administradores];
        if (filtroRol !== '') {
            resultadosFiltrados = resultadosFiltrados.filter(admin => admin.rol.toString() === filtroRol);
        }
        if (filtroId !== '') {
            resultadosFiltrados = resultadosFiltrados.filter(admin => admin.id.toString() === filtroId);
        }
        if (filtroFecha !== '') {
            resultadosFiltrados = resultadosFiltrados.filter(admin => {
                const fechaIngreso = new Date(admin.fecha_ingreso).toLocaleDateString();
                return fechaIngreso === filtroFecha;
            });
        }
        return resultadosFiltrados;
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value);
    };

    const handleFiltrarRol = (e) => {
        setFiltroRol(e.target.value);
    };


    const administradoresFiltrados = filtrarAdministradores(busqueda !== '' ? buscarAdministradores() : administradores);
    const navegarACrud = () => {
        history.push("/admin");
    };

    return (
        <div className='admin'>
            <div className="header">
                <div className="header-sliderbar">
                    <button className="logout-btn" onClick={navegarACrud}>
                        Inicio
                    </button>
                </div>

                <button className="logout-btn" onClick={cerrarSesion}>
                    Cerrar Sesión
                </button>
            </div>
            <div className="product-list">
                <h1 className=''>Administradores</h1>
                <form onSubmit={submitHandler}>
                    <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Contraseña" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
                    <select value={rol} onChange={(e) => setRol(parseInt(e.target.value))} className='select-rol'>
                        <option value={1}>Administrador</option>
                        <option value={2}>Proveedor</option>
                    </select>
                    <button className="update-btn" type="submit">{editandoId === null ? 'Agregar' : 'Editar'}</button>
                </form>

            </div>
            <div className="table-container">
                <div className="product-list">
                    <div className='search-bar'>
                        <select value={filtroRol} onChange={handleFiltrarRol} className='filtro-paginacion'>
                            <option value="">Todos los roles</option>
                            <option value="1">Administrador</option>
                            <option value="2">Proveedor</option>
                        </select>
                        <input type="text" placeholder="Ingresa el ID o el nombre aquí..." value={busqueda} onChange={handleBuscar} />

                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Fecha de Ingreso</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {administradoresFiltrados.map((admin, index) => (
                                <tr key={admin.id}>
                                    <td>{index + 1}</td>
                                    <td>{admin.id}</td>
                                    <td>{admin.nombre}</td>
                                    <td>{admin.email}</td>
                                    <td>{admin.rol === 1 ? 'Administrador' : 'Proveedor'}</td>
                                    <td>{new Date(admin.fecha_ingreso).toLocaleDateString()}</td>
                                    <td>
                                        <button className="edit-btn" onClick={() => editarAdministradorClick(admin)}>Editar</button>
                                        <button className='delete-btn' onClick={() => eliminarAdministrador(admin.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Roles;
