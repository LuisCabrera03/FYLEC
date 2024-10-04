import { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  MenuItem,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateProduct = () => {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const opcionesCategoria = [
    "Herramientas Manuales",
    "Herramientas eléctricas",
    "Ferretería general",
    "Pintura y acabados",
    "Electricidad",
    "Fontanería",
    "Jardinería y exteriores",
    "Seguridad y protección",
    "Materiales de Construcción",
  ];

  const opcionesSubcategoria = {
    "Herramientas Manuales": [
      "Destornilladores",
      "Llaves (fijas, ajustables, de tubo)",
      "Alicates (de corte, de punta, de presión)",
      "Martillos (de carpintero, de bola, de goma)",
      "Sierras (para madera, para metal)",
      "Cinceles",
      "Gatos y prensas",
    ],
    "Herramientas eléctricas": [
      "Taladros",
      "Sierra circular",
      "Amoladoras",
      "Lijadoras",
      "Sierras caladoras",
      "Pistolas de calor",
      "Soldadoras",
    ],
    "Ferretería general": [
      "Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)",
      "Bisagras y cerraduras",
      "Pomos y manijas",
      "Cadenas y candados",
      "Escaleras y andamios",
      "Carretillas y carros de mano",
      "Soportes y colgadores",
    ],
    "Pintura y acabados": [
      "Pinturas (interior, exterior, esmaltes, aerosoles)",
      "Rodillos y brochas",
      "Cintas de enmascarar",
      "Masillas y selladores",
      "Lijas y papel de lija",
      "Impermeabilizantes",
    ],
    Electricidad: [
      "Cables eléctricos",
      "Interruptores y enchufes",
      "Lámparas y bombillas",
      "Extensiones y enrolladores",
      "Tubos y accesorios para instalaciones eléctricas",
      "Cajas de conexiones",
    ],
    Fontanería: [
      "Tuberías y accesorios (cobre, PVC, PPR)",
      "Grifos y accesorios de baño y cocina",
      "Sanitarios y accesorios de fontanería",
      "Bombas de agua",
      "Herramientas para fontanería (llaves de tubo, cortatubos)",
      "Fosas sépticas y sistemas de tratamiento de aguas",
    ],
    "Jardinería y exteriores": [
      "Herramientas de jardinería (pala, rastrillo, podadoras)",
      "Mangueras y aspersores",
      "Fertilizantes y pesticidas",
      "Macetas y jardineras",
      "Barbacoas y accesorios para exteriores",
      "Sistemas de riego",
    ],
    "Seguridad y protección": [
      "Sistemas de alarma y vigilancia",
      "Cerrajería de seguridad (cerrojos, mirillas digitales)",
      "Extintores y sistemas contra incendios",
      "Equipos de protección personal (cascos, guantes, gafas)",
      "Señalización de seguridad",
      "Cajas fuertes y armeros",
    ],
    "Materiales de Construcción": [
      "Herramientas de Construcción",
      "Materiales de Albañilería",
      "Materiales de Acabado",
      "Carpintería y Madera",
      "Plomería y Fontanería",
      "Electricidad",
      "Techos y Cubiertas",
    ],
  };

  const agregarProducto = async () => {
    if (
      !codigo.trim() ||
      !nombre.trim() ||
      !descripcion.trim() ||
      !cantidad.trim() ||
      !categoria.trim() ||
      !precio.trim() ||
      !imgUrl.trim()
    ) {
      toast.error("Por favor, complete todos los campos correctamente.");
      return;
    }

    const cantidadNumerica = parseInt(cantidad, 10);
    const descuentoNumerico = parseFloat(descuento.replace(",", "."));

    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0 || isNaN(descuentoNumerico) || descuentoNumerico < 0) {
      toast.error("Por favor, ingrese valores numéricos válidos y positivos.");
      return;
    }

    try {
      const precioNumerico = parseFloat(precio.replace(/\./g, "").replace(",", "."));
      await axios.post("http://127.0.0.1:5000/api/agregar-producto", {
        codigo,
        nombre,
        marca,
        descripcion,
        cantidad: cantidadNumerica,
        categoria,
        subcategoria,
        precio: precioNumerico,
        descuento: descuentoNumerico,
        imgUrl,
      });
      limpiarCampos();
      toast.success("Producto agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      toast.error("Error al agregar producto");
    }
  };

  const limpiarCampos = () => {
    setCodigo("");
    setNombre("");
    setMarca("");
    setDescripcion("");
    setCantidad("");
    setCategoria("");
    setSubcategoria("");
    setPrecio("");
    setDescuento("");
    setImgUrl("");
  };

  const handlePrecioChange = (e) => {
    const inputPrecio = e.target.value.replace(/[^\d,]/g, "");
    const numericPrecio = inputPrecio.replace(",", ".").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setPrecio(numericPrecio);
  };

  const handleDescuentoChange = (e) => {
    const inputDescuento = e.target.value.replace(/[^\d]/g, "");
    setDescuento(inputDescuento);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4 }}>
      <ToastContainer />
      <Card>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Agregar Producto
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Código del Producto"
                variant="outlined"
                fullWidth
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre del Producto"
                variant="outlined"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Marca"
                variant="outlined"
                fullWidth
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Descripción"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cantidad"
                type="number"
                variant="outlined"
                fullWidth
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Categoría"
                variant="outlined"
                fullWidth
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <MenuItem value="">
                  <em>Selecciona una categoría</em>
                </MenuItem>
                {opcionesCategoria.map((opcion, index) => (
                  <MenuItem key={index} value={opcion}>
                    {opcion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Subcategoría"
                variant="outlined"
                fullWidth
                value={subcategoria}
                onChange={(e) => setSubcategoria(e.target.value)}
              >
                <MenuItem value="">
                  <em>Selecciona una subcategoría</em>
                </MenuItem>
                {categoria &&
                  opcionesSubcategoria[categoria]?.map((opcion, index) => (
                    <MenuItem key={index} value={opcion}>
                      {opcion}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Precio"
                variant="outlined"
                fullWidth
                value={precio}
                onChange={handlePrecioChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Descuento (%)"
                variant="outlined"
                fullWidth
                value={descuento}
                onChange={handleDescuentoChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="URL de la Imagen"
                variant="outlined"
                fullWidth
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
              />
            </Grid>
          </Grid>
          {imgUrl && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <img src={imgUrl} alt="Preview" style={{ maxWidth: "100%", height: "auto" }} />
            </Box>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: "center" }}>
          <Button variant="contained" color="primary" onClick={agregarProducto} startIcon={<FontAwesomeIcon icon={faPlus} />}>
            Agregar Producto
          </Button>
          <Button variant="outlined" color="secondary" onClick={limpiarCampos} startIcon={<FontAwesomeIcon icon={faTimes} />}>
            Limpiar Campos
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default CreateProduct;
