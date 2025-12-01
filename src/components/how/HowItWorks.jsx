import './HowItWorks.css';
const HowItWorks = () => {
    return (
        <section className="how-it-works-section" id="como-funciona">
        <div className="container">
            <h2 className="how-it-works__title">¿Cómo funciona?</h2>
            <div className="steps">
            <div className="step-box">
                <img
                src="https://cdn-icons-png.flaticon.com/128/8224/8224757.png"
                alt="Icono perfil universitario"
                />
                <h3>
                CREA<br />
                <span>tu perfil universitario!!</span>
                </h3>
            </div>
            <div className="step-box">
                <img
                src="https://cdn-icons-png.flaticon.com/128/10351/10351986.png"
                alt="Icono eventos y comunidades"
                />
                <h3>
                DESCUBRE<br />
                <span>eventos y comunidades</span>
                </h3>
            </div>
            <div className="step-box">
                <img
                src="https://cdn-icons-png.flaticon.com/128/18868/18868531.png"
                alt="Icono amigos reales"
                />
                <h3>
                CONECTA<br />
                <span>y haz amigos reales</span>
                </h3>
            </div>
            </div>
        </div>
        </section>
    )
}

export default HowItWorks;