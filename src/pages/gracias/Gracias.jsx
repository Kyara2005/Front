import './Gracias.css';
import { Link } from 'react-router';

const Gracias = () => {
    return (
        <section className="gracias">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>

            <div className="gracias__box" data-aos="fade-up" data-aos-duration="10" data-aos-delay="100">
                <h1>¡Bienvenidos a VIbe-U! 💌</h1>
                <p>Empecemos creando nuestro perfil universitario</p>
                <Link to="/perfil" className="btn btn-primary">Crear perfil</Link>
            </div>
        </section>
    )
};

export default Gracias;
