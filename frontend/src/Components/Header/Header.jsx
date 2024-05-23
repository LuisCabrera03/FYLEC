import { useState, useRef, useEffect } from 'react';
import './Header.css';
import { useHistory, useLocation } from 'react-router-dom';
import { faSearch, faUser, faTruck, faShoppingBag, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [subItems, setSubItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [previousSearches, setPreviousSearches] = useState([]);
    const menuRef = useRef(null);
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        fetchProfileData();
        const previousSearchesData = localStorage.getItem('previousSearches');
        if (previousSearchesData) {
            setPreviousSearches(JSON.parse(previousSearchesData));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
    }, [previousSearches]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUserLoggedIn(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const responseData = await response.json();

            if (!responseData || !responseData.usuario) {
                throw new Error('Datos de perfil no válidos');
            }

            setUserName(responseData.usuario.nombre);
            setUserLoggedIn(true);
        } catch (error) {
            if (error.message.includes('401') || error.message.includes('422')) {
                // Suprimir errores de autenticación específicos
                console.log('Usuario no autenticado o token inválido');
            } else {
                console.error('Error al obtener el perfil:', error.message);
            }
            setUserLoggedIn(false);
        }
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleRedirect = () => {
        if (userLoggedIn) {
            history.push('/perfil');
        } else {
            history.push('/login');
        }
    };

    const redirectToHome = () => {
        history.push('/');
        setSelectedCategory(null);
        setIsOpen(false);
    };

    const handleRedirectToCarrito = () => {
        history.push('/CarritoCompras');
    };

    const handleRedirectToFactura = () => {
        history.push('/Factura');
    };

    const handleItemClick = (item) => {
        const subcategories = obtenerSubcategorias(item);
        setSubItems(subcategories);
        setSelectedCategory(item);
    };

    const handleSubcategoryClick = (subcategory) => {
        history.push(`/productos?subcategoria=${subcategory}`);
    };

    const handleSearchInputChange = (event) => {
        const { value } = event.target;
        setSearchTerm(value);

        const filteredSearches = previousSearches.filter(search => search.includes(value));
        setSearchSuggestions(filteredSearches);
    };

    const handleSearchSubmit = (event) => {
        if (event.key === 'Enter' || event.type === 'click') {
            setPreviousSearches(prevSearches => [...prevSearches, searchTerm]);
            history.push(`/productos?search=${searchTerm}`);
        }
    };

    const handleCategoryClick = (categoria) => {
        const subcategories = obtenerSubcategorias(categoria);
        const subcategoriasParam = subcategories.join(',');
        history.push(`/categorias?categoria=${categoria}&subcategorias=${subcategoriasParam}`);
        setSelectedCategory(categoria);
        setIsOpen(false);
    }

    const obtenerSubcategorias = (categoria) => {
        const subcategorias = {
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

        return subcategorias[categoria] || [];
    }

    const categorias = [
        "Herramientas Manuales",
        "Herramientas eléctricas",
        "Ferretería general",
        "Pintura y acabados",
        "Electricidad",
        "Fontanería",
        "Jardinería y exteriores",
        "Seguridad y protección",
        "Materiales de Construcción"
    ];

    const categoriasVisuales = [
        "Manuales",
        "Eléctricos",
        "Ferretería",
        "Pinturas",
        "Electricidad",
        "Fontanería",
        "Jardinería",
        "Seguridad",
        "Construcción"
    ];

    return (
        <>
            <header>
                <div className="fylec" onClick={redirectToHome}>
                    <h1>FYLEC</h1>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="¿Qué estás buscando hoy?"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        onKeyPress={handleSearchSubmit}
                    />
                    <button type="button" onClick={handleSearchSubmit}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                    {isOpen && searchTerm && (
                        <div className="search-suggestions">
                            {searchSuggestions.map((suggestion, index) => (
                                <div key={index} onClick={() => setSearchTerm(suggestion)}>
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="profile-icons">
                    <div onClick={handleRedirect} className='btn-direccion'>
                        <FontAwesomeIcon icon={faUser} className='icon' />
                        <div className='saludo'>
                            <h4>{userLoggedIn ? 'Hola,' : 'Hola, Amigo'}</h4>
                            <p>{userLoggedIn ? userName.split(' ')[0] : 'Inicia sesión'}</p>
                        </div>
                    </div>
                    <div onClick={handleRedirectToFactura} className='btn-direccion'>
                        <FontAwesomeIcon icon={faTruck} className='icon' />
                    </div>
                    <div onClick={handleRedirectToCarrito} className='btn-direccion'>
                        <FontAwesomeIcon icon={faShoppingBag} className='icon' />
                    </div>
                </div>
            </header>
            <section>
                {isOpen && (
                    <div className="dropdown-menu" ref={menuRef}>
                        <div className='item'>
                            <ul>
                                {categorias.map((categoria, index) => (
                                    <li key={index} onClick={() => handleItemClick(categoria)} className={selectedCategory === categoria ? "selected" : ""}>{categoria}</li>
                                ))}
                            </ul>
                        </div>
                        <div className='sub-item'>
                            {subItems.map((subItem, index) => (
                                <div key={index} className="subcategory-item" onClick={() => handleSubcategoryClick(subItem)}>
                                    <p>{subItem}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className='container-section' onClick={toggleMenu}>
                    <div className='container-categorias'>
                        <FontAwesomeIcon icon={faBars} /><p>CATEGORÍAS</p>
                    </div>
                </div>
                <div className='lista-categorias'>
                    <ul>
                        {location.pathname !== '/' && (
                            <li onClick={redirectToHome}>
                                <div className='btn-inicio'>Inicio</div>
                            </li>
                        )}
                        {categoriasVisuales.map((categoria, index) => (
                            <li key={index} className={`${selectedCategory === categorias[index] && !isOpen ? "selected selected2" : ""}`}>
                                <div onClick={() => handleCategoryClick(categorias[index])}>{categoria}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}

export default Header;
