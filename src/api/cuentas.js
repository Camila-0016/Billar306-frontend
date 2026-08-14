import { apiFetch } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerCuenta(id) {
  const res = await apiFetch(`${API_URL}/api/cuentas/${id}`);
  if (!res.ok) throw new Error("Cuenta no encontrada");
  return res.json();
}