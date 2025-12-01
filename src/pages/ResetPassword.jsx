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
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async (data) => {
    const loadingToast = toast.loading("Restableciendo contraseña...");
    try {
      // ✅ CORRECCIÓN CLAVE: Enviar 'confirmpassword' para que el backend pueda validarlo.
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reset-password/${token}`,
        { 
          password: data.password, // Enviamos el campo principal
          confirmpassword: data.confirmPassword // Enviamos la confirmación con el nombre que espera el backend
        }
      );
      toast.update(loadingToast, { render: res.data.msg, type: "success", isLoading: false, autoClose: 4000 });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.update(loadingToast, { render: error.response?.data?.msg || "Error 😞", type: "error", isLoading: false, autoClose: 4000 });
    }
  };

  const styles = {
    container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg,#ffb07c,#9f6bff)", padding: "20px", position: "relative" },
    card: { background: "white", width: "400px", padding: "40px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center", position: "relative" },
    title: { fontSize: "28px", fontWeight: "bold" },
    subtitle: { marginTop: "8px", color: "#555", fontSize: "15px" },
    backBtn: { position: "absolute", top: "25px", left: "25px", color: "black" },
    inputContainer: { position: "relative", width: "100%", marginTop: "20px" },
    input: { 
      width: "100%", 
      padding: "12px 12px 12px 12px", // ojo pegado al borde derecho
      border: "2px solid #ccc", 
      borderRadius: "10px", 
      fontSize: "16px", 
      backgroundColor: "white", 
      color: "black" 
    },
    eyeIcon: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#555" },
    errorText: { display: "block", fontSize: "13px", color: "red", marginTop: "4px" },
    button: { width: "100%", padding: "13px", background: "#8a3dff", color: "white", fontSize: "16px", fontWeight: "bold", border: "none", borderRadius: "12px", marginTop: "30px", cursor: "pointer", transition: ".3s" }
  };

  return (
    <div style={styles.container}>
      <Link to="/login" style={styles.backBtn}><IoArrowBack size={30} /></Link>
      <div style={styles.card}>
        <h2 style={styles.title}>Restablecer contraseña</h2>
        <p style={styles.subtitle}>Ingresa tu nueva contraseña y confírmala</p>
        <form onSubmit={handleSubmit(handleReset)}>
          {/* Nueva contraseña */}
          <div style={styles.inputContainer}>
            <input
              type={showPassword ? "text" : "password"} // ojo abierto → visible, ojo cerrado → oculto
              placeholder="Nueva contraseña"
              style={styles.input}
              {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
            />
            {showPassword ? 
              <AiOutlineEye style={styles.eyeIcon} size={20} onClick={() => setShowPassword(false)} /> : 
              <AiOutlineEyeInvisible style={styles.eyeIcon} size={20} onClick={() => setShowPassword(true)} />}
          </div>
          {errors.password && <span style={styles.errorText}>{errors.password.message}</span>}

          {/* Confirmar contraseña */}
          <div style={styles.inputContainer}>
            <input
              type={showConfirm ? "text" : "password"} // ojo abierto → visible, ojo cerrado → oculto
              placeholder="Reescribe la contraseña"
              style={styles.input}
              {...register("confirmPassword", { required: "Debes confirmar", validate: value => value === password || "No coinciden" })}
            />
            {showConfirm ? 
              <AiOutlineEye style={styles.eyeIcon} size={20} onClick={() => setShowConfirm(false)} /> : 
              <AiOutlineEyeInvisible style={styles.eyeIcon} size={20} onClick={() => setShowConfirm(true)} />}
          </div>
          {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword.message}</span>}

          <button type="submit" style={styles.button}>Restablecer contraseña</button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default ResetPassword;