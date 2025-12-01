import './Beneficios.css';

const Beneficios = () => {
    return (
        <section id="funcionalidad" className="funcionalidades">
            <div className="container">
                <h2 className="section-title">Beneficios clave de Vibe-U</h2>
                <div className="funcionalidades__grid">
                    <div className="funcionalidad__item">
                        <img src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png" alt="Haz nuevos amigos" />
                        <p>Haz nuevos amigos</p>
                    </div>
                    <div className="funcionalidad__item">
                        <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Únete a comunidades" />
                        <p>Únete a comunidades</p>
                    </div>
                    <div className="funcionalidad__item">
                        <img src="https://cdn-icons-png.flaticon.com/512/4221/4221927.png" alt="Asiste a eventos" />
                        <p>Asiste a eventos</p>
                    </div>
                    <div className="funcionalidad__item">
                        <img src="https://cdn-icons-png.flaticon.com/512/992/992700.png" alt="Conecta por afinidad" />
                        <p>Conecta por afinidad</p>
                    </div>
                </div>
            </div>
        </section>
    )
};

export default Beneficios;
