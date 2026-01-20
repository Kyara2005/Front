import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import axios from 'axios';
import { 
    FaPlus, FaArrowLeft, FaCamera, FaThumbsUp, FaComment, FaSearch, FaTimes, FaEllipsisH, FaShare, 
    FaGlobeAmericas, FaRegImage, FaUserFriends, FaUserCircle, FaTrash, FaSignOutAlt, FaRegFileAlt,
    FaRegBookmark, FaBookmark, FaPaperPlane
} from 'react-icons/fa';
import './Grupos.css';

const API_URL = "https://controversial-jacquette-vibe-u-d09f766e.koyeb.app/api/grupos";

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

    // --- ESTADOS DE COMENTARIOS ---
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

    // --- 1. CARGAR PERFIL ---
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get(
                    `https://controversial-jacquette-vibe-u-d09f766e.koyeb.app/api/usuarios/perfil`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data?.nombre) setUserName(response.data.nombre);
                if (response.data?.avatar) setAvatar(response.data.avatar);
                if (response.data?.rol) setUserRole(response.data.rol);
            } catch (error) { console.error("Error perfil:", error); }
        };
        fetchUserInfo();
    }, []);

    // --- 2. CARGAR GRUPOS ---
    const cargarGrupos = async () => {
        try {
            const res = await fetch(`${API_URL}/listar`);
            const data = await res.json();
            setGrupos(data);
        } catch (error) { console.error("Error grupos:", error); }
    };

    useEffect(() => { cargarGrupos(); }, []);

    // --- 3. PERSISTENCIA ---
    useEffect(() => {
        if (grupoActivo) localStorage.setItem("ultimoGrupoVisitado", JSON.stringify(grupoActivo));
        else localStorage.removeItem("ultimoGrupoVisitado");
    }, [grupoActivo]);

    // --- 4. LÓGICA DE COMENTARIOS ---
    const toggleComentarios = (postId) => {
        setComentariosAbiertos(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleComentar = async (e, postId) => {
        if (e) e.preventDefault(); 
        const texto = comentarioTexto[postId];
        if (!texto || !texto.trim()) return;

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
                setGrupos(prevGrupos => prevGrupos.map(g => {
                    if (g._id === grupoActivo._id) {
                        return {
                            ...g,
                            posts: g.posts.map(p => 
                                p._id === postId 
                                ? { ...p, comentarios: [...(p.comentarios || []), nuevoComentario] } 
                                : p
                            )
                        };
                    }
                    return g;
                }));
                setComentarioTexto(prev => ({ ...prev, [postId]: "" }));
            }
        } catch (error) { console.error("Error comentar:", error); }
    };

    // --- 5. LÓGICA DE RECORTE ---
    const onCropComplete = useCallback((_ , pixels) => { setCroppedAreaPixels(pixels); }, []);
    
    const handleConfirmCrop = async () => {
        try {
            const image = new Image();
            image.src = imageToCrop;
            await image.decode();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
            setNuevoGrupo({ ...nuevoGrupo, imagen: canvas.toDataURL('image/jpeg') });
            setImageToCrop(null); 
        } catch (e) { console.error("Error recorte", e); }
    };

    // --- 6. ACCIONES DE GRUPO ---
    const handleUnirseGrupo = async (grupo) => {
        try {
            const res = await fetch(`${API_URL}/${grupo._id}/unirse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: userEmail })
            });
            if (res.ok) cargarGrupos();
        } catch (error) { console.error(error); }
    };

    const handleEliminarGrupo = async (id) => {
        if (!window.confirm("¿Eliminar definitivamente este grupo?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                cargarGrupos();
                setGrupoActivo(null);
            }
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

    // --- 7. PUBLICACIONES ---
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
            setGrupos(prev => prev.map(g => 
                g._id === grupoActivo._id ? { ...g, posts: [postGuardado, ...g.posts] } : g
            ));
            setNuevoPost("");
            setFotoPost(null);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
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

    // --- RENDER MURO ---
    if (grupoActivo) {
        const grupoData = grupos.find(g => g._id === grupoActivo._id) || grupoActivo;
        return (
            <div className="fb-layout">
                <div className="fb-header-container">
                    <div className="fb-cover-photo" style={{ backgroundImage: `url(${grupoData.imagen})` }}>
                        <button className="fb-back-btn" onClick={salirDeGrupo}><FaArrowLeft /></button>
                        <button className="fb-edit-cover"><FaCamera /> Editar Portada</button>
                    </div>
                    <div className="fb-profile-nav">
                        <div className="fb-avatar-section">
                            <div className="fb-avatar-wrapper" style={{ width: '168px', height: '168px', borderRadius: '50%', border: '4px solid white', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={grupoData.imagen || "https://via.placeholder.com/150"} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="fb-name-stats">
                                <h1 style={{color: '#000', margin: '0'}}>{grupoData.nombre}</h1>
                                <p style={{color: '#65676b'}}><FaGlobeAmericas /> Grupo Público · <b>{grupoData.miembrosArray?.length || 1} miembros</b></p>
                            </div>
                            <div className="fb-header-btns">
                                <button className="btn-fb-blue"><FaPlus /> Invitar</button>
                                <button className="btn-fb-gray"><FaUserFriends /> Miembro</button>
                                {userRole === "admin" && (
                                    <button className="btn-fb-gray" onClick={() => handleEliminarGrupo(grupoData._id)}><FaTrash color="red" /></button>
                                )}
                            </div>
                        </div>
                        <div className="fb-nav-tabs">
                            <button className="active">Publicaciones</button>
                            <button>Información</button>
                            <button>Miembros</button>
                            <button>Eventos</button>
                        </div>
                    </div>
                </div>

                <div className="fb-body-grid">
                    <aside className="fb-sidebar-left">
                        <div className="fb-card-white">
                            <h3 style={{color: '#000'}}>Información</h3>
                            <p style={{color: '#000'}}>Bienvenido al grupo oficial de {grupoData.nombre}.</p>
                            <button className="btn-sidebar-full">Ver todo</button>
                        </div>
                    </aside>

                    <main className="fb-feed-center">
                        <div className="fb-card-white publish-area">
                            <div className="publish-input-row">
                                <img src={avatar || "https://via.placeholder.com/40"} className="mini-avatar-fb" alt="yo" />
                                <input style={{color: '#000'}} placeholder={`¿Qué piensas, ${userName}?`} value={nuevoPost} onChange={(e) => setNuevoPost(e.target.value)} />
                            </div>
                            {fotoPost && <div className="fb-post-preview-container"><img src={fotoPost} alt="p" /><button onClick={() => setFotoPost(null)}><FaTimes /></button></div>}
                            <div className="publish-footer-fb">
                                <button onClick={() => postFotoRef.current.click()}><FaRegImage color="#45bd62" /> Foto/video</button>
                                <button><FaUserFriends color="#1877f2" /> Etiquetar</button>
                                <button onClick={handlePublicar} className="btn-send-fb">Publicar</button>
                                <input type="file" ref={postFotoRef} style={{display:'none'}} onChange={(e) => handleImagePreview(e, 'post')} />
                            </div>
                        </div>

                        {grupoData.posts?.map(post => (
                            <div key={post._id} className="fb-card-white post-container">
                                <div className="post-top-header">
                                    <div className="post-info-left">
                                        <img src={post.autorFoto || "https://via.placeholder.com/40"} className="mini-avatar-fb" alt="a" />
                                        <div className="post-user-meta">
                                            <span className="author-fb" style={{color: '#000'}}>{post.autor}</span>
                                            <span className="time-fb">Ahora · <FaGlobeAmericas /></span>
                                        </div>
                                    </div>
                                    <FaEllipsisH color="#65676b" />
                                </div>
                                
                                {/* AUMENTO: PADDING PARA QUE NO PEGUE AL MARGEN */}
                                <div className="post-body-text" style={{color: '#000', padding: '0 20px', marginBottom: '10px'}}>
                                    {post.contenido}
                                </div>

                                {post.foto && <img src={post.foto} className="img-full-post" alt="p" />}
                                
                                <div className="post-stats-fb" style={{color: '#65676b'}}>
                                    <span><FaThumbsUp color="#1877f2" /> {likes[post._id] ? 1 : 0}</span>
                                    <span>{post.comentarios?.length || 0} comentarios</span>
                                </div>

                                <div className="post-action-buttons-fb">
                                    <button onClick={() => toggleLike(post._id)} className={likes[post._id] ? "liked" : ""}><FaThumbsUp /> Me gusta</button>
                                    <button onClick={() => toggleComentarios(post._id)}><FaComment /> Comentar</button>
                                    <button onClick={() => toggleGuardar(post._id)} className={guardados[post._id] ? "saved" : ""}>
                                        {guardados[post._id] ? <FaBookmark /> : <FaRegBookmark />} Guardar
                                    </button>
                                    <button><FaShare /> Compartir</button>
                                </div>

                                {comentariosAbiertos[post._id] && (
                                    <div className="fb-comments-section">
                                        {post.comentarios?.map((com, i) => (
                                            <div key={i} className="comment-item">
                                                <img src={com.autorFoto || "https://via.placeholder.com/32"} className="comment-mini-avatar" alt="c" />
                                                <div className="comment-bubble">
                                                    <div className="comment-author-name" style={{color: '#000'}}>{com.autor}</div>
                                                    {/* AUMENTO: SANGRÍA DE 50PX */}
                                                    <div className="comment-text" style={{color: '#000', marginLeft: '50px'}}>{com.contenido}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <form onSubmit={(e) => handleComentar(e, post._id)} className="comment-input-wrapper">
                                            <img src={avatar || "https://via.placeholder.com/32"} className="comment-mini-avatar" alt="yo" />
                                            <div className="comment-input-container-with-btn">
                                                <input 
                                                    placeholder="Escribe un comentario..." 
                                                    style={{color: '#000'}}
                                                    value={comentarioTexto[post._id] || ""}
                                                    onChange={(e) => setComentarioTexto({...comentarioTexto, [post._id]: e.target.value})}
                                                />
                                                {/* AUMENTO: BOTÓN DE ENVÍO ACTIVO */}
                                                <button type="submit" className="btn-comment-submit-vibe">
                                                    <FaPaperPlane />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ))}
                    </main>

                    <aside className="fb-sidebar-right">
                        <div className="fb-card-white">
                            <h3 style={{color: '#000'}}>Miembros</h3>
                            <div className="miembros-preview-list">
                                {grupoData.miembrosArray?.slice(0, 5).map((m, i) => (
                                    <div key={i} className="miembro-mini-row">
                                        <FaUserCircle size={24} color="#ccc" />
                                        <span style={{color: '#000'}}>{m.split('@')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <section className="grupos-page">
            <div className="grupos-header-top">
                <div className="header-left-side">
                    <button className="btn-back-main-page" onClick={() => window.history.back()}><FaArrowLeft /></button>
                    <h2 style={{color: '#000'}}>Grupos</h2>
                </div>
                <button className="btn-crear-grupo" onClick={() => setIsModalOpen(true)}><FaPlus /> Crear nuevo grupo</button>
            </div>
            
            <div className="search-bar-pure-white">
                <FaSearch />
                <input type="text" placeholder="Buscar grupos..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
            </div>

            <div className="grupos-nav-pestanas">
                <button className={pestana === "todos" ? "active" : ""} onClick={() => setPestana("todos")}>Todos los grupos</button>
                <button className={pestana === "sugeridos" ? "active" : ""} onClick={() => setPestana("sugeridos")}>Sugerencias</button>
                <button className={pestana === "mis" ? "active" : ""} onClick={() => setPestana("mis")}>Mis grupos</button>
            </div>

            <div className="grupos-grid-moderno">
                {grupos.filter(g => g.nombre?.toLowerCase().includes(filtro.toLowerCase())).map(grupo => (
                    <div key={grupo._id} className="grupo-card-row">
                        <div className="grupo-card-top-content" onClick={() => entrarAGrupo(grupo)}>
                            <img src={grupo.imagen || "https://via.placeholder.com/150"} className="grupo-img-mini-square" alt="g" />
                            <div className="grupo-textos-info">
                                <h3 className="grupo-nombre-bold" style={{color: '#000'}}>{grupo.nombre}</h3>
                                <p style={{color: '#65676b'}}>{grupo.miembrosArray?.length || 1} miembros</p>
                            </div>
                        </div>
                        <div className="grupo-card-actions">
                            {grupo.miembrosArray?.includes(userEmail) ? (
                                <button className="btn-ver-grupo-vibe-blue" onClick={() => entrarAGrupo(grupo)}>Entrar</button>
                            ) : (
                                <button className="btn-unirse-vibe" onClick={() => handleUnirseGrupo(grupo)}>Unirme</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="vibe-modal-container">
                        <button className="vibe-close-circle" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                        <h3 style={{color: '#000'}}>Crear grupo</h3>
                        <form onSubmit={handleCrearGrupo}>
                            <div className="vibe-input-group">
                                <label style={{color: '#000'}}>Nombre del grupo</label>
                                <input className="vibe-input-field" placeholder="Nombre" required value={nuevoGrupo.nombre} onChange={(e) => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})} />
                            </div>
                            <div className="vibe-input-group">
                                <label style={{color: '#000'}}>Portada</label>
                                <div className="vibe-upload-box" onClick={() => fileInputRef.current.click()}>
                                    {nuevoGrupo.imagen ? <img src={nuevoGrupo.imagen} className="vibe-img-fit" alt="p" /> : <p>Haz clic para subir foto</p>}
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={(e) => handleImagePreview(e, 'grupo')} />
                            <button type="submit" className="vibe-btn-primary-full" disabled={loading}>{loading ? "Creando..." : "Crear Grupo"}</button>
                        </form>
                    </div>
                </div>
            )}

            {imageToCrop && (
                <div className="modal-overlay cropper-overlay">
                    <div className="vibe-modal-container cropper-modal">
                        <div className="crop-area-container">
                            <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={16/9} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                        </div>
                        <div className="cropper-footer">
                            <button onClick={() => setImageToCrop(null)}>Cancelar</button>
                            <button className="btn-confirm-vibe" onClick={handleConfirmCrop}>Guardar recorte</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Grupos;
