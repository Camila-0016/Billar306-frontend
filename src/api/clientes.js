import { apiFetch } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function buscarClientes(nombre) {
  const res = await apiFetch(`${API_URL}/api/clientes/buscar/${nombre}`);
  if (!res.ok) return [];
  return res.json();
}

export async function crearCliente(nombreCompleto) {
  const res = await apiFetch(`${API_URL}/api/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombreCompleto }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Error al crear cliente");
  return res.json();
}

export async function obtenerCliente(id) {
  const res = await apiFetch(`${API_URL}/api/clientes/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function listarClientes() {
  const res = await apiFetch(`${API_URL}/api/clientes`);
  if (!res.ok) throw new Error("Error al listar clientes");
  return res.json();
}