import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Matches.css';

const Matches = () => {
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await fetch('https://randomuser.me/api/?results=6&nat=us,es,mx,br');
                const data = await res.json();
                setSuggestedUsers(data.results);
            } catch (error) {
                console.error("Error al cargar matches:", error);
            }
        };
        fetchSuggestedUsers();
    }, []);

    return (
        <section className="matches-section">
            <button className="back-btn" onClick={() => navigate(-1)}>⬅️ Volver</button>
            <h2 className="matches-title">Tus posibles matches 💖</h2>
            <p className="matches-subtitle">Conecta con estudiantes que comparten tu vibe ✨</p>

            <div className="matches-grid">
                {suggestedUsers.map((user, index) => (
                    <div key={index} className="match-card">
                        <img src={user.picture.large} alt={user.name.first} className="match-avatar" />
                        <h4>{user.name.first} {user.name.last}</h4>
                        <p>{user.location.country}</p>
                        <button className="connect-btn">Conectar 💬</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Matches;
