import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFetch } from "../../hooks/useFetch";
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();
    const fetchDataBackend = useFetch();
    const { register, handleSubmit, formState: { errors } } = useForm();

    // 🔹 Registro en backend
    const registerUser = async (dataForm) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/register`;

        // Mapear los campos del formulario a lo que espera tu backend
        const body = {
            nombre: dataForm.name,
            correoInstitucional: dataForm.email,
            password: dataForm.password
        };
        
        console.log("URL del backend:", url);

        try {
            const response = await fetchDataBackend(url, body, "POST");

            if (response) {
                toast.success(response.msg || "Registro exitoso 🎉", {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Redirigir al login después de registrarse
                navigate("/login");
            }
        } catch (error) {
            console.error("Error en el registro:", error);
        }
    };

    return (
        <div className="register-page">
            {/* Sección izquierda con imagen o mensaje */}
            <div className="register-left">
                <div className="register-overlay">
                    <h1 className="vibe-logo">VIBE-<span>U</span></h1>
                    <p className="register-text">
                        Únete a la comunidad universitaria.<br />
                        Conecta, comparte y vive nuevas experiencias 🎓
                    </p>
                </div>
            </div>

            {/* Sección derecha con formulario */}
            <div className="register-right">
                <div className="register-card">
                    <h2 className="register-title">Crea tu cuenta</h2>
                    <p className="register-subtitle">
                        ¿Ya tienes una cuenta?{" "}
                        <NavLink to="/login" className="login-link">Inicia sesión</NavLink>
                    </p>

                    <form className="register-form" onSubmit={handleSubmit(registerUser)}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                {...register("name", { required: "El nombre es obligatorio" })}
                            />
                            {errors.name && <span className="error-text">{errors.name.message}</span>}
                        </div>

                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Correo institucional"
                                {...register("email", { required: "El correo es obligatorio" })}
                            />
                            {errors.email && <span className="error-text">{errors.email.message}</span>}
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Contraseña"
                                {...register("password", { required: "La contraseña es obligatoria" })}
                            />
                            {errors.password && <span className="error-text">{errors.password.message}</span>}
                        </div>

                        <button type="submit" className="register-btn">Registrarme</button>
                    </form>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default Register;
