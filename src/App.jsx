import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// 📄 Páginas públicas
import Landing from "./pages/Landing";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import Gracias from "./pages/gracias/Gracias";
import Contacto from "./pages/contacto/Contacto";
import Eventos from "./pages/eventos/Eventos";
import Beneficios from "./pages/beneficios/Beneficios";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Confirm } from "./pages/confirm";

// 🔐 Páginas privadas
import Dashboard from "./pages/dashboard/Dashboard";
import Perfil from "./pages/perfil/Perfil";
import Matches from "./pages/Matches/Matches";
import MUsuario from "./pages/MUsuario/MUsuario";
import Ajustes from "./pages/Ajustes/Ajustes.jsx";
import ActualizarInfo from "./Actualizacion/ActualizarInfo.jsx";
import ChangePasswordForm from "./pages/Password/ActualizarPass.jsx";

// 🧭 Rutas protegidas
import PublicRoute from "./routes/PublicRouter.jsx";
import PrivateRoute from "./routes/PrivateRouter.jsx";

// 🗃️ Stores
import storeProfile from "./context/storeProfile";
import storeAuth from "./context/storeAuth";

function App() {
  const profile = storeProfile((state) => state.profile);
  const token = storeAuth((state) => state.token);

  // 🔹 SOLO pedir perfil si hay token
  useEffect(() => {
    if (token) {
      profile();
    }
  }, [token, profile]);

  // 🔹 Animaciones
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <HashRouter>
      <Routes>

        {/* ===================== */}
        {/* 🌐 RUTAS PÚBLICAS */}
        {/* ===================== */}
        <Route element={<PublicRoute />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="gracias" element={<Gracias />} />
          <Route path="confirmar/:token" element={<Confirm />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="recuperarpassword/:token" element={<ResetPassword />} />
        </Route>

        {/* ===================== */}
        {/* 🔒 RUTAS PRIVADAS */}
        {/* ===================== */}
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

        {/* ===================== */}
        {/* 📢 PÚBLICAS LIBRES */}
        {/* ===================== */}
        <Route path="contacto" element={<Contacto />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="beneficios" element={<Beneficios />} />

      </Routes>
    </HashRouter>
  );
}

export default App;
