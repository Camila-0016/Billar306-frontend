import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import InfoCard from "../../components/InfoCard";
import { Clock } from "lucide-react";
import { formatearHora } from "../../utils/fecha";
import {
  listarDiasLaborales,
  abrirDiaLaboral,
  cerrarDiaLaboral,
} from "../../api/diaLaboral";
import {
  listarTurnos,
  abrirTurno,
  obtenerActivos,
  asignarAuxiliar,
  retirarAuxiliar,
  cerrarTurno,
} from "../../api/turnos";
import { listarUsuarios } from "../../api/usuarios";

export default function Turno() {
  const [diaLaboral, setDiaLaboral] = useState(null);
  const [turno, setTurno] = useState(null);
  const [activos, setActivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [titularSeleccionado, setTitularSeleccionado] = useState("");
  const [auxiliarSeleccionado, setAuxiliarSeleccionado] = useState("");

  async function cargarEstado() {
    try {
      setError(null);
      const dias = await listarDiasLaborales();
      const diaAbierto = dias.find((d) => !d.estaCerrado) ?? null;
      setDiaLaboral(diaAbierto);

      const turnos = await listarTurnos();
      const turnoAbierto = turnos.find((t) => !t.salida) ?? null;
      setTurno(turnoAbierto);

      if (turnoAbierto) {
        const act = await obtenerActivos(turnoAbierto.id);
        setActivos(act);
      } else {
        setActivos([]);
      }

      const users = await listarUsuarios();
      setUsuarios(users);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEstado();
  }, []);

  function nombreDe(empleadoId) {
    return usuarios.find((u) => u.id === empleadoId)?.nombreUsuario ?? "—";
  }

  async function accion(fn) {
    try {
      setError(null);
      await fn();
      await cargarEstado();
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) {
    return (
      <>
        <PageHeader icon="🕐" title="TURNO" />
        <p>Cargando...</p>
      </>
    );
  }

  const idsActivos = activos.map((a) => a.empleadoId);
  const usuariosDisponibles = usuarios.filter((u) => !idsActivos.includes(u.id));

  return (
    <>
      <PageHeader Icon={Clock} title="TURNO" />

      {error && <div className="error-msg">{error}</div>}

      {/* --- DÍA LABORAL --- */}
      <InfoCard>
        <div className="fila">
          <span>
            <span className={`estado-dot ${diaLaboral ? "abierto" : "cerrado"}`} />
            Día laboral: {diaLaboral ? "ABIERTO" : "CERRADO"}
          </span>
          {diaLaboral && <span>{formatearHora(diaLaboral.fechaInicio)}</span>}
        </div>

        {!diaLaboral && (
          <button
            className="btn-primary"
            style={{ marginTop: 10 }}
            onClick={() => accion(() => abrirDiaLaboral())}
          >
            ABRIR DÍA LABORAL
          </button>
        )}

        {diaLaboral && !turno && (
          <button
            className="btn-secondary"
            style={{ marginTop: 10 }}
            onClick={() => accion(() => cerrarDiaLaboral(diaLaboral.id))}
          >
            CERRAR DÍA LABORAL
          </button>
        )}
      </InfoCard>

      {/* --- SIN TURNO ABIERTO --- */}
      {diaLaboral && !turno && (
        <InfoCard>
          <label>¿Quién abre el turno?</label>
          <select
            value={titularSeleccionado}
            onChange={(e) => setTitularSeleccionado(e.target.value)}
          >
            <option value="">Seleccioná un empleado...</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombreUsuario}
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            disabled={!titularSeleccionado}
            onClick={() => accion(() => abrirTurno(Number(titularSeleccionado)))}
          >
            ABRIR TURNO
          </button>
        </InfoCard>
      )}

      {/* --- TURNO ABIERTO --- */}
      {turno && (
        <InfoCard>
          <div className="fila">
            <span>
              <span className="estado-dot abierto" />
              Turno: ABIERTO
            </span>
            <span>{formatearHora(turno.fechaInicio)}</span>
          </div>

          <label style={{ marginTop: 12 }}>Presentes ahora</label>
          {activos.map((a) => (
            <div className="fila" key={a.id}>
              <span>
                {nombreDe(a.empleadoId)}
                {a.empleadoId === turno.titularId ? " (titular)" : " (aux.)"}
              </span>
              <span>
                {formatearHora(a.fechaInicio)}
                {a.empleadoId !== turno.titularId && (
                  <button
                    style={{ marginLeft: 8, color: "var(--color-error)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => accion(() => retirarAuxiliar(turno.id, a.empleadoId))}
                  >
                    ✕
                  </button>
                )}
              </span>
            </div>
          ))}

          <label style={{ marginTop: 12 }}>Asignar auxiliar</label>
          <select
            value={auxiliarSeleccionado}
            onChange={(e) => setAuxiliarSeleccionado(e.target.value)}
          >
            <option value="">Seleccioná un empleado...</option>
            {usuariosDisponibles.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombreUsuario}
              </option>
            ))}
          </select>
          <button
            className="btn-secondary"
            disabled={!auxiliarSeleccionado}
            onClick={() =>
              accion(async () => {
                await asignarAuxiliar(turno.id, Number(auxiliarSeleccionado));
                setAuxiliarSeleccionado("");
              })
            }
          >
            + ASIGNAR AUXILIAR
          </button>

          <button
            className="btn-peligro"
            style={{ marginTop: 10 }}
            onClick={() => accion(() => cerrarTurno(turno.id))}
          >
            CERRAR TURNO
          </button>
        </InfoCard>
      )}
    </>
  );
}