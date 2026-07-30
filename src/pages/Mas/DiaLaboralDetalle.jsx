import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listarDiasLaborales } from "../../api/diaLaboral";
import { listarUsuarios } from "../../api/usuarios";
import { formatearHora, formatearFecha, parsearFechaUtc } from "../../utils/fecha";
import "./SubPagina.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function DiaLaboralDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dia, setDia] = useState(null);
  const [numeroDia, setNumeroDia] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`${API_URL}/api/dialaborales/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el detalle del día");
        const detalle = await res.json();
        setDia(detalle);

        const todos = await listarDiasLaborales();
        const ascendente = todos
          .slice()
          .sort((a, b) => parsearFechaUtc(a.fechaInicio) - parsearFechaUtc(b.fechaInicio));
        const idx = ascendente.findIndex((d) => d.id === Number(id));
        setNumeroDia(idx >= 0 ? idx + 1 : null);

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

  if (cargando) return <p style={{ padding: 16 }}>Cargando...</p>;
  if (error) return <p style={{ padding: 16 }} className="error-msg">{error}</p>;

  const turnosOrdenados = dia.turnos
    .slice()
    .sort((a, b) => parsearFechaUtc(a.fechaInicio) - parsearFechaUtc(b.fechaInicio));

  return (
    <div className="subpagina">
      <div className="subpagina-header">
        <button className="volver-btn" onClick={() => navigate("/mas/dias-laborales")}>
          <ArrowLeft size={20} />
        </button>
        <span>Día #{numeroDia} — {formatearFecha(dia.fechaInicio)}</span>
      </div>
      <div className="subpagina-body">
        {turnosOrdenados.length === 0 && <p className="hint-texto">Sin turnos registrados este día.</p>}
        {turnosOrdenados.map((turno, i) => (
          <div key={turno.id} className="turno-card" onClick={() => navigate(`/mas/turno/${turno.id}`)}>
            <div className="turno-card-top">
              <span className="turno-titulo">Turno #{i + 1}</span>
              <span className="hint-texto">
                {formatearHora(turno.fechaInicio)} — {turno.salida ? formatearHora(turno.salida) : "en curso"} hs
              </span>
            </div>
            <div className="turno-personal">
              Personal: {nombreDe(turno.titularId)} (Titular)
              {turno.auxiliarId && ` + ${nombreDe(turno.auxiliarId)} (Aux.)`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}