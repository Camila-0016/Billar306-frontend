const API_URL = import.meta.env.VITE_API_URL;

export async function listarTurnos() {
  const res = await fetch(`${API_URL}/api/turnos`);
  if (!res.ok) throw new Error("Error al listar turnos");
  return res.json();
}

export async function abrirTurno(titularId) {
  const res = await fetch(`${API_URL}/api/turnos/abrir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titularId }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al abrir turno");
  return res.json();
}

export async function obtenerActivos(turnoId) {
  const res = await fetch(`${API_URL}/api/turnos/${turnoId}/activos`);
  if (!res.ok) throw new Error("Error al obtener empleados activos");
  return res.json();
}

export async function asignarAuxiliar(turnoId, auxiliarId) {
  const res = await fetch(`${API_URL}/api/turnos/${turnoId}/auxiliar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auxiliarId }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al asignar auxiliar");
}

export async function retirarAuxiliar(turnoId, empleadoId) {
  const res = await fetch(`${API_URL}/api/turnos/${turnoId}/auxiliar/${empleadoId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al retirar auxiliar");
}

export async function cerrarTurno(turnoId) {
  const res = await fetch(`${API_URL}/api/turnos/${turnoId}/cerrar`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al cerrar turno");
}