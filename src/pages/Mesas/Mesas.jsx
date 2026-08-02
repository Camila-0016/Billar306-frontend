import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { listarMesas } from "../../api/mesas";
import { listarSesionesAbiertas, abrirSesion } from "../../api/sesionesMesa";
import { buscarClientes } from "../../api/clientes";
import { listarTurnos } from "../../api/turnos";
import "./Mesas.css";

export default function Mesas() {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [turnoAbierto, setTurnoAbierto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [resultadosCliente, setResultadosCliente] = useState([]);
  const [clienteElegido, setClienteElegido] = useState(null);
  const [nombreClienteNuevo, setNombreClienteNuevo] = useState("");
  const [errorModal, setErrorModal] = useState(null);

  async function cargar() {
    try {
      setError(null);
      const [mesasData, sesionesData, turnosData] = await Promise.all([
        listarMesas(),
        listarSesionesAbiertas(),
        listarTurnos(),
      ]);
      setMesas(mesasData);
      setSesiones(sesionesData);

      const abierto = turnosData.find((t) => !t.salida) ?? null;
      setTurnoAbierto(abierto);
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
      if (!clienteElegido && !nombreClienteNuevo.trim()) {
        setErrorModal("Elegí un cliente existente o escribí uno nuevo.");
        return;
      }

      await abrirSesion({
        mesaId: mesaSeleccionada.id,
        clienteId: clienteElegido ? clienteElegido.id : null,
        nombreClienteNuevo: clienteElegido ? null : nombreClienteNuevo.trim(),
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

          <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmarApertura}>
            ABRIR MESA
          </button>
        </Modal>
      )}
    </>
  );
}