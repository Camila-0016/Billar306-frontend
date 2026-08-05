import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { obtenerDetalleTurno } from "../../api/reportes";
import { listarUsuarios } from "../../api/usuarios";
import { formatearHora } from "../../utils/fecha";


export default function TurnoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        setReporte(await obtenerDetalleTurno(id));
        setUsuarios(await listarUsuarios());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  function nombreDe(empleadoId) {
    return usuarios.find((u) => u.id === empleadoId)?.nombreUsuario ?? "—";
  }

  function formatearHoras(decimalHoras) {
    if (decimalHoras == null) return "en curso";
    const horas = Math.floor(decimalHoras);
    const minutos = Math.round((decimalHoras - horas) * 60);
    return `${horas}h ${minutos}min`;
  }

  if (cargando) return <p style={{ padding: 16 }}>Cargando...</p>;
  if (error) return <p style={{ padding: 16 }} className="error-msg">{error}</p>;

  const totalMesas = reporte.mesas.reduce((acc, m) => acc + m.total, 0);
  const totalVentas = reporte.ventasDirectas.reduce((acc, v) => acc + v.total, 0);

  return (
    <div className="subpagina">
      <div className="subpagina-header">
        <button className="volver-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <span>Turno — {nombreDe(reporte.titularId)}</span>
      </div>
      <div className="subpagina-body">
        <p className="hint-texto">
          {formatearHora(reporte.fechaInicio)} → {reporte.salida ? formatearHora(reporte.salida) : "en curso"}
          <br />
          Titular: {nombreDe(reporte.titularId)}
          {reporte.auxiliarId && <><br />Auxiliar: {nombreDe(reporte.auxiliarId)}</>}
        </p>

        <h4 className="seccion-titulo">Horas trabajadas</h4>
{reporte.horas.map((h) => (
  <div key={h.id} className="fila-detalle">
    <span>{nombreDe(h.empleadoId)}</span>
    <span>
  {formatearHora(h.fechaInicio)}
  {h.salida ? ` → ${formatearHora(h.salida)} · ${formatearHoras(h.horasTrabajadas)}` : " → en curso"}
</span>
  </div>
))}

        <h4 className="seccion-titulo">Mesas atendidas</h4>
        {reporte.mesas.length === 0 && <p className="hint-texto">Sin mesas en este turno.</p>}
        {reporte.mesas.map((m) => (
     <div
        key={m.sesionId}
        className="fila-detalle clickable"
        onClick={() => navigate(`/mesas/${m.sesionId}`)}
  >
    <span>Mesa {m.mesaNumero} — {m.cliente}</span>
    <span>${m.total.toLocaleString("es-AR")} {m.cerrada ? "✓" : "●"}</span>
  </div>
))}

    <h4 className="seccion-titulo">Ventas directas</h4>
{reporte.ventasDirectas.length === 0 && <p className="hint-texto">Sin ventas directas en este turno.</p>}
{reporte.ventasDirectas.map((v) => (
  <div
    key={v.cuentaId}
    className="fila-detalle clickable"
    onClick={() => navigate(`/mesas/${v.cuentaId}`)}
  >
    <span>{v.cliente}</span>
    <span>${v.total.toLocaleString("es-AR")}</span>
  </div>
))}

        <h4 className="seccion-titulo">Productos vendidos</h4>
{reporte.productosVendidos.length === 0 && <p className="hint-texto">Sin ventas de confitería en este turno.</p>}
{reporte.productosVendidos.map((p) => (
  <div key={p.productoId} className="fila-detalle">
    <span>{p.nombre}</span>
    <span>{p.cantidadTotal} un.</span>
  </div>
))}

        <div className="fila-detalle total">
          <span>TOTAL DEL TURNO</span>
          <span>${(totalMesas + totalVentas).toLocaleString("es-AR")}</span>
        </div>
      </div>
    </div>
  );
}