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
    // --- ESTADOS ---
    const [grupos, setGrupos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [pestana, setPestana] = useState("todos");
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState("Usuario");
    const [userRole, setUserRole] = useState(""); 
    const [avatar, setAvatar] = useState(null);
    const userEmail = localStorage.getItem("correo");

    const [grupoActivo, setGrupoActivo] = useState(() => {
        const persistido = localStorage.getItem("ultimoGrupoVisitado");
        return persistido ? JSON.parse(persistido) : null;
    });
    const [nuevoPost, setNuevoPost] = useState("");
    const [fotoPost, setFotoPost] = useState(null);
    const [likes, setLikes] = useState({});
    const [guardados, setGuardados] = useState({});

    const [comentarioTexto, setComentarioTexto] = useState({});
    const [comentariosAbiertos, setComentariosAbiertos] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nuevoGrupo, setNuevoGrupo] = useState({ nombre: "", imagen: "" });
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const fileInputRef = useRef(null);
    const postFotoRef = useRef(null);

    // --- CARGAR PERFIL ---
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

    // --- CARGAR GRUPOS ---
    const cargarGrupos = async () => {
        try {
            const res = await fetch(`${API_URL}/listar`);
            const data = await res.json();
            setGrupos(data);
        } catch (error) { console.error("Error grupos:", error); }
    };
    useEffect(() => { cargarGrupos(); }, []);

    // --- PERSISTENCIA ---
    useEffect(() => {
        if (grupoActivo) localStorage.setItem("ultimoGrupoVisitado", JSON.stringify(grupoActivo));
        else localStorage.removeItem("ultimoGrupoVisitado");
    }, [grupoActivo]);

    // --- LÓGICA DE COMENTARIOS (CORREGIDA) ---
    const toggleComentarios = (postId) => {
        setComentariosAbiertos(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleComentar = async (e, postId) => {
        if (e) e.preventDefault();
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
                
                // Actualización inmediata del estado
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

                // LIMPIEZA DEL INPUT
                setComentarioTexto(prev => ({ ...prev, [postId]: "" }));
            }
        } catch (error) { console.error("Error al comentar:", error); }
    };

    // --- RECORTE DE IMAGEN ---
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

    // --- ACCIONES ---
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

    const handlePublicar = async (e) => {
        e.preventDefault();
        if (!nuevoPost.trim() && !fotoPost) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/${grupoActivo._id}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ autor: userName, autorFoto: avatar, autorEmail: userEmail, contenido: nuevoPost, foto: fotoPost })
            });
            const postGuardado = await res.json();
            setGrupos(prev => prev.map(g => g._id === grupoActivo._id ? { ...g, posts: [postGuardado, ...g.posts] } : g));
            setNuevoPost(""); setFotoPost(null);
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

    // --- VISTA DE MURO ---
    if (grupoActivo) {
        const grupoData = grupos.find(g => g._id === grupoActivo._id) || grupoActivo;
        return (
            <div className="fb-layout">
                <div className="fb-header-container">
                    <div className="fb-cover-photo" style={{ backgroundImage: `url(${grupoData.imagen})` }}>
                        <button className="fb-back-btn" onClick={salirDeGrupo}><FaArrowLeft /></button>
                    </div>
                    <div className="fb-profile-nav">
                        <div className="fb-avatar-section">
                            <div className="fb-avatar-wrapper">
                                <img src={grupoData.imagen || "https://via.placeholder.com/150"} alt="g" />
                            </div>
                            <div className="fb-name-stats">
                                <h1 style={{color: '#000'}}>{grupoData.nombre}</h1>
                                <p style={{color: '#65676b'}}><FaGlobeAmericas /> Grupo Público</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fb-body-grid single-column">
                    <main className="fb-feed-center">
                        <div className="fb-card-white publish-area">
                            <div className="publish-input-row">
                                <img src={avatar || "https://via.placeholder.com/40"} className="mini-avatar-fb" alt="me" />
                                <input placeholder={`¿Qué piensas, ${userName}?`} value={nuevoPost} onChange={(e) => setNuevoPost(e.target.value)} />
                            </div>
                            <div className="publish-footer-fb">
                                <button onClick={() => postFotoRef.current.click()}><FaRegImage color="#45bd62" /> Foto</button>
                                <button onClick={handlePublicar} className="btn-send-fb">Publicar</button>
                                <input type="file" ref={postFotoRef} style={{display:'none'}} onChange={(e) => handleImagePreview(e, 'post')} />
                            </div>
                        </div>

                        {grupoData.posts?.map(post => (
                            <div key={post._id} className="fb-card-white post-container">
                                <div className="post-top-header">
                                    <img src={post.autorFoto || "https://via.placeholder.com/40"} className="mini-avatar-fb" alt="a" />
                                    <div className="post-user-meta">
                                        <span className="author-fb" style={{color:'#000'}}>{post.autor}</span>
                                        <span className="time-fb">Ahora</span>
                                    </div>
                                </div>
                                <div className="post-body-text" style={{color:'#000'}}>{post.contenido}</div>
                                {post.foto && <img src={post.foto} className="img-full-post" alt="p" />}
                                
                                <div className="post-action-buttons-fb">
                                    <button onClick={() => toggleLike(post._id)} className={likes[post._id] ? "liked" : ""}><FaThumbsUp /> Like</button>
                                    <button onClick={() => toggleComentarios(post._id)}><FaComment /> Comentar</button>
                                </div>

                                {comentariosAbiertos[post._id] && (
                                    <div className="fb-comments-section">
                                        <div className="comments-list">
                                            {post.comentarios?.map((com, i) => (
                                                <div key={i} className="comment-item">
                                                    <img src={com.autorFoto || "https://via.placeholder.com/32"} className="comment-mini-avatar" alt="c" />
                                                    <div className="comment-bubble">
                                                        <span className="comment-author-name">{com.autor}</span>
                                                        <span className="comment-text">{com.contenido}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* FORMULARIO CON EVENTO ONSUBMIT Y BOTÓN CON ONCLICK */}
                                        <form onSubmit={(e) => handleComentar(e, post._id)} className="comment-input-wrapper">
                                            <img src={avatar || "https://via.placeholder.com/32"} className="comment-mini-avatar" alt="me" />
                                            <div className="comment-input-container-with-btn">
                                                <input 
                                                    placeholder="Escribe un comentario..." 
                                                    className="comment-input-field"
                                                    value={comentarioTexto[post._id] || ""}
                                                    onChange={(e) => setComentarioTexto({...comentarioTexto, [post._id]: e.target.value})}
                                                />
                                                <button 
                                                    type="submit" 
                                                    className="btn-send-comment-icon"
                                                    onClick={(e) => handleComentar(e, post._id)}
                                                >
                                                    <FaPaperPlane />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ))}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <section className="grupos-page">
            <div className="grupos-header-top">
                <h2>Comunidades</h2>
                <button className="btn-crear-grupo" onClick={() => setIsModalOpen(true)}><FaPlus /> Crear</button>
            </div>
            <div className="search-bar-pure-white">
                <FaSearch />
                <input type="text" placeholder="Buscar..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
            </div>
            <div className="grupos-grid-moderno">
                {grupos.filter(g => g.nombre?.toLowerCase().includes(filtro.toLowerCase())).map(grupo => (
                    <div key={grupo._id} className="grupo-card-row">
                        <div className="grupo-card-top-content" onClick={() => entrarAGrupo(grupo)}>
                            <img src={grupo.imagen || "https://via.placeholder.com/150"} alt="g" />
                            <div>
                                <h3 className="grupo-nombre-bold" style={{color:'#000'}}>{grupo.nombre}</h3>
                                <p>{grupo.miembrosArray?.length || 1} miembros</p>
                            </div>
                        </div>
                        <button className="btn-ver-grupo-vibe-blue" onClick={() => entrarAGrupo(grupo)}>Ver</button>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="vibe-modal-container">
                        <button onClick={() => setIsModalOpen(false)} className="vibe-close-circle"><FaTimes /></button>
                        <form onSubmit={handleCrearGrupo}>
                            <input className="vibe-input-field" placeholder="Nombre" required value={nuevoGrupo.nombre} onChange={(e) => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})} />
                            <div className="vibe-upload-box" onClick={() => fileInputRef.current.click()}>Subir Foto</div>
                            <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={(e) => handleImagePreview(e, 'grupo')} />
                            <button type="submit" className="vibe-btn-primary-full">Crear</button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Grupos;
