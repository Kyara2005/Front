import { Navigate, Outlet } from "react-router-dom";
import storeAuth from "../context/storeAuth";

const PrivateRoute = () => {
  const token = storeAuth((state) => state.token);

  // 🔐 Si no hay token → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Si hay token → renderizar rutas hijas
  return <Outlet />;
};

export default PrivateRoute;
