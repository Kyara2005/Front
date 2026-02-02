import { useEffect, useState } from "react";
import storeAuth from "../../context/storeAuth";
import "./Gusuarios.css";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admins/usuarios`;

export default function Gusuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  // Obtenemos tu usuario del store
  const currentUser = storeAuth((state) => state.user);

  const getUsuarios = async () => {
    try {
      setLoading(true);
      const token = storeAuth.getState().token;
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

  // FILTRADO ACTUALIZADO
  const usuariosFiltrados = usuarios.filter((u) => {
    // 1. Buscamos por nombre o por correoInstitucional
    const coincideBusqueda = 
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correoInstitucional?.toLowerCase().includes(busqueda.toLowerCase());
    
    // 2. EXCLUIRTE A TI (Damaris Lopez)
    // Usamos el ID de tu BDD que me pasaste o el correoInstitucional
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
                  {/* AQUÍ ESTABA EL ERROR: usamos correoInstitucional */}
                  <td>{usuario.correoInstitucional}</td>
                  <td>
                    <span className={`gestion-badge ${usuario.rol === 'administrador' ? 'admin' : 'usuario'}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: "center" }}>
                      <button className="btn-edit" onClick={() => alert("Editar a " + usuario.nombre)}>
                        ✏️ Editar
                      </button>
                      <button className="btn-delete" onClick={() => alert("Eliminar logic...")}>
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
