const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerVenta(id) {
  const res = await fetch(`${API_URL}/api/confiteria/venta/${id}`);
  if (!res.ok) throw new Error("Error al obtener la venta");
  return res.json();
}

export async function agregarAMesa(sesionMesaId, empleadoId, items) {
  const res = await fetch(`${API_URL}/api/confiteria/mesa/${sesionMesaId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empleadoId, items }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al agregar consumición");
  return res.json();
}

export async function quitarItem(itemId) {
  const res = await fetch(`${API_URL}/api/confiteria/items/${itemId}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al retirar ítem");
}