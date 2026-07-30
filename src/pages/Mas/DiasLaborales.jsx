import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listarDiasLaborales } from "../../api/diaLaboral";
import { useAuth } from "../../context/AuthContext";
import { formatearHora, formatearFecha, parsearFechaUtc } from "../../utils/fecha";
import "./SubPagina.css";

export default function DiasLaborales() {
  const navigate = useNavigate();
  const { sesion } = useAuth();
  const [dias, setDias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarDiasLaborales()
      .then((data) => {
        const ascendente = data
          .slice()
          .sort((a, b) => parsearFechaUtc(a.fechaInicio) - parsearFechaUtc(b.fechaInicio));
        const numerados = ascendente.map((d, i) => ({ ...d, numero: i + 1 }));
        const visibles = sesion?.rol === "Jefe" ? numerados : numerados.filter((d) => !d.estaCerrado);
        setDias(visibles.slice().reverse());
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
          <div
            key={dia.id}
            className={`dia-card ${dia.estaCerrado ? "cerrado" : "abierto"}`}
            onClick={() => navigate(`/mas/dias-laborales/${dia.id}`)}
          >
            <div className="dia-card-top">
              <span className="dia-titulo">Día Laboral #{dia.numero}</span>
              <span className={`estado-badge ${dia.estaCerrado ? "cerrado" : "abierto"}`}>
                {dia.estaCerrado ? "CERRADO" : "ABIERTO"}
              </span>
            </div>
            <div className="dia-fecha-texto">{formatearFecha(dia.fechaInicio)}</div>
            <div className="hint-texto">
              {dia.estaCerrado
                ? `${formatearHora(dia.fechaInicio)} a ${formatearHora(dia.fechaCierre)} hs`
                : `Desde las ${formatearHora(dia.fechaInicio)} hs`}
            </div>
          </div>
        ))}
        {dias.length === 0 && <p className="hint-texto">No hay días laborales para mostrar.</p>}
      </div>
    </div>
  );
}