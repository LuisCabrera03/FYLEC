import { useState, useEffect } from "react";
import axios from "axios";
import './Ventas.css';

const Ventas = () => {
    const [ventas, setVentas] = useState([]);

    useEffect(() => {
        const obtenerVentas = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/comprastotal');
                setVentas(response.data.facturas);
            } catch (error) {
                console.error('Error al obtener los datos de ventas:', error);
            }
        };

        obtenerVentas();
    }, []);

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            await axios.put(`http://localhost:5000/api/comprastotal/${id}`, { estado: nuevoEstado });
            setVentas((ventas) =>
                ventas.map((venta) =>
                    venta.id === id ? { ...venta, estado: nuevoEstado } : venta
                )
            );
        } catch (error) {
            console.error('Error al actualizar el estado de la venta:', error);
        }
    };

    return (
        <div className="ventas">
            <h2>Ventas</h2>
            <div className="ventas-table-container">
                <table className="ventas-table">
                    <thead>
                        <tr>
                            <th>ID Venta</th>
                            <th>Nombre Cliente</th>
                            <th>Correo</th>
                            <th>Departamento</th>
                            <th>Municipio</th>
                            <th>Dirección</th>
                            <th>Producto(s)</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <th>Marca</th>
                            <th>Subcategoría</th>
                            <th>Cantidad Producto</th>
                            <th>Precio</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>Tarjeta</th>
                            <th>ID Usuario</th>
                            <th>Estado Actual</th>
                            <th>Cambiar Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.map((venta) => (
                            <tr key={venta.id}>
                                <td>{venta.id}</td>
                                <td>{venta.nombre}</td>
                                <td>{venta.correo}</td>
                                <td>{venta.departamento}</td>
                                <td>{venta.municipio}</td>
                                <td>{venta.direccion}</td>
                                <td>{venta.producto.nombre}</td>
                                <td>{venta.producto.categoria}</td>
                                <td>{venta.producto.descripcion}</td>
                                <td>{venta.producto.marca}</td>
                                <td>{venta.producto.subcategoria}</td>
                                <td>{venta.producto.cantidad}</td>
                                <td>{venta.producto.precio}</td>
                                <td>{venta.cantidad * venta.producto.precio}</td>
                                <td>{new Date(venta.fecha_factura).toLocaleDateString()}</td>
                                <td>{venta.tarjeta}</td>
                                <td>{venta.usuario_id}</td>
                                <td>{venta.estado}</td>
                                <td>
                                    <select
                                        value={venta.estado}
                                        onChange={(e) => handleEstadoChange(venta.id, e.target.value)}
                                    >
                                        <option value="esperando">Esperando</option>
                                        <option value="enviando">Enviando</option>
                                        <option value="recibido">Recibido</option>
                                        <option value="entregado">Entregado</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Ventas;
