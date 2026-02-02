import { useEffect, useState } from "react";
import storeAuth from "../../context/storeAuth";
import "./Gusuarios.css";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admins/usuarios`;

export default function Gusuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUser = storeAuth((state) => state.user);
  const token = storeAuth.getState().token;

  const getUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsuarios();
  }, []);

  // ===============================
  // LÓGICA: CAMBIAR ROL (TOGGLE)
  // ===============================
  const handleCambiarRol = async (usuario) => {
    const nuevoRol = usuario.rol === "administrador" ? "estudiante" : "administrador";
    const mensaje = `¿Deseas cambiar el rol de ${usuario.nombre} a ${nuevoRol}?`;
    
    if (!window.confirm(mensaje)) return;

    try {
      const res = await fetch(`${API_URL}/${usuario._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rol: nuevoRol }),
      });

      if (res.ok) {
        setUsuarios((prev) =>
          prev.map((u) => (u._id === usuario._id ? { ...u, rol: nuevoRol } : u))
        );
      }
    } catch (err) {
      alert("No se pudo actualizar el rol");
    }
  };

  // ===============================
  // LÓGICA: ELIMINAR DE LA BDD
  // ===============================
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro? Se eliminará permanentemente de la BDD.")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsuarios((prev) => prev.filter((u) => u._id !== id));
      }
    } catch (err) {
      alert("Error al eliminar el registro");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideBusqueda = 
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correoInstitucional?.toLowerCase().includes(busqueda.toLowerCase());
    
    const noSoyYo = u.correoInstitucional !== currentUser?.correoInstitucional && 
                    u._id !== "696701c02175478e2b8302c4"; 

    return coincideBusqueda && noSoyYo;
  });

  if (loading) return <div className="gestion-usuarios-seccion"><h3>Cargando...</h3></div>;

  return (
    <div className="gestion-usuarios-seccion">
      <div className="gestion-header">
        <h2>👤 Gestión de Usuarios</h2>
      </div>

      <div className="gestion-search-container">
        <input
          type="text"
          className="gestion-input-search"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="gestion-tabla-wrapper">
        <table className="gestion-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email Institucional</th>
              <th>Rol</th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px" }}>
                  No hay otros usuarios registrados
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario._id}>
                  <td className="font-bold">{usuario.nombre}</td>
                  <td>{usuario.correoInstitucional}</td>
                  <td>
                    <span className={`gestion-badge ${usuario.rol === 'administrador' ? 'admin' : 'usuario'}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: "center" }}>
                      {/* BOTÓN DINÁMICO SEGÚN EL ROL */}
                      <button 
                        className={usuario.rol === "administrador" ? "btn-downgrade" : "btn-promote"} 
                        onClick={() => handleCambiarRol(usuario)}
                      >
                        {usuario.rol === "administrador" ? "Quitar Admin" : "Hacer Admin"}
                      </button>
                      
                      <button className="btn-delete" onClick={() => handleEliminar(usuario._id)}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
