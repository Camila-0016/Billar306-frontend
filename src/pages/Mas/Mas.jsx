import { Menu, Settings, Package, ClipboardList, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import "./Mas.css";

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
      <p className="sesion-actual">Sesión: {sesion?.nombreUsuario}</p>

      <div className="menu-item" onClick={() => navigate("/mas/configuracion")}>
        <Settings size={18} /> Configuración (tarifas)
      </div>
      <div className="menu-item" onClick={() => navigate("/mas/catalogo")}>
        <Package size={18} /> Catálogo / Productos
      </div>
      <div className="menu-item" onClick={() => navigate("/mas/dias-laborales")}>
        <ClipboardList size={18} /> Historial días laborales
      </div>
      <div className="menu-item peligro" onClick={manejarCierre}>
        <LogOut size={18} /> Cerrar sesión
      </div>
    </>
  );
}