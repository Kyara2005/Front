// src/components/Avatar/AvatarCropperModal.jsx

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// ➡️ Asegúrate de que esta ruta sea correcta
import { getCroppedImg } from '../../utils/cropImage'; 

const AvatarCropperModal = ({ imageSrc, open, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // ➡️ Esta función llama a getCroppedImg y devuelve el BLOB para subir
  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      // Llama a la función del padre (ActualizarInfo) para subir la imagen
      onCropComplete(croppedImageBlob); 
    } catch (e) {
      console.error(e);
      // Puedes manejar el error aquí si es necesario
    }
  }, [imageSrc, croppedAreaPixels, rotation, onCropComplete]);

  if (!open) return null; 

  return (
    // ➡️ CONTENEDOR PRINCIPAL DEL MODAL (OVERLAY) - Estilos para flotar
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999 // Z-INDEX MUY ALTO para asegurar la visibilidad
    }}>
      {/* ➡️ CONTENIDO INTERNO DEL MODAL */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '10px',
        maxWidth: '550px',
        width: '90%',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
          Ajustar Avatar
        </h3>
        
        {/* ÁREA DEL CROPPER */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '350px',
          backgroundColor: '#f0f0f0', 
          marginBottom: '20px',
        }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
            cropShape="round" 
            objectFit="contain"
            showGrid={true}
          />
        </div>

        {/* CONTROLES DE ZOOM Y ROTACIÓN */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
              Zoom: {zoom.toFixed(1)}
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ width: '100%', height: '8px', background: '#ddd', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
              Rotación: {rotation.toFixed(0)}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              style={{ width: '100%', height: '8px', background: '#ddd', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* ➡️ BOTONES DE ACCIÓN (¡AQUÍ ESTÁ LA SOLUCIÓN!) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background-color 0.3s'
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={showCroppedImage} // ⬅️ Este es el botón "ACEPTAR" o "GUARDAR"
            style={{
              padding: '10px 20px',
              backgroundColor: '#760265', 
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background-color 0.3s'
            }}
          >
            Recortar y Guardar
          </button>
        </div>
        {/* ---------------------------------------------------- */}
      </div>
    </div>
  );
};

export default AvatarCropperModal;