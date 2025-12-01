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
        const res = await axios.get(`http://localhost:5000/api/usuarios/confirmar/${token}`);
        setMensaje('Cuenta confirmada ✅');
      } catch (error) {
        setMensaje('Token inválido o ya confirmado');
      } finally {
        setCargando(false);
        setTimeout(() => setFadeIn(true), 50); // activar animación
      }
    };

    confirmarCuenta();
  }, [token]);

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#ffb07c,#9f6bff)',
      padding: '20px',
      overflow: 'hidden',
    },
    card: {
      background: 'white',
      width: '400px',
      padding: '50px 40px',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      textAlign: 'center',
      position: 'relative',
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? 'scale(1)' : 'scale(0.8)',
      transition: 'opacity 0.8s ease, transform 0.8s ease',
    },
    image: {
      width: '130px',
      height: '130px',
      borderRadius: '50%',
      marginBottom: '25px',
      border: '4px solid #8a3dff',
      objectFit: 'cover',
    },
    mensaje: {
      fontSize: '28px', // más grande
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
    },
    subMensaje: {
      fontSize: '18px',
      color: '#555',
      marginBottom: '25px',
    },
    button: {
      width: '100%',
      padding: '15px',
      background: '#8a3dff',
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: '.3s',
    },
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Verificando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Logo Vibe-U" style={styles.image} />
        <p style={styles.mensaje}>{mensaje}</p>
        <p style={styles.subMensaje}>Ya puedes iniciar sesión</p>
        <Link to="/login">
          <button style={styles.button}>Ir al Login</button>
        </Link>
      </div>
    </div>
  );
};
