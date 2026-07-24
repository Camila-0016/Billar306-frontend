import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

export default function Mas() {
  const navigate = useNavigate();
  const { sesion, cerrarSesion } = useAuth();

  function manejarCierre() {
    cerrarSesion();
    navigate("/login");
  }

  return (
    <>
      <PageHeader Icon={Menu} title="MÁS" />
      <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
        Sesión: {sesion?.nombreUsuario}
      </p>
      <div className="menu-item" onClick={manejarCierre} style={{ cursor: "pointer", color: "var(--color-error)" }}>
        <LogOut size={18} /> Cerrar sesión
      </div>
    </>
  );
}