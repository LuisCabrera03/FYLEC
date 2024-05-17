import React, { useState, useEffect } from "react";
import axios from "axios";

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

    return (
        <div className="product-list">
            <table>
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
                    </tr>
                </thead>
                <tbody>
                    {ventas.map((venta) => (
                        <React.Fragment key={venta.id}>
                            <tr>
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
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Ventas;
