import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { obtenerConfiguracion, guardarConfiguracion } from "../../api/configuracion";

export default function Configuracion() {
  const navigate = useNavigate();
  const [valor, setValor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  async function cargar() {
    try {
      const actual = await obtenerConfiguracion("TarifaHoraMesa");
      if (actual) {
        setValor(String(actual.valor));
        setDescripcion(actual.descripcion ?? "");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardar() {
    try {
      setError(null);
      setExito(null);
      const numero = Number(valor);
      if (!valor || isNaN(numero) || numero <= 0) {
        setError("Ingresá un monto válido.");
        return;
      }
      await guardarConfiguracion("TarifaHoraMesa", numero, descripcion || null);
      setExito("Tarifa actualizada correctamente.");
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) return <p style={{ padding: 16 }}>Cargando...</p>;

  return (
    <div className="subpagina">
      <div className="subpagina-header">
        <button className="volver-btn" onClick={() => navigate("/mas")}>
          <ArrowLeft size={20} />
        </button>
        <span>Configuración</span>
      </div>
      <div className="subpagina-body">
        {error && <div className="error-msg">{error}</div>}
        {exito && <div className="exito-msg">{exito}</div>}

        <label>Tarifa hora de mesa</label>
        <input
          type="number"
          placeholder="$ 500"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <label>Descripción (opcional)</label>
        <input
          placeholder="Vigente desde julio 2026"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <button className="btn-primary" onClick={guardar}>GUARDAR</button>

        <h4 className="seccion-titulo" style={{ marginTop: 20 }}>
          Otros parámetros (sin uso todavía)
        </h4>
        <p style={{ fontSize: 12, color: "#999", lineHeight: 1.8 }}>
          • Tarifa hora empleado<br />
          • Tarifa hora encargado<br />
          • Umbral faltante admisible<br />
          • Monto limpieza baño
        </p>
      </div>
    </div>
  );
}