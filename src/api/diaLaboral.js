import { apiFetch } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function listarDiasLaborales() {
  const res = await apiFetch(`${API_URL}/api/dialaborales`);
  if (!res.ok) throw new Error("Error al listar días laborales");
  return res.json();
}

export async function abrirDiaLaboral() {
  const res = await apiFetch(`${API_URL}/api/dialaborales/abrir`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al abrir día laboral");
  return res.json();
}

export async function cerrarDiaLaboral(id) {
  const res = await apiFetch(`${API_URL}/api/dialaborales/${id}/cerrar`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al cerrar día laboral");
}