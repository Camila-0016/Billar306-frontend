import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login/Login";
import Turno from "./pages/Turno/Turno";
import Mesas from "./pages/Mesas/Mesas";
import Venta from "./pages/Venta/Venta";
import Clientes from "./pages/Clientes/Clientes";
import Mas from "./pages/Mas/Mas";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/turno" replace />} />
        <Route path="/turno" element={<Turno />} />
        <Route path="/mesas" element={<Mesas />} />
        <Route path="/venta" element={<Venta />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/mas" element={<Mas />} />
      </Route>
    </Routes>
  );
}