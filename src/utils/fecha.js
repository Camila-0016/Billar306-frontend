export function parsearFechaUtc(fechaStr) {
  if (!fechaStr) return null;
  const conZ = fechaStr.endsWith("Z") ? fechaStr : fechaStr + "Z";
  return new Date(conZ);
}

export function formatearHora(fechaStr) {
  const fecha = parsearFechaUtc(fechaStr);
  return fecha
    ? fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "-";
}