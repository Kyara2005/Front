import './Header.css';
import { Link } from "react-router"; 
import logo from '../../assets/logo-vibe-u.webp';
import { useNavigate } from "react-router"; 

const Header = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate("/login");
    };

    const handleJoinNowClick = () => {
        navigate("/register");
    };

    return (
        <header className="header">
            <div className="logo-container">
                <Link to="/">
                    <img src={logo} alt="Vibe-U Logo" className="logo" loading="lazy" />
                </Link>
                <div className="boton-descarga1">
                    <a href="https://play.google.com/store/games?hl=es_EC" className="btn btn-primary descarga-chica">Descarga la App</a>
                </div>
            </div>  
            <nav className="nav-links">
                <a href="#que-es-vibe-u">¿Qué es Vibe-U?</a>
                <a href="#como-funciona">¿Cómo Funciona?</a>
                <a href="#explora-conecta">Explora y Conecta</a>
                <Link to="/contacto">Contacto</Link>
                <Link to="/beneficios">Beneficios</Link>
                <Link to="/eventos">Eventos</Link>
            </nav>
            <button className="button__auth-button" onClick={handleLoginClick}>
                Iniciar Sesión / Registrarse
            </button>
            <div className="hero-text" data-aos="fade-down" data-aos-duration="1500">
                <p>La app que pone a la U en modo social</p>
                <div className="boton-descarga">
                    <a href="#" className="btn" onClick={handleJoinNowClick}>
                        Únete ahora
                    </a>
                    <a href="#como-funciona" className="btn-secondary">Cómo funciona</a>
                </div>
            </div>
        </header>
    );
}

export default Header;
