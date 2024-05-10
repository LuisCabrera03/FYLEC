import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Crud = () => {
    const history = useHistory();
    const [codigo, setCodigo] = useState('');
    const [nombre, setNombre] = useState('');
    const [marca, setMarca] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [categoria, setCategoria] = useState('');
    const [subcategoria, setSubcategoria] = useState('');
    const [precio, setPrecio] = useState('');
    const [descuento, setDescuento] = useState('');
    const [imgUrl, setImgUrl] = useState('');

    const opcionesCategoria = ["Herramientas Manuales", "Herramientas eléctricas", 'Ferretería general', 'Pintura y acabados', 'Electricidad', 'Fontanería', 'Jardinería y exteriores', 'Seguridad y protección', "Materiales de Construcción"];
    const opcionesSubcategoria = {
        "Herramientas Manuales": ["Destornilladores", "Llaves (fijas, ajustables, de tubo)", "Alicates (de corte, de punta, de presión)", 'Martillos (de carpintero, de bola, de goma)', 'Sierras (para madera, para metal)', 'Cinceles', 'Gatos y prensas'],
        "Herramientas eléctricas": ["Taladros", "Sierra circular", "Amoladoras", 'Lijadoras', 'Sierras caladoras', 'Pistolas de calor', 'Soldadoras'],
        "Ferretería general": ["Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)", "Bisagras y cerraduras", "Pomos y manijas", 'Cadenas y candados', 'Escaleras y andamios', 'Carretillas y carros de mano', 'Soportes y colgadores'],
        "Pintura y acabados": ["Pinturas (interior, exterior, esmaltes, aerosoles)", "Rodillos y brochas", "Cintas de enmascarar", 'Masillas y selladores', 'Lijas y papel de lija', 'Impermeabilizantes'],
        "Electricidad": ["Cables eléctricos", "Interruptores y enchufes", "Lámparas y bombillas", 'Extensiones y enrolladores', 'Tubos y accesorios para instalaciones eléctricas', 'Cajas de conexiones'],
        "Fontanería": ["Tuberías y accesorios (cobre, PVC, PPR)", "Grifos y accesorios de baño y cocina", "Sanitarios y accesorios de fontanería", 'Bombas de agua', 'Herramientas para fontanería (llaves de tubo, cortatubos)', 'Fosas sépticas y sistemas de tratamiento de aguas'],
        "Jardinería y exteriores": ["Herramientas de jardinería (pala, rastrillo, podadoras)", "Mangueras y aspersores", "Fertilizantes y pesticidas", "Macetas y jardineras", "Barbacoas y accesorios para exteriores", 'Sistemas de riego'],
        "Seguridad y protección": ["Sistemas de alarma y vigilancia", "Cerrajería de seguridad (cerrojos, mirillas digitales)", "Extintores y sistemas contra incendios", 'Equipos de protección personal (cascos, guantes, gafas)', 'Señalización de seguridad', 'Cajas fuertes y armeros'],
        "Materiales de Construcción": ["Herramientas de Construcción", "Materiales de Albañilería", "Materiales de Acabado", "Carpintería y Madera", "Plomería y Fontanería", "Electricidad", "Techos y Cubiertas"],
    };

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            history.push('/login');
        }
    }, [history]);

    const agregarProducto = async () => {
        if (!codigo || !nombre || !descripcion || !cantidad || !categoria || !precio || !imgUrl) {
            toast.error('Por favor, complete todos los campos.');
            return;
        }
        try {
            const precioDecimal = parseFloat(precio.replace('.', '').replace(',', '.'));
            const precioRedondeado = Math.round(precioDecimal * 100) / 100;
            const precioFormateado = precioRedondeado.toLocaleString('es-CO', { minimumFractionDigits: 2 });

            await axios.post('http://localhost:5000/api/agregar-producto', {
                codigo,
                nombre,
                marca,
                descripcion,
                cantidad,
                categoria,
                subcategoria,
                precio: precioFormateado,
                descuento,
                imgUrl
            });
            limpiarCampos();
            toast.success('Producto agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar producto:', error);
            toast.error('Error al agregar producto');
        }
    };

    const limpiarCampos = () => {
        setCodigo('');
        setNombre('');
        setMarca('');
        setDescripcion('');
        setCantidad('');
        setCategoria('');
        setSubcategoria('');
        setPrecio('');
        setDescuento('');
        setImgUrl('');
    };

    const handlePrecioChange = (e) => {
        const inputPrecio = e.target.value;
        // Eliminar caracteres que no sean dígitos o puntos decimales
        const cleanedPrecio = inputPrecio.replace(/[^\d.]/g, '');
        // Obtener el precio formateado
        const precioFormateado = cleanedPrecio
            .replace(/\./g, '') // Eliminar puntos existentes
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Agregar puntos de separación de miles
        // Actualizar el estado del precio
        setPrecio(precioFormateado);
    };


    return (
        <div className='admin'>
            <ToastContainer />
            

            <div className="main-content">
                <div className='dasboard'></div>
                <div className="product-form">
                    <h3>Agregar Producto</h3>
                    <span>Código del Producto </span>
                    <input type="text" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                    <span>Nombre del Producto </span>
                    <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    <span>Marca del Producto</span>
                    <input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
                    <span>Descripción del Producto </span>
                    <textarea
                        placeholder="Descripción"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                    <span>Cantidad de Productos </span>
                    <input type="number" placeholder="Cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                    <fieldset>
                        <legend>Categoria del Producto</legend>
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                            <option value="">Selecciona una categoría</option>
                            {opcionesCategoria.map((opcion, index) => (
                                <option key={index} value={opcion}>{opcion}</option>
                            ))}
                        </select>
                    </fieldset>
                    <fieldset>
                        <legend>Selecciona una Subcategoría</legend>
                        <select value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)}>
                            <option value="">Selecciona una subcategoría</option>
                            {categoria && opcionesSubcategoria[categoria] && opcionesSubcategoria[categoria].map((opcion, index) => (
                                <option key={index} value={opcion}>{opcion}</option>
                            ))}
                        </select>
                    </fieldset>
                    <span>Precio del Producto</span>
                    <div>
                        <input
                            type="text"
                            placeholder="Precio"
                            value={precio}
                            onChange={handlePrecioChange}
                        />
                    </div>
                    <span>Descuento del Producto %</span>
                    <input type="number" placeholder="Descuento (%)" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
                    <span>URL de la Imagen del Producto</span>
                    <input type="text" placeholder="URL de la imagen" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
                    {imgUrl && (
                        <div className="carrito-img">
                            <img src={imgUrl} alt="Preview" className="preview-image" />
                        </div>
                    )}
                    <button className="add-btn" onClick={agregarProducto}>
                        <FontAwesomeIcon icon={faPlus} /> Agregar Producto
                    </button>
                    <button className="clear-btn" onClick={limpiarCampos}>
                        <FontAwesomeIcon icon={faTimes} /> Limpiar Campos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Crud;
