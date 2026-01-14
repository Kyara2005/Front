import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import axios from 'axios';
import { 
    FaPlus, FaArrowLeft, FaCamera, FaThumbsUp, FaComment, FaSearch, FaTimes, FaEllipsisH, FaShare, 
    FaGlobeAmericas, FaRegImage, FaUserFriends, FaUserCircle, FaTrash, FaSignOutAlt, FaRegFileAlt,
    FaRegBookmark, FaBookmark
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

    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [likes, setLikes] = useState({});
    const [guardados, setGuardados] = useState({});

    // ESTADOS DEL USUARIO
    const [userName, setUserName] = useState(localStorage.getItem("nombre") || "Usuario");
    const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || null);
    const userEmail = localStorage.getItem("correo");

    const fileInputRef = useRef(null);
    const postFotoRef = useRef(null);

    // Cargar perfil del usuario actualizado
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get(
                    `https://controversial-jacquette-vibe-u-d09f766e.koyeb.app/api/usuarios/perfil`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data?.nombre) {
                    setUserName(response.data.nombre);
                    localStorage.setItem("nombre", response.data.nombre);
                }
                if (response.data?.avatar) {
                    setAvatar(response.data.avatar);
                    localStorage.setItem("avatar", response.data.avatar);
                }
            } catch (error) {
                console.error("Error al obtener el perfil:", error);
            }
        };
        fetchUserInfo();
    }, []);

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
        } catch (e) { console.error("Error al recortar", e); }
    };

    const cargarGrupos = async () => {
        try {
            const res = await fetch(`${API_URL}/listar`);
            const data = await res.json();
            setGrupos(data);
        } catch (error) { console.error("Error al cargar grupos:", error); }
    };

    useEffect(() => { cargarGrupos(); }, []);

    useEffect(() => {
        if (grupoActivo) {
            localStorage.setItem("ultimoGrupoVisitado", JSON.stringify(grupoActivo));
        } else {
            localStorage.removeItem("ultimoGrupoVisitado");
        }
    }, [grupoActivo]);

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
            if (res.ok) { cargarGrupos(); }
        } catch (error) { console.error(error); }
    };

    const handleEliminarGrupo = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este grupo?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) { cargarGrupos(); if (grupoActivo?._id === id) setGrupoActivo(null); }
        } catch (error) { console.error(error); }
    };

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
                    autorFoto: avatar, // Aquí enviamos tu avatar actual
                    contenido: nuevoPost, 
                    foto: fotoPost 
                })
            });
            const postGuardado = await res.json();
            
            // Actualizamos el estado local de los grupos para ver el post al instante
            setGrupos(prev => prev.map(g => 
                g._id === grupoActivo._id 
                ? { ...g, posts: [postGuardado, ...(g.posts || [])] } 
                : g
            ));
            
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

    const entrarAGrupo = (grupo) => setGrupoActivo(grupo);
    const salirDeGrupo = () => setGrupoActivo(null);
    const toggleLike = (postId) => setLikes(prev => ({ ...prev, [postId]: !prev[postId] }));

    // --- RENDERIZADO MURO ACTIVO ---
    if (grupoActivo) {
        const grupoData = grupos.find(g => g._id === grupoActivo._id) || grupoActivo;
        return (
            <div className="fb-layout">
                <div className="fb-header-container">
                    <div className="fb-cover-photo" style={{ backgroundImage: `url(${grupoData.imagen})` }}>
                        <button className="fb-back-btn" onClick={salirDeGrupo}><FaArrowLeft /></button>
                        <button className="fb-edit-cover"><FaCamera /> Editar portada</button>
                    </div>
                    <div className="fb-profile-nav">
                        <div className="fb-avatar-section">
                            <div className="fb-avatar-wrapper">
                                <img src={grupoData.imagen || "https://via.placeholder.com/150"} alt="avatar" className="fb-main-avatar" />
                            </div>
                            <div className="fb-name-stats">
                                <h1>{grupoData.nombre}</h1>
                                <p><FaGlobeAmericas /> Grupo Público · <b>{grupoData.miembrosArray?.length || 1} miembros</b></p>
                            </div>
                            <div className="fb-header-btns">
                                <button className="btn-fb-blue"><FaPlus /> Invitar</button>
                                <button className="btn-fb-gray"><FaUserFriends /> Miembro</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fb-body-grid">
                    <div className="fb-feed-center">
                        
                        {/* AREA DE PUBLICAR (Corregida con tu avatar) */}
                        <div className="fb-card-white publish-card">
                            <div className="publish-input-row">
                                {avatar ? (
                                    <img src={avatar} className="mini-avatar-fb" alt="perfil" />
                                ) : (
                                    <FaUserCircle size={40} color="#ccc" className="mini-avatar-fb" />
                                )}
                                <input 
                                    className="fb-fake-input"
                                    placeholder={`¿Qué estás pensando, ${userName}?`} 
                                    value={nuevoPost}
                                    onChange={(e) => setNuevoPost(e.target.value)}
                                />
                            </div>
                            {fotoPost && (
                                <div className="fb-post-preview-container">
                                    <img src={fotoPost} alt="preview" />
                                    <button className="vibe-close-circle" onClick={() => setFotoPost(null)}><FaTimes /></button>
                                </div>
                            )}
                            <div className="publish-footer-fb">
                                <button onClick={() => postFotoRef.current.click()}><FaRegImage color="#45bd62" /> Foto/video</button>
                                <button onClick={handlePublicar} disabled={loading} className="btn-fb-blue-solid">Publicar</button>
                                <input type="file" ref={postFotoRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'post')} />
                            </div>
                        </div>

                        {/* LISTA DE POSTS (Lógica de avatar robusta) */}
                        {grupoData.posts?.map(post => {
                            // Lógica para decidir qué foto mostrar:
                            // 1. Si el autor del post eres tú, mostramos SIEMPRE tu avatar actual del estado.
                            // 2. Si no eres tú, mostramos la foto que venga en el post o un icono por defecto.
                            const esMiPost = post.autor === userName;
                            const fotoAMostrar = esMiPost ? (avatar || post.autorFoto) : post.autorFoto;

                            return (
                                <div key={post._id} className="fb-card-white post-card-adjusted">
                                    <div className="post-top-header">
                                        <div className="post-header-left">
                                            {fotoAMostrar ? (
                                                <img src={fotoAMostrar} className="mini-avatar-fb" alt="autor" />
                                            ) : (
                                                <FaUserCircle size={40} color="#ccc" className="mini-avatar-fb" />
                                            )}
                                            <div className="post-user-meta">
                                                <span className="author-fb-bold">{post.autor}</span>
                                                <span className="time-fb-gray">Ahora · <FaGlobeAmericas size={12}/></span>
                                            </div>
                                        </div>
                                        <button className="btn-dots-gray" onClick={(e) => handleToggleMenu(e, post._id)}><FaEllipsisH /></button>
                                    </div>

                                    <div className="post-body-content">{post.contenido}</div>

                                    {post.foto && (
                                        <div className="post-image-full-width">
                                            <img src={post.foto} alt="contenido" />
                                        </div>
                                    )}

                                    <div className="post-footer-stats">
                                        <div className="fb-like-count">
                                            <div className="blue-circle-like"><FaThumbsUp size={10} color="white"/></div>
                                            <span>{likes[post._id] ? 'Tú y 0 personas' : '0 personas'}</span>
                                        </div>
                                    </div>

                                    <div className="post-action-buttons-fb-grid">
                                        <button onClick={() => toggleLike(post._id)} className={likes[post._id] ? "active-blue" : ""}>
                                            <FaThumbsUp /> Me gusta
                                        </button>
                                        <button><FaComment /> Comentar</button>
                                        <button><FaShare /> Compartir</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Render de la lista principal (Comunidades)
    return (
        <section className="grupos-page">
            <div className="grupos-header-top">
                <div className="header-left-side">
                    <button className="btn-back-main-page" onClick={() => window.history.back()}><FaArrowLeft /></button>
                    <h2 className="texto-negro">Comunidades</h2>
                </div>
                <button className="btn-crear-grupo" onClick={() => setIsModalOpen(true)}><FaPlus /> Crear Grupo</button>
            </div>
            
            <div className="search-bar-pure-white">
                <FaSearch style={{color: '#65676b'}} />
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
                                <p>{grupo.miembrosArray?.length || 1} miembros</p>
                            </div>
                        </div>
                        <div className="grupo-card-actions-row">
                            {grupo.miembrosArray?.includes(userEmail) ? (
                                <button className="btn-ver-grupo-vibe-blue" onClick={() => entrarAGrupo(grupo)}>Ver grupo</button>
                            ) : (
                                <button className="btn-ver-grupo-vibe-blue" onClick={() => handleUnirseGrupo(grupo)}>Unirse</button>
                            )}
                            <button className="btn-dots-gray" onClick={(e) => handleToggleMenu(e, grupo._id)}><FaEllipsisH /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL CREAR GRUPO */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="vibe-modal-container">
                        <div className="vibe-modal-header">
                            <button className="vibe-close-circle" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                            <h3 className="vibe-modal-title-main">Nuevo Grupo</h3>
                        </div>
                        <form onSubmit={handleCrearGrupo}>
                            <div className="vibe-modal-content-body">
                                <input type="text" className="vibe-input-field" placeholder="Nombre" required value={nuevoGrupo.nombre} onChange={(e) => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})} />
                                <div className="vibe-upload-box" onClick={() => fileInputRef.current.click()}>
                                    {nuevoGrupo.imagen ? <img src={nuevoGrupo.imagen} className="vibe-img-fit" alt="preview" /> : <div className="vibe-upload-placeholder"><FaCamera /><p>Subir foto</p></div>}
                                </div>
                                <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'grupo')} />
                            </div>
                            <button type="submit" className="vibe-btn-primary-full" disabled={loading}>{loading ? "Cargando..." : "Crear Comunidad"}</button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Grupos;
