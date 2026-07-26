import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { obtenerEstadoSalida, confirmarSalida } from "../../api/salida";

export default function Salida() {
  const navigate = useNavigate();
  const { sesion } = useAuth();
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cerrarDia, setCerrarDia] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    obtenerEstadoSalida(sesion.usuarioId)
      .then(setEstado)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  async function confirmar() {
    try {
      setError(null);
      const resultado = await confirmarSalida(sesion.usuarioId, cerrarDia);
      setAviso(resultado.mensaje);
      setConfirmado(true);
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) return <p style={{ padding: 16 }}>Cargando...</p>;

  if (confirmado) {
    return (
      <>
        <PageHeader Icon={LogOut} title="SALIDA" />
        <p>Salida registrada correctamente.</p>
        {aviso && <p className="hint-texto">{aviso}</p>}
        <button className="btn-primary" onClick={() => navigate("/turno")}>VOLVER</button>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader Icon={LogOut} title="SALIDA" />
        <div className="error-msg">{error}</div>
        <button className="btn-secondary" onClick={() => navigate("/turno")}>VOLVER</button>
      </>
    );
  }

  return (
    <>
      <PageHeader Icon={LogOut} title="SALIDA" />
      <p>Hola, {sesion.nombreUsuario}.</p>

      {estado.esUnicoActivo ? (
        <>
          <div className="error-msg aviso-amarillo">
            Sos el único activo en el turno. Al confirmar, el turno se cerrará.
          </div>

          {!estado.hayMesasAbiertas ? (
            <label className="checkbox-fila">
              <input
                type="checkbox"
                checked={cerrarDia}
                onChange={(e) => setCerrarDia(e.target.checked)}
              />
              También cerrar el día laboral
            </label>
          ) : (
            <p className="hint-texto">Hay mesas abiertas — el día laboral no puede cerrarse todavía.</p>
          )}
        </>
      ) : (
        <p className="hint-texto">Vas a retirarte del turno. El turno sigue abierto para los demás.</p>
      )}

      <button className="btn-peligro" style={{ marginTop: 14 }} onClick={confirmar}>
        CONFIRMAR SALIDA
      </button>
    </>
  );
}