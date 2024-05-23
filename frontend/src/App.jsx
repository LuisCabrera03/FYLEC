import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './Components/Header/Header';
import Home from './Components/Home/Home';
import Perfil from './Components/Perfil/Perfil';
import Login from './Components/Login/Login';
import CreateAccount from './Components/Crearcuenta/CreateAccount';
import Admin from './Components/Admin/Admin';
import Productos from './Components/Productos/Productos';
import CarritoCompras from './Components/CarritoCompras/CarritoCompras';
import AdminLogin from './Components/Admin-login/Admin-login';
import CartasHome from './Components/CartasHome/CartasHome';
import Detalle from './Components/Detalle/Detalle';
import Categorias from './Components/Categorias/Categorias';
import ForgotPassword from './Components/Login/ForgotPassword/ForgotPassword';
import Compra from './Components/Compra/Compra';
import Factura from './Components/Factura/Factura';
import Footer from './Components/Footer/Footer';
import Ver from './Components/Admin/Ver/Ver';
import Usuarios from './Components/Admin/Usuarios/Usuarios';
import Roles from './Components/Admin/Roles/Roles';
import Ventas from './Components/Admin/Ventas/Ventas';
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
      <Route path="/compra/:productId/:cantidad" component={Compra} />
      <Route path="/Factura" component={Factura} />

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
        <Route path="/Ver" component={Ver} />
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