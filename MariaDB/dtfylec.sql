-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-05-2024 a las 00:23:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dtfylec`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `rol` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administrador`
--

INSERT INTO `administrador` (`id`, `nombre`, `email`, `contraseña`, `fecha_ingreso`, `rol`) VALUES
(1, 'Adminl', 'admin@gmail.com', '123', '2024-05-05', 1),
(5, '12324', 'administrador@gmail.com', '87654321', '2024-05-06', 2),
(6, 'camilo', 'adm111in@gmail.com', '12345678', '2024-05-06', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carritocompras`
--

CREATE TABLE `carritocompras` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `departamento` text CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `municipio` text CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `tarjeta` varchar(255) NOT NULL,
  `fecha_factura` date NOT NULL DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura`
--

INSERT INTO `factura` (`id`, `usuario_id`, `producto_id`, `cantidad`, `nombre`, `correo`, `direccion`, `departamento`, `municipio`, `tarjeta`, `fecha_factura`) VALUES
(1, 13, 41, 10, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '3434', '2024-04-19'),
(2, 13, 41, 10, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '876543234', '2024-04-19'),
(3, 13, 56, 11, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '65432', '2024-04-19'),
(4, 13, 42, 10, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '765456765434', '2024-04-23'),
(5, 13, 42, 1, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '765456', '2024-04-23'),
(6, 13, 42, 10, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '876545678', '2024-04-23'),
(7, 13, 42, 1, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '212121', '2024-04-23'),
(8, 13, 53, 10, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '434344', '2024-04-23'),
(9, 13, 57, 4, 'Pepe Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '1212', '2024-04-23'),
(10, 13, 55, 8, 'Luis Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '1234569876543', '2024-04-29'),
(11, 13, 27, 1, 'Luis Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '123456789', '2024-05-01'),
(12, 13, 28, 1, 'Luis Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', 'wwww', '2024-05-01'),
(13, 13, 54, 1, 'Luis Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '234567890', '2024-05-03'),
(14, 13, 62, 5, 'Luis Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '12345678', '2024-05-04'),
(15, 13, 62, 1, 'Luis Alfredo Cabrera Sarria ', 'Administrador@gmail.com', 'calle 4b Sur #5-11', 'Amazonas', 'Tarapacá', '234564', '2024-05-04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `subcategoria` varchar(100) DEFAULT NULL,
  `imgUrl` varchar(255) DEFAULT NULL,
  `precio` decimal(10,3) DEFAULT NULL,
  `descuento` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `codigo`, `nombre`, `marca`, `descripcion`, `cantidad`, `categoria`, `subcategoria`, `imgUrl`, `precio`, `descuento`) VALUES
(27, '1', 'Juego de brocas de destornillador de 1/4 pulgadas', 'Malca ñao', 'Juego de brocas de destornillador de 1/4 pulgadas, Kit de herramientas de Llave de trinquete para reparación automática, 46 piezas', 10, 'Herramientas Manuales', 'Destornilladores', 'https://s.alicdn.com/@sc04/kf/Hcae4888fbe404337875e604d9f5bc344C.jpg', 33.000, 0.00),
(28, '12', 'Juego de Herramientas de llave de tubo, trinquete reversible, combinación de 16 Uds.', 'Ningbo Dongrun Imp & Exp Co., Ltd.', 'Garantía	1 month\nMaterial	De acero al carbono', 4, 'Herramientas Manuales', 'Llaves (fijas, ajustables, de tubo)', 'https://s.alicdn.com/@sc04/kf/He2de61db49b64a599ad92f14f88444c9X.jpg', 22.000, 0.00),
(30, '1', 'Martillo con mango de fibra, superficie de succión, martillo con cabeza cuadrada', 'Hefei Chegongshe Hardware Technology', 'Material del mango	Fibra de vidrio, Plástico\nUso	Multifuncional martillo', 27, 'Herramientas Manuales', 'Martillos (de carpintero, de bola, de goma)', 'https://s.alicdn.com/@sc04/kf/H4dab9f9ac4b54474baa045b4253650a4P.jpg', 16000.000, 0.00),
(31, '1', 'sierra de mano para acampar en madera', 'Changxing Yuao Import And Export Co., Ltd', 'TODO tipo de herramientas de trabajo pesado, hoja Extra larga de 45cm, sierra de mano para acampar en madera', 43, 'Herramientas Manuales', 'Sierras (para madera, para metal)', 'https://s.alicdn.com/@sc04/kf/HTB1C9agaEvrK1RjSszfq6xJNVXag.jpg', 12500.000, 0.00),
(32, '1', 'Cincel plano de 6 pulgadas', 'Enping Jinkun Hardware Products Co., Ltd.', 'Cincel plano de 6 pulgadas Juego de cinceles de mampostería resistente de acero de grado industrial con protección para las manos', 86, 'Herramientas Manuales', 'Cinceles,', 'https://s.alicdn.com/@sc04/kf/H32929ad978104a02afb4a61b225737b9K.jpg', 8901.000, 0.00),
(33, '1', 'Soporte de acero ajustable para gato de coche', 'Qingdao Giantfortune Industry Co., Ltd.', 'Soporte de acero ajustable para gato de coche, herramientas para vehículo, 3 toneladas, precio barato', 543, 'Herramientas Manuales', 'Gatos y prensas', 'https://s.alicdn.com/@sc04/kf/H495938e7680f4432afc8c9d87a1b271bP.jpg', 36200.000, 0.00),
(34, '2', 'Taladro eléctrico sin escobillas', 'Ningbo Liangye Electric Appliances Co., Ltd', 'Taladro eléctrico sin escobillas, Herramientas, 20v', 43, 'Herramientas eléctricas', 'Taladros', 'https://s.alicdn.com/@sc04/kf/Hb8e3f84f9dec4f59ab7ac4428170aca9V.jpg', 120001.000, 11.00),
(35, '2', 'Minisierra Circular inalámbrica', 'Wuxi Saab Machinery Co., Ltd', 'Minisierra Circular inalámbrica, 20v, velocidad Variable, batería de litio', 654, 'Herramientas eléctricas', 'Sierra circular', 'https://s.alicdn.com/@sc04/kf/H262bb274da984ea3b06f5f2c99b4be62S.jpg', 250000.000, 13.00),
(36, '2', 'Amoladora angular de batería de litio', 'Zhejiang Topwire Trading Co., Ltd.', 'Amoladora angular de batería de litio, herramienta eléctrica inalámbrica de 21V con interruptor deslizante para corte y acondicionamiento de superficies', 23, 'Herramientas eléctricas', 'Amoladoras', 'https://s.alicdn.com/@sc04/kf/H7e5b52bb469d43c0b7bb09151936b8e4a.png', 300.000, 15.00),
(37, '2', 'Lijadora de coche de aire profesional RP7336S 6', 'Zhejiang Rongpeng Air Tools Co., Ltd', 'RONGPENG-Lijadora de coche de aire profesional RP7336S 6 \'\'para lijadoras neumáticas de superficies curvas', 43, 'Herramientas eléctricas', 'Lijadoras', 'https://s.alicdn.com/@sc04/kf/Hb88d956d47254223aea6a3fdf0684cc5b.png', 370000.000, 0.00),
(38, '2', 'Máquina de sierra caladora', 'Yuyao Goldsen International Trade Co., L', 'Herramienta profesional de trabajo de madera TOLHIT, máquina de sierra caladora de mandril de liberación rápida, sierra caladora eléctrica manual portátil Industrial 65mm 710W', 43, 'Herramientas eléctricas', 'Sierras caladoras', 'https://s.alicdn.com/@sc04/kf/H1071c6a431ec4d6ea6bfca4b6eb00873u.jpg', 54300.000, 12.00),
(39, '2', 'Pistola de calor ', 'Hefei Chegongshe Hardware Technology', 'Pistola de calor de velocidad ajustable para soldar molde de plástico, grado ndustrial 2000W', 90, 'Herramientas eléctricas', 'Pistolas de calor', 'https://s.alicdn.com/@sc04/kf/H924fd55233ce47f7a517e59750add597R.jpg', 68000.000, 0.00),
(40, '2', 'Máquina de soldar portátil 3 en 1', 'Yongkang Songshi Technology Co., Ltd.', 'Máquina de soldar portátil 3 en 1 MIG/MAG/MMA IGBT, inversor, máquina de soldadura sin gas', 31, 'Herramientas eléctricas', 'Soldadoras', 'https://s.alicdn.com/@sc04/kf/He65006b046db472ebf3917bacd82381eD.jpg', 700000.000, 15.00),
(41, '3', 'Tornillo combinado de cabeza plana', 'Shenzhen Senyi Precision Hardware Co., Ltd.', 'Tornillo combinado de cabeza plana empotrada en cruz personalizado de fábrica al por mayor M2 M3 M4 M5 Tornillo de arandela doble de resorte plano de acero inoxidable', 468, 'Ferretería general', 'Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)', 'https://s.alicdn.com/@sc04/kf/Hb6f9c9fa78694d60848adceb4a969501q.jpg', 100.000, 0.00),
(42, '3', 'Bisagras de puerta', 'Foshan Chengyi Hardware Factory', 'Bisagras de puerta al por mayor de China para puertas compuestas comprar Bisagras de metal horno de acero inoxidable 316 bisagra para madera', 21, 'Ferretería general', 'Bisagras y cerraduras', 'https://s.alicdn.com/@sc04/kf/H910be6907b7b42b981a00b47def08df7h.png', 6000.000, 0.00),
(43, '3', 'Tirador de puerta de armario', 'Guangdong Topcent Development Co., ', 'Topcent-tirador de puerta de armario, perillas de acero inoxidable para muebles, manijas de cajón de cocina', 76, 'Ferretería general', 'Pomos y manijas', 'https://s.alicdn.com/@sc04/kf/Hab0a4050f627448e81503cefcd0fb403Y.jpg', 7001.000, 0.00),
(44, '3', 'Candado de aluminio', 'Wenzhou Boshi Safety Products Co., Ltd', 'Candado de aluminio ligero anodizado impermeable personalizado de fabricante OEM de alta calidad para bloqueo industrial-Equipo de etiquetado', 8, 'Ferretería general', 'Cadenas y candados', 'https://s.alicdn.com/@sc04/kf/H14a1865a9eae4a4b97fcf5892f70d617u.jpg', 15000.000, 0.00),
(45, '3', 'Andamio de aluminio', 'Zhejiang Leader Industry&Trade Co., Ltd.', 'Andamio de aluminio de fábrica Andamio de escalera multiusos con escaleras de plataforma y escalera de andamios', 6, 'Ferretería general', 'Escaleras y andamios', 'https://s.alicdn.com/@sc04/kf/Hb273a95a643d4985b11e66bac510f2c4I.jpg', 250000.000, 20.00),
(46, '3', 'Abor-carrete de rueda rolley, 6400 Newest, práctico', 'Qingdao Yuantai Metal Products Co., Ltd.', 'Abor-carrete de rueda rolley, 6400 Newest, práctico', 5, 'Ferretería general', 'Carretillas y carros de mano', 'https://s.alicdn.com/@sc04/kf/H21dba7d7809848a89c52fd61af6f3eab2.png', 70.000, 1.00),
(47, '3', 'Chapa metálica', 'Foshan Canen Metal Products Co., Ltd.', 'Hardware, piezas de estampado, proveedores de piezas de fabricación de chapa metálica, soportes de estante de metal, soportes angulares de soporte en L para conector de madera', 318, 'Ferretería general', 'Soportes y colgadores', 'https://s.alicdn.com/@sc04/kf/Hcf25aafed0b84e71ace5f60a22dc1ac9m.jpg', 3000.000, 0.00),
(48, '4', 'Pintura de revestimiento impermeable', 'Hebei Naisi International Trading Ltd.', 'Pintura de revestimiento impermeable de baja temperatura para la construcción y el ahorro de energía de la casa', 54, 'Pintura y acabados', 'Pinturas (interior, exterior, esmaltes, aerosoles)', 'https://s.alicdn.com/@sc04/kf/H35f33c1f732e4de98601f61e8d92af39s.jpg', 70000.000, 0.00),
(49, '4', 'Cepillo de madera con cerdas, pincel de pintura barato', 'Danyang Rixing Tool Co., Ltd.', 'Cepillo de madera con cerdas, pincel de pintura barato', 65, 'Pintura y acabados', 'Rodillos y brochas', 'https://s.alicdn.com/@sc04/kf/H7f13d7ae4e744ec490383a4b85141addf.jpg', 5000.000, 0.00),
(50, '4', 'Cinta adhesiva resistente a altas temperaturas', 'Dongguan Yihong New Material Co., Ltd.', 'Cinta adhesiva resistente a altas temperaturas 3mm proveedor Jumbo Precio Autobody Cinta automotriz', 25, 'Pintura y acabados', 'Cintas de enmascarar', 'https://s.alicdn.com/@sc04/kf/H026a2321a9ac4be493e155696f8b9aa4l.jpg', 7000.000, 0.00),
(51, '3', 'CLAVOS HELICOIDALES', 'Anhui Amigo Imp. & Exp. Co., Ltd.', 'CLAVOS HELICOIDALES para palés, fabricante 2, 1/4 \'\'x.099\'\'', 960, 'Ferretería general', 'Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)', 'https://s.alicdn.com/@sc04/kf/HTB1pOXJcER1BeNjy0Fmq6z0wVXaL.jpg', 3000.000, 0.00),
(53, '65432', 'Cemento ', 'Argos', 'cemento pa cementar', 876533, 'Materiales de Construcción', 'Materiales de Albañilería', 'https://www.argos.com.pa/wp-content/uploads/2020/12/PRODUCTOS_CEMENTO-GRIS-USO-GENERAL_1.jpg', 30000.000, 0.00),
(54, '3233r', 'Destornilladores multiusos con mango de PP aislado', ' Straight Head', 'Destornilladores multiusos con mango de PP aislado, destornillador de mano, accesorios resistentes al desgaste, herramientas de mantenimiento del hogar', 873, 'Herramientas Manuales', 'Destornilladores', 'https://s.alicdn.com/@sc04/kf/H0ea649199fe44b4c821cdf4d2a32734ei.jpg', 10.000, 5.00),
(55, '45567', 'Luminum', 'Luminum', 'Luminum-luminaria flexible, accesorio de iluminación ajustable', 0, 'Herramientas Manuales', 'Llaves (fijas, ajustables, de tubo)', 'https://s.alicdn.com/@sc04/kf/H30b34ba0d74044278626ff6d1b24ae88A.jpg', 16600.000, 2.00),
(56, '2323f4', 'Tornillo de compresión sin cabeza', 'Shuangyang', 'Tornillo de compresión sin cabeza, herramienta de fijación quirúrgica, caja de instrumentos, 2,4, 2,7', 478, 'Ferretería general', 'Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)', 'https://s.alicdn.com/@sc04/kf/HTB1foc1X6DuK1RjSszdq6xGLpXaP.jpg', 300.000, 0.00),
(57, '2rree4', 'Tornillos hexagonales de acero inoxidable', 'WANLUO', 'Tornillos hexagonales de acero inoxidable, estándar personalizado, para muebles, autoperforación', 340, 'Ferretería general', 'Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)', 'https://s.alicdn.com/@sc04/kf/Hd8b2c62782164493bef75a1f78434e63E.jpg', 300.000, 0.00),
(58, '232323c', 'Xternal exagon Elf-tapping', 'WANLUO', 'Xternal exagon Elf-tapping, equipos de oarse, xtension Elf-Drilling, 6M8M10M12\n', 666, 'Ferretería general', 'Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)', 'https://s.alicdn.com/@sc04/kf/H5767546ac9f9467e88dc7d1575c2bfefM.jpg', 300.000, 0.00),
(59, '222ee2', 'Tornillo de madera avellanado de acero inoxidable', 'WANLUO', 'Phillips-tornillo de madera avellanado de acero inoxidable, rosca autorroscante A2,', 654, 'Ferretería general', 'Tornillería y fijaciones (tornillos, tuercas, arandelas, clavos)', 'https://s.alicdn.com/@sc04/kf/Hc212fc5bd5b544ac88eb67aa31e44cfff.jpg', 350.000, 0.00),
(60, '323345f', 'Alicates', 'Mogen', 'Aislado Terminal Manual de herramientas de crimpado de alambre eléctrico alicates', 29, 'Herramientas Manuales', 'Alicates (de corte, de punta, de presión)', 'https://s.alicdn.com/@sc04/kf/Hb1153f4206f14d0884b44c2dd34da6539.jpg', 20001.000, 4.00),
(61, '3ee33', 'Minialicates de Corte Lateral', 'OEM', 'Minialicates de Corte Lateral, cortador Diagonal PT936', 23, 'Herramientas Manuales', 'Alicates (de corte, de punta, de presión)', 'https://s.alicdn.com/@sc04/kf/H6d79783b86a64a8f96fc181b175a2c61P.jpg', 5000.000, 0.00),
(62, '233', 'Alicates de combinación de corte multifuncional', 'TOLSEN', 'TOLSEN 10000 Herramientas de mano Alicates de combinación de corte multifuncional', 47, 'Herramientas Manuales', 'Alicates (de corte, de punta, de presión)', 'https://s.alicdn.com/@sc04/kf/HTB1fLvJKQvoK1RjSZFDq6xY3pXae.jpg', 60.000, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `tipo_documento` varchar(20) NOT NULL,
  `numero_documento` varchar(20) NOT NULL,
  `sexo` varchar(20) DEFAULT NULL,
  `departamento` text CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `municipio` text CHARACTER SET utf8 COLLATE utf8_spanish_ci NOT NULL,
  `direccion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `contraseña`, `fecha_nacimiento`, `tipo_documento`, `numero_documento`, `sexo`, `departamento`, `municipio`, `direccion`) VALUES
(13, 'LuiCabrera Sarria ', 'Administrador@gmail.com', '$2b$12$/H8jwUrx./l.j8Kc96qoYOe6Opi8aBc4oFMhdupTXAKixM/zYLEfS', '2003-07-03', 'ti', '1004250794', 'Masculino', 'Amazonas', 'Tarapacá', 'calle 4b Sur #5-11'),
(54, 'Luis Alfredo', 'administddrador@gmail.com', '$2b$12$.mW677cecyaISFa/wTFZm.o4S3OrdhN1drczB7RoxoUrQSy/zu52a', '2024-03-31', 'pasaporte', '1004250794', 'Femenino', 'Amazonas', 'Puerto Nariño', 'calle 2'),
(56, 'Luis Alfredo', 'administador@gmail.com', '$2b$12$iRRLprPsJMMFTvs55fl7MusZpNBkRKTytIj32ZcsZADWDMlTMiQb6', '2024-04-28', 'ti', '1004250794', 'Femenino', 'Amazonas', 'Puerto Nariño', 'calle 2'),
(57, 'Luis Alfredo', 'cabrerasarrialuis@gmail.com', '$2b$12$ES6u9Ao0R43hD.u8JYJhLex8fkEBHZXRLGyEkELqCojLJaU4VmWXa', '2024-04-28', 'ti', '1004250794', 'Femenino', 'Amazonas', 'Puerto Nariño', 'calle 2'),
(58, 'Luis Alfredo', 'a22dministrador@gmail.com', '$2b$12$k/HNGtahiSHksjzfSfCOZ.Ond5djH3P7aimbw6DPZ2rI/whYXgjme', '2024-04-29', 'carnet', '1004250794', 'Otro', 'Amazonas', 'Leticia', 'calle 2'),
(59, 'Luis Alfredo', 'a22d22ministrador@gmail.com', '$2b$12$.s7JcSLmYD3.sR2QWb2yhusxtEhoKNv5SCbyZgtbyTgvHV4QQEtXG', '2024-04-29', 'carnet', '1004250794', 'Otro', 'Amazonas', 'Leticia', 'calle 2'),
(60, 'Luis Alfredo', 'a22d22ministrador@gmail.com', '$2b$12$djNyc00.u5bHfqBcJMZmn.TGZGgZdQ61qmy6y9nbGfro9Maz9pzo.', '2024-04-29', 'carnet', '1004250794', 'Otro', 'Amazonas', 'Leticia', 'calle 2'),
(61, 'Luis Alfredo', 'a22d22ministrador@gmail.com', '$2b$12$r.1uV9qBwE7.xaKjMarl6.6gZC2tT3F.WgwOPPz9723JGnQ295hJa', '2024-04-29', 'carnet', '1004250794', 'Otro', 'Amazonas', 'Leticia', 'calle 2'),
(63, 'Luis Alfredo', 'adm444inistrador@gmail.com', '$2b$12$9afDjE9hccxz22MmRVYXN.EbfCSViWZJI.w6tpJpFxNobeTuTFi/q', '2024-04-29', 'ti', '1004250794', 'Femenino', 'Amazonas', 'Puerto Nariño', 'calle 2'),
(64, 'Luis Alfredo', 'administra1dor@gmail.com', '$2b$12$Y622Sq06yvh1sKZZDO8xQOoSlRGq2zChaC9HNIlLuiKg1Wtnpt/8K', '2024-04-30', 'cedula', '1004250794', 'Masculino', 'Amazonas', 'Leticia', 'calle 2'),
(65, 'Luis Alfredo', 'adminwwistrador@gmail.com', '$2b$12$OgCj9asFodklOoXyXiX1R.seTcVv6CwpiTiuwZwD7sU0ce57KNM1q', '2024-04-29', 'cedula', '1004250794', 'Masculino', 'Antioquia', 'Medellín', 'calle 2');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `carritocompras`
--
ALTER TABLE `carritocompras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `carritocompras`
--
ALTER TABLE `carritocompras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carritocompras`
--
ALTER TABLE `carritocompras`
  ADD CONSTRAINT `carritocompras_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `carritocompras_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `fk_factura_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_factura_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
