import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleForgot = async (data) => {
        const loadingToast = toast.loading("Enviando instrucciones...");

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/olvide-password`,
                { correoInstitucional: data.email }
            );

            toast.update(loadingToast, {
                render: res.data.msg || "Revisa tu correo 📩",
                type: "success",
                isLoading: false,
                autoClose: 4000
            });
        } catch (error) {
            toast.update(loadingToast, {
                render: error.response?.data?.msg || "Error al enviar correo 😞",
                type: "error",
                isLoading: false,
                autoClose: 4000
            });
            console.error(error);
        }
    };

    return (
        <>
            <div className="forgot-container">
                <Link to="/login" className="forgot-back-btn">
                    <IoArrowBack size={30} />
                </Link>

                <div className="forgot-card">
                    <h2 className="forgot-title">Recuperar contraseña</h2>
                    <p className="forgot-subtitle">
                        Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
                    </p>

                    <form className="forgot-form" onSubmit={handleSubmit(handleForgot)}>
                        <div className="forgot-input-group">
                            <input
                                type="email"
                                placeholder="Correo institucional"
                                className="forgot-input"
                                {...register("email", { 
                                    required: "El email es obligatorio" 
                                })}
                            />
                            {errors.email && (
                                <span className="forgot-error-text">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        <button type="submit" className="forgot-button">
                            Enviar instrucciones
                        </button>
                    </form>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={4000} />
        </>
    );
};

export default ForgotPassword;