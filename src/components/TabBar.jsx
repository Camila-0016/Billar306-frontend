import { NavLink } from "react-router-dom";
import { Clock, Table2, ShoppingCart, Users, Menu } from "lucide-react";
import "./TabBar.css";

const TABS = [
  { to: "/turno", Icon: Clock, label: "Turno" },
  { to: "/mesas", Icon: Table2, label: "Mesas" },
  { to: "/venta", Icon: ShoppingCart, label: "Venta" },
  { to: "/clientes", Icon: Users, label: "Clientes" },
  { to: "/mas", Icon: Menu, label: "Más" },
];

export default function TabBar() {
  return (
    <nav className="tab-bar">
      {TABS.map(({ to, Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => "tab-item" + (isActive ? " active" : "")}
        >
          <Icon size={20} strokeWidth={2} />
          <span className="tab-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}