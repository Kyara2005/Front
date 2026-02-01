import { useEffect, useState } from "react";
import storeAuth from "../../context/storeAuth";

// 🔗 URL DEL BACKEND
const API_URL =
  "https://controversial-jacquette-vibe-u-d09f766e.koyeb.app/api/users";

export default function Gusuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===============================
  // OBTENER USUARIOS
  // ===============================
  const getUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = storeAuth.getState().token;

      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudieron cargar los usuarios");
      }

      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsuarios();
  }, []);

  // ===============================
  // ELIMINAR USUARIO
  // ===============================
  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este usuario?"
    );
    if (!confirmar) return;

    try {
      const token = storeAuth.getState().token;

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el usuario");
      }

      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar usuario");
    }
  };

  // ===============================
  // FILTRADO
  // ===============================
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ===============================
  // RENDER
  // ===============================
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Cargando usuarios...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
        <h3>{error}</h3>
        <button onClick={getUsuarios}>Reintentar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>👤 Gestión de Usuarios</h2>

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          maxWidth: "320px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {/* TABLA */}
      <div style={{ overflowX: "auto" }}>
        <table
          width="100%"
          cellPadding="10"
          cellSpacing="0"
          style={{ borderCollapse: "collapse" }}
        >
          <thead style={{ background: "#f3e8ff" }}>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" align="center">
                  No hay usuarios
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario._id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.rol || "usuario"}</td>
                  <td>
                    <button
                      style={{ marginRight: "8px" }}
                      onClick={() =>
                        alert("Aquí puedes abrir un modal de edición")
                      }
                    >
                      ✏️ Editar
                    </button>

                    <button
                      style={{ color: "red" }}
                      onClick={() => eliminarUsuario(usuario._id)}
                    >
                      🗑️ Eliminar
                    </button>
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
