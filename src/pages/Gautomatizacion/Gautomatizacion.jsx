import { useState } from "react";
import "./Gautomatizacion.css";

const Gautomatizacion = () => {
    const [reporte, setReporte] = useState([]);
    const [cargando, setCargando] = useState(false);

    const solicitarAutomatizacion = async () => {
        const token = localStorage.getItem("token");
        setCargando(true);

        try {
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/automatizacion/reporte/grupos`,
            {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            }
        );

        if (!response.ok) {
            throw new Error("Error al generar la automatización");
        }

        const data = await response.json();
        setReporte(data.reporte);

        } catch (error) {
        console.error("Error:", error);
        } finally {
        setCargando(false);
        }
    };

    return (
        <div className="gauto-container">
        <h2>Automatización del Sistema 🤖</h2>

        {/* TABLA */}
        <table className="gauto-table">
            <thead>
            <tr>
                <th>Grupo</th>
                <th>Miembros</th>
                <th>Publicaciones</th>
                <th>Creador</th>
            </tr>
            </thead>

            <tbody>
            {reporte.length === 0 ? (
                <tr>
                <td colSpan="4" className="gauto-empty">
                    No hay automatización generada
                </td>
                </tr>
            ) : (
                reporte.map((g, index) => (
                <tr key={index}>
                    <td>{g.grupo}</td>
                    <td>{g.totalUsuarios}</td>
                    <td>{g.totalPosts}</td>
                    <td>{g.creadorEmail}</td>
                </tr>
                ))
            )}
            </tbody>
        </table>

        {/* BOTÓN */}
        <button
            className="gauto-btn"
            onClick={solicitarAutomatizacion}
            disabled={cargando}
        >
            {cargando ? "Generando..." : "Solicitar Automatización"}
        </button>
        </div>
    );
};

export default Gautomatizacion;



