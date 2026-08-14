import { apiFetch } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerConfiguracion(clave) {
  const res = await apiFetch(`${API_URL}/api/configuraciones/${clave}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al obtener la configuración");
  return res.json();
}

export async function guardarConfiguracion(clave, valor, descripcion) {
  const res = await apiFetch(`${API_URL}/api/configuraciones/${clave}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor, descripcion }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al guardar");
  return res.json();
}