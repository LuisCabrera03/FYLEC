import 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompradoresChart = ({ topCompradores }) => {
    const data = {
        labels: topCompradores.map(comprador => comprador.nombre),
        datasets: [
            {
                label: 'Productos Comprados',
                data: topCompradores.map(comprador => comprador.compras),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
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
                text: 'Top 3 Compradores',
            },
        },
    };

    return (
        <div style={{ width: '600px', margin: 'auto' }}>
            <Bar data={data} options={options} />
        </div>
    );
};

CompradoresChart.propTypes = {
    topCompradores: PropTypes.arrayOf(
        PropTypes.shape({
            nombre: PropTypes.string.isRequired,
            compras: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default CompradoresChart;
