import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ActualizarInfo.css";

// ➡️ Asegúrate de que esta ruta sea correcta para tu AvatarCropperModal
import AvatarCropperModal from "../components/Avatar/AvatarCropperModal.jsx";

const ActualizarInfo = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [avatar, setAvatar] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // ➡️ NUEVOS ESTADOS para el recorte
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropperModalOpen, setCropperModalOpen] = useState(false);

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userCedula, setUserCedula] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [userUniversity, setUserUniversity] = useState("");
  const [userCareer, setUserCareer] = useState("");

  const avatarOptions = [
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar1",
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar2",
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar3",
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar4",
    "https://api.dicebear.com/6.x/bottts/svg?seed=Avatar5",
  ];

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // ✅ RUTA GET: /usuarios/perfil
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/perfil`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserName(res.data.nombre || "");
        setAvatar(res.data.avatar || null);
        setUserPhone(res.data.telefono || "");
        setUserAddress(res.data.direccion || "");
        setUserCedula(res.data.cedula || "");
        setUserDescription(res.data.descripcion || "");
        setUserUniversity(res.data.universidad || "");
        setUserCareer(res.data.carrera || "");
      } catch (err) {
        // 🛑 CAMBIO CLAVE: Elimina el toast.error para evitar el mensaje
        // y el return previene que se sobrescriban los estados
        console.error(
          "Error al cargar datos del usuario, manteniendo la información actual:",
          err.response?.data || err
        );
        return;
      }
    };

    fetchUserInfo();
  }, [navigate]); // Añadir navigate a dependencias

  const handleFileClick = () => fileInputRef.current.click();

  // 🔄 handleFileChange MODIFICADO: Ahora carga la imagen en el cropper, NO la sube
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convertir el archivo a Data URL para el cropper
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result); // Guarda la URL para el cropper
      setCropperModalOpen(true); // Abre el modal de recorte
    });
    reader.readAsDataURL(file);
  };

  // 🆕 NUEVA FUNCIÓN: Sube la imagen ya recortada (Blob) a Cloudinary
  const handleCroppedAvatar = async (croppedImageBlob) => {
    setCropperModalOpen(false); // Cierra el modal de recorte
    setImageToCrop(null); // Limpia la imagen temporal

    if (!croppedImageBlob) {
      toast.error("No se pudo obtener la imagen recortada.");
      return;
    }

    // ➡️ Lógica de Cloudinary usando el Blob recortado
    const formData = new FormData();
    formData.append("file", croppedImageBlob);
    formData.append("upload_preset", "VIBE-U");
    formData.append("folder", "avatars");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dm5yhmz9a/image/upload",
        formData
      );
      setAvatar(res.data.secure_url);
      toast.success("Avatar subido y ajustado correctamente");
    } catch (err) {
      console.error(
        "Error al subir la imagen recortada:",
        err.response?.data || err
      );
      toast.error("Error al subir avatar");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      // 🛑 RUTA PUT: Se mantiene "/actualizar"
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/actualizar`,
        {
          nombre: userName,
          telefono: userPhone,
          direccion: userAddress,
          cedula: userCedula,
          descripcion: userDescription,
          universidad: userUniversity,
          carrera: userCareer,
          avatar: avatar,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Información actualizada");
      setTimeout(() => navigate("/ajustes"), 1200);
    } catch (err) {
      // Manejo de error más detallado
      console.error("Error al actualizar la información:", err.response?.data || err);
      if (err.response && err.response.status === 404) {
        toast.error("Error 404: La ruta de actualización no fue encontrada.");
      } else {
        toast.error("Error al guardar la información.");
      }
    }
  };

  return (
    <div className="actualizar-container">
      <ToastContainer />

      <h2 className="titulo">Actualizar información de cuenta</h2>

      <div className="avatar-wrapper">
        {/* Usamos las clases de tu CSS original */}
        <div className="avatar-circle" onClick={handleFileClick}>
          {avatar ? (
            <img src={avatar} alt="Avatar" className="avatar-img-preview" />
          ) : (
            <span className="default-avatar">👤</span>
          )}
        </div>

        <div className="btns-avatar">
          {/* Usamos las clases de tu CSS original */}
          <button className="btn-upload" onClick={handleFileClick}>
            Subir foto
          </button>
          <button
            className="btn-select"
            onClick={() => setAvatarModalOpen(!avatarModalOpen)}
          >
            Elegir avatar
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="input-file-hidden"
          accept="image/*"
          onChange={handleFileChange} // Llama a la nueva lógica
        />
      </div>

      {/* Modal de Avatares Predefinidos */}
      {avatarModalOpen && (
        <div className="avatar-modal-overlay">
          <div className="avatar-modal-content">
            <h3 className="modal-title">Seleccionar Avatar Predefinido</h3>
            <div className="avatar-options-grid">
              {avatarOptions.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="avatar-option"
                  onClick={() => {
                    setAvatar(url);
                    setAvatarModalOpen(false);
                  }}
                  alt={`avatar-${i}`}
                />
              ))}
            </div>
            <button
              className="modal-close-btn"
              onClick={() => setAvatarModalOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 🆕 AÑADIMOS EL MODAL DE RECORTAR */}
      {cropperModalOpen && imageToCrop && (
        <AvatarCropperModal
          imageSrc={imageToCrop}
          open={cropperModalOpen}
          onClose={() => setCropperModalOpen(false)}
          onCropComplete={handleCroppedAvatar} // Llama a la nueva función de subida
        />
      )}
      {/* ---------------------------------- */}

      <div className="form-section">
        <div className="field-row">
          <label className="field-label">Usuario</label>
          <input
            className="field-input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nombre de usuario"
          />
        </div>

        <div className="field-row">
          <label className="field-label">Descripción</label>
          <textarea
            className="field-input textarea-input"
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
            placeholder="Breve descripción"
          />
        </div>

        <div className="field-row">
          <label className="field-label">Teléfono</label>
          <input
            className="field-input"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            placeholder="Ej: +593 9..."
          />
        </div>

        <div className="field-row">
          <label className="field-label">Dirección</label>
          <input
            className="field-input"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="Dirección"
          />
        </div>

        <div className="field-row">
          <label className="field-label">Cédula</label>
          <input
            className="field-input"
            value={userCedula}
            onChange={(e) => setUserCedula(e.target.value)}
            placeholder="No. de cédula"
          />
        </div>

        <div className="field-row">
          <label className="field-label">Universidad</label>
          <input
            className="field-input"
            value={userUniversity}
            onChange={(e) => setUserUniversity(e.target.value)}
            placeholder="Nombre de la universidad"
          />
        </div>

        <div className="field-row">
          <label className="field-label">Carrera</label>
          <input
            className="field-input"
            value={userCareer}
            onChange={(e) => setUserCareer(e.target.value)}
            placeholder="Tu carrera"
          />
        </div>

        <div className="btn-row">
          <button className="cancel-btn" onClick={() => navigate("/ajustes")}>
            Cancelar
          </button>

          <button className="save-btn" onClick={handleUpdate}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualizarInfo;
