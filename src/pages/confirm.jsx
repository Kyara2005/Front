import logo from '../assets/logo-vibe-u.webp';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const Confirm = () => {
  const { token } = useParams();
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const confirmarCuenta = async () => {
      try {
        await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/confirmar/${token}`
        );
        setMensaje('Cuenta confirmada ✅');
      } catch (error) {
        setMensaje('Token inválido o ya confirmado');
      } finally {
        setCargando(false);
        setTimeout(() => setFadeIn(true), 50);
      }
    };

    confirmarCuenta();
  }, [token]);

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>
          Verificando tu cuenta...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg,#ffb07c,#9f6bff)',
    }}>
      <div style={{
        background: 'white',
        padding: '50px',
        borderRadius: '20px',
        textAlign: 'center',
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'scale(1)' : 'scale(0.8)',
        transition: 'all .8s ease'
      }}>
        <img src={logo} alt="Logo Vibe-U" style={{ width: '130px', marginBottom: '25px' }} />
        <h2 style={{ color: '#000', marginBottom: '10px' }}>
          {mensaje}
        </h2>
        <p style={{ color: '#333' }}>
          Ya puedes iniciar sesión
        </p>

        <Link to="/login">
          <button style={{ padding: '15px', marginTop: '20px' }}>
            Ir al Login
          </button>
        </Link>
      </div>
    </div>
  );
};
