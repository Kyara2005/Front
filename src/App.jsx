import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// =====================
// 📄 PÁGINAS PÚBLICAS
// =====================
import Landing from "./pages/Landing";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import Gracias from "./pages/gracias/Gracias";
import Contacto from "./pages/contacto/Contacto";
import Beneficios from "./pages/beneficios/Beneficios";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Confirm } from "./pages/confirm";

// =====================
// 🔐 PÁGINAS PRIVADAS
// =====================
import Dashboard from "./pages/dashboard/Dashboard";
import Perfil from "./pages/perfil/Perfil";
import Matches from "./pages/Matches/Matches";
import MUsuario from "./pages/MUsuario/MUsuario";
import Ajustes from "./pages/Ajustes/Ajustes.jsx";
import ActualizarInfo from "./Actualizacion/ActualizarInfo.jsx";
import ChangePasswordForm from "./pages/Password/ActualizarPass.jsx";
import Grupos from "./pages/Grupos/Grupos.jsx";
import Eventos from "./pages/eventos/Eventos";
import Gusuario from "./pages/Gusuario.jsx";

// =====================
// 🧭 RUTAS PROTEGIDAS
// =====================
import PublicRoute from "./routes/PublicRouter.jsx";
import PrivateRoute from "./routes/PrivateRouter.jsx";

// =====================
// 🗃️ STORES
// =====================
import storeProfile from "./context/storeProfile";
import storeAuth from "./context/storeAuth";

function App() {
  const profile = storeProfile((state) => state.profile);
  const token = storeAuth((state) => state.token);

  // 🔹 Cargar perfil SOLO si hay token
  useEffect(() => {
    if (token) {
      profile();
    }
  }, [token, profile]);

  // 🔹 Inicializar animaciones
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <BrowserRouter>
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
          <Route path="musuario" element={<MUsuario />} />
          <Route path="userprofile" element={<MUsuario />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="actualizar-info" element={<ActualizarInfo />} />
          <Route path="actualizar-pass" element={<ChangePasswordForm />} />
          <Route path="grupos" element={<Grupos />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="gusuarios" element={<Gusuario />} />
        </Route>

        {/* ===================== */}
        {/* 📢 PÚBLICAS LIBRES */}
        {/* ===================== */}
        <Route path="contacto" element={<Contacto />} />
        <Route path="beneficios" element={<Beneficios />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
