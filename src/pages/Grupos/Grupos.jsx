import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import axios from 'axios';
import { 
    FaPlus, FaArrowLeft, FaCamera, FaThumbsUp, FaComment, FaSearch, FaTimes, FaEllipsisH, FaShare, 
    FaGlobeAmericas, FaRegImage, FaUserFriends, FaUserCircle, FaTrash, FaSignOutAlt, FaRegFileAlt,
    FaRegBookmark, FaBookmark, FaPaperPlane
} from 'react-icons/fa';
import './Grupos.css';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/grupos`;

const Grupos = () => {
    // --- ESTADOS DE DATOS ---
    const [grupos, setGrupos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [pestana, setPestana] = useState("todos");
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- ESTADO DEL USUARIO ---
    const [userName, setUserName] = useState("Usuario");
    const [userRole, setUserRole] = useState(""); 
    const [avatar, setAvatar] = useState(null);
    const userEmail = localStorage.getItem("correo");

    // --- ESTADOS DE NAVEGACIÓN Y POSTS ---
    const [grupoActivo, setGrupoActivo] = useState(() => {
        const persistido = localStorage.getItem("ultimoGrupoVisitado");
        return persistido ? JSON.parse(persistido) : null;
    });
    const [nuevoPost, setNuevoPost] = useState("");
    const [fotoPost, setFotoPost] = useState(null);
    const [likes, setLikes] = useState({});
    const [guardados, setGuardados] = useState({});

    // --- ESTADOS DE COMENTARIOS (AUMENTADOS) ---
    const [comentarioTexto, setComentarioTexto] = useState({});
    const [comentariosAbiertos, setComentariosAbiertos] = useState({});

    // --- ESTADOS DE CREACIÓN Y RECORTE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nuevoGrupo, setNuevoGrupo] = useState({ nombre: "", imagen: "" });
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const fileInputRef = useRef(null);
    const postFotoRef = useRef(null);

    // --- LÓGICA DE DESPLIEGUE ---
    const toggleComentarios = (postId) => {
        setComentariosAbiertos(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // --- 1. CARGAR PERFIL ---
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/perfil`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data?.nombre) setUserName(response.data.nombre);
                if (response.data?.avatar) setAvatar(response.data.avatar);
                if (response.data?.rol) setUserRole(response.data.rol);
            } catch (error) {
                console.error("Error al obtener el perfil:", error);
            }
        };
        fetchUserInfo();
    }, []);

    // --- 2. CARGAR GRUPOS ---
    const cargarGrupos = async () => {
        try {
            const res = await fetch(`${API_URL}/listar`);
            const data = await res.json();
            setGrupos(data);
        } catch (error) { console.error("Error al cargar grupos:", error); }
    };

    useEffect(() => { cargarGrupos(); }, []);

    // --- 3. PERSISTENCIA ---
    useEffect(() => {
        if (grupoActivo) {
            localStorage.setItem("ultimoGrupoVisitado", JSON.stringify(grupoActivo));
        } else {
            localStorage.removeItem("ultimoGrupoVisitado");
        }
    }, [grupoActivo]);

    // --- 4. LÓGICA DE RECORTE ---
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
            ctx.drawImage(
                image,
                croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
                0, 0, croppedAreaPixels.width, croppedAreaPixels.height
            );
            setNuevoGrupo({ ...nuevoGrupo, imagen: canvas.toDataURL('image/jpeg') });
            setImageToCrop(null); 
        } catch (e) { console.error("Error al recortar", e); }
    };

    // --- 5. ACCIONES DE GRUPO ---
    const handleUnirseGrupo = async (grupo) => {
        try {
            const res = await fetch(`${API_URL}/${grupo._id}/unirse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: userEmail })
            });
            if (res.ok) { cargarGrupos(); }
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
            if (res.ok) { cargarGrupos(); setGrupoActivo(null); }
        } catch (error) { console.error(error); }
    };

    const handleEliminarGrupo = async (id) => {
        if (!window.confirm("¿Eliminar este grupo definitivamente?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) { cargarGrupos(); setGrupoActivo(null); }
        } catch (error) { console.error(error); }
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
            const data = await res.json();
            setGrupos([data, ...grupos]);
            setIsModalOpen(false);
            setNuevoGrupo({ nombre: "", imagen: "" });
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    // --- 6. PUBLICACIONES Y COMENTARIOS (AUMENTADO) ---
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
                    autorFoto: avatar,
                    autorEmail: userEmail,
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

    const handleComentar = async (e, postId) => {
        e.preventDefault();
        const texto = comentarioTexto[postId];
        if (!texto?.trim()) return;

        try {
            const res = await fetch(`${API_URL}/${grupoActivo._id}/post/${postId}/comentar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    autor: userName,
                    autorFoto: avatar,
                    autorEmail: userEmail,
                    contenido: texto
                })
            });

            if (res.ok) {
                const nuevoComentario = await res.json();
                setGrupos(prev => prev.map(g => {
                    if (g._id === grupoActivo._id) {
                        return {
                            ...g,
                            posts: g.posts.map(p => 
                                p._id === postId ? { ...p, comentarios: [...(p.comentarios || []), nuevoComentario] } : p
                            )
                        };
                    }
                    return g;
                }));
                setComentarioTexto(prev => ({ ...prev, [postId]: "" }));
            }
        } catch (error) {
            console.error("Error al comentar:", error);
        }
    };

    const handleImagePreview = (e, destino) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (destino === 'grupo') setImageToCrop(reader.result);
            else if (destino === 'post') setFotoPost(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const entrarAGrupo = (grupo) => setGrupoActivo(grupo);
    const salirDeGrupo = () => setGrupoActivo(null);
    const toggleLike = (postId) => setLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
    const toggleGuardar = (postId) => setGuardados(prev => ({ ...prev, [postId]: !prev[postId] }));

    // --- RENDER MURO (GRUPO ACTIVO) ---
    if (grupoActivo) {
        const grupoData = grupos.find(g => g._id === grupoActivo._id) || grupoActivo;
        return (
            <div className="fb-layout">
                <div className="fb-header-container">
                    <div className="fb-cover-photo" style={{ backgroundImage: `url(${grupoData.imagen})` }}>
                        <button className="fb-back-btn" onClick={salirDeGrupo}><FaArrowLeft /></button>
                        <button className="fb-edit-cover"><FaCamera /> Editar</button>
                    </div>
                    <div className="fb-profile-nav">
                        <div className="fb-avatar-section">
                            <div className="fb-avatar-wrapper" style={{ width: '168px', height: '168px', minWidth: '168px', minHeight: '168px', borderRadius: '50%', border: '4px solid white', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                                <img src={grupoData.imagen || "https://via.placeholder.com/150"} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="fb-name-stats">
                                <h1 style={{color: '#000', margin: '0'}}>{grupoData.nombre}</h1>
                                <p style={{color: '#65676b', margin: '5px 0'}}><FaGlobeAmericas /> Grupo Público · <b>{grupoData.miembrosArray?.length || 1} miembros</b></p>
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
                                <div className="avatar-circle-wrapper">
                                    {avatar ? <img src={avatar} className="mini-avatar-fb" alt="yo" /> : <FaUserCircle size={40} color="#ccc" className="mini-avatar-fb" />}
                                </div>
                                <input style={{color: '#000'}} placeholder={`¿Qué compartes hoy, ${userName}?`} value={nuevoPost} onChange={(e) => setNuevoPost(e.target.value)} />
                            </div>
                            
                            {fotoPost && (
                                <div className="fb-post-preview-container" style={{ margin: '10px 15px', position: 'relative', width: 'fit-content' }}>
                                    <img src={fotoPost} alt="preview" style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', display: 'block', border: '1px solid #ddd' }} />
                                    <button className="fb-remove-preview" onClick={() => setFotoPost(null)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#f02849', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
                                </div>
                            )}

                            <div className="publish-footer-fb">
                                <button onClick={() => postFotoRef.current.click()}><FaRegImage color="#45bd62" /> Foto/video</button>
                                <button onClick={handlePublicar} disabled={loading} className="btn-send-fb">Publicar</button>
                                <input type="file" ref={postFotoRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'post')} />
                            </div>
                        </div>

                        {grupoData.posts?.map(post => {
                            const esMiPost = post.autorEmail === userEmail || post.autor === userName;
                            const estaAbierto = comentariosAbiertos[post._id];

                            return (
                                <div key={post._id} className="fb-card-white post-container">
                                    <div className="post-top-header">
                                        <div className="mini-avatar-fb avatar-circle-wrapper">
                                            {esMiPost ? (avatar ? <img src={avatar} alt="yo" className="round-img" /> : <FaUserCircle size={40} color="#ccc" />) : (post.autorFoto ? <img src={post.autorFoto} alt="autor" className="round-img" /> : <FaUserCircle size={40} color="#ccc" />)}
                                        </div>
                                        <div className="post-user-meta">
                                            <span className="author-fb" style={{color: '#000'}}>{esMiPost ? userName : (post.autor || "Usuario")}</span>
                                            <span className="time-fb" style={{color: '#65676b'}}>Ahora · <FaGlobeAmericas /></span>
                                        </div>
                                        <div className="post-actions-right">
                                            <button className={`btn-save-post ${guardados[post._id] ? 'active' : ''}`} onClick={() => toggleGuardar(post._id)}>{guardados[post._id] ? <FaBookmark /> : <FaRegBookmark />}</button>
                                            <button className="btn-fb-options" onClick={() => setMenuAbiertoId(menuAbiertoId === post._id ? null : post._id)}><FaEllipsisH /></button>
                                        </div>
                                    </div>
                                    <div className="post-body-text" style={{color: '#000', padding: '10px 15px'}}>{post.contenido}</div>
                                    {post.foto && <div className="post-image-main"><img src={post.foto} className="img-full-post" alt="post" /></div>}
                                    
                                    <div className="post-action-buttons-fb">
                                        <button onClick={() => toggleLike(post._id)} className={likes[post._id] ? "liked" : ""} style={{color: '#65676b'}}>
                                            <FaThumbsUp /> Me gusta
                                        </button>
                                        
                                        <button onClick={() => toggleComentarios(post._id)} style={{color: '#65676b'}}>
                                            <FaComment /> Comentar
                                        </button>
                                        
                                        <button style={{color: '#65676b'}}><FaShare /> Compartir</button>
                                    </div>

                                    {/* SECCIÓN DE COMENTARIOS CON DESPLIEGUE Y BOTÓN DE ENVIAR A LA DERECHA */}
                                    {estaAbierto && (
                                        <div className="fb-comments-section">
                                            {post.comentarios?.map((com, index) => (
                                                <div key={index} className="comment-item">
                                                    <img src={com.autorFoto || "https://via.placeholder.com/32"} alt="avatar" className="comment-mini-avatar" />
                                                    <div className="comment-bubble">
                                                        <span className="comment-author-name">{com.autor}</span>
                                                        <span className="comment-text">{com.contenido}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <form onSubmit={(e) => handleComentar(e, post._id)} className="comment-input-wrapper">
                                                <div className="avatar-circle-wrapper">
                                                    {avatar ? <img src={avatar} className="comment-mini-avatar" alt="yo" /> : <FaUserCircle size={32} color="#ccc" />}
                                                </div>
                                                <div className="comment-input-container-with-btn">
                                                    <input 
                                                        placeholder="Escribe un comentario..." 
                                                        className="comment-input-field"
                                                        value={comentarioTexto[post._id] || ""}
                                                        onChange={(e) => setComentarioTexto({...comentarioTexto, [post._id]: e.target.value})}
                                                    />
                                                    <button type="submit" className="btn-send-comment-icon" disabled={!comentarioTexto[post._id]?.trim()}>
                                                        <FaPaperPlane />
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </main>
                </div>
            </div>
        );
    }

    // --- RENDER LISTA DE GRUPOS ---
    return (
        <section className="grupos-page">
            <div className="grupos-header-top">
                <div className="header-left-side">
                    <button className="btn-back-main-page" onClick={() => window.history.back()}><FaArrowLeft /></button>
                    <h2 style={{color: '#000'}}>Comunidades</h2>
                </div>
                <button className="btn-crear-grupo" onClick={() => setIsModalOpen(true)}><FaPlus /> Crear Grupo</button>
            </div>
            
            <div className="search-bar-pure-white">
                <FaSearch className="icon-s" />
                <input type="text" placeholder="Buscar grupos..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
            </div>

            <div className="tabs-vibe">
                <button className={pestana === "todos" ? "active" : ""} onClick={() => setPestana("todos")}>Todos</button>
                <button className={pestana === "mis-grupos" ? "active" : ""} onClick={() => setPestana("mis-grupos")}>Mis Grupos</button>
            </div>

            <div className="grupos-grid-moderno">
                {grupos
                .filter(g => {
                    const match = g.nombre?.toLowerCase().includes(filtro.toLowerCase());
                    return pestana === "mis-grupos" ? (match && g.miembrosArray?.includes(userEmail)) : match;
                })
                .map(grupo => {
                    const esCreador = grupo.creadorEmail === userEmail;
                    const esMiembro = grupo.miembrosArray?.includes(userEmail);
                    const esAdminGlobal = userRole === "administrador" || userRole === "administradores";

                    return (
                        <div key={grupo._id} className="grupo-card-row">
                            <div className="grupo-card-top-content" onClick={() => entrarAGrupo(grupo)}>
                                <img src={grupo.imagen || "https://via.placeholder.com/150"} className="grupo-img-mini-square" alt={grupo.nombre} />
                                <div className="grupo-textos-info">
                                    <h3 className="grupo-nombre-bold" style={{color: '#000'}}>{grupo.nombre}</h3>
                                    <p style={{color: '#65676b'}}>{grupo.miembrosArray?.length || 1} miembros</p>
                                </div>
                            </div>
                            <div className="grupo-card-actions-row">
                                {!esMiembro ? (
                                    <button className="btn-ver-grupo-vibe-blue" onClick={() => handleUnirseGrupo(grupo)}>Unirse</button>
                                ) : (
                                    <button className="btn-ver-grupo-vibe-blue" onClick={() => entrarAGrupo(grupo)}>Ver</button>
                                )}
                                
                                <div style={{ position: 'relative' }}>
                                    <button className="btn-dots-gray" onClick={() => setMenuAbiertoId(menuAbiertoId === grupo._id ? null : grupo._id)}><FaEllipsisH /></button>
                                    {menuAbiertoId === grupo._id && (
                                        <div className="dropdown-fb-style" style={{ display: 'block' }}>
                                            {(esCreador || esAdminGlobal) ? (
                                                <button onClick={() => handleEliminarGrupo(grupo._id)} style={{color: 'red'}}><FaTrash /> Eliminar Grupo</button>
                                            ) : (
                                                esMiembro ? (
                                                    <button onClick={() => handleAbandonarGrupo(grupo._id)}><FaSignOutAlt /> Abandonar Grupo</button>
                                                ) : (
                                                    <button onClick={() => handleUnirseGrupo(grupo)}><FaPlus /> Unirse</button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- MODAL CREAR --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="vibe-modal-container">
                        <div className="vibe-modal-header">
                            <button className="vibe-close-circle" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                            <h3 style={{color: '#000'}}>Nuevo Grupo</h3>
                        </div>
                        <form onSubmit={handleCrearGrupo}>
                            <div className="vibe-modal-content-body">
                                <input className="vibe-input-field" placeholder="Nombre del grupo" required value={nuevoGrupo.nombre} onChange={(e) => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})} />
                                <div className="vibe-upload-box" onClick={() => fileInputRef.current.click()}>
                                    {nuevoGrupo.imagen ? <img src={nuevoGrupo.imagen} className="vibe-img-fit" alt="preview" /> : <p>Subir foto de portada</p>}
                                </div>
                                <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'grupo')} />
                            </div>
                            <div className="vibe-modal-footer">
                                <button type="submit" className="vibe-btn-primary-full">{loading ? "Creando..." : "Crear Grupo"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL CROPPER --- */}
            {imageToCrop && (
                <div className="modal-overlay cropper-overlay">
                    <div className="vibe-modal-container cropper-modal">
                        <div className="crop-area-container">
                            <Cropper image={imageToCrop} crop={crop} zoom={zoom} rotation={rotation} aspect={16 / 9} onCropChange={setCrop} onZoomChange={setZoom} onRotationChange={setRotation} onCropComplete={onCropComplete} />
                        </div>
                        <div className="cropper-footer">
                            <button onClick={() => setImageToCrop(null)}>Cancelar</button>
                            <button className="btn-confirm-vibe" onClick={handleConfirmCrop}>Cortar y Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Grupos;
