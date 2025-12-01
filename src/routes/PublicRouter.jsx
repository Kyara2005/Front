import { Navigate, Outlet } from "react-router";
import storeAuth from "../context/storeAuth";

const PublicRoute = () => {
  const token = storeAuth((state) => state.token);
  const justLoggedIn = storeAuth((state) => state.justLoggedIn); // nuevo estado booleano

  // Redirige a dashboard solo si hay token y el usuario acaba de loguearse
  return token && justLoggedIn ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default PublicRoute;
