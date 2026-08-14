import { NavLink } from "react-router-dom";
import { Clock, Table2, ShoppingCart, Users, Menu } from "lucide-react";

const TABS = [
  { to: "/turno", Icon: Clock, label: "Turno" },
  { to: "/mesas", Icon: Table2, label: "Mesas" },
  { to: "/venta", Icon: ShoppingCart, label: "Venta" },
  { to: "/clientes", Icon: Users, label: "Clientes" },
  { to: "/mas", Icon: Menu, label: "Más" },
];

export default function TabBar() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex bg-[#14100e] border-t border-[#2a2420] z-40">
      {TABS.map(({ to, Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center pt-2 pb-2.5 no-underline text-[11px] ${
              isActive ? "text-dorado-claro font-bold" : "text-[#8a8378]"
            }`
          }
        >
          <Icon size={20} strokeWidth={2} className="mb-0.5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}