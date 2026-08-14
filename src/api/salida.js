import { apiFetch } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerEstadoSalida() {
  const res = await apiFetch(`${API_URL}/api/salida/estado`);
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al consultar el estado");
  return res.json();
}

export async function confirmarSalida(cerrarDiaLaboral) {
  const res = await apiFetch(`${API_URL}/api/salida`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cerrarDiaLaboral }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al registrar la salida");
  return res.json();
}