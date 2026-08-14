export function authHeaders() {
  const sesion = JSON.parse(localStorage.getItem("billar306_sesion") ?? "null");
  return sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {};
}

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers ?? {}), ...authHeaders() },
  });

  if (res.status === 401) {
    localStorage.removeItem("billar306_sesion");
    window.location.href = "/login";
    throw new Error("Tu sesión expiró. Iniciá sesión nuevamente.");
  }

  return res;
}