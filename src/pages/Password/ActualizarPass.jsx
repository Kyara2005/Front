import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import storeAuth from "../../context/storeAuth";
import './ActualizarPass.css';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// --- OJITOS KAWAII ADAPTADOS ---
const KawaiiEyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="7" ry="4" fill="white" />
        <circle cx="12" cy="12" r="3.5" fill="black" />
        <circle cx="13.5" cy="10.5" r="0.5" fill="white" />
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="#000" strokeWidth="2" fill="none"/>
    </svg>
);

const KawaiiEyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="7" ry="4" fill="white" />
        <circle cx="12" cy="12" r="2" fill="black" />
        <circle cx="13.5" cy="10.5" r="0.5" fill="white" />
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.49M2 2l20 20" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M21.94 12c-3.1-4.81-6.57-7.25-9.44-8a18.45 18.45 0 0 0-3.04.57" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
);

const ChangePasswordForm = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [username, setUsername] = useState('Usuario');
  const [avatarUrl, setAvatarUrl] = useState('https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = storeAuth.getState().token;
        if (!token) return;

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/usuarios/perfil`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUsername(res.data?.nombre || "Usuario");
        setAvatarUrl(res.data?.avatar || "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg");

      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Usuario no autorizado");
        return;
      }


      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/actualizar-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.msg || "Contraseña actualizada correctamente");

      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setTimeout(() => {
        navigate("/ajustes");
      }, 1500);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Error al actualizar la contraseña");
    }
  };

  const handleCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    navigate("/ajustes");
  };

  return (
    <div className="password-change-container">
      <ToastContainer />
      <div className="password-change-card">

        <div style={{ cursor: 'pointer', textAlign: 'left', marginBottom: '15px' }} onClick={() => navigate("/ajustes")}>
          ← Volver a Ajustes
        </div>

        <h2 className="main-username-title">{username}</h2>
        <div className="icon-circle">
          <img src={avatarUrl} alt="Avatar de usuario" className="user-avatar-image" />
        </div>
        <h2 className="title">Cambiar contraseña</h2>

        <form onSubmit={handleSubmit} className="form-content">
          
          <div className="input-with-eye">
            <input
              type={showOldPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Contraseña anterior"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowOldPassword(!showOldPassword)}>
              {showOldPassword ? <KawaiiEyeIcon /> : <KawaiiEyeOffIcon />}
            </span>
          </div>

          <div className="input-with-eye">
            <input
              type={showNewPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Contraseña nueva"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <KawaiiEyeIcon /> : <KawaiiEyeOffIcon />}
            </span>
          </div>

          <div className="input-with-eye">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Confirmar contraseña nueva"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <KawaiiEyeIcon /> : <KawaiiEyeOffIcon />}
            </span>
          </div>

          <div className="btn-row">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancelar
            </button>

            <button type="submit" className="save-btn">
              Cambiar Contraseña
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
