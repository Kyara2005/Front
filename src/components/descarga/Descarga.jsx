import appStoreImg from '../../assets/appstore.png';
import googlePlayImg from '../../assets/googleplay.png';
import './Descarga.css';

const Descarga = () => {
    return (
        <section className="download-cta-section" id="descarga">
        <div className="container">
            <h2 className="section-title">¿Listo para vivir la mejor experiencia universitaria?</h2>
            <p>Descarga Vibe-U hoy y empieza a conectar con tu comunidad universitaria.</p>
            <div className="app-buttons-cta">
            <a href="https://apps.apple.com/app/apple-store/id6444221234?pt=123456789&ct=website&mt=8" target="_blank" rel="" className="btn btn-appstore">
                <img src={appStoreImg} alt="Descargar en App Store" />
                <span></span>
            </a>
            <a href="https://play.google.com/store/games?hl=es_EC" target="_blank" rel="" className="btn btn-googleplay">
                <img src={googlePlayImg} alt="Descargar en Google Play" />
                <span></span>
            </a>
            </div>
        </div>
        </section>
    );
};

export default Descarga;
