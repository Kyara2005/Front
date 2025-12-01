// src/routes/PrivateRouter.jsx
import { Navigate, Outlet } from "react-router";
import storeAuth from "../context/storeAuth";

const PrivateRoute = () => {
  const token = storeAuth((state) => state.token);
  
  // Si NO hay token → redirigir a login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si HAY token → se permiten las rutas protegidas
  return <Outlet />;
};

export default PrivateRoute;
