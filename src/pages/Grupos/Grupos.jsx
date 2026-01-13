import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { 
    FaPlus, FaArrowLeft, FaPaperPlane, 
    FaCamera, FaThumbsUp, FaComment, FaSearch, FaTimes, FaEllipsisH, FaShare, 
    FaHeart, FaBell, FaRegFileAlt, FaChevronRight, FaThumbtack, FaExclamationCircle, FaSignOutAlt, FaTrash
} from 'react-icons/fa';
import './Grupos.css';

const API_URL = "http://localhost:8000/api/grupos";

const Grupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [pestana, setPestana] = useState("todos");
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);

    const [grupoActivo, setGrupoActivo] = useState(() => {
        const persistido = localStorage.getItem("ultimoGrupoVisitado");
        return persistido ? JSON.parse(persistido) : null;
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nuevoPost, setNuevoPost] = useState("");
    const [fotoPost, setFotoPost] = useState(null);
    const [nuevoGrupo, setNuevoGrupo] = useState({ nombre: "", imagen: "" });
    const [loading, setLoading] = useState(false);

    // ESTADOS PARA EL RECORTADOR (CROPPER)
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [favoritos, setFavoritos] = useState({});
    const [likes, setLikes] = useState({});

    const fileInputRef = useRef(null);
    const postFotoRef = useRef(null);
    const bannerInputRef = useRef(null);
    const perfilInputRef = useRef(null);

    const userEmail = localStorage.getItem("correo");
    const userName = localStorage.getItem("nombre") || "Usuario";

    // --- FUNCIONES DEL CROPPER ---
    const onCropComplete = useCallback((_ , pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirmCrop = async () => {
        try {
            const image = new Image();
            image.src = imageToCrop;
            await image.decode();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            ctx.drawImage(
                image,
                croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
                0, 0, croppedAreaPixels.width, croppedAreaPixels.height
            );

            const result = canvas.toDataURL('image/jpeg');
            setNuevoGrupo({ ...nuevoGrupo, imagen: result });
            setImageToCrop(null); // Cerrar editor
        } catch (e) {
            console.error("Error al recortar", e);
        }
    };

    const handleUnirseGrupo = async (grupo) => {
        if (grupo.miembrosArray?.includes(userEmail)) {
            alert("Ya estás en este grupo");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/${grupo._id}/unirse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: userEmail })
            });
            if (res.ok) {
                alert("Te has unido al grupo");
                cargarGrupos();
            }
        } catch (error) { console.error(error); }
    };

    const handleAbandonarGrupo = async (id) => {
        if (!window.confirm("¿Seguro que quieres abandonar el grupo?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}/abandonar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: userEmail })
            });
            if (res.ok) {
                alert("Has abandonado el grupo");
                cargarGrupos();
            }
        } catch (error) { console.error(error); }
    };

    const handleEliminarGrupo = async (id) => {
        if (!window.confirm("¿ESTÁS SEGURO? Esta acción eliminará el grupo permanentemente.")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Grupo eliminado");
                cargarGrupos();
                if (grupoActivo?._id === id) setGrupoActivo(null);
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        const cerrarTodosLosMenus = () => setMenuAbiertoId(null);
        window.addEventListener('click', cerrarTodosLosMenus);
        return () => window.removeEventListener('click', cerrarTodosLosMenus);
    }, []);

    useEffect(() => {
        if (grupoActivo) {
            localStorage.setItem("ultimoGrupoVisitado", JSON.stringify(grupoActivo));
        } else {
            localStorage.removeItem("ultimoGrupoVisitado");
        }
    }, [grupoActivo]);

    const cargarGrupos = async () => {
        try {
            const res = await fetch(`${API_URL}/listar`);
            const data = await res.json();
            setGrupos(data);
        } catch (error) {
            console.error("Error al cargar grupos:", error);
        }
    };

    useEffect(() => { cargarGrupos(); }, []);

    const entrarAGrupo = (grupo) => setGrupoActivo(grupo);
    const salirDeGrupo = () => setGrupoActivo(null);

    const toggleFavorito = (postId) => setFavoritos(prev => ({ ...prev, [postId]: !prev[postId] }));
    const toggleLike = (postId) => setLikes(prev => ({ ...prev, [postId]: !prev[postId] }));

    const handleToggleMenu = (e, id) => {
        e.stopPropagation(); 
        setMenuAbiertoId(menuAbiertoId === id ? null : id);
    };

    const handleImagePreview = (e, destino) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (destino === 'grupo') setImageToCrop(reader.result);
            else if (destino === 'post') setFotoPost(reader.result);
            else if (destino === 'banner-update') console.log("Nueva portada");
            else if (destino === 'perfil-update') console.log("Nuevo perfil");
        };
        reader.readAsDataURL(file);
    };

    const handlePublicar = async (e) => {
        e.preventDefault();
        if (!nuevoPost.trim() && !fotoPost) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/${grupoActivo._id}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ autor: userName, contenido: nuevoPost, foto: fotoPost })
            });
            const postGuardado = await res.json();
            setGrupos(prev => prev.map(g => g._id === grupoActivo._id ? { ...g, posts: [postGuardado, ...g.posts] } : g));
            setNuevoPost(""); 
            setFotoPost(null);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleCrearGrupo = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/crear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nuevoGrupo.nombre,
                    imagen: nuevoGrupo.imagen,
                    creadorEmail: userEmail,
                    miembrosArray: [userEmail]
                })
            });
            const grupoGuardado = await res.json();
            setGrupos([grupoGuardado, ...grupos]);
            setIsModalOpen(false);
            setNuevoGrupo({ nombre: "", imagen: "" });
        } catch (error) { alert("Error al crear grupo"); }
        finally { setLoading(false); }
    };

    if (grupoActivo) {
        const grupoData = grupos.find(g => g._id === grupoActivo._id) || grupoActivo;
        return (
            <div className="grupo-muro-wrapper">
                <div className="perfil-header-container">
                    <div className="muro-banner-bg" style={{ backgroundImage: `url(${grupoData.imagen})` }}>
                        <button className="btn-regresar-float" onClick={salirDeGrupo}><FaArrowLeft /></button>
                        <button className="btn-edit-banner-purple" onClick={() => bannerInputRef.current.click()}>
                            <FaCamera /> <span>Editar portada</span>
                        </button>
                        <input type="file" ref={bannerInputRef} style={{display:'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'banner-update')} />
                    </div>
                    <div className="perfil-info-wrapper">
                        <div className="perfil-info-main-row">
                            <div className="foto-perfil-overlap">
                                <img src={grupoData.imagen || "https://via.placeholder.com/150"} alt="grupo" />
                                <button className="btn-subir-perfil-muro" onClick={() => perfilInputRef.current.click()}>
                                    <FaCamera />
                                </button>
                                <input type="file" ref={perfilInputRef} style={{display:'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'perfil-update')} />
                            </div>
                            <div className="perfil-textos-header">
                                <h2 className="perfil-nombre-bold">{grupoData.nombre}</h2>
                                <p className="perfil-stats-social">
                                    <span className="stats-count"><b>{grupoData.miembrosArray?.length || 1}</b> miembros</span>
                                    <span className="stats-divider">•</span>
                                    <span className="stats-privacy">Grupo público</span>
                                </p>
                            </div>
                            <div className="perfil-acciones-derecha">
                                <button className="btn-header-invite"><FaPlus /> Invitar</button>
                                <button className="btn-header-member-status">
                                    {grupoData.creadorEmail === userEmail ? "Administrador" : "Miembro"}
                                </button>
                                <button className="btn-header-more"><FaEllipsisH /></button>
                            </div>
                        </div>
                        <div className="muro-nav-tabs">
                            <button className="nav-tab active">Conversación</button>
                            <button className="nav-tab">Miembros</button>
                            <button className="nav-tab">Eventos</button>
                            <button className="nav-tab">Multimedia</button>
                        </div>
                    </div>
                </div>
                <div className="muro-contenido-central">
                    <div className="publicar-card-social">
                        <div className="publicar-top">
                            <img src="https://via.placeholder.com/40" className="user-avatar-small" alt="u" />
                            <input type="text" className="input-social-white" placeholder={`¿Qué compartes hoy, ${userName}?`}
                                value={nuevoPost} onChange={(e) => setNuevoPost(e.target.value)} />
                            <button className="btn-send-minimal" onClick={handlePublicar} disabled={loading}><FaPaperPlane /></button>
                        </div>
                        {fotoPost && (
                            <div className="container-previsualizacion">
                                <img src={fotoPost} alt="Vista previa" className="img-previa-post" />
                                <button className="btn-borrar-previa" onClick={() => setFotoPost(null)}><FaTimes /></button>
                            </div>
                        )}
                        <div className="publicar-bottom">
                            <button className="btn-action-foto" onClick={() => postFotoRef.current.click()}><FaCamera className="icon-camera-green" /> Foto</button>
                            <input type="file" ref={postFotoRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'post')} />
                        </div>
                    </div>
                    <div className="muro-posts-lista">
                        {grupoData.posts?.map(post => (
                            <div key={post._id} className="post-item-card-social">
                                <div className="post-header-social">
                                    <div className="post-user-info">
                                        <img src="https://via.placeholder.com/40" alt="u" className="author-avatar" />
                                        <div>
                                            <h4 className="author-name">{post.autor}</h4>
                                            <span className="post-date">Justo ahora</span>
                                        </div>
                                    </div>
                                    <button className={`btn-corazon-top ${favoritos[post._id] ? 'active' : ''}`} onClick={() => toggleFavorito(post._id)}><FaHeart /></button>
                                </div>
                                <p className="post-text-content">{post.contenido}</p>
                                {post.foto && <div className="contenedor-imagen-post-main"><img src={post.foto} alt="post" /></div>}
                                <div className="post-footer-actions">
                                    <button className={`action-btn-social ${likes[post._id] ? 'liked' : ''}`} onClick={() => toggleLike(post._id)}><FaThumbsUp /> Me gusta</button>
                                    <button className="action-btn-social"><FaComment /> Comentar</button>
                                    <button className="action-btn-social"><FaShare /> Compartir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="grupos-page">
            <div className="grupos-header-top">
                <div className="header-left-side">
                    <button className="btn-back-main-page" onClick={() => window.history.back()}>
                        <FaArrowLeft />
                    </button>
                    <h2 className="texto-negro">Comunidades</h2>
                </div>
                <button className="btn-crear-grupo" onClick={() => setIsModalOpen(true)}><FaPlus /> Crear Grupo</button>
            </div>
            
            <div className="search-bar-pure-white">
                <FaSearch className="icon-s" />
                <input type="text" placeholder="Buscar grupos..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
            </div>
            <div className="tabs-vibe">
                <button className={pestana === "todos" ? "active" : ""} onClick={() => setPestana("todos")}>Todos los grupos</button>
                <button className={pestana === "mis-grupos" ? "active" : ""} onClick={() => setPestana("mis-grupos")}>Mis grupos</button>
            </div>
            <div className="grupos-grid-moderno">
                {grupos.filter(g => g.nombre?.toLowerCase().includes(filtro.toLowerCase())).map(grupo => (
                    <div key={grupo._id} className="grupo-card-row">
                        <div className="grupo-card-top-content">
                            <img src={grupo.imagen || "https://via.placeholder.com/150"} className="grupo-img-mini-square" alt={grupo.nombre} />
                            <div className="grupo-textos-info">
                                <h3 className="grupo-nombre-bold">{grupo.nombre}</h3>
                                <p className="ultima-visita">Tu última visita: hace poco</p>
                            </div>
                        </div>
                        <div className="grupo-card-actions-row">
                            {grupo.miembrosArray?.includes(userEmail) ? (
                                <button className="btn-ver-grupo-vibe-blue" onClick={() => entrarAGrupo(grupo)}>Ver grupo</button>
                            ) : (
                                <button className="btn-ver-grupo-vibe-blue" onClick={() => handleUnirseGrupo(grupo)}>Unirse</button>
                            )}
                            
                            <div className="contenedor-opciones-grupo">
                                <button className="btn-dots-gray" onClick={(e) => handleToggleMenu(e, grupo._id)}><FaEllipsisH /></button>
                                {menuAbiertoId === grupo._id && (
                                    <div className="dropdown-fb-style">
                                        <div className="arrow-up-fb"></div>
                                        <button className="fb-item"><FaRegFileAlt className="fb-icon" /> Tu contenido</button>
                                        <button className="fb-item justify"><span><FaShare className="fb-icon" /> Compartir</span><FaChevronRight className="fb-arrow" /></button>
                                        {grupo.creadorEmail === userEmail ? (
                                            <button className="fb-item" onClick={() => handleEliminarGrupo(grupo._id)}>
                                                <FaTrash className="fb-icon" style={{color: 'red'}} /> Eliminar Grupo
                                            </button>
                                        ) : grupo.miembrosArray?.includes(userEmail) ? (
                                            <button className="fb-item item-danger" onClick={() => handleAbandonarGrupo(grupo._id)}>
                                                <FaSignOutAlt className="fb-icon" /> Abandonar grupo
                                            </button>
                                        ) : null}
                                        <button className="fb-item"><FaBell className="fb-icon" /> Notificaciones</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE CREACIÓN */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="vibe-modal-container">
                        <div className="vibe-modal-header">
                            <button className="vibe-close-circle" onClick={() => setIsModalOpen(false)}>
                                <FaTimes />
                            </button>
                            <h3 className="vibe-modal-title-main">Nuevo Grupo</h3>
                        </div>
                        <form onSubmit={handleCrearGrupo}>
                            <div className="vibe-modal-content-body">
                                <div className="vibe-input-wrapper">
                                    <input 
                                        type="text" 
                                        className="vibe-input-field" 
                                        placeholder="Nombre de la comunidad" 
                                        required
                                        value={nuevoGrupo.nombre} 
                                        onChange={(e) => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})} 
                                    />
                                </div>
                                <div className="vibe-upload-box" onClick={() => fileInputRef.current.click()}>
                                    {nuevoGrupo.imagen ? (
                                        <img src={nuevoGrupo.imagen} className="vibe-img-fit" alt="preview" />
                                    ) : (
                                        <div className="vibe-upload-placeholder">
                                            <FaCamera className="vibe-camera-icon" />
                                            <p>Subir foto de portada</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'grupo')} />
                            </div>
                            <div className="vibe-modal-footer">
                                <button type="submit" className="vibe-btn-primary-full" disabled={loading}>
                                    {loading ? "Cargando..." : "Crear Comunidad"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SEGUNDO MODAL: AJUSTAR AVATAR (ESTILO CAPTURA) */}
            {imageToCrop && (
                <div className="modal-overlay cropper-overlay">
                    <div className="vibe-modal-container cropper-modal">
                        <div className="cropper-header">
                            <h3 className="vibe-modal-title-main">Ajustar Avatar</h3>
                        </div>
                        
                        <div className="cropper-body">
                            <div className="crop-area-container">
                                <Cropper
                                    image={imageToCrop}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={16 / 9}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={onCropComplete}
                                    cropShape="rect" // o "round" según prefieras
                                    showGrid={true}
                                />
                            </div>

                            <div className="cropper-controls-vibe">
                                <div className="control-group">
                                    <label>Zoom: {zoom.toFixed(1)}</label>
                                    <input 
                                        type="range" 
                                        min={1} max={3} step={0.1} 
                                        value={zoom} 
                                        onChange={(e) => setZoom(parseFloat(e.target.value))} 
                                    />
                                </div>
                                <div className="control-group">
                                    <label>Rotación: {rotation}°</label>
                                    <input 
                                        type="range" 
                                        min={0} max={360} step={1} 
                                        value={rotation} 
                                        onChange={(e) => setRotation(parseInt(e.target.value))} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="cropper-footer">
                            <button className="btn-cancel-vibe" onClick={() => setImageToCrop(null)}>Cancelar</button>
                            <button className="btn-confirm-vibe" onClick={handleConfirmCrop}>Recortar y Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Grupos;
