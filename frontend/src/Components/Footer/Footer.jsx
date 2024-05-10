import 'react';
import Logo from '../../assets/logoFYLEC.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPhone,
    faEnvelope,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import {
    faFacebookSquare,
    faInstagram,
    faTwitter
} from '@fortawesome/free-brands-svg-icons'; // Se cambió a free-brands-svg-icons
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className='contact'>
                <div className='contact-content'>
                    <FontAwesomeIcon icon={faPhone} className='icon-contact' />
                    <div>
                        <b> + (57) 316 790 80 80</b>
                        <p>¡Soporte en línea gratis!</p>
                    </div>
                </div>
                <div className='contact-content'>
                    <FontAwesomeIcon icon={faEnvelope} className='icon-contact' />
                    <div>
                        <b> hola@laferre.com</b>
                        <p>¡Escríbenos!</p>
                    </div>
                </div>
                <div className='contact-content'>
                    <FontAwesomeIcon icon={faClock} className='icon-contact' />
                    <div>
                        <b> Lun - Vie / 8:00 - 18:00</b>
                        <p>¡Días de trabajo / Horas!</p>
                    </div>
                </div>
            </div>
            <div className='informacion'>
                <div>
                    <img src={Logo} alt='logo' />
                    <p>Somos una ferretería online encantados de</p>
                    <p> atenderte y brindarte la mejor experiencia.</p>
                    <p> Preguntas por nuestros descuentos.</p>
                </div>
                <div className='informacio-2'>
                    <b>ENCUENTRA RÁPIDO</b>
                    <p>Contacto</p>
                    <p>Preguntas frecuentes</p>
                </div>
                <div className='informacio-2'>
                    <p>Devoluciones/ Intercambio</p>
                    <p>Lista de deseos</p>
                </div>
                <div>
                    <p>Novedades</p>
                </div>
            </div>
            <div className='redes'>
                <div className='desarrollo'><p>DESARROLLADO POR BYTHE HUNTERS</p></div>
                <div className='redes-content'>
                    <FontAwesomeIcon icon={faFacebookSquare} className="icon-contact" />
                    <FontAwesomeIcon icon={faInstagram} className="icon-contact" />
                    <FontAwesomeIcon icon={faTwitter} className="icon-contact" />
                </div>
            </div>
        </footer>
    );
}

export default Footer;
