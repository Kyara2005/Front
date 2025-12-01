import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MUsuario.css';

const MUsuario = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuario");
  const [userStatus, setUserStatus] = useState("Disponible");
  const [avatar, setAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState("cuenta");
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const avatarOptions = [
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar1",
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar2",
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar3",
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar4",
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar5"
  ];
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userCedula, setUserCedula] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [userUniversity, setUserUniversity] = useState("");
  const [userCareer, setUserCareer] = useState("");

  const getAvatarUrl = (url) => {
    if (!url) return null;
    return `${url}?t=${new Date().getTime()}`;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/perfil`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.nombre) setUserName(response.data.nombre);
        if (response.data?.estado) setUserStatus(response.data.estado);
        if (response.data?.avatar) setAvatar(response.data.avatar);
        if (response.data?.telefono) setUserPhone(response.data.telefono);
        if (response.data?.direccion) setUserAddress(response.data.direccion);
        if (response.data?.cedula) setUserCedula(response.data.cedula);
        if (response.data?.descripcion) setUserDescription(response.data.descripcion);
        if (response.data?.universidad) setUserUniversity(response.data.universidad);
        if (response.data?.carrera) setUserCareer(response.data.carrera);

      } catch (error) {
        console.error("Error al obtener el usuario:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "VIBE-U");
    formData.append("folder", "avatars");

    let newAvatarUrl = null;
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Sesión expirada. Por favor, inicia sesión.");
        return;
    }

    try {
      const resCloudinary = await axios.post(
        "https://api.cloudinary.com/v1_1/dm5yhmz9a/image/upload",
        formData
      );
      newAvatarUrl = resCloudinary.data.secure_url;
      
      setAvatar(newAvatarUrl);
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/actualizar`, 
        { avatar: newAvatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Avatar actualizado y guardado correctamente.");
      
    } catch (err) {
      console.error("Error al subir o guardar el avatar:", err.response?.data || err);
      toast.error("Error al actualizar el avatar.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.querySelector(".side-menu");
      const hamburger = document.querySelector(".hamburger-btn");

      if (menuOpen && menu && !menu.contains(event.target) && hamburger && !hamburger.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const renderRightContent = () => {
    switch (activeTab) {
      case "cuenta":
        return (
          <div className="user-profile-section">
            <h3 style={{ textAlign: "center", marginBottom: "15px", color: "#000" }}>
              {userName || "Usuario"}
            </h3>

            <div className="profile-header" style={{ justifyContent: "center" }}>
              <div className="avatar-circle-large">
                {avatar ? (
                  <img src={getAvatarUrl(avatar)} alt="Avatar" className="avatar-img-large" />
                ) : (
                  <span className="default-avatar-large">👤</span>
                )}
              </div>
            </div>

            <div className="profile-info">
              <div className="info-row">
                <strong>Descripción:</strong>
                <span style={{ color: userDescription ? "#333" : "#000" }}>{userDescription || "No disponible"}</span>
              </div>
              <div className="info-row">
                <strong>Teléfono:</strong>
                <span style={{ color: userPhone ? "#333" : "#000" }}>{userPhone || "No disponible"}</span>
              </div>
              <div className="info-row">
                <strong>Dirección:</strong>
                <span style={{ color: userAddress ? "#333" : "#000" }}>{userAddress || "No disponible"}</span>
              </div>
              <div className="info-row">
                <strong>Cédula:</strong>
                <span style={{ color: userCedula ? "#333" : "#000" }}>{userCedula || "No disponible"}</span>
              </div>

              <div className="info-row">
                <strong>Universidad:</strong>
                <span style={{ color: userUniversity ? "#333" : "#000" }}>{userUniversity || "No disponible"}</span>
              </div>
              <div className="info-row">
                <strong>Carrera:</strong>
                <span style={{ color: userCareer ? "#333" : "#000" }}>{userCareer || "No disponible"}</span>
              </div>
            </div>
          </div>
        );

      case "favoritos":
        return <div><h3>Favoritos</h3><p>Información de tu cuenta...</p></div>;
      case "chats":
        return <div><h3>Chats</h3><p>Tus conversaciones...</p></div>;
      case "notificaciones":
        return <div><h3>Notificaciones</h3><p>Tus notificaciones...</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className="musuario-container">
      <ToastContainer />

      {/* BOTÓN DE HAMBURGUESA */}
      <button className={`hamburger-btn ${menuOpen ? "open" : ""}`} onClick={handleMenuToggle}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* MENÚ DESLIZABLE */}
      <nav className={`side-menu ${menuOpen ? "show" : ""}`}>

        {/* SECCIÓN SUPERIOR */}
        <div className="menu-header">

          {/* 🔵 CAMBIO AÑADIDO AQUÍ */}
          <h3 className="menu-title">Menú</h3>

          <div className="avatar-section">
            <div className="avatar-container" onClick={handleFileClick}>
              {avatar ? (
                <img src={getAvatarUrl(avatar)} alt="Avatar" className="avatar-img" />
              ) : (
                <span className="default-avatar">👤</span>
              )}
              <div className="avatar-overlay">
                <i className="fa fa-camera"></i>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="input-file-hidden"
              accept="image/*"
            />
          </div>
        </div>

        <div className="menu-buttons">
          <button onClick={() => navigate("/Dashboard")}>Inicio</button>
          <button onClick={() => navigate("/MUsuario")}>Mi cuenta</button>
          <button onClick={() => {}}>Favoritos</button>
          <button onClick={() => navigate("/Ajustes")}>Ajustes</button>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="main-nav-panel"> 
        <div className="left-panel-content">

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                overflow: "hidden",
                margin: "0 auto",
                backgroundColor: "#ddd",
              }}
            >
              {avatar ? (
                <img src={getAvatarUrl(avatar)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Avatar" />
              ) : (
                <span style={{ fontSize: "50px", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>👤</span>
              )}
            </div>

            <h3 style={{ color: "white", marginTop: "10px"}}>{userName}</h3>
            <p style={{ color: "#8bc34a", marginTop: "-5px" }}>{userStatus}</p>

            <hr style={{ marginTop: "10px", marginBottom: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.2)" }} />
          </div>

          <div className="menu-buttons">
            <button className={activeTab === "cuenta" ? "active" : ""} onClick={() => setActiveTab("cuenta")}>Cuenta</button>
            <button className={activeTab === "favoritos" ? "active" : ""} onClick={() => setActiveTab("favoritos")}>Favoritos</button>
            <button className={activeTab === "chats" ? "active" : ""} onClick={() => setActiveTab("chats")}>Chats</button>
            <button className={activeTab === "notificaciones" ? "active" : ""} onClick={() => setActiveTab("notificaciones")}>Notificaciones</button>
          </div>
        </div>
      </div>

      <div className="right-panel">
        {renderRightContent()}
      </div>
    </div>
  );
};

export default MUsuario;
