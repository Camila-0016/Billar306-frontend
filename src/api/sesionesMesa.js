const API_URL = import.meta.env.VITE_API_URL;

export async function listarSesionesAbiertas() {
  const res = await fetch(`${API_URL}/api/sesionesmesa/abiertas`);
  if (!res.ok) throw new Error("Error al listar sesiones abiertas");
  return res.json();
}

export async function obtenerSesion(id) {
  const res = await fetch(`${API_URL}/api/sesionesmesa/${id}`);
  if (!res.ok) throw new Error("Error al obtener la sesión");
  return res.json();
}

export async function abrirSesion({ mesaId, clienteId, nombreClienteNuevo, empleadoAperturaId }) {
  const res = await fetch(`${API_URL}/api/sesionesmesa/abrir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mesaId, clienteId, nombreClienteNuevo, empleadoAperturaId }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al abrir la mesa");
  return res.json();
}

export async function cerrarSesion(id, empleadoCierreId) {
  const res = await fetch(`${API_URL}/api/sesionesmesa/${id}/cerrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empleadoCierreId }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al cerrar la mesa");
}