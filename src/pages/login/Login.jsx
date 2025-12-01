import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import storeAuth from "../../context/storeAuth";

import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const setToken = storeAuth((state) => state.setToken);
    const setRol = storeAuth((state) => state.setRol);

    const handleLogin = async (data) => {
        const loadingToast = toast.loading("Iniciando sesión...");

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/login`,
                {
                    correoInstitucional: data.email,
                    password: data.password,
                    rol: data.rol   // 🔥 AHORA SÍ ENVIAMOS EL ROL
                }
            );

            // El backend devuelve el rol verificado
            const { token, nombre, correoInstitucional, rol } = res.data;

            // Guardar en Zustand
            setToken(token);
            setRol(rol);

            // Guardar en localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("rol", rol);
            localStorage.setItem("nombre", nombre);
            localStorage.setItem("correo", correoInstitucional);

            toast.update(loadingToast, {
                render: "¡Bienvenido!",
                type: "success",
                isLoading: false,
                autoClose: 1200
            });

            setTimeout(() => navigate("/dashboard"), 900);

        } catch (error) {
            toast.update(loadingToast, {
                render: error.response?.data?.msg || "Ocurrió un error 😞",
                type: "error",
                isLoading: false,
                autoClose: 4000
            });
            console.error(error);
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
                                {...register("email", {
                                    required: "El email es obligatorio"
                                })}
                            />
                            {errors.email && <span className="error-text">{errors.email.message}</span>}
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Contraseña"
                                {...register("password", {
                                    required: "La contraseña es obligatoria"
                                })}
                            />
                            {errors.password && <span className="error-text">{errors.password.message}</span>}
                        </div>

                        {/* 🔥 El usuario debe seleccionar el rol */}
                        <div className="input-group">
                            <select
                                {...register("rol", { required: "Selecciona un rol" })}
                                className="select-rol"
                            >
                                <option value="">Seleccionar rol...</option>
                                <option value="administracion">Administración</option>
                                <option value="estudiante">Estudiante</option>
                                <option value="moderador">Moderador</option>
                            </select>
                            {errors.rol && (
                                <span className="error-text">{errors.rol.message}</span>
                            )}
                        </div>

                        <button type="submit" className="login-btn">
                            Iniciar Sesión
                        </button>

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
