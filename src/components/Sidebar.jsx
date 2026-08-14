import { NavLink, useNavigate } from "react-router-dom";
import { Clock, Table2, ShoppingCart, Users, Menu, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/turno", Icon: Clock, label: "Turno" },
  { to: "/mesas", Icon: Table2, label: "Mesas" },
  { to: "/venta", Icon: ShoppingCart, label: "Venta" },
  { to: "/clientes", Icon: Users, label: "Clientes" },
  { to: "/mas", Icon: Menu, label: "Más" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { sesion, cerrarSesion } = useAuth();

  function manejarCierre() {
    cerrarSesion();
    navigate("/login");
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 bg-[#14100e] text-marfil flex-col justify-between h-screen">
      <div>
        <div className="px-6 py-6 border-b border-[#2a2420]">
          <span className="text-dorado-claro font-bold text-lg">🎱 BILLAR 306</span>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-fieltro text-dorado-claro" : "text-[#8a8378] hover:bg-[#1f1a17]"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="px-4 py-4 border-t border-[#2a2420]">
        <p className="text-xs text-[#8a8378] mb-2 truncate">
          {sesion?.nombreUsuario} · {sesion?.rol}
        </p>
        <button
          onClick={manejarCierre}
          className="flex items-center gap-2 text-sm text-error hover:opacity-80 w-full"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}