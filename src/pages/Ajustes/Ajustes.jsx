import { useEffect } from "react";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Necesitas axios
import storeAuth from "../../context/storeAuth"; // Necesitas storeAuth
import "./Ajustes.css";

const Ajustes = () => {
  const [notificaciones, setNotificaciones] = useState(true);
  const [tema, setTema] = useState("light");
  const [idioma, setIdioma] = useState("es");

  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null); // Importante: Estado para guardar la URL del avatar

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 📌 Cargar Avatar al iniciar el componente
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const token = storeAuth.getState().token;
        
        // Verifica que la variable de entorno y el token existan
        if (!token || !import.meta.env.VITE_BACKEND_URL) return;

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/perfil`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // ✔ Cargar avatar desde backend
        if (res.data?.avatar) {
          setAvatar(res.data.avatar);
        }
      } catch (error) {
        console.error("Error al obtener el avatar en Ajustes:", error);
      }
    };

    fetchAvatar();
  }, []); // El array vacío asegura que se ejecute solo una vez al inicio

  const handleFileClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      // NOTA: Aquí solo se establece la vista previa. Para guardar
      // permanentemente, necesitarías una llamada a la API de subida.
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Opcional: storeAuth.getState().clearToken();
    navigate("/login");
  };

  return (
    <section className="ajustes-section">

      {/* ---------------- BOTÓN HAMBURGUESA ---------------- */}
      <button
        className={`hamburger-btn ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* ---------------- MENÚ LATERAL ---------------- */}
      <nav className={`side-menu ${menuOpen ? "show" : ""}`}>

        {/* Encabezado */}
        <div className="menu-header">
          <h3 className="menu-title">Menú</h3>

          {/* AVATAR — YA NO ES CLICKEABLE */}
          <div className="avatar-section">
            <div className="avatar-container" style={{ cursor: "default" }}>
              {avatar ? (
                // Aquí se muestra el avatar cargado por el useEffect o el nuevo archivo
                <img src={avatar} alt="Avatar" className="avatar-img" />
              ) : (
                <span className="default-avatar">👤</span>
              )}
            </div>
          </div>

        </div>

        {/* Botones del menú */}
        <div className="menu-buttons">
          <button onClick={() => navigate("/dashboard")}>Inicio</button>
          <button onClick={() => navigate("/MUsuario")}>Mi cuenta</button>
          <button onClick={() => navigate("/matches")}>Favoritos</button>
          <button onClick={() => navigate("/ajustes")}>Ajustes</button>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      {/* ---------------- TÍTULO ---------------- */}
      <h2 className="ajustes-title">Ajustes</h2>

      {/* ---------------- CUENTA ---------------- */}
      <div className="ajustes-card">
        <h3>Cuenta</h3>

        {/* --- ACTUALIZAR INFO DE CUENTA --- */}
        <div
          className="ajustes-row hover-card"
          onClick={() => navigate("/ActualizarInfo")}
          style={{ cursor: "pointer" }}
        >
          <span>  Actualizar información de cuenta</span>
        </div>

        {/* --- CAMBIAR CONTRASEÑA --- */}
        <div
          className="ajustes-row hover-highlight"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/ActualizarPass")}
        >
          <span>Cambiar contraseña</span>
        </div>
      </div>

      {/* ---------------- PERSONALIZACIÓN ---------------- */}
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

      {/* ---------------- SESIÓN ---------------- */}
      <div className="ajustes-card">
        <h3>Sesión</h3>

        <div
          className="ajustes-row hover-card"
          onClick={() => navigate("/login")}
          style={{ cursor: "pointer" }}
        >
          <span>Cerrar sesión</span>
        </div>
      </div>

    </section>
  );
};

export default Ajustes;