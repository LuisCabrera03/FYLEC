import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faSquareMinus } from "@fortawesome/free-solid-svg-icons";
import './Compra.css';
import jsPDF from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Compra(props) {
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [precioConDescuento, setPrecioConDescuento] = useState(null);
    const [mostrarFormularioPago, setMostrarFormularioPago] = useState(false);
    const [nombreCliente, setNombreCliente] = useState('');
    const [correoCliente, setCorreoCliente] = useState('');
    const [direccion, setDireccion] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [tarjeta, setTarjeta] = useState('');
    const [fechaExpiracion, setFechaExpiracion] = useState('');
    const [cvv, setCvv] = useState('');
    const [metodoCompra, setMetodoCompra] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [departamentos] = useState([
        'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca',
        'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
        'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander',
        'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
    ]);
    const [municipios, setMunicipios] = useState([]);
    const [mostrarBotonDescargar, setMostrarBotonDescargar] = useState(false);
    const [, setCompraExitosa] = useState(false);
    const municipiosPorDepartamento = {
        'Amazonas': ['Leticia', 'Puerto Nariño', 'La Chorrera', 'Tarapacá', 'Puerto Santander', 'La Pedrera', 'Puerto Arica'],
        // Agrega los demás departamentos y municipios aquí
    };

    useEffect(() => {
        const obtenerProducto = async () => {
            try {
                const { productId, cantidad } = props.match.params;
                const response = await axios.get(`http://localhost:5000/api/productos/${productId}`);
                setProducto(response.data.producto);
                setCantidad(parseInt(cantidad));
            } catch (error) {
                console.error('Error al obtener el producto:', error);
            }
        };

        obtenerProducto();
    }, [props.match.params]);

    useEffect(() => {
        if (producto && producto.descuento > 0) {
            const precioConDescuento = producto.precio * (1 - producto.descuento / 100);
            setPrecioConDescuento(precioConDescuento);
        } else {
            setPrecioConDescuento(null);
        }
    }, [producto]);

    useEffect(() => {
        const obtenerUsuario = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const usuario = response.data.usuario;
                setUsuario(usuario);
                setNombreCliente(usuario.nombre);
                setCorreoCliente(usuario.correo);
                setDireccion(usuario.direccion);
                setDepartamento(usuario.departamento);
                setMunicipio(usuario.municipio);
                obtenerMunicipios(usuario.departamento);
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
            }
        };

        obtenerUsuario();
    }, []);

    const obtenerMunicipios = (departamentoId) => {
        const municipiosDepartamento = municipiosPorDepartamento[departamentoId];
        setMunicipios(municipiosDepartamento || []);
    };

    const aumentarCantidad = () => {
        if (cantidad < producto.cantidad) {
            setCantidad(prevCantidad => prevCantidad + 1);
        }
    };

    const disminuirCantidad = () => {
        setCantidad(prevCantidad => (prevCantidad > 1 ? prevCantidad - 1 : prevCantidad));
    };

    const handleCompraDirecta = () => {
        setMetodoCompra('Retiro por Ventanilla');
        setMostrarFormularioPago(true);
    };

    const handleCompraEnvio = () => {
        setMetodoCompra('Envío a tu Dirección');
        setMostrarFormularioPago(true);
    };

    const limpiarCampos = () => {
        setNombreCliente('');
        setCorreoCliente('');
        setDireccion('');
        setDepartamento('');
        setMunicipio('');
        setTarjeta('');
        setFechaExpiracion('');
        setCvv('');
    };

    const ocultarFormulario = () => {
        setMostrarFormularioPago(false);
        setCompraExitosa(true);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/completar-compra', {
                producto_id: producto.id,
                cantidad: cantidad,
                nombre: nombreCliente,
                correo: correoCliente,
                direccion: direccion,
                departamento: departamento,
                municipio: municipio,
                tarjeta: tarjeta,
                fechaExpiracion: fechaExpiracion,
                cvv: cvv
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Respuesta del servidor:', response.data);
            mostrarMensajeExito();
        } catch (error) {
            console.error('Error al completar la compra:', error);
            toast.error('Error al completar la compra. Por favor, inténtalo de nuevo más tarde.');
        }
    };

    const mostrarMensajeExito = () => {
        toast.success('¡Compra exitosa! ¡Gracias por tu compra!');
        limpiarCampos();
        ocultarFormulario();
        setMostrarBotonDescargar(true);
        enviarFactura();
    };

    const enviarFactura = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/crear-factura', {
                usuario_id: usuario.id,
                producto_id: producto.id,
                cantidad: cantidad,
                nombre: nombreCliente,
                correo: correoCliente,
                direccion: direccion,
                departamento: departamento,
                municipio: municipio,
                tarjeta: tarjeta
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Respuesta del servidor:', response.data);
        } catch (error) {
            console.error('Error al enviar la factura:', error);
            toast.error('Error al enviar la factura. Por favor, inténtalo de nuevo más tarde.');
        }
    };

    const descargarComprobante = () => {
        const doc = new jsPDF();
        const fecha = new Date().toLocaleDateString();
        const hora = new Date().toLocaleTimeString();
        const idCompra = generarIdCompra();
        const precioTotal = calcularPrecioTotal();
        const precioSinIVA = calcularPrecioSinIVA();

        doc.text(`Recibo de Compra`, 10, 10);
        doc.text(`FYLEC`, 10, 20);
        doc.text(`Tiendas FYLEC Colombia S.A.S`, 10, 30);
        doc.text(`NIT: 900.460.456-2`, 10, 40);
        doc.text(`GRAN CONTRIBUYENTE Res.  ${fecha} ${hora}`, 10, 50);
        doc.text(`Somos Agentes de Retención de IVA`, 10, 60);
        doc.text(`Tienda No. 0118`, 10, 70);
        doc.text(`Calle 4B Sur # 05 - 11`, 10, 80);
        doc.text(`La Plata Huila`, 10, 90);

        doc.text(`ID de Compra: ${idCompra}`, 10, 100);
        doc.text(`Producto: ${producto.nombre}`, 10, 110);
        doc.text(`Categoría: ${producto.categoria}`, 10, 120);
        doc.text(`Subcategoría: ${producto.subcategoria}`, 10, 130);
        doc.text(`Precio por Unidad: $${producto.precio.toFixed(2)}`, 10, 140);
        doc.text(`Precio sin IVA: $${precioSinIVA.toFixed(2)}`, 10, 150);
        if (producto.descuento > 0) {
            doc.text(`Precio con Descuento: $${precioConDescuento.toFixed(2)}`, 10, 160);
        }
        doc.text(`Cantidad: ${cantidad}`, 10, 170);
        doc.text(`Precio Total: $${precioTotal.toFixed(2)}`, 10, 180);
        doc.text(`Cliente: ${usuario.nombre}`, 10, 190);
        doc.text(`Correo Electrónico: ${usuario.correo}`, 10, 200);

        doc.save('comprobante.pdf');
    };

    const generarIdCompra = () => {
        return Math.floor(Math.random() * 1000000);
    };

    const calcularPrecioTotal = () => {
        return producto.descuento > 0 ? cantidad * precioConDescuento : cantidad * producto.precio;
    };

    const calcularPrecioSinIVA = () => {
        return producto.precio / 1.19; // Resta el 19% de IVA
    };

    return (
        <div className='carrito-container'>
            {producto ? (
                <div className='lista-carrito'>
                    <div className='item-carrito'>
                        <div className='detalle-item'>
                            <div className="carrito-img">
                                <img src={producto.imgUrl} alt={producto.nombre} />
                            </div>
                            <div className='nombre'>{producto.nombre}</div>

                            <p>Precio Unitario: ${producto.precio}</p>
                            {producto.descuento > 0 && (
                                <div>
                                    <p>Descuento: {producto.descuento}%</p>
                                    {precioConDescuento !== null && (
                                        <p>Precio con Descuento: ${precioConDescuento.toFixed(2)}</p>
                                    )}
                                </div>
                            )}
                            <div className='cantidad'>
                                <button onClick={disminuirCantidad}><FontAwesomeIcon icon={faSquareMinus} /></button>
                                <input type="number" min="1" max={producto.cantidad} value={cantidad} readOnly />
                                <button onClick={aumentarCantidad}><FontAwesomeIcon icon={faSquarePlus} /></button>
                            </div>
                        </div>
                    </div>
                    <div className='acciones'>
                        <button onClick={handleCompraDirecta} className='btn-pagar'>Retiro por Ventanilla</button>
                        <button className='btn-pagar' onClick={handleCompraEnvio}>Envío a tu Dirección</button>
                    </div>
                    {mostrarFormularioPago && (
                        <form onSubmit={handleFormSubmit}>
                            <h3>{metodoCompra}</h3>
                            {metodoCompra === 'Retiro por Ventanilla' ? (
                                <p>Se ha registrado tu solicitud de compra. Por favor, dirígete a nuestra sucursal más cercana para completar el proceso de pago.</p>
                            ) : (
                                <div className='pago-tarjeta'>
                                    <label>
                                        <input type="text" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} required className='datos' />
                                    </label>
                                    <label>
                                        <input type="email" value={correoCliente} onChange={(e) => setCorreoCliente(e.target.value)} required className='datos' />
                                    </label>
                                    <label className='direccion'>
                                        <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                                        <select value={departamento} onChange={(e) => { setDepartamento(e.target.value); obtenerMunicipios(e.target.value); }} required>
                                            {departamentos.map(dep => (
                                                <option key={dep} value={dep}>{dep}</option>
                                            ))}
                                        </select>
                                        <select value={municipio} onChange={(e) => setMunicipio(e.target.value)} required>
                                            {municipios.map(mun => (
                                                <option key={mun} value={mun}>{mun}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className='pago'>
                                        <input type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} required className='tarjeta' placeholder='Numero de Tarjeta' />

                                        <input type="text" value={fechaExpiracion} onChange={(e) => setFechaExpiracion(e.target.value)} required className='expiracion' placeholder='Fecha de Expiracion'/>

                                        <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} required className='cvc' placeholder='CVC'/>
                                    </label>
                                    <button type="submit">Confirmar Compra</button>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            ) : (
                <p>Cargando producto...</p>
            )}
            {mostrarBotonDescargar && (
                <button onClick={descargarComprobante}>Descargar Comprobante</button>
            )}
            <ToastContainer />
        </div>
    );
}

export default Compra;
