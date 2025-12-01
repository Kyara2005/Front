import { useForm } from "react-hook-form";
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useFetch } from "../../hooks/useFetch";
import "./Perfil.css";

const Perfil = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [perfiles, setPerfiles] = useState([]);
    const [id, setId] = useState("");
    const fetchDataBackend = useFetch();

    // 🔹 Traer todos los perfiles
    const getPerfiles = async () => {
        try {
            const data = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/api/usuarios`, null, "GET");
            setPerfiles(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getPerfiles();
    }, []);

    // 🔹 Crear o actualizar perfil
    const handleCreateOrUpdate = async (dataForm) => {
        try {
            if (id) {
                await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}`,
                    dataForm,
                    "PUT"
                );
                toast.success("Perfil actualizado correctamente");
                setId("");
            } else {
                await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/api/usuarios`,
                    dataForm,
                    "POST"
                );
                toast.success("Perfil creado correctamente");
            }
            reset();
            getPerfiles();
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error");
        }
    };

    // 🔹 Editar perfil
    const handleEdit = (perfil) => {
        setId(perfil._id);
        reset({
            nombre: perfil.nombre,
            correoInstitucional: perfil.correoInstitucional,
            foto: perfil.foto,
            bio: perfil.bio
        });
        toast.info("Edita los campos y guarda");
    };

    // 🔹 Eliminar perfil
    const handleDelete = async (perfilId) => {
        const confirmar = confirm("Vas a eliminar este perfil, ¿estás seguro?");
        if (!confirmar) return;
        try {
            await fetchDataBackend(
                `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${perfilId}`,
                null,
                "DELETE"
            );
            toast.success("Perfil eliminado correctamente");
            getPerfiles();
        } catch (error) {
            console.error(error);
            toast.error("No se pudo eliminar");
        }
    };

    return (
        <main className="perfil-main">
            <h1 className="main-title">Gestionar Perfiles de Usuarios</h1>
            <div className="perfil-content">
                <section className="perfil-form-section">
                    <form className="perfil-form" onSubmit={handleSubmit(handleCreateOrUpdate)}>
                        <div className="input-group">
                            <label>Nombre completo:</label>
                            <input
                                type="text"
                                placeholder="Ej: María López"
                                {...register("nombre", { required: true })}
                            />
                            {errors.nombre && <span className="error-text">El nombre es requerido</span>}
                        </div>

                        <div className="input-group">
                            <label>Correo institucional:</label>
                            <input
                                type="email"
                                placeholder="ejemplo@universidad.com"
                                {...register("correoInstitucional", { required: true })}
                            />
                            {errors.correoInstitucional && <span className="error-text">El correo es requerido</span>}
                        </div>

                        <div className="input-group">
                            <label>Foto de perfil (URL):</label>
                            <input
                                type="url"
                                placeholder="URL de tu foto"
                                {...register("foto", { required: true })}
                            />
                            {errors.foto && <span className="error-text">La imagen es requerida</span>}
                        </div>

                        <div className="input-group">
                            <label>Biografía:</label>
                            <textarea
                                placeholder="Cuéntanos de ti"
                                {...register("bio", { required: true })}
                            ></textarea>
                            {errors.bio && <span className="error-text">La bio es requerida</span>}
                        </div>

                        <button type="submit" className="submit-btn">
                            {id ? "Actualizar Perfil" : "Crear Perfil"}
                        </button>
                    </form>
                </section>

                <section className="perfiles-registrados-section">
                    <h4>Perfiles registrados</h4>
                    <div className="usuarios-list">
                        {perfiles.length === 0 ? (
                            <p>No hay perfiles aún.</p>
                        ) : (
                            perfiles.map(perfil => (
                                <div key={perfil._id} className="usuario-card">
                                    <img src={perfil.foto} alt={perfil.nombre} className="foto-perfil" />
                                    <h4>{perfil.nombre}</h4>
                                    <p>{perfil.bio}</p>
                                    <div className="route-actions">
                                        <button className="update-btn" onClick={() => handleEdit(perfil)}>Editar</button>
                                        <button className="delete-btn" onClick={() => handleDelete(perfil._id)}>Eliminar</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
            <ToastContainer />
        </main>
    );
};

export default Perfil;
