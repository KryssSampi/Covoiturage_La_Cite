import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AdminRoute({ children }) {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
