import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import storeAuth from "../../context/storeAuth";
import { useState } from "react";

import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

// --- SVG OJITOS KAWAII ---
const KawaiiEyeIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="icon-eye-kawaii"
    >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
        <circle cx="13.5" cy="10.5" r="0.5" fill="white"/>
    </svg>
);

const KawaiiEyeOffIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="icon-eye-off-kawaii"
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.49M2 2l20 20" />
        <path d="M21.94 12c-3.1-4.81-6.57-7.25-9.44-8a18.45 18.45 0 0 0-3.04.57" />
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const setToken = storeAuth((state) => state.setToken);
    const setRol = storeAuth((state) => state.setRol);

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (data) => {
        const loadingToast = toast.loading("Iniciando sesión...");

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/login`,
                {
                    correoInstitucional: data.email,
                    password: data.password,
                    rol: data.rol // Se envía el rol seleccionado por el usuario
                }
            );

            // Extraemos los datos reales que vienen de la base de datos
            const { token, nombre, correoInstitucional, rol, fotoPerfil } = res.data;

            // --- VALIDACIÓN ESTRICTA ---
            // Comparamos el rol seleccionado (data.rol) con el rol real (rol)
            // También incluimos "administradores" por si acaso tu DB usa el plural
            const esAdminMatch = (data.rol === "administrador" && (rol === "administrador" || rol === "administradores"));
            const esEstudianteMatch = (data.rol === "estudiante" && rol === "estudiante");
            const esModeradorMatch = (data.rol === "moderador" && rol === "moderador");

            if (!esAdminMatch && !esEstudianteMatch && !esModeradorMatch) {
                toast.update(loadingToast, {
                    render: `Acceso denegado: Tu cuenta no tiene permisos de ${data.rol} 🚫`,
                    type: "error",
                    isLoading: false,
                    autoClose: 4000
                });
                return; // Cortamos la ejecución, no se guarda sesión
            }

            // Si la validación pasa, guardamos la sesión
            setToken(token);
            setRol(rol);
            
            localStorage.setItem("token", token);
            localStorage.setItem("rol", rol);
            localStorage.setItem("nombre", nombre);
            localStorage.setItem("correo", correoInstitucional);
            localStorage.setItem("fotoPerfil", fotoPerfil || ""); 

            toast.update(loadingToast, {
                render: `¡Bienvenido ${nombre}!`,
                type: "success",
                isLoading: false,
                autoClose: 1200
            });

            setTimeout(() => navigate("/dashboard"), 900);

        } catch (error) {
            toast.update(loadingToast, {
                render: error.response?.data?.msg || "Error en el inicio de sesión 😞",
                type: "error",
                isLoading: false,
                autoClose: 4000
            });
        }
    };

    return (
        <>
            <div className="login-container">
                <Link to="/" className="back-btn">
                    <IoArrowBack size={30} />
                </Link>

                <div className="login-card">
                    <h2 className="login-title">Inicio de Sesión</h2>
                    <p className="login-subtitle">
                        Ingresa tus datos para acceder a tu cuenta.
                    </p>

                    <form className="login-form" onSubmit={handleSubmit(handleLogin)}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email universitario"
                                {...register("email", { required: "El email es obligatorio" })}
                            />
                            {errors.email && <span className="error-text">{errors.email.message}</span>}
                        </div>

                        <div className="input-group password-group" style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                {...register("password", { required: "La contraseña es obligatoria" })}
                            />
                            <span
                                className="eye-icon"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer"
                                }}
                            >
                                {showPassword ? <KawaiiEyeIcon /> : <KawaiiEyeOffIcon />}
                            </span>
                            {errors.password && <span className="error-text">{errors.password.message}</span>}
                        </div>

                        <div className="input-group">
                            <select {...register("rol", { required: "Selecciona un rol" })} className="select-rol">
                                <option value="">Seleccionar rol...</option>
                                <option value="administrador">Administrador</option>
                                <option value="estudiante">Estudiante</option>
                                <option value="moderador">Moderador</option>
                            </select>
                            {errors.rol && <span className="error-text">{errors.rol.message}</span>}
                        </div>

                        <button type="submit" className="login-btn">Iniciar Sesión</button>

                        <Link to="/Forgot-password" className="Forgot-link">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </form>

                    <Link to="/register" className="register-link">
                        ¿No tienes cuenta? Regístrate aquí
                    </Link>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={4000} />
        </>
    );
};

export default Login;
