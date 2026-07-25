import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RutaSoloJefe({ children }) {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  if (sesion?.rol === "Jefe") {
    return children;
  }

  return (
    <div style={{ padding: 16 }}>
      <button
        onClick={() => navigate("/mas")}
        style={{
          background: "none",
          border: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 14,
          cursor: "pointer",
          color: "var(--color-fieltro)",
          fontWeight: "bold",
        }}
      >
        <ArrowLeft size={18} /> Volver
      </button>
      <div className="error-msg">
        No tenés acceso a esta sección. Solo el Jefe puede ingresar aquí.
      </div>
    </div>
  );
}