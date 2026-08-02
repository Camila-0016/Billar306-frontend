import { authHeaders } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function listarTurnos() {
  const res = await fetch(`${API_URL}/api/turnos`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Error al listar turnos");
  return res.json();
}

export async function abrirTurno() {
  const res = await fetch(`${API_URL}/api/turnos/abrir`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al abrir turno");
  return res.json();
}

export async function obtenerActivos(turnoId) {
  const res = await fetch(`${API_URL}/api/turnos/${turnoId}/activos`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Error al obtener empleados activos");
  return res.json();
}

export async function asignarAuxiliar(turnoId, auxiliarId) {
  const res = await fetch(`${API_URL}/api/turnos/${turnoId}/auxiliar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ auxiliarId }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al asignar auxiliar");
}

export async function retirarAuxiliar(turnoId, empleadoId) {
  const res = await fetch(`${API_URL}/api/turnos/${turnoId}/auxiliar/${empleadoId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al retirar auxiliar");
}

export async function cerrarTurno(turnoId) {
  const res = await fetch(`${API_URL}/api/turnos/${turnoId}/cerrar`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al cerrar turno");
}