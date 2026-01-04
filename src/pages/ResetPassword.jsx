import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useState } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch("password");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async (data) => {
    const loadingToast = toast.loading("Restableciendo contraseña...");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/reset-password/${token}`,
        {
          password: data.password
        }
      );

      toast.update(loadingToast, {
        render: res.data.msg,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.msg || "Error 😞",
        type: "error",
        isLoading: false,
        autoClose: 4000
      });
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg,#ffb07c,#9f6bff)",
      padding: "20px",
      position: "relative"
    },
    card: {
      background: "white",
      width: "100%",
      maxWidth: "420px",
      padding: "40px",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      textAlign: "center",
      position: "relative"
    },
    backBtn: {
      position: "absolute",
      top: "20px",
      left: "20px",
      color: "#111"
    },
    title: {
      fontSize: "26px",
      fontWeight: "bold",
      color: "#111"
    },
    subtitle: {
      marginTop: "8px",
      color: "#555",
      fontSize: "14px"
    },
    inputContainer: {
      position: "relative",
      width: "100%",
      marginTop: "18px"
    },
    input: {
  width: "100%",
  height: "44px",              // ⬅️ más pequeño
  padding: "10px 14px",        // ⬅️ MISMO espacio izq / der
  borderRadius: "10px",
  border: "1.5px solid #c4c4c4",
  fontSize: "15px",
  backgroundColor: "#fff",
  color: "#000",               // ⬅️ letras negras
  boxSizing: "border-box"
},
    eyeIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#555"
    },
    errorText: {
      display: "block",
      fontSize: "13px",
      color: "red",
      marginTop: "4px",
      textAlign: "left"
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "#8a3dff",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      border: "none",
      borderRadius: "12px",
      marginTop: "30px",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.container}>
      <Link to="/login" style={styles.backBtn}>
        <IoArrowBack size={28} />
      </Link>

      <div style={styles.card}>
        <h2 style={styles.title}>Restablecer contraseña</h2>
        <p style={styles.subtitle}>
          Ingresa tu nueva contraseña y confírmala
        </p>

        <form onSubmit={handleSubmit(handleReset)}>
          {/* NUEVA CONTRASEÑA */}
          <div style={styles.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              style={styles.input}
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "Mínimo 6 caracteres"
                }
              })}
            />
            {showPassword ? (
              <AiOutlineEye
                style={styles.eyeIcon}
                size={20}
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <AiOutlineEyeInvisible
                style={styles.eyeIcon}
                size={20}
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>
          {errors.password && (
            <span style={styles.errorText}>
              {errors.password.message}
            </span>
          )}

          {/* CONFIRMAR CONTRASEÑA */}
          <div style={styles.inputContainer}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar contraseña"
              style={styles.input}
              {...register("confirmPassword", {
                required: "Debes confirmar la contraseña",
                validate: value =>
                  value === password || "Las contraseñas no coinciden"
              })}
            />
            {showConfirm ? (
              <AiOutlineEye
                style={styles.eyeIcon}
                size={20}
                onClick={() => setShowConfirm(false)}
              />
            ) : (
              <AiOutlineEyeInvisible
                style={styles.eyeIcon}
                size={20}
                onClick={() => setShowConfirm(true)}
              />
            )}
          </div>
          {errors.confirmPassword && (
            <span style={styles.errorText}>
              {errors.confirmPassword.message}
            </span>
          )}

          <button type="submit" style={styles.button}>
            Restablecer contraseña
          </button>
        </form>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default ResetPassword;
