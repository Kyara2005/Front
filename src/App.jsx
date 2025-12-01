import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import Gracias from "./pages/gracias/Gracias";
import Perfil from "./pages/perfil/Perfil";
import Contacto from "./pages/contacto/Contacto";
import { useEffect } from "react";
import Eventos from "./pages/eventos/Eventos";
import Beneficios from "./pages/beneficios/Beneficios";
import Dashboard from "./pages/dashboard/Dashboard";
import Matches from "./pages/Matches/Matches";
import { Confirm } from "./pages/confirm";
import AOS from "aos";
import "aos/dist/aos.css";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MUsuario from "./pages/MUsuario/MUsuario";
import PublicRoute from "./routes/PublicRouter.jsx";
import PrivateRoute from "./routes/PrivateRouter.jsx";
import Ajustes from "./pages/Ajustes/Ajustes.jsx";
import ActualizarInfo from "./Actualizacion/ActualizarInfo.jsx";
import storeProfile from './context/storeProfile'
import storeAuth from './context/storeAuth'
import ChangePasswordForm from "./pages/Password/ActualizarPass.jsx";
function App() {
   const { profile} = storeProfile()
  const { token } = storeAuth()

  useEffect(() => {
    if(token){
      profile()
    }
  }, [token])
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* ⬇️ RUTAS VISIBLES SOLO SIN TOKEN */}
        <Route element={<PublicRoute />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="gracias" element={<Gracias />} />
        </Route>

        {/* ⬇️ RUTAS QUE REQUIEREN TOKEN */}
        <Route element={<PrivateRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="matches" element={<Matches />} />
          <Route path="MUsuario" element={<MUsuario />} />
          <Route path="UserProfile" element={<MUsuario />} />
          <Route path="Ajustes" element={<Ajustes />} />
          <Route path="ActualizarInfo" element={<ActualizarInfo />} />
          <Route path="ActualizarPass" element={<ChangePasswordForm />} />
        </Route>

        {/* ⬇️ ESTAS SIGUEN SIENDO PÚBLICAS NORMALMENTE */}
        <Route path="contacto" element={<Contacto />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="beneficios" element={<Beneficios />} />
        <Route path="confirmar/:token" element={<Confirm />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="recuperarpassword/:token" element={<ResetPassword />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
