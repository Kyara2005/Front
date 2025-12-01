import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import storeAuth from "../../context/storeAuth";
import './ActualizarPass.css';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/perfil`, {
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
        `${import.meta.env.VITE_BACKEND_URL}/actualizar/password`,
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

  const EyeIcon = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path fillRule="evenodd" d={isOpen
        ? "M1.323 11.447L2.49 12.385a8.25 8.25 0 0 0 14.114 0l1.166-.938A9.75 9.75 0 0 0 12 18c-3.678 0-6.891-1.86-10.677-5.447ZM22.677 11.447 21.51 12.385a8.25 8.25 0 0 1-14.114 0l-1.166-.938A9.75 9.75 0 0 1 12 6c3.678 0 6.891 1.86 10.677 5.447Z"
        : "M1.323 11.447L2.49 12.385a8.25 8.25 0 0 0 14.114 0l-1.166-.938M1.323 11.447 12 22.5c3.678 0 6.891-1.86 10.677-5.447M12 6C8.322 6 5.109 7.86 1.323 11.447M22.677 11.447L12 22.5c-3.678 0-6.891-1.86-10.677-5.447"}
        clipRule="evenodd"
      />
    </svg>
  );

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
          
          <div className="input-with-icon">
            <input type={showOldPassword ? 'text' : 'password'} className="input-field"
              placeholder="Contraseña anterior" value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)} required />
            <div className="eye-icon" onClick={() => setShowOldPassword(!showOldPassword)}>
              <EyeIcon isOpen={showOldPassword} />
            </div>
          </div>

          <div className="input-with-icon">
            <input type={showNewPassword ? 'text' : 'password'} className="input-field"
              placeholder="Contraseña nueva" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} required />
            <div className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
              <EyeIcon isOpen={showNewPassword} />
            </div>
          </div>

          <div className="input-with-icon">
            <input type={showConfirmPassword ? 'text' : 'password'} className="input-field"
              placeholder="Confirmar contraseña nueva" value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)} required />
            <div className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              <EyeIcon isOpen={showConfirmPassword} />
            </div>
          </div>

          {/* FILA DE BOTONES */}
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
