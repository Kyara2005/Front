/* =================================== */
/* === BASE: LAYOUT PRINCIPAL Y GENERAL === */
/* =================================== */

.musuario-container {
  display: flex;
  min-height: 100vh; /* Usamos min-height para permitir que crezca */
  font-family: 'Inter', sans-serif; 
  
  /* 🔄 AJUSTE CLAVE: Fondo gris claro que se mezcla con un color más oscuro en el fondo */
  background-color: #f5f5f5; 
  
  /* Agregamos una sombra morada/púrpura en el fondo para simular el borde inferior de la captura */
  /* El color morado oscuro #4a0142 coincide con el degradado del menú lateral */
  box-shadow: inset 0 -300px 100px -100px #4a0142, inset 0 0 0 100vh #f5f5f5;
  
  /* Nota: Esta técnica con box-shadow es una simulación. Si se desea un pie de página real, se necesitaría un elemento HTML adicional. */
}

/* ================================================= */
/* === PANEL DE NAVEGACIÓN PRINCIPAL (main-nav-panel) === */
/* ================================================= */

.main-nav-panel {
  width: 250px;
  background-color: #760265; /* Color Morado/Púrpura sólido */
  color: white;
  padding: 60px 20px 20px;
  display: flex; 
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  position: sticky; /* Asegura que el panel fijo se mantenga */
  top: 0;
  height: 100vh; /* Ocupa toda la altura */
}

.left-panel-content {
  margin-top: 20px; 
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Estilos de botones dentro del panel principal */
.main-nav-panel .menu-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    padding: 0;
    margin: 0;
}

.main-nav-panel .menu-buttons button {
    width: 100%;
    padding: 10px 15px;
    background: transparent;
    color: white;
    border: none;
    cursor: pointer;
    text-align: left;
    border-radius: 8px;
    transition: background 0.2s;
    font-weight: 500;
}

.main-nav-panel .menu-buttons button:hover,
.main-nav-panel .menu-buttons button.active {
    background: rgba(255, 255, 255, 0.2);
    font-weight: 700;
}

/* ---------------------------------------------------- */
/* AJUSTES FALTANTES DEL AVATAR DE PC (Visto en la imagen) */
/* Asegura que el contenido del panel fijo (main-nav-panel) se vea igual que en PC */
/* ---------------------------------------------------- */

.desktop-avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 25px; 
    width: 100%;
}

.desktop-avatar-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 10px;
    border: 3px solid white; 
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.desktop-avatar-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.desktop-status {
    background-color: #03a800; /* Verde para "Disponible" */
    color: white;
    font-size: 0.75rem;
    padding: 3px 10px;
    border-radius: 9999px;
    margin-top: 5px;
    font-weight: 600;
}

/* =================================== */
/* === PANEL DERECHO (Right-Panel) === */
/* =================================== */

.right-panel {
  flex: 1; 
  padding: 30px;
  /* 🔄 AJUSTE CLAVE: Asegura que el panel de contenido sea blanco (por encima del fondo gris/morado) */
  background-color: #ffffff;
  min-height: 100vh; /* Importante para que el blanco cubra toda la altura */
  overflow-y: auto;
}

/* ---------------------------------------------------- */
/* MENÚ HAMBURGUESA (Visible en Compu y Móvil)          */
/* ---------------------------------------------------- */

.hamburger-btn {
    position: fixed;
    top: 20px;
    left: 20px; 
    
    width: 45px;
    height: 40px;
    display: flex; 
    flex-direction: column;
    justify-content: space-between;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 3500;
}

.hamburger-btn span {
    display: block;
    width: 100%;
    height: 4px;
    background: #333;
    border-radius: 4px;
}

/* ---------------------------------------------------- */
/* MENÚ LATERAL DESLIZABLE (side-menu) con DEGRADADO    */
/* ---------------------------------------------------- */

.side-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 260px;
    height: 100%;
    
    /* 🎨 FONDO DEGRADADO SOLICITADO */
    background: linear-gradient(180deg, #920ae6 0%, #4a0142 100%);
    
    color: white;
    box-shadow: 2px 0 10px rgba(0,0,0,0.4);
    padding: 30px 20px;
    /* Inicia oculto */
    transform: translateX(-100%);
    transition: transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 3000;
    /* Aseguramos que se muestre en mobile cuando se le agregue la clase .show */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.side-menu.show {
    /* Se desliza para mostrarse */
    transform: translateX(0);
}

.menu-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 50px;
  margin-bottom: 30px;
}

.menu-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  text-align: center;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
    width: 100%;
}

.avatar-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    margin-bottom: 10px;
    position: relative; /* Para el overlay */
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  border-radius: 50%;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.default-avatar {
  font-size: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.input-file-hidden {
    display: none;
}

/* Botones dentro del menú deslizable */
.side-menu .menu-buttons {
    display: flex;
    flex-direction: column; 
    gap: 10px;
    width: 100%;
    padding: 0;
    margin: 0;
}

.side-menu .menu-buttons button {
    width: 100%;          
    text-align: left;     
    padding: 10px 15px;
    background: transparent;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s;
    font-weight: 500;
}

.side-menu .menu-buttons button:hover {
    background: rgba(255, 255, 255, 0.1); 
}

/* =================================== */
/* === ESTILOS DE CARTILLA DE PERFIL === */
/* =================================== */

.user-profile-section {
  max-width: 400px;
  margin: 30px auto;
  background: #ffffff;
  border-radius: 15px;
  padding: 25px 20px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  font-family: 'Inter', sans-serif;
  border: 2px solid #920ae6; 
}

.avatar-circle-large {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px;
  border: 2px solid #760265; /* Borde al avatar grande */
}

.avatar-img-large {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.default-avatar-large {
  font-size: 80px;
  color: #920ae6;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  background: #f3f3f3;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.info-row strong {
  color: #760265; /* Morado más oscuro */
  font-weight: 600;
}

/* ---------------------------------------------------- */
/* RESPONSIVE MEDIA QUERIES (Ajustes para Móvil)        */
/* Hacemos visibles el panel principal (inline), el botón de hamburguesa y el menú deslizable (off-screen) */
/* ---------------------------------------------------- */

@media (max-width: 768px) {
    /* 1. Apilar los paneles verticalmente */
    .musuario-container {
        flex-direction: column; 
    }

    /* 2. MOSTRAR el panel principal (púrpura) y hacerlo ocupar el 100% */
    .main-nav-panel {
        display: flex; /* Asegura que se vea */
        width: 100%; /* Ocupa todo el ancho del celular */
        height: auto; /* Permite que el contenido determine la altura */
        position: relative; /* Fluye con el scroll */
        padding-top: 20px; /* Ajuste de padding para móvil */
        padding-bottom: 20px;
    }
    
    /* 3. El contenido principal (right-panel) ocupa todo el ancho */
    .right-panel {
        width: 100%;
        /* No necesitamos padding extra arriba si el panel principal ya está ahí */
        padding-top: 30px; 
        padding-left: 15px;
        padding-right: 15px;
        flex-shrink: 0;
        min-height: auto; /* Lo dejamos en auto para que fluya con el contenido */
    }

    /* 4. El menú desplegable (side-menu) permanece accesible (flotará sobre todo al activarse) */
    .side-menu {
        display: flex; /* Asegura que la capa esté presente */
    }
    
    /* 5. AJUSTAR la visibilidad y apariencia del botón de hamburguesa en móvil */
    .hamburger-btn {
        display: flex; /* Asegura que se vea */
        /* Eliminamos el fondo blanco y la sombra para que sea transparente */
        background-color: transparent; 
        border-radius: 0;
        padding: 5px;
        top: 10px;
        left: 10px;
        box-shadow: none;
    }
    
    /* 6. La cartilla de perfil ocupa todo el ancho disponible */
    .user-profile-section {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
    }
}

/* 🔥 NEGRITA SOLO PARA "Menú" DEL MENÚ HAMBURGUESA */
.side-menu .menu-title {
    font-weight: 800 !important;
}
