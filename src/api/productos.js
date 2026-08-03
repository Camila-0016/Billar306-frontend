import { authHeaders } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function listarCatalogos() {
  const res = await fetch(`${API_URL}/api/catalogos`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Error al listar catálogos");
  return res.json();
}

export async function listarProductosPorCatalogo(catalogoId) {
  const res = await fetch(`${API_URL}/api/productos/catalogo/${catalogoId}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Error al listar productos");
  return res.json();
}

export async function crearCatalogo(categoria) {
  const res = await fetch(`${API_URL}/api/catalogos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ categoria }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al crear categoría");
  return res.json();
}

export async function crearProducto({ nombre, precio, descripcion, catalogoId }) {
  const res = await fetch(`${API_URL}/api/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ nombre, precio, descripcion, catalogoId }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al crear producto");
  return res.json();
}

export async function actualizarProducto(id, { nombre, precio, descripcion, activo }) {
  const res = await fetch(`${API_URL}/api/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ id, nombre, precio, descripcion, activo }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al actualizar producto");
}