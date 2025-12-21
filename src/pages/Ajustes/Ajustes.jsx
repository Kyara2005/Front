import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import storeAuth from "../../context/storeAuth";
import "./Ajustes.css";

const Ajustes = () => {
  const [notificaciones, setNotificaciones] = useState(true);
  const [tema, setTema] = useState("light");
  const [idioma, setIdioma] = useState("es");
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Cargar avatar
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const token = storeAuth.getState().token;
        if (!token || !import.meta.env.VITE_BACKEND_URL) return;

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/perfil`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.avatar) setAvatar(res.data.avatar);
      } catch (error) {
        console.error("Error al obtener avatar:", error);
      }
    };

    fetchAvatar();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <section className="ajustes-section">

      {/* BOTÓN HAMBURGUESA */}
      <button
        className={`hamburger-btn ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* MENÚ LATERAL */}
      <nav className={`side-menu ${menuOpen ? "show" : ""}`}>
        <div className="menu-header">
          <h3 className="menu-title">Menú</h3>

          <div className="avatar-section">
            <div className="avatar-container">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="avatar-img" />
              ) : (
                <span className="default-avatar">👤</span>
              )}
            </div>
          </div>
        </div>

        <div className="menu-buttons">
          <button onClick={() => navigate("/dashboard")}>Inicio</button>
          <button onClick={() => navigate("/MUsuario")}>Mi cuenta</button>
          <button onClick={() => navigate("/matches")}>Favoritos</button>
          <button onClick={() => navigate("/ajustes")}>Ajustes</button>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      {/* TÍTULO */}
      <h2 className="ajustes-title">Ajustes</h2>

      {/* ✅ CONTENEDOR QUE LIMITA EL ANCHO */}
      <div className="ajustes-container">

        {/* CUENTA */}
        <div className="ajustes-card">
          <h3>Cuenta</h3>

          <div
            className="ajustes-row hover-card"
            onClick={() => navigate("/ActualizarInfo")}
          >
            <span>Actualizar información de cuenta</span>
          </div>

          <div
            className="ajustes-row hover-highlight"
            onClick={() => navigate("/ActualizarPass")}
          >
            <span>Cambiar contraseña</span>
          </div>
        </div>

        {/* PERSONALIZACIÓN */}
        <div className="ajustes-card">
          <h3>Personalización</h3>

          <div className="ajustes-row">
            <span>Notificaciones</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={notificaciones}
                onChange={() => setNotificaciones(!notificaciones)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="ajustes-row">
            <span>Tema</span>
            <select
              className="ajustes-select"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>

          <div className="ajustes-row">
            <span>Idioma</span>
            <select
              className="ajustes-select"
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </div>
        </div>

        {/* SESIÓN */}
        <div className="ajustes-card">
          <h3>Sesión</h3>

          <div
            className="ajustes-row hover-card"
            onClick={handleLogout}
          >
            <span>Cerrar sesión</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Ajustes;
