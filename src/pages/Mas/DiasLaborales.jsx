import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listarDiasLaborales } from "../../api/diaLaboral";
import { formatearHora } from "../../utils/fecha";
import { useAuth } from "../../context/AuthContext";
import "./SubPagina.css";

export default function DiasLaborales() {
  const navigate = useNavigate();
  const [dias, setDias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { sesion } = useAuth();

  useEffect(() => {
  listarDiasLaborales()
    .then((data) => {
      const ordenados = data.slice().reverse();
      const filtrados = sesion?.rol === "Jefe" ? ordenados : ordenados.filter((d) => !d.estaCerrado);
      setDias(filtrados);
    })
    .catch((e) => setError(e.message))
    .finally(() => setCargando(false));
}, [sesion]);
  if (cargando) return <p style={{ padding: 16 }}>Cargando...</p>;

  return (
    <div className="subpagina">
      <div className="subpagina-header">
        <button className="volver-btn" onClick={() => navigate("/mas")}>
          <ArrowLeft size={20} />
        </button>
        <span>Días Laborales</span>
      </div>
      <div className="subpagina-body">
        {error && <div className="error-msg">{error}</div>}
        {dias.map((dia) => (
          <div key={dia.id} className="dia-card" onClick={() => navigate(`/mas/dias-laborales/${dia.id}`)}>
            <div className="dia-fecha">
              <span className={`estado-dot ${dia.estaCerrado ? "cerrado" : "abierto"}`} />
              {dia.estaCerrado ? "Cerrado" : "Abierto"} — desde {formatearHora(dia.fechaInicio)}
              {dia.estaCerrado && ` hasta ${formatearHora(dia.fechaCierre)}`}
            </div>
          </div>
        ))}
        {dias.length === 0 && <p className="hint-texto">No hay días laborales registrados.</p>}
      </div>
    </div>
  );
}