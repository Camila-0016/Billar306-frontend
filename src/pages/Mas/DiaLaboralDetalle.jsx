import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listarUsuarios } from "../../api/usuarios";
import { formatearHora } from "../../utils/fecha";
import "./SubPagina.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function DiaLaboralDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dia, setDia] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`${API_URL}/api/dialaborales/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el detalle del día");
        setDia(await res.json());
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

  return (
    <div className="subpagina">
      <div className="subpagina-header">
        <button className="volver-btn" onClick={() => navigate("/mas/dias-laborales")}>
          <ArrowLeft size={20} />
        </button>
        <span>Día {formatearHora(dia.fechaInicio)}</span>
      </div>
      <div className="subpagina-body">
        {dia.turnos.length === 0 && <p className="hint-texto">Sin turnos registrados este día.</p>}
        {dia.turnos.map((turno) => (
          <div key={turno.id} className="dia-card" onClick={() => navigate(`/mas/turno/${turno.id}`)}>
            <div className="dia-fecha">
              Turno — {nombreDe(turno.titularId)}
              {turno.auxiliarId && ` + ${nombreDe(turno.auxiliarId)}`}
            </div>
            <div className="hint-texto">
              {formatearHora(turno.fechaInicio)} → {turno.salida ? formatearHora(turno.salida) : "en curso"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}