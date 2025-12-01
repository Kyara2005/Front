import './ExploraConecta.css';
import evento1 from '../../assets/evento1.webp';
import paso2 from '../../assets/paso2.jpg';
import paso3 from '../../assets/paso3.jpg';
import paso4 from '../../assets/paso4.jpg';

const ExploraConecta = () => {
    return (
        <section className="explora-conecta" id="explora-conecta">
        <h2>Explora y Conecta</h2>
        <div className="explora-conecta__container">
            <div className="paso">
            <img src={evento1} alt="Evento 1" loading="lazy" />
            <h3>Explora eventos en todos los campus</h3>
            <p>Descubre actividades sociales y académicas en tu campus.</p>
            </div>
            <div className="paso">
            <img src={paso2} alt="Paso 2" loading="lazy" />
            <h3>Desliza para guardar o ignorar</h3>
            <p>Elige si te interesan con solo un gesto.</p>
            </div>
            <div className="paso">
            <img src={paso3} alt="Paso 3" loading="lazy" />
            <h3>Haz match con quien vaya</h3>
            <p>Conéctate con otros estudiantes que asistirán al mismo evento.</p>
            </div>
            <div className="paso">
            <img src={paso4} alt="Paso 4" loading="lazy" />
            <h3>Chatea y coordina</h3>
            <p>Planea detalles con tus nuevos contactos para asistir juntos.</p>
            </div>
        </div>
        </section>
    )
};

export default ExploraConecta;