import { useEffect, useState } from "react";
import "./Gautomatizacion.css";

const Gautomatizacion = () => {
    const [reporte, setReporte] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const obtenerReporte = async () => {
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
            throw new Error("Error al obtener el reporte");
            }

            const data = await response.json();
            setReporte(data.reporte);

        } catch (error) {
            console.error("Error:", error);
        }
        };

        obtenerReporte();
    }, []);

    return (
        <div className="gauto-container">
        <h2>Automatización del Sistema 🤖</h2>

        {reporte && (
            <div className="gauto-card">
            <p>Total de grupos: <strong>{reporte.totalGrupos}</strong></p>
            <p>Grupos activos: <strong>{reporte.gruposActivos}</strong></p>
            <p>Grupos inactivos: <strong>{reporte.gruposInactivos}</strong></p>
            </div>
        )}

        <button className="gauto-btn">
            Solicitar Automatización
        </button>
        </div>
    );
};

export default Gautomatizacion;


