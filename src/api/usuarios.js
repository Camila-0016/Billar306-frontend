const API_URL = import.meta.env.VITE_API_URL;

export async function listarUsuarios() {
  const res = await fetch(`${API_URL}/api/usuarios`);
  if (!res.ok) throw new Error("Error al listar usuarios");
  return res.json();
}