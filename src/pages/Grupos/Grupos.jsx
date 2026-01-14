import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { 
    FaPlus, FaArrowLeft, FaPaperPlane, 
    FaCamera, FaThumbsUp, FaComment, FaSearch, FaTimes, FaEllipsisH, FaShare, 
    FaHeart, FaBell, FaRegFileAlt, FaChevronRight, FaThumbtack, FaExclamationCircle, 
    FaSignOutAlt, FaTrash, FaRegBookmark, FaBookmark, FaGlobeAmericas, FaRegImage, FaUserFriends,
    FaUserCircle
} from 'react-icons/fa';
import './Grupos.css';

const API_URL = "https://controversial-jacquette-vibe-u-d09f766e.koyeb.app/api/grupos";

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
    const [guardados, setGuardados] = useState({});

    const fileInputRef = useRef(null);
    const postFotoRef = useRef(null);
    const bannerInputRef = useRef(null);
    const perfilInputRef = useRef(null);

    const userEmail = localStorage.getItem("correo");
    const userName = localStorage.getItem("nombre") || "Usuario";
    
    // OBTENEMOS LA FOTO (Usamos 'avatar' para que coincida con tu modelo de Mongoose)
    const userPhoto = localStorage.getItem("avatar");

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
            setImageToCrop(null); 
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
    const toggleGuardar = (postId) => setGuardados(prev => ({ ...prev, [postId]: !prev[postId] }));

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
                body: JSON.stringify({ 
                    autor: userName, 
                    autorFoto: userPhoto, 
                    contenido: nuevoPost, 
                    foto: fotoPost 
                })
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

    // --- RENDERIZADO DEL MURO ACTIVO ---
    if (grupoActivo) {
        const grupoData = grupos.find(g => g._id === grupoActivo._id) || grupoActivo;
        return (
            <div className="fb-layout">
                <div className="fb-header-container">
                    <div className="fb-cover-photo" style={{ backgroundImage: `url(${grupoData.imagen})` }}>
                        <button className="fb-back-btn" onClick={salirDeGrupo}><FaArrowLeft /></button>
                        <button className="fb-edit-cover" onClick={() => bannerInputRef.current.click()}><FaCamera /> Editar portada</button>
                        <input type="file" ref={bannerInputRef} style={{display:'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'banner-update')} />
                    </div>
                    
                    <div className="fb-profile-nav">
                        <div className="fb-avatar-section">
                            <div className="fb-avatar-wrapper">
                                <img src={grupoData.imagen || "https://via.placeholder.com/150"} alt="avatar" className="fb-main-avatar" />
                                <button className="fb-avatar-cam-btn" onClick={() => perfilInputRef.current.click()}><FaCamera /></button>
                                <input type="file" ref={perfilInputRef} style={{display:'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'perfil-update')} />
                            </div>
                            <div className="fb-name-stats">
                                <h1 style={{color: '#000'}}>{grupoData.nombre}</h1>
                                <p style={{color: '#333'}}><FaGlobeAmericas /> Grupo Público · <b>{grupoData.miembrosArray?.length || 1} miembros</b></p>
                            </div>
                            <div className="fb-header-btns">
                                <button className="btn-fb-blue"><FaPlus /> Invitar</button>
                                <button className="btn-fb-gray"><FaUserFriends /> Miembro</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fb-body-grid single-column">
                    <main className="fb-feed-center">
                        <div className="fb-card-white publish-area">
                            <div className="publish-input-row">
                                {userPhoto ? (
                                    <img 
                                        src={userPhoto} 
                                        className="mini-avatar-fb" 
                                        alt="perfil" 
                                        onError={(e) => { e.target.style.display = 'none'; }} 
                                    />
                                ) : null}
                                {(!userPhoto) && <FaUserCircle size={40} color="#ccc" className="mini-avatar-fb" />}

                                <input 
                                    style={{color: '#000'}}
                                    placeholder={`¿Qué compartes hoy, ${userName}?`} 
                                    value={nuevoPost}
                                    onChange={(e) => setNuevoPost(e.target.value)}
                                />
                            </div>
                            {fotoPost && (
                                <div className="fb-post-preview-container">
                                    <img src={fotoPost} alt="preview" className="fb-img-previa" />
                                    <button className="fb-remove-preview" onClick={() => setFotoPost(null)}><FaTimes /></button>
                                </div>
                            )}
                            <div className="publish-footer-fb">
                                <button onClick={() => postFotoRef.current.click()}><FaRegImage color="#45bd62" /> Foto/video</button>
                                <button onClick={handlePublicar} disabled={loading} className="btn-send-fb">Publicar</button>
                                <input type="file" ref={postFotoRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'post')} />
                            </div>
                        </div>

                        {grupoData.posts?.map(post => (
                            <div key={post._id} className="fb-card-white post-container">
                                <div className="post-top-header">
                                    {post.autorFoto ? (
                                        <img src={post.autorFoto} className="mini-avatar-fb" alt="autor" />
                                    ) : (post.autor === userName && userPhoto) ? (
                                        <img src={userPhoto} className="mini-avatar-fb" alt="yo" />
                                    ) : (
                                        <FaUserCircle size={40} color="#ccc" className="mini-avatar-fb" />
                                    )}

                                    <div className="post-user-meta">
                                        <span className="author-fb" style={{color: '#000'}}>{post.autor}</span>
                                        <span className="time-fb" style={{color: '#65676b'}}>Hace un momento · <FaGlobeAmericas /></span>
                                    </div>
                                    <div className="post-actions-right">
                                        <button 
                                            className={`btn-save-post ${guardados[post._id] ? 'active' : ''}`}
                                            onClick={() => toggleGuardar(post._id)}
                                        >
                                            {guardados[post._id] ? <FaBookmark /> : <FaRegBookmark />}
                                        </button>
                                        <button className="btn-fb-options" onClick={(e) => handleToggleMenu(e, post._id)}><FaEllipsisH /></button>
                                    </div>
                                </div>

                                <div className="post-body-text" style={{color: '#000'}}>{post.contenido}</div>

                                {post.foto && (
                                    <div className="post-image-main">
                                        <img src={post.foto} className="img-full-post" alt="post" />
                                    </div>
                                )}

                                <div className="post-action-buttons-fb">
                                    <button onClick={() => toggleLike(post._id)} className={likes[post._id] ? "liked" : ""} style={{color: '#65676b'}}>
                                        <FaThumbsUp /> Me gusta
                                    </button>
                                    <button style={{color: '#65676b'}}><FaComment /> Comentar</button>
                                    <button style={{color: '#65676b'}}><FaShare /> Compartir</button>
                                </div>
                            </div>
                        ))}
                    </main>
                </div>
            </div>
        );
    }

    // --- VISTA LISTA DE GRUPOS ---
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
                                <h3 className="grupo-nombre-bold" style={{color: '#000'}}>{grupo.nombre}</h3>
                                <p className="ultima-visita" style={{color: '#65676b'}}>Tu última visita: hace poco</p>
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
                            <h3 className="vibe-modal-title-main" style={{color: '#000'}}>Nuevo Grupo</h3>
                        </div>
                        <form onSubmit={handleCrearGrupo}>
                            <div className="vibe-modal-content-body">
                                <div className="vibe-input-wrapper">
                                    <input 
                                        type="text" 
                                        className="vibe-input-field" 
                                        placeholder="Nombre de la comunidad" 
                                        required
                                        style={{color: '#000'}}
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
                                            <p style={{color: '#65676b'}}>Subir foto de portada</p>
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

            {/* MODAL CROPPER */}
            {imageToCrop && (
                <div className="modal-overlay cropper-overlay">
                    <div className="vibe-modal-container cropper-modal">
                        <div className="cropper-header">
                            <h3 className="vibe-modal-title-main" style={{color: '#000'}}>Ajustar Avatar</h3>
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
                                    showGrid={true}
                                />
                            </div>
                            <div className="cropper-controls-vibe">
                                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
                                <input type="range" min={0} max={360} step={1} value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} />
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
