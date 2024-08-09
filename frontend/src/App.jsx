import  'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// Common components
import Header from './Components/Common/Header/Header';
import Footer from './Components/Common/Footer/Footer';
import Error404 from './Components/Common/Error/Error404';
import Error400 from './Components/Common/Error/Error400';
import Error401 from './Components/Common/Error/Error401';
import Error403 from './Components/Common/Error/Error403';
import Error500 from './Components/Common/Error/Error500';
import Error503 from './Components/Common/Error/Error503';

// Authentication components
import Login from './Components/auth/Login/Login';
import CreateAccount from './Components/auth/Crearcuenta/CreateAccount';
import AdminLogin from './Components/auth/Admin-login/Admin-login';
import ForgotPassword from './Components/auth/Login/ForgotPassword/ForgotPassword';

// Admin components
import Admin from './Components/Admin/Admin';
import EditProduct from './Components/Admin/EditProduct/EditProduct';
import Usuarios from './Components/Admin/Usuarios/Usuarios';
import Roles from './Components/Admin/Roles/Roles';
import Ventas from './Components/Admin/Ventas/Ventas';

// User components
import Perfil from './Components/User/Perfil/Perfil';

// Products and shopping components
import Productos from './Components/Products/Productos/Productos';
import CarritoCompras from './Components/shopping/CarritoCompras/CarritoCompras';
import Detalle from './Components/shopping/Detalle/Detalle';
import Compra from './Components/shopping/Compra/Compra';
import Factura from './Components/shopping/Factura/Factura';
import CartasHome from './Components/Products/CartasHome/CartasHome';
import Categorias from './Components/Products/Categorias/Categorias';

// Other components
import Home from './Components/Home/Home';

const HeaderWithRoutes = () => (
  <>
    <Header />
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/Productos" component={Productos} />
      <Route path="/CarritoCompras" component={CarritoCompras} />
      <Route path="/CartasHome" component={CartasHome} />
      <Route path="/detalle/:id" component={Detalle} />
      <Route path="/categorias" component={Categorias} />
      <Route path="/compra/:items" component={Compra} />      
      <Route path="/Factura" component={Factura} />
      <Route path="/error400" component={Error400} />
      <Route path="/error401" component={Error401} />
      <Route path="/error403" component={Error403} />
      <Route path="/error500" component={Error500} />
      <Route path="/error503" component={Error503} />
      <Route component={Error404} />
    </Switch>
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/perfil" component={Perfil} />
        <Route path="/login" component={Login} />
        <Route path="/crearCuenta" component={CreateAccount} />
        <Route path="/Admin-login" component={AdminLogin} />
        <Route path="/Admin" component={Admin} />
        <Route path="/EditProduct" component={EditProduct} />
        <Route path="/Usuarios" component={Usuarios} />
        <Route path="/Roles" component={Roles} />
        <Route path="/ventas" component={Ventas} />
        <Route path="/ForgotPassword" component={ForgotPassword} />
        <Route component={HeaderWithRoutes} />
      </Switch>
    </Router>
  );
}

export default App;
