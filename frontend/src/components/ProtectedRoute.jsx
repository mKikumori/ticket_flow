import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser } = useContext(UserContext);

  if (!currentUser?.token || !currentUser?.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
