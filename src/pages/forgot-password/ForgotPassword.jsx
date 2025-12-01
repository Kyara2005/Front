import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleForgot = async (data) => {
        const loadingToast = toast.loading("Enviando instrucciones...");

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/olvide-password`,
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

    // Estilos inline para reemplazar el CSS externo
    const styles = {
        container: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #ffb07c, #9f6bff)",
            padding: "20px",
            position: "relative"
        },
        card: {
            background: "white",
            width: "400px",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            textAlign: "center"
        },
        title: {
            fontSize: "28px",
            fontWeight: "bold"
        },
        subtitle: {
            marginTop: "8px",
            color: "#555",
            fontSize: "15px"
        },
        backBtn: {
            position: "absolute",
            top: "25px",
            left: "25px",
            color: "black"
        },
        form: {
            marginTop: "20px"
        },
        input: {
            width: "100%",
            padding: "12px",
            marginTop: "12px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            fontSize: "16px"
        },
        errorText: {
            display: "block",
            fontSize: "13px",
            color: "red",
            marginTop: "4px"
        },
        button: {
            width: "100%",
            padding: "13px",
            background: "#8a3dff",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "12px",
            marginTop: "20px",
            cursor: "pointer",
            transition: "0.3s"
        },
        buttonHover: {
            background: "#6c24ff"
        }
    };

    return (
        <>
            <div style={styles.container}>
                <Link to="/login" style={styles.backBtn}>
                    <IoArrowBack size={30} />
                </Link>

                <div style={styles.card}>
                    <h2 style={styles.title}>Recuperar contraseña</h2>
                    <p style={styles.subtitle}>
                        Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
                    </p>

                    <form style={styles.form} onSubmit={handleSubmit(handleForgot)}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Correo institucional"
                                {...register("email", { required: "El email es obligatorio" })}
                                style={styles.input}
                            />
                            {errors.email && (
                                <span style={styles.errorText}>{errors.email.message}</span>
                            )}
                        </div>

                        <button type="submit" style={styles.button}>
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
