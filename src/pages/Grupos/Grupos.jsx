import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import axios from 'axios';
import { 
    FaPlus, FaArrowLeft, FaCamera, FaThumbsUp, FaComment, FaSearch, FaTimes, FaEllipsisH, FaShare, 
    FaGlobeAmericas, FaRegImage, FaUserFriends, FaUserCircle, FaTrash, FaPaperPlane, FaEdit
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
    const [grupoActivoId, setGrupoActivoId] = useState(() => {
        return localStorage.getItem("ultimoGrupoVisitadoId") || null;
    });

    const grupoData = grupos.find(g => g._id === grupoActivoId);

    const [nuevoPost, setNuevoPost] = useState("");
    const [fotoPost, setFotoPost] = useState(null);
    const [likes, setLikes] = useState({});
    
    // Estado para editar posts
    const [postEditandoId, setPostEditandoId] = useState(null);
    const [contenidoEditado, setContenidoEditado] = useState("");

    // --- ESTADOS DE COMENTARIOS ---
    const [comentarioTexto, setComentarioTexto] = useState({});
    const [comentariosAbiertos, setComentariosAbiertos] = useState({});

    // --- ESTADOS DE CREACIÓN Y RECORTE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nuevoGrupo, setNuevoGrupo] = useState({ nombre: "", imagen: "", portada: "" });
    const [imageToCrop, setImageToCrop] = useState(null);
    const [tipoRecorte, setTipoRecorte] = useState(""); // "perfil", "portada", "grupo"
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);
    const postFotoRef = useRef(null);

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
            } catch (error) { console.error("Error al obtener el perfil:", error); }
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
        if (grupoActivoId) {
            localStorage.setItem("ultimoGrupoVisitadoId", grupoActivoId);
        } else {
            localStorage.removeItem("ultimoGrupoVisitadoId");
        }
    }, [grupoActivoId]);

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
            const base64 = canvas.toDataURL('image/jpeg');

            if (tipoRecorte === "perfil") {
                handleUpdateGrupoImage({ imagen: base64 });
            } else if (tipoRecorte === "portada") {
                handleUpdateGrupoImage({ portada: base64 });
            } else if (tipoRecorte === "grupo") {
                setNuevoGrupo({ ...nuevoGrupo, imagen: base64 });
            }
            setImageToCrop(null); 
        } catch (e) { console.error("Error al recortar", e); }
    };

    // --- 5. ACCIONES DE GRUPO ---
    const handleUpdateGrupoImage = async (dataUpdate) => {
        try {
            const res = await fetch(`${API_URL}/${grupoActivoId}/editar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataUpdate)
            });
            if (res.ok) cargarGrupos();
        } catch (error) { console.error("Error al actualizar imagen:", error); }
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
            setNuevoGrupo({ nombre: "", imagen: "", portada: "" });
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    // --- 6. PUBLICACIONES Y COMENTARIOS ---
    const handlePublicar = async (e) => {
        e.preventDefault();
        if (!nuevoPost.trim() && !fotoPost) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/${grupoActivoId}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    autor: userName, autorFoto: avatar, autorEmail: userEmail,
                    contenido: nuevoPost, foto: fotoPost 
                })
            });
            const postGuardado = await res.json();
            setGrupos(prev => prev.map(g => 
                g._id === grupoActivoId ? { ...g, posts: [postGuardado, ...(g.posts || [])] } : g
            ));
            setNuevoPost(""); setFotoPost(null);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleEditarPost = async (postId) => {
        try {
            const res = await fetch(`${API_URL}/${grupoActivoId}/post/${postId}/editar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido: contenidoEditado })
            });
            if (res.ok) {
                setGrupos(prev => prev.map(g => {
                    if (g._id === grupoActivoId) {
                        return {
                            ...g,
                            posts: g.posts.map(p => p._id === postId ? { ...p, contenido: contenidoEditado, editado: true } : p)
                        };
                    }
                    return g;
                }));
                setPostEditandoId(null);
            }
        } catch (error) { console.error("Error al editar post:", error); }
    };

    const handleEliminarPost = async (postId) => {
        if (!window.confirm("¿Eliminar esta publicación?")) return;
        try {
            const res = await fetch(`${API_URL}/${grupoActivoId}/post/${postId}`, { method: 'DELETE' });
            if (res.ok) {
                setGrupos(prev => prev.map(g => 
                    g._id === grupoActivoId 
                    ? { ...g, posts: g.posts.filter(p => p._id !== postId) } 
                    : g
                ));
            }
        } catch (error) { console.error(error); }
    };

    const handleComentar = async (e, postId) => {
        e.preventDefault();
        const texto = comentarioTexto[postId];
        if (!texto?.trim()) return;
        try {
            const res = await fetch(`${API_URL}/${grupoActivoId}/post/${postId}/comentar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    autor: userName, autorFoto: avatar, autorEmail: userEmail, contenido: texto
                })
            });
            if (res.ok) {
                const nuevoComentario = await res.json();
                setGrupos(prev => prev.map(g => {
                    if (g._id === grupoActivoId) {
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
        } catch (error) { console.error("Error al comentar:", error); }
    };

    const handleImagePreview = (e, destino) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (destino === 'grupo') { setTipoRecorte("grupo"); setImageToCrop(reader.result); }
            else if (destino === 'post') setFotoPost(reader.result);
            else if (destino === 'perfil') { setTipoRecorte("perfil"); setImageToCrop(reader.result); }
            else if (destino === 'portada') { setTipoRecorte("portada"); setImageToCrop(reader.result); }
        };
        reader.readAsDataURL(file);
    };

    const entrarAGrupo = (grupo) => setGrupoActivoId(grupo._id);
    const salirDeGrupo = () => setGrupoActivoId(null);
    const toggleLike = (postId) => setLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
    const toggleComentarios = (postId) => setComentariosAbiertos(prev => ({ ...prev, [postId]: !prev[postId] }));

    // --- RENDER MURO DEL GRUPO ---
    if (grupoActivoId && grupoData) {
        const esCreadorGrupo = grupoData.creadorEmail === userEmail;
        return (
            <div className="fb-layout">
                <div className="fb-header-container">
                    <div className="fb-cover-photo" style={{ backgroundImage: `url(${grupoData.portada || "https://via.placeholder.com/800x300"})` }}>
                        <button className="fb-back-btn" onClick={salirDeGrupo}><FaArrowLeft /></button>
                        {esCreadorGrupo && (
                            <button className="fb-edit-cover" onClick={() => coverInputRef.current.click()}>
                                <FaCamera /> Editar Portada
                            </button>
                        )}
                        <input type="file" ref={coverInputRef} style={{display:'none'}} accept="image/*" onChange={(e)=>handleImagePreview(e, 'portada')} />
                    </div>

                    <div className="fb-profile-nav">
                        <div className="fb-avatar-section">
                            <div className="fb-avatar-wrapper">
                                <img src={grupoData.imagen || "https://via.placeholder.com/150"} alt="avatar" />
                                {esCreadorGrupo && (
                                    <button className="fb-edit-avatar-btn" onClick={() => fileInputRef.current.click()}>
                                        <FaCamera size={18} />
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={(e)=>handleImagePreview(e, 'perfil')} />
                            </div>
                            <div className="fb-name-stats">
                                <h1>{grupoData.nombre}</h1>
                                <p><FaGlobeAmericas /> Grupo Público · <b>{grupoData.miembrosArray?.length || 1} miembros</b></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fb-body-grid single-column">
                    <main className="fb-feed-center">
                        {/* ÁREA DE PUBLICAR */}
                        <div className="fb-card-white publish-area">
                            <div className="publish-input-row">
                                {avatar ? <img src={avatar} className="mini-avatar-fb" alt="yo" /> : <FaUserCircle size={40} color="#ccc" />}
                                <input placeholder={`¿Qué compartes hoy, ${userName}?`} value={nuevoPost} onChange={(e) => setNuevoPost(e.target.value)} />
                            </div>
                            {fotoPost && <div className="preview-foto-post"><img src={fotoPost} alt="preview" /><button onClick={()=>setFotoPost(null)}>X</button></div>}
                            <div className="publish-footer-fb">
                                <button onClick={() => postFotoRef.current.click()}><FaRegImage color="#45bd62" /> Foto/video</button>
                                <button onClick={handlePublicar} disabled={loading} className="btn-send-fb">{loading ? "..." : "Publicar"}</button>
                                <input type="file" ref={postFotoRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'post')} />
                            </div>
                        </div>

                        {/* LISTA DE POSTS */}
                        {grupoData.posts?.map(post => {
                            const esMiPost = post.autorEmail === userEmail;
                            const esAdmin = userRole === 'admin' || esCreadorGrupo;
                            const estaAbierto = comentariosAbiertos[post._id];

                            return (
                                <div key={post._id} className="fb-card-white post-container">
                                    <div className="post-top-header">
                                        <div className="mini-avatar-fb">
                                            <img src={post.autorFoto || "https://via.placeholder.com/40"} alt="autor" />
                                        </div>
                                        <div className="post-user-meta">
                                            <span className="author-fb">{post.autor}</span>
                                            <span className="time-fb">Ahora · <FaGlobeAmericas /> {post.editado && " · Editado"}</span>
                                        </div>
                                        <div className="post-actions-right">
                                            <button className="btn-fb-options" onClick={() => setMenuAbiertoId(menuAbiertoId === post._id ? null : post._id)}>
                                                <FaEllipsisH />
                                            </button>
                                            {menuAbiertoId === post._id && (
                                                <div className="dropdown-fb-style">
                                                    {esMiPost && (
                                                        <button onClick={() => { setPostEditandoId(post._id); setContenidoEditado(post.contenido); setMenuAbiertoId(null); }}>
                                                            <FaEdit /> Editar
                                                        </button>
                                                    )}
                                                    {(esMiPost || esAdmin) && (
                                                        <button className="delete-btn" onClick={() => handleEliminarPost(post._id)}>
                                                            <FaTrash /> Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {postEditandoId === post._id ? (
                                        <div className="edit-post-box">
                                            <textarea value={contenidoEditado} onChange={(e) => setContenidoEditado(e.target.value)} />
                                            <div className="edit-btns">
                                                <button className="btn-send-fb" onClick={() => handleEditarPost(post._id)}>Guardar</button>
                                                <button onClick={() => setPostEditandoId(null)}>Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="post-body-text">{post.contenido}</div>
                                    )}

                                    {post.foto && <img src={post.foto} className="img-full-post" alt="post" />}

                                    <div className="post-action-buttons-fb">
                                         <button onClick={() => toggleLike(post._id)} className={likes[post._id] ? "active-like" : ""}>
                                            <FaThumbsUp /> Me gusta
                                         </button>
                                         <button onClick={() => toggleComentarios(post._id)}><FaComment /> Comentar</button>
                                         <button><FaShare /> Compartir</button>
                                    </div>

                                    {estaAbierto && (
                                        <div className="fb-comments-section">
                                            {post.comentarios?.map((com, idx) => (
                                                <div key={idx} className="comment-item">
                                                    <img src={com.autorFoto || "https://via.placeholder.com/32"} alt="v" className="comment-mini-avatar" />
                                                    <div className="comment-bubble">
                                                        <span className="comment-author-name">{com.autor}</span>
                                                        <span className="comment-text">{com.contenido}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <form onSubmit={(e) => handleComentar(e, post._id)} className="comment-input-wrapper">
                                                <input 
                                                    placeholder="Escribe un comentario..." 
                                                    value={comentarioTexto[post._id] || ""} 
                                                    onChange={(e) => setComentarioTexto({...comentarioTexto, [post._id]: e.target.value})} 
                                                />
                                                <button type="submit"><FaPaperPlane /></button>
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
                    <h2>Comunidades</h2>
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
                .map(grupo => (
                    <div key={grupo._id} className="grupo-card-row">
                        <div className="grupo-card-top-content" onClick={() => entrarAGrupo(grupo)}>
                            <img src={grupo.imagen || "https://via.placeholder.com/150"} className="grupo-img-mini-square" alt={grupo.nombre} />
                            <div className="grupo-textos-info">
                                <h3 className="grupo-nombre-bold">{grupo.nombre}</h3>
                                <p>{grupo.miembrosArray?.length || 1} miembros</p>
                            </div>
                        </div>
                        <button className="btn-ver-grupo-vibe-blue" onClick={() => entrarAGrupo(grupo)}>Ver</button>
                    </div>
                ))}
            </div>

            {/* MODAL CREAR GRUPO */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="vibe-modal-container">
                        <div className="vibe-modal-header">
                            <button className="vibe-close-circle" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                            <h3>Nuevo Grupo</h3>
                        </div>
                        <form onSubmit={handleCrearGrupo}>
                            <div className="vibe-modal-content-body">
                                <input className="vibe-input-field" placeholder="Nombre del grupo" required value={nuevoGrupo.nombre} onChange={(e) => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})} />
                                <div className="vibe-upload-box" onClick={() => fileInputRef.current.click()}>
                                    {nuevoGrupo.imagen ? <img src={nuevoGrupo.imagen} className="vibe-img-fit" alt="p" /> : <p>Subir foto de perfil</p>}
                                </div>
                                <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'grupo')} />
                            </div>
                            <div className="vibe-modal-footer">
                                <button type="submit" disabled={loading} className="vibe-btn-primary-full">{loading ? "Creando..." : "Crear Grupo"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CROPPER */}
            {imageToCrop && (
                <div className="modal-overlay cropper-overlay">
                    <div className="vibe-modal-container cropper-modal">
                        <div className="crop-area-container">
                            <Cropper 
                                image={imageToCrop} 
                                crop={crop} zoom={zoom} rotation={rotation} 
                                aspect={tipoRecorte === "portada" ? 16 / 5 : 1 / 1} 
                                onCropChange={setCrop} onZoomChange={setZoom} onRotationChange={setRotation} onCropComplete={onCropComplete} 
                            />
                        </div>
                        <div className="cropper-footer">
                            <button onClick={() => setImageToCrop(null)}>Cancelar</button>
                            <button className="btn-confirm-vibe" onClick={handleConfirmCrop}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Grupos;
