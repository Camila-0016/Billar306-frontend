export function authHeaders() {
  const sesion = JSON.parse(localStorage.getItem("billar306_sesion") ?? "null");
  return sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {};
}