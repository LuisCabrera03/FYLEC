import 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

const VentasMensualesChart = ({ ventasMensuales }) => {
    const data = {
        labels: ventasMensuales.map(venta => venta.mes),
        datasets: [
            {
                label: 'Ventas Mensuales',
                data: ventasMensuales.map(venta => venta.cantidad),
                fill: false,
                borderColor: '#42A5F5',
                tension: 0.1
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Ventas Mensuales',
            },
        },
    };

    return (
        <div style={{ width: '600px', margin: 'auto' }}>
            <Line data={data} options={options} />
        </div>
    );
};

VentasMensualesChart.propTypes = {
    ventasMensuales: PropTypes.arrayOf(
        PropTypes.shape({
            mes: PropTypes.string.isRequired,
            cantidad: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default VentasMensualesChart;
