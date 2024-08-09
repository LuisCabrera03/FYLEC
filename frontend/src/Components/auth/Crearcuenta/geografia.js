const axios = require('axios');

async function obtenerDepartamentosYCiudades() {
  try {
    // Hacer una solicitud a la API de OSM para obtener la información geográfica de Colombia
    const response = await axios.get('https://nominatim.openstreetmap.org/search?country=Colombia&format=json&polygon=1');
    
    // Filtrar la respuesta para obtener solo los datos de los departamentos y municipios
    const datosColombia = response.data.filter(item => item.type === 'administrative');

    // Extraer los nombres de los departamentos y municipios
    const departamentos = datosColombia.map(item => item.address.state);
    const municipios = datosColombia.map(item => item.address.city);

    // Eliminar duplicados y ordenar alfabéticamente
    const departamentosUnicos = [...new Set(departamentos)].sort();
    const municipiosUnicos = [...new Set(municipios)].sort();

    return { departamentos: departamentosUnicos, municipios: municipiosUnicos };
  } catch (error) {
    console.error('Error al obtener la información geográfica:', error);
    return { error: 'Error al obtener la información geográfica' };
  }
}

module.exports = { obtenerDepartamentosYCiudades };
