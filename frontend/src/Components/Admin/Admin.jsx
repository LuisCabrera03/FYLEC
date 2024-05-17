import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./Admin.css";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import { confirmAlert } from 'react-confirm-alert';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faUserGroup,
    faClock,
    faBoxesStacked,
    faSackDollar,
    faTrophy,
    faGaugeHigh,
    faSquarePlus,
    faCartFlatbed,
    faUsers,
    faUserShield
} from "@fortawesome/free-solid-svg-icons";
import { UsersRound, ShoppingBasket, DollarSign, } from 'lucide-react';

// Código del componente...

import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import CRUD from "./Crud/CRUD";
registerLocale("es", es);

const Admin = () => {
    const history = useHistory();
    const [isAdmin, setIsAdmin] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [cantidadUsuarios, setCantidadUsuarios] = useState(0);
    const [cantidadProductos, setCantidadProductos] = useState(0);
    const [cantidadProductosComprados, setCantidadProductosComprados] = useState(0);
    const [notificaciones, setNotificaciones] = useState([]);
    const [mostrarCRUD, setMostrarCRUD] = useState(false); // Estado para controlar la visibilidad del CRUD
    const [mostrarInicioState, setMostrarInicio] = useState(false); // Estado para controlar si se muestra la página de inicio
    const [mostrarBotonesProductos, setMostrarBotonesProductos] = useState(false); // Estado para controlar la visibilidad de los botones "Agregar" y "Administrar"
    const [botonSeleccionado, setBotonSeleccionado] = useState('Dashboard'); // Estado para almacenar el nombre del botón seleccionado
    const [topCompradores, setTopCompradores] = useState([]);


    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        const adminRole = localStorage.getItem('adminRole'); // Obtener el rol del almacenamiento local
        if (!adminToken) {
            history.push('/login');
        } else {
            // Verificar si hay un rol almacenado localmente
            if (adminRole) {
                setIsAdmin(adminRole === 'Administrador');
            } else {
                // Si no hay un rol almacenado localmente, obtenerlo del servidor
                obtenerRolAdministrador();
            }
        }
    }, [history]);

    const obtenerRolAdministrador = async () => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                history.push('/login');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/rol-admin', {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            // Leer el valor del rol de la respuesta
            const rol = response.data.rol;

            // Almacenar el rol en el almacenamiento local
            localStorage.setItem('adminRole', rol);

            // Manejar el rol de acuerdo a tus necesidades
            setIsAdmin(rol === 'Administrador');

        } catch (error) {
            console.error('Error al obtener el rol del administrador:', error);
            // Manejar el error adecuadamente (por ejemplo, redirigir a una página de error)
        }
    };

    // Función para redirigir al componente de roles si el administrador tiene el rol requerido
    const gestionarRoles = () => {
        if (isAdmin) {
            history.push("/roles");
        } else {
            // Mostrar notificación de falta de acceso si el administrador no tiene el rol requerido
            confirmAlert({
                title: 'Acceso denegado',
                message: 'No tienes permiso para acceder a la gestión de roles.',
                buttons: [
                    {
                        label: 'OK',
                        onClick: () => { }
                    }
                ]
            });
        }
    };
    useEffect(() => {
        obtenerCantidadUsuarios();
        obtenerCantidadProductos();
        obtenerDatosCompras();

        // Actualizar notificaciones cada 60 segundos
        const interval = setInterval(() => {
            obtenerDatosCompras();
        }, 60000);

        // Limpiar intervalo al desmontar el componente
        return () => clearInterval(interval);
    }, []);

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const navegarACrud = () => {
        history.push("/ver");
    };

    const mostrarAgregarProducto = () => {
        setMostrarCRUD(true); // Cambiar el estado para mostrar el CRUD
    };

    const mostrarInicioFunc = () => {
        setMostrarInicio(true); // Cambiar el estado para mostrar la página de inicio
        setMostrarCRUD(false); // Ocultar el CRUD
    };

    const toggleMostrarBotonesProductos = () => {
        setMostrarBotonesProductos(!mostrarBotonesProductos); // Alternar la visibilidad de los botones "Agregar" y "Administrar"
    };

    const handleButtonClick = (buttonName) => {
        setBotonSeleccionado(buttonName); // Actualizar el estado del botón seleccionado
    };

    const obtenerCantidadUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/usuarios');
            setCantidadUsuarios(response.data.usuarios.length);
        } catch (error) {
            console.error('Error al obtener la cantidad de usuarios:', error);
        }
    };

    const obtenerCantidadProductos = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/productos');
            setCantidadProductos(response.data.productos.length);
        } catch (error) {
            console.error('Error al obtener la cantidad de productos:', error);
        }
    };

    const obtenerDatosCompras = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/comprastotal');
            const compras = response.data.facturas;
            const ultimasCompras = compras.slice(-5).reverse();
            setCantidadProductosComprados(compras.length);
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


    const formatoTiempoTranscurrido = (fecha) => {
        const segundosTranscurridos = Math.floor((new Date() - new Date(fecha)) / 1000);

        if (segundosTranscurridos < 60) {
            return 'hace un momento';
        } else if (segundosTranscurridos < 3600) {
            const minutosTranscurridos = Math.floor(segundosTranscurridos / 60);
            return `hace ${minutosTranscurridos} minutos`;
        } else if (segundosTranscurridos < 86400) {
            const horasTranscurridas = Math.floor(segundosTranscurridos / 3600);
            return `hace ${horasTranscurridas} horas`;
        } else {
            return formatDistanceToNow(new Date(fecha), { locale: es, addSuffix: true });
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
                        localStorage.removeItem('adminRole'); 
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

    return (
        <div className="admin">
            <div className="header">
                <div className="header-sliderbar">
                    <FontAwesomeIcon icon={faBars} onClick={toggleSidebar} style={{ color: "#797979", }} />
                    <h1>Panel de Administración</h1>
                </div>
                <button className="logout-btn" onClick={cerrarSesion}>
                    Cerrar Sesión
                </button>
            </div>
            <div className="content-dash">
                {sidebarVisible && (
                    <div className="sidebar-1">
                        <h2>Bienvenido</h2>
                        <button className={botonSeleccionado === 'Dashboard' ? 'selected' : ''} onClick={() => { mostrarInicioFunc(); handleButtonClick('Dashboard'); }}>
                            <FontAwesomeIcon icon={faGaugeHigh} style={{ color: "#ffff", }} /> Dasboard
                        </button>
                        <button className={botonSeleccionado === 'Productos' ? 'selected' : ''} onClick={() => { toggleMostrarBotonesProductos(); handleButtonClick('Productos'); }}>
                            <FontAwesomeIcon icon={faSquarePlus} style={{ color: "#ffffff", }} /> Productos
                        </button>
                        {mostrarBotonesProductos && (
                            <div>
                                <button className={botonSeleccionado === 'AgregarProducto' ? 'selected' : ''} onClick={() => { mostrarAgregarProducto(); handleButtonClick('AgregarProducto'); }}>
                                    <FontAwesomeIcon icon={faSquarePlus} style={{ color: "#ffffff", }} /> Agregar un Producto
                                </button>
                                <button className={botonSeleccionado === 'AdministrarProductos' ? 'selected' : ''} onClick={() => { navegarACrud(); handleButtonClick('AdministrarProductos'); }}>
                                    <FontAwesomeIcon icon={faCartFlatbed} style={{ color: "#ffffff", }} /> Administrar Productos
                                </button>
                            </div>
                        )}
                        <button className={botonSeleccionado === 'Usuarios' ? 'selected' : ''} onClick={() => { history.push('/usuarios'); handleButtonClick('Usuarios'); }}>
                            <FontAwesomeIcon icon={faUsers} style={{ color: "#ffffff", }} /> Usuarios
                        </button>
                        <button className={botonSeleccionado === 'Usuarios' ? 'selected' : ''} onClick={() => { history.push('/ventas'); handleButtonClick('Usuarios'); }}>
                            <FontAwesomeIcon icon={faUsers} style={{ color: "#ffffff", }} /> Ventas
                        </button>
                        <button className={botonSeleccionado === 'GestionRoles' ? 'selected' : ''} onClick={gestionarRoles}>
                            <FontAwesomeIcon icon={faUserShield} style={{ color: "#ffffff", }} /> Gestionar Roles
                        </button>
                    </div>
                )}
                <div className="container-info">
                    {!mostrarCRUD && !mostrarInicioState && (
                        <div>
                            <div className="usuarios-info">
                                <p className="estadistica"><UsersRound />
                                    + {cantidadUsuarios}<small className="user">{cantidadUsuarios} Personas Hacen Parte de FYLEC</small></p>
                                <p className="estadistica"><ShoppingBasket /> {cantidadProductos} <small>Tienes {cantidadProductos} Productos</small></p>
                                <p className="estadistica"><DollarSign />{cantidadProductosComprados} <small>Has Vendido {cantidadProductosComprados} Productos </small></p>
                            </div>
                            <div className="tarjetas">
                                <h2>Top Compras</h2>
                                {topCompradores.map((comprador, index) => (
                                    <p key={index}>
                                        <FontAwesomeIcon icon={faTrophy} style={{ color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32" }} />
                                        {comprador.nombre} - {comprador.compras} productos
                                    </p>
                                ))}
                            </div>

                        </div>
                    )}
                    {mostrarCRUD && <CRUD />}
                    {mostrarInicioState && (
                        <div>
                            <div className="usuarios-info">
                                <p className="estadistica"><FontAwesomeIcon icon={faUserGroup} />
                                    + {cantidadUsuarios}<small className="user">{cantidadUsuarios} Personas Hacen Parte de FYLEC</small></p>
                                <p className="estadistica"><FontAwesomeIcon icon={faBoxesStacked} /> {cantidadProductos} <small>Tienes {cantidadProductos} Productos</small></p>
                                <p className="estadistica"><FontAwesomeIcon icon={faSackDollar} />{cantidadProductosComprados} <small>Has Vendido {cantidadProductosComprados} Productos </small></p>
                            </div>

                        </div>
                    )}
                </div>
                <div className="notification">
                    <h2>NOTIFICACIONES</h2>
                    <ul>
                        {notificaciones.map((compra, index) => (
                            <li key={index}>
                                <FontAwesomeIcon icon={faClock} className="time" style={{ color: "#74C0FC", }} />
                                <div>
                                    <i>{formatoTiempoTranscurrido(compra.fecha_factura)}</i>
                                    <b>{compra.nombre}</b>
                                    <p>compró  {compra.producto.nombre}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {/* <Calendar 
                        onChange={(date) => setSelectedDate(date)}
                        value={selectedDate}
                        locale="es"
                    /> */}
                </div>
            </div>
        </div>
    );
};
export default Admin;
