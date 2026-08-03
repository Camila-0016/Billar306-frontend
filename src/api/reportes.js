import { authHeaders } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerDetalleTurno(turnoId) {
  const res = await fetch(`${API_URL}/api/reportes/turno/${turnoId}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Error al obtener el detalle del turno");
  return res.json();
}