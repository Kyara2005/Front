import { useState } from 'react';
import { enviarCorreo } from '../services/emailService';

export const FormContacto = () => {
  const [mensaje, setMensaje] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await enviarCorreo({ para: email, asunto: 'Hola', mensaje });
      alert(res.mensaje);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Mensaje" />
      <button type="submit">Enviar</button>
    </form>
  );
};
