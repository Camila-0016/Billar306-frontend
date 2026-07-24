import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { listarMesas } from "../../api/mesas";
import { listarSesionesAbiertas, abrirSesion } from "../../api/sesionesMesa";
import { buscarClientes } from "../../api/clientes";
import { listarUsuarios } from "../../api/usuarios";
import { listarTurnos, obtenerActivos } from "../../api/turnos";
import "./Mesas.css";

export default function Mesas() {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [empleadosActivos, setEmpleadosActivos] = useState([]);
  const [turnoAbierto, setTurnoAbierto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [resultadosCliente, setResultadosCliente] = useState([]);
  const [clienteElegido, setClienteElegido] = useState(null);
  const [nombreClienteNuevo, setNombreClienteNuevo] = useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [errorModal, setErrorModal] = useState(null);

  async function cargar() {
    try {
      setError(null);
      const [mesasData, sesionesData, usuariosData, turnosData] = await Promise.all([
        listarMesas(),
        listarSesionesAbiertas(),
        listarUsuarios(),
        listarTurnos(),
      ]);
      setMesas(mesasData);
      setSesiones(sesionesData);
      setUsuarios(usuariosData);

      const abierto = turnosData.find((t) => !t.salida) ?? null;
      setTurnoAbierto(abierto);
      setEmpleadosActivos(abierto ? await obtenerActivos(abierto.id) : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 20000);
    return () => clearInterval(intervalo);
  }, []);

  function nombreDe(empleadoId) {
    return usuarios.find((u) => u.id === empleadoId)?.nombreUsuario ?? "—";
  }

  function sesionDeMesa(mesaId) {
    return sesiones.find((s) => s.mesaId === mesaId);
  }

  function abrirModal(mesa) {
    if (!turnoAbierto) {
      setError("No hay un turno abierto. Abrí uno primero en la pestaña Turno.");
      return;
    }
    setMesaSeleccionada(mesa);
    setBusquedaCliente("");
    setResultadosCliente([]);
    setClienteElegido(null);
    setNombreClienteNuevo("");
    setEmpleadoSeleccionado("");
    setErrorModal(null);
  }

  async function buscarClienteInput(valor) {
  setBusquedaCliente(valor);
  setClienteElegido(null);
  setNombreClienteNuevo(""); // al buscar un existente, se limpia el campo de "nuevo"
  if (valor.length < 2) {
    setResultadosCliente([]);
    return;
  }
  setResultadosCliente(await buscarClientes(valor));
}

function escribirClienteNuevo(valor) {
  setNombreClienteNuevo(valor);
  if (valor.length > 0) {
    // al escribir un cliente nuevo, se limpia la búsqueda de existente
    setClienteElegido(null);
    setBusquedaCliente("");
    setResultadosCliente([]);
  }
}

  async function confirmarApertura() {
    try {
      setErrorModal(null);
      const tieneExistente = Boolean(clienteElegido);
const tieneNuevo = nombreClienteNuevo.trim().length > 0;

if (tieneExistente === tieneNuevo) {
  setErrorModal(
    tieneExistente
      ? "No podés indicar un cliente existente y uno nuevo a la vez."
      : "Elegí un cliente existente o escribí uno nuevo."
  );
  return;
}
      if (!empleadoSeleccionado) {
        setErrorModal("Seleccioná qué empleado abre la mesa.");
        return;
      }

      await abrirSesion({
        mesaId: mesaSeleccionada.id,
        clienteId: clienteElegido ? clienteElegido.id : null,
        nombreClienteNuevo: clienteElegido ? null : nombreClienteNuevo.trim(),
        empleadoAperturaId: Number(empleadoSeleccionado),
      });

      setMesaSeleccionada(null);
      await cargar();
    } catch (e) {
      setErrorModal(e.message);
    }
  }

  if (cargando) {
    return (
      <>
        <PageHeader Icon={Table2} title="MESAS" />
        <p>Cargando...</p>
      </>
    );
  }

  return (
    <>
      <PageHeader Icon={Table2} title="MESAS" />
      {error && <div className="error-msg">{error}</div>}

      <div className="mesas-grid">
        {mesas.map((mesa) => {
          const sesion = sesionDeMesa(mesa.id);
          const ocupada = Boolean(sesion);
          return (
            <button
              key={mesa.id}
              className={`mesa-card ${ocupada ? "ocupada" : "libre"}`}
              onClick={() => (ocupada ? navigate(`/mesas/${sesion.id}`) : abrirModal(mesa))}
            >
              Mesa {mesa.numero}
              <span className="monto">
                {ocupada ? `$${sesion.totalActual.toLocaleString("es-AR")}` : "Libre"}
              </span>
            </button>
          );
        })}
      </div>

      {mesaSeleccionada && (
        <Modal title={`Abrir Mesa ${mesaSeleccionada.numero}`} onClose={() => setMesaSeleccionada(null)}>
          {errorModal && <div className="error-msg">{errorModal}</div>}

          <label>Cliente</label>
<input
  placeholder="Buscar cliente..."
  value={busquedaCliente}
  onChange={(e) => buscarClienteInput(e.target.value)}
  disabled={nombreClienteNuevo.length > 0}
/>
{resultadosCliente.map((c) => (
  <div
    key={c.id}
    className={`resultado-cliente ${clienteElegido?.id === c.id ? "elegido" : ""}`}
    onClick={() => {
      setClienteElegido(c);
      setBusquedaCliente(c.nombreCompleto);
      setResultadosCliente([]);
    }}
  >
    {c.nombreCompleto}
  </div>
))}

<div className="separador-o">— o —</div>

<label>Cliente nuevo</label>
<input
  placeholder="Nombre completo"
  value={nombreClienteNuevo}
  onChange={(e) => escribirClienteNuevo(e.target.value)}
  disabled={Boolean(clienteElegido)}
/>

          <label style={{ marginTop: 12 }}>Empleado que abre</label>
          <select value={empleadoSeleccionado} onChange={(e) => setEmpleadoSeleccionado(e.target.value)}>
            <option value="">Seleccioná un empleado...</option>
            {empleadosActivos.map((a) => (
              <option key={a.empleadoId} value={a.empleadoId}>{nombreDe(a.empleadoId)}</option>
            ))}
          </select>

          <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmarApertura}>
            ABRIR MESA
          </button>
        </Modal>
      )}
    </>
  );
}