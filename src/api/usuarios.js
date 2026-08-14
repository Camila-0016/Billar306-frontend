import { authHeaders } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function listarUsuarios() {
  const res = await fetch(`${API_URL}/api/usuarios`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Error al listar usuarios");
  return res.json();
}

export async function crearUsuario({ nombreUsuario, password, rol }) {
  const res = await fetch(`${API_URL}/api/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ nombreUsuario, password, rol }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al crear usuario");
  return res.json();
}

export async function actualizarUsuario(id, { nombreUsuario, rol, activo }) {
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ id, nombreUsuario, rol, activo }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al actualizar usuario");
}