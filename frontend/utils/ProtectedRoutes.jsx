import { useAuth } from "../src/context/AuthContext.jsx";
import { Navigate } from "react-router";

const ProtectedRoutes = ({ children, requireRole }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!requireRole.includes(user.role)) {
    // Role not allowed
    return <Navigate to="/unauthorized" replace />;
  }

  return children; // User is allowed
};

export default ProtectedRoutes;
