import React from 'react';
import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const ReciboCompra = ({ ferreteria, fechaCompra, idCompra, producto, precioTotal }) => {
    return (
        <Document>
            <Page style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>Recibo de Compra</Text>
                    <Text>{ferreteria.nombre}</Text>
                    <Text>{ferreteria.direccion}</Text>
                    <Text>{ferreteria.telefono}</Text>
                </View>
                <View style={styles.section}>
                    <Text>Fecha de Compra: {fechaCompra}</Text>
                    <Text>ID de Compra: {idCompra}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.subheader}>Detalles del Producto</Text>
                    <Text>Nombre: {producto.nombre}</Text>
                    <Text>Categoría: {producto.categoria}</Text>
                    <Text>Subcategoría: {producto.subcategoria}</Text>
                    <Text>Precio por Unidad: ${producto.precio}</Text>
                    {producto.descuento > 0 && <Text>Precio con Descuento: ${producto.precioConDescuento}</Text>}
                </View>
                <View style={styles.section}>
                    <Text style={styles.total}>Total Pagado: ${precioTotal}</Text>
                </View>
            </Page>
        </Document>
    );
};

const ReciboCompraPDF = ({ ferreteria, fechaCompra, idCompra, producto, precioTotal }) => {
    return (
        <PDFDownloadLink document={<ReciboCompra ferreteria={ferreteria} fechaCompra={fechaCompra} idCompra={idCompra} producto={producto} precioTotal={precioTotal} />} fileName="recibo_compra.pdf">
            {({ blob, url, loading, error }) => (loading ? 'Generando PDF...' : 'Descargar Recibo')}
        </PDFDownloadLink>
    );
};

export default ReciboCompraPDF;

const styles = StyleSheet.create({
    page: {
        padding: 20,
    },
    section: {
        margin: 10,
    },
    header: {
        fontSize: 24,
        marginBottom: 10,
    },
    subheader: {
        fontSize: 18,
        marginBottom: 10,
    },
    total: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
