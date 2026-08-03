const API_URL = import.meta.env.VITE_API_URL;

export async function login(nombreUsuario, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombreUsuario, password }),
  });
  if (!res.ok) throw new Error((await res.json()).mensaje ?? "Usuario o contraseña incorrectos");
  return res.json();
}




