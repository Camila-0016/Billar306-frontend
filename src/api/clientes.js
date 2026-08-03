import { authHeaders } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function buscarClientes(nombre) {
  const res = await fetch(`${API_URL}/api/clientes/buscar/${nombre}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function crearCliente(nombreCompleto) {
  const res = await fetch(`${API_URL}/api/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ nombreCompleto }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al crear cliente");
  return res.json();
}

export async function obtenerCliente(id) {
  const res = await fetch(`${API_URL}/api/clientes/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function listarClientes() {
  const res = await fetch(`${API_URL}/api/clientes`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Error al listar clientes");
  return res.json();
}