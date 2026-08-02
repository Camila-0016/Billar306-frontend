import { authHeaders } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerEstadoSalida() {
  const res = await fetch(`${API_URL}/api/salida/estado`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al consultar el estado");
  return res.json();
}

export async function confirmarSalida(cerrarDiaLaboral) {
  const res = await fetch(`${API_URL}/api/salida`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ cerrarDiaLaboral }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al registrar la salida");
  return res.json();
}