const API_URL = import.meta.env.VITE_API_URL;

export async function listarCatalogos() {
  const res = await fetch(`${API_URL}/api/catalogos`);
  if (!res.ok) throw new Error("Error al listar catálogos");
  return res.json();
}

export async function listarProductosPorCatalogo(catalogoId) {
  const res = await fetch(`${API_URL}/api/productos/catalogo/${catalogoId}`);
  if (!res.ok) throw new Error("Error al listar productos");
  return res.json();
}