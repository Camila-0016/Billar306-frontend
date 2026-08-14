import { apiFetch } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function listarMesas() {
  const res = await apiFetch(`${API_URL}/api/mesas`);
  if (!res.ok) throw new Error("Error al listar mesas");
  return res.json();
}