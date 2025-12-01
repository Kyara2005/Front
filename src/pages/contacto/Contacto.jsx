import React from 'react';
import integrante2 from '../../assets/integrante2.jpg';
import integrante1 from '../../assets/integrante1.jpg';
import integrante3 from '../../assets/integrante3.jpg';
import integrante4 from '../../assets/integrante4.jpg';
import integrante5 from '../../assets/integrante5.jpg';
import integrante6 from '../../assets/integrante6.jpg';

import Grupo from '../../assets/unnamed.webp';
import './Contacto.css';

const Contacto = () => {
    const teamMembers = [
        {
            name: 'Melany Perugachi',
            bio: 'Especialista en front-end, responsable del diseño de la interfaz y la experiencia de usuario.',
            photo: integrante4
        },
        {
            name: 'Santiago Vargas',
            bio: 'Desarrollador back-end, encargado de la lógica del servidor y la gestión de la base de datos.',
            photo: integrante5
        },
        {
            name: 'Sebastian Hidalgo',
            bio: 'Experto en la arquitectura de la aplicación, asegurando un rendimiento óptimo.',
            photo: integrante6
        },
        {
            name: 'Emilio Gavilánez',
            bio: 'Desarrollador en los algoritmos para conectar a estudiantes con personas y grupos compatibles en Vibe-U.',
            photo: integrante2
        },
        {
            name: 'Jhonathan Ruiz',
            bio: 'Experto en control de calidad, garantiza que la aplicación esté libre de errores.',
            photo: integrante1
        },
        {
            name: 'Kyara Altamirano',
            bio: 'Creadora de contenido y estratega de marketing para la comunidad Vibe-U.',
            photo: integrante3
        },
    ];

    return (
        <section id="contacto" className="contacto-section">
            <h2 className="contacto-title">Conoce al Equipo detrás de Vibe-U 🤝</h2>
            <p className="subtitulo">Somos un grupo de universitarios apasionados por crear conexiones auténticas.</p>

            <div className="imagen-grupal-container">
                {/* Imagen grupal con carga diferida y formato WebP */}
                <picture>
                    <source srcSet={Grupo} type="image/webp" />
                    <img
                        src={Grupo} // fallback a JPG
                        alt="Foto grupal del equipo Vibe-U"
                        className="imagen-grupal"
                        loading="lazy"
                    />
                </picture>
            </div>

            <div className="equipo-container">
                {teamMembers.map((member, index) => (
                    <div key={index} className="miembro-card">
                        <picture>
                            {/* Usamos el formato WebP para imágenes modernas, y JPG como fallback */}
                            <source srcSet={member.photo} type="image/webp" />
                            <img
                                src={member.photo} // fallback a JPG
                                alt={member.name}
                                className="miembro-foto"
                                loading="lazy" // Lazy loading para cada foto de miembro
                            />
                        </picture>
                        <h3>{member.name}</h3>
                        <p>{member.bio}</p>
                    </div>
                ))}
            </div>

            <div className="contacto-info">
                <h3>¡Contáctanos!</h3>
                <p>Si tienes alguna pregunta o sugerencia, no dudes en escribirnos:</p>
                <p>
                    Correo: <a href="mailto:kyaramaltamirano@gmail.com">vibeu.app@gmail.com</a>
                </p>
                <p>
                    WhatsApp: <a href="https://wa.me/593963267963">+593 963 267 963</a>
                </p>
            </div>
        </section>
    );
};

export default Contacto;
