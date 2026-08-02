import { authHeaders } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerVenta(id) {
  const res = await fetch(`${API_URL}/api/confiteria/venta/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Error al obtener la venta");
  return res.json();
}

export async function agregarAMesa(sesionMesaId, items) {
  const res = await fetch(`${API_URL}/api/confiteria/mesa/${sesionMesaId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al agregar consumición");
  return res.json();
}

export async function crearVentaDirecta({ clienteId, nombreClienteNuevo, items }) {
  const res = await fetch(`${API_URL}/api/confiteria/venta-directa`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ clienteId, nombreClienteNuevo, items }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al registrar la venta");
  return res.json();
}

export async function quitarItem(itemId) {
  const res = await fetch(`${API_URL}/api/confiteria/items/${itemId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al retirar ítem");
}