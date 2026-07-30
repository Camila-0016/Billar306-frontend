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

export function formatearDuracion(inicioStr, finStr, ahoraMs) {
  const inicio = parsearFechaUtc(inicioStr);
  const fin = finStr ? parsearFechaUtc(finStr) : new Date(ahoraMs);
  if (!inicio || !fin) return "-";
  const totalMin = Math.floor((fin - inicio) / 60000);
  const horas = Math.floor(totalMin / 60);
  const minutos = totalMin % 60;
  return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
}

export function formatearFecha(fechaStr) {
  const fecha = parsearFechaUtc(fechaStr);
  if (!fecha) return "-";
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}