import 'react';
import PropTypes from 'prop-types';
import { CheckSquare, Package, Truck, Home } from 'lucide-react';

const estados = [
    { estado: 'esperando', label: 'Esperando', icon: <CheckSquare /> },
    { estado: 'recibido', label: 'Recibido', icon: <Package /> },
    { estado: 'enviando', label: 'Enviando', icon: <Truck /> },
    { estado: 'entregado', label: 'Entregado', icon: <Home /> }
];

const ProgressBar = ({ currentState }) => {
    const getStateIndex = (estado) => estados.findIndex((item) => item.estado === estado);
    const currentIndex = getStateIndex(currentState);

    const getColor = (index) => {
        const colors = ['#FAC12C', '#F9564D', '#964CBD', '#40DB5C']; 
        return colors[index];
    };

    return (
        <div className="progress-bar-custom">
            {estados.map((item, index) => (
                <div key={item.estado} className={`progress-step-custom ${index <= currentIndex ? 'active' : ''}`}>
                    <div className="icon-custom" style={{ backgroundColor: index <= currentIndex ? getColor(index) : '#ccc' }}>
                        {item.icon}
                    </div>
                    <div className="label-custom">{item.label}</div>
                    {index < estados.length - 1 && <div className="divider-custom" style={{ backgroundColor: index < currentIndex ? getColor(index) : '#ccc' }}></div>}
                </div>
            ))}
        </div>
    );
};

ProgressBar.propTypes = {
    currentState: PropTypes.string.isRequired
};

export default ProgressBar;
