import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ children }) {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  return children;
}