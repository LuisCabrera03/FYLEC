import { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,

} from '@fortawesome/free-solid-svg-icons';
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

    const navegarACrud = () => {
        history.push("/admin");
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

    const indexOfLastUsuario = paginaActual * usuariosPorPagina;
    const indexOfFirstUsuario = indexOfLastUsuario - usuariosPorPagina;
    const usuariosFiltrados = usuarios.filter(filtrarUsuarios).sort(ordenarUsuarios);
    const usuariosActuales = usuariosFiltrados.slice(indexOfFirstUsuario, indexOfLastUsuario);

    const totalPages = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

    return (
        <div className="admin">
            <div className="header">
                <div className="header-sliderbar">
                    <button className="logout-btn" onClick={navegarACrud}>
                        inicio
                    </button>
                    <h1>Panel de Administración</h1>
                </div>
                <button className="logout-btn" onClick={cerrarSesion}>
                    Cerrar Sesión
                </button>
            </div>
            <div className="product-list">
                <div className="container-filtro">

                    <div className="search-bar">
                        <select
                            className="filtro-paginacion"
                            id="usuariosPorPagina"
                            value={usuariosPorPagina}
                            onChange={(e) => setUsuariosPorPagina(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                        <input
                            placeholder="Filtrar Por Nombre"
                            type="text"
                            id="filtroNombre"
                            value={filtroNombre}
                            onChange={handleFiltroNombreChange}
                        />
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />

                    </div>
                </div>


                <div className="usuarios-table">
                    {loading ? (
                        <p>Cargando...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th onClick={() => handleOrdenChange('id')}>
                                        ID {ordenCampo === 'id' && (ordenAscendente ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleOrdenChange('nombre')}>
                                        Nombre {ordenCampo === 'nombre' && (ordenAscendente ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleOrdenChange('correo')}>
                                        Email {ordenCampo === 'correo' && (ordenAscendente ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleOrdenChange('sexo')}>
                                        Sexo {ordenCampo === 'sexo' && (ordenAscendente ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleOrdenChange('tipo_documento')}>
                                        Tipo de documento {ordenCampo === 'tipo_documento' && (ordenAscendente ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleOrdenChange('numero_documento')}>
                                        Número de documento {ordenCampo === 'numero_documento' && (ordenAscendente ? '▲' : '▼')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosActuales.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.id}</td>
                                        <td>{usuario.nombre}</td>
                                        <td>{usuario.correo}</td>
                                        <td>{usuario.sexo}</td>
                                        <td>{usuario.tipo_documento}</td>
                                        <td>{usuario.numero_documento}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button key={index + 1} onClick={() => paginar(index + 1)}>
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Usuarios;
