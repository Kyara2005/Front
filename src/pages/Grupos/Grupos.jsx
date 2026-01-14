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
    const [userName, setUserName] = useState("Usuario");
    const [avatar, setAvatar] = useState(null);
    const userEmail = localStorage.getItem("correo");

    const fileInputRef = useRef(null);
    const postFotoRef = useRef(null);

    // Cargar perfil del usuario
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
                    autorFoto: avatar, 
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

    const entrarAGrupo = (grupo) => setGrupoActivo(grupo);
    const salirDeGrupo = () => setGrupoActivo(null);
    const toggleLike = (postId) => setLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
    const toggleGuardar = (postId) => setGuardados(prev => ({ ...prev, [postId]: !prev[postId] }));

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
                    <div className="fb-feed-center" style={{ width: '100%', maxWidth: '900px' }}>
                        
                        {/* AREA DE PUBLICAR */}
                        <div className="fb-card-white">
                            <div className="publish-input-row">
                                {avatar ? <img src={avatar} className="mini-avatar-fb" alt="yo" /> : <FaUserCircle size={40} color="#ccc" className="mini-avatar-fb" />}
                                <input 
                                    placeholder={`¿Qué compartes hoy, ${userName}?`} 
                                    value={nuevoPost}
                                    onChange={(e) => setNuevoPost(e.target.value)}
                                />
                            </div>
                            {fotoPost && (
                                <div className="fb-post-preview-container" style={{padding: '10px', position: 'relative'}}>
                                    <img src={fotoPost} alt="preview" style={{width: '100%', borderRadius: '8px'}} />
                                    <button className="vibe-close-circle" onClick={() => setFotoPost(null)}><FaTimes /></button>
                                </div>
                            )}
                            <div className="publish-footer-fb">
                                <button onClick={() => postFotoRef.current.click()}><FaRegImage color="#45bd62" /> Foto/video</button>
                                <button onClick={handlePublicar} disabled={loading} className="btn-fb-blue" style={{borderRadius: '6px', padding: '6px 20px'}}>Publicar</button>
                                <input type="file" ref={postFotoRef} style={{display: 'none'}} accept="image/*" onChange={(e) => handleImagePreview(e, 'post')} />
                            </div>
                        </div>

                        {/* LISTA DE POSTS */}
                        {grupoData.posts?.map(post => (
                            <div key={post._id} className="fb-card-white">
                                <div className="post-top-header">
                                    {post.autor === userName ? (
                                        avatar ? <img src={avatar} className="mini-avatar-fb" alt="yo" /> : <FaUserCircle size={40} color="#ccc" className="mini-avatar-fb" />
                                    ) : (
                                        post.autorFoto ? <img src={post.autorFoto} className="mini-avatar-fb" alt="autor" /> : <FaUserCircle size={40} color="#ccc" className="mini-avatar-fb" />
                                    )}
                                    <div className="post-user-meta">
                                        <span className="author-fb">{post.autor}</span>
                                        <span className="time-fb">Ahora · <FaGlobeAmericas /></span>
                                    </div>
                                    <button className="btn-dots-gray" onClick={(e) => handleToggleMenu(e, post._id)}><FaEllipsisH /></button>
                                </div>

                                <div className="post-body-text" style={{padding: '0 24px 12px 24px', color: '#050505'}}>{post.contenido}</div>

                                {post.foto && (
                                    <div className="post-image-manga-style">
                                        <img src={post.foto} className="img-full-post" alt="post" />
                                    </div>
                                )}

                                <div className="post-footer-metrics">
                                    <FaThumbsUp color="#1877f2" /> {likes[post._id] ? 'Tú y otros' : '0 personas'}
                                </div>

                                <div className="post-action-buttons-fb">
                                    <button onClick={() => toggleLike(post._id)} className={likes[post._id] ? "liked" : ""}>
                                        <FaThumbsUp /> Me gusta
                                    </button>
                                    <button><FaComment /> Comentar</button>
                                    <button><FaShare /> Compartir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDERIZADO LISTA DE GRUPOS ---
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
                            <div style={{position: 'relative'}}>
                                <button className="btn-dots-gray" onClick={(e) => handleToggleMenu(e, grupo._id)}><FaEllipsisH /></button>
                                {menuAbiertoId === grupo._id && (
                                    <div className="dropdown-fb-style" style={{right: 0, top: '40px'}}>
                                        <button className="fb-item"><FaRegFileAlt className="fb-icon" /> Contenido</button>
                                        <button className="fb-item"><FaShare className="fb-icon" /> Compartir</button>
                                        {grupo.creadorEmail === userEmail ? (
                                            <button className="fb-item" onClick={() => handleEliminarGrupo(grupo._id)}><FaTrash className="fb-icon" style={{color: 'red'}} /> Eliminar</button>
                                        ) : grupo.miembrosArray?.includes(userEmail) ? (
                                            <button className="fb-item" onClick={() => handleAbandonarGrupo(grupo._id)}><FaSignOutAlt className="fb-icon" /> Salir</button>
                                        ) : null}
                                    </div>
                                )}
                            </div>
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

            {/* MODAL CROPPER */}
            {imageToCrop && (
                <div className="modal-overlay cropper-overlay">
                    <div className="vibe-modal-container cropper-modal">
                        <div className="cropper-header"><h3>Ajustar Foto</h3></div>
                        <div className="crop-area-container">
                            <Cropper image={imageToCrop} crop={crop} zoom={zoom} rotation={rotation} aspect={16 / 9} onCropChange={setCrop} onZoomChange={setZoom} onRotationChange={setRotation} onCropComplete={onCropComplete} />
                        </div>
                        <div className="cropper-footer">
                            <button className="btn-cancel-vibe" onClick={() => setImageToCrop(null)}>Cancelar</button>
                            <button className="btn-confirm-vibe" onClick={handleConfirmCrop}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Grupos;
