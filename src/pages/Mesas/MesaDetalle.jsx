import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { obtenerSesion, cerrarSesion } from "../../api/sesionesMesa";
import { obtenerVenta, agregarAMesa, quitarItem } from "../../api/confiteria";
import { listarCatalogos, listarProductosPorCatalogo } from "../../api/productos";
import { listarTurnos, obtenerActivos } from "../../api/turnos";
import { listarUsuarios } from "../../api/usuarios";
import { listarMesas } from "../../api/mesas";
import { obtenerCliente } from "../../api/clientes";
import { formatearHora, parsearFechaUtc } from "../../utils/fecha";
import Modal from "../../components/Modal";
import "./MesaDetalle.css";

export default function MesaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sesion, setSesion] = useState(null);
  const [venta, setVenta] = useState(null);
  const [numeroMesa, setNumeroMesa] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [empleadosActivos, setEmpleadosActivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [ahora, setAhora] = useState(Date.now());

  const [modalConsumicion, setModalConsumicion] = useState(false);
  const [catalogos, setCatalogos] = useState([]);
  const [productosPorCatalogo, setProductosPorCatalogo] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [errorModal, setErrorModal] = useState(null);
  const [clienteNombre, setClienteNombre] = useState("");
  const [modalCierre, setModalCierre] = useState(false);
  const [empleadoCierreSeleccionado, setEmpleadoCierreSeleccionado] = useState("");

  async function cargar() {
    try {
      setError(null);
      const sesionData = await obtenerSesion(id);
      setSesion(sesionData);

      setVenta(sesionData.ventaConfiteriaId ? await obtenerVenta(sesionData.ventaConfiteriaId) : null);

      const [usuariosData, turnos, mesas] = await Promise.all([
        listarUsuarios(),
        listarTurnos(),
        listarMesas(),
      ]);
      setUsuarios(usuariosData);
      setNumeroMesa(mesas.find((m) => m.id === sesionData.mesaId)?.numero ?? "-");
      
      const cliente = await obtenerCliente(sesionData.clienteId);
      setClienteNombre(cliente?.nombreCompleto ?? "—");

      const turnoAbierto = turnos.find((t) => !t.salida);
      setEmpleadosActivos(turnoAbierto ? await obtenerActivos(turnoAbierto.id) : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 15000);
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => {
      clearInterval(intervalo);
      clearInterval(reloj);
    };
  }, [id]);

  function nombreDe(empleadoId) {
    return usuarios.find((u) => u.id === empleadoId)?.nombreUsuario ?? "—";
  }

  function estaEnVentana(fechaInicioItem) {
    const inicio = parsearFechaUtc(fechaInicioItem);
    return inicio && ahora - inicio.getTime() < 60000;
  }

  async function abrirModalConsumicion() {
    setErrorModal(null);
    setCantidades({});
    setEmpleadoSeleccionado("");

    const cats = await listarCatalogos();
    setCatalogos(cats);

    const productosMap = {};
    for (const cat of cats) {
      productosMap[cat.id] = await listarProductosPorCatalogo(cat.id);
    }
    setProductosPorCatalogo(productosMap);
    setModalConsumicion(true);
  }

  function cambiarCantidad(productoId, delta) {
    setCantidades((prev) => {
      const actual = prev[productoId] ?? 0;
      const nueva = Math.max(0, actual + delta);
      return { ...prev, [productoId]: nueva };
    });
  }

  async function confirmarConsumicion() {
    try {
      setErrorModal(null);
      const items = Object.entries(cantidades)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([productoId, cantidad]) => ({ productoId: Number(productoId), cantidad }));

      if (items.length === 0) {
        setErrorModal("Agregá al menos un producto con el +.");
        return;
      }
      if (!empleadoSeleccionado) {
        setErrorModal("Seleccioná qué empleado registra el pedido.");
        return;
      }

      await agregarAMesa(sesion.id, Number(empleadoSeleccionado), items);
      setModalConsumicion(false);
      await cargar();
    } catch (e) {
      setErrorModal(e.message);
    }
  }

  async function retirarItem(itemId) {
    try {
      await quitarItem(itemId);
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  async function confirmarCierre() {
    try {
      setErrorModal(null);
      if (!empleadoCierreSeleccionado) {
        setErrorModal("Seleccioná qué empleado cierra la mesa.");
        return;
      }
      await cerrarSesion(sesion.id, Number(empleadoCierreSeleccionado));
      navigate("/mesas");
    } catch (e) {
      setErrorModal(e.message);
    }
  }

  if (cargando) return <p style={{ padding: 16 }}>Cargando...</p>;
  if (!sesion) return <p style={{ padding: 16 }}>Mesa no encontrada.</p>;

  return (
    <div className="mesa-detalle">
      <div className="mesa-detalle-header">
        <button className="volver-btn" onClick={() => navigate("/mesas")}>
          <ArrowLeft size={20} />
        </button>
        <span>Mesa {numeroMesa} — Detalle</span>
      </div>

      <div className="mesa-detalle-body">
        {error && <div className="error-msg">{error}</div>}

        <div className="fila-detalle">
          <span>Cliente</span>
          <span>{clienteNombre}</span>
        </div>
        
        <div className="fila-detalle">
          <span>Desde</span>
          <span>{formatearHora(sesion.fechaInicio)}</span>
        </div>

        <div className="fila-detalle">
          <span>Tiempo de mesa</span>
          <span>${sesion.montoMesaActual.toLocaleString("es-AR")}</span>
        </div>
        
        {venta && venta.items.length > 0 && (
          <>
            <h4 className="seccion-titulo">Consumiciones activas</h4>
            {venta.items.map((item) => {
              const enVentana = estaEnVentana(item.fechaInicio);
              return (
                <div key={item.id} className="item-card">
                  <div className="item-info">
                    <span className="item-nombre">{item.cantidad}x {item.nombre}</span>
                    {enVentana ? (
                      <button className="item-estado anulable" onClick={() => retirarItem(item.id)}>
                        (En tiempo de anulación — tocar para quitar)
                      </button>
                    ) : (
                      <span className="item-estado bloqueado">(Fijo — bloqueado)</span>
                    )}
                  </div>
                  <span className="item-precio">${item.total.toLocaleString("es-AR")}</span>
                </div>
              );
            })}
          </>
        )}

        <div className="fila-detalle total">
          <span>TOTAL</span>
          <span>${sesion.totalActual.toLocaleString("es-AR")}</span>
        </div>

        <button className="btn-secondary" style={{ marginTop: 14 }} onClick={abrirModalConsumicion}>
          + AGREGAR CONSUMICIÓN
        </button>
        <button
          className="btn-peligro"
          style={{ marginTop: 10 }}
          onClick={() => {
            setEmpleadoCierreSeleccionado("");
            setErrorModal(null);
            setModalCierre(true);
          }}
        >
          CERRAR MESA
        </button>
      </div>

      {modalConsumicion && (
        <Modal title="Agregar consumiciones" onClose={() => setModalConsumicion(false)}>
          {errorModal && <div className="error-msg">{errorModal}</div>}

          {catalogos.map((cat) => (
            <div key={cat.id}>
              <div className="categoria-titulo">{cat.categoria.toUpperCase()}</div>
              {(productosPorCatalogo[cat.id] ?? []).map((p) => (
                <div key={p.id} className="producto-fila">
                  <div>
                    <div className="producto-nombre">{p.nombre}</div>
                    <div className="producto-precio">${p.precio.toLocaleString("es-AR")}</div>
                  </div>
                  <div className="cantidad-selector">
                    <button className="cantidad-btn" onClick={() => cambiarCantidad(p.id, -1)}>−</button>
                    <span className="cantidad-valor">{cantidades[p.id] ?? 0}</span>
                    <button className="cantidad-btn" onClick={() => cambiarCantidad(p.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <label style={{ marginTop: 14 }}>Empleado</label>
          <select value={empleadoSeleccionado} onChange={(e) => setEmpleadoSeleccionado(e.target.value)}>
            <option value="">Seleccioná un empleado...</option>
            {empleadosActivos.map((a) => (
              <option key={a.empleadoId} value={a.empleadoId}>{nombreDe(a.empleadoId)}</option>
            ))}
          </select>

          <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmarConsumicion}>
            CONFIRMAR PEDIDO
          </button>
        </Modal>
      )}

      {modalCierre && (
        <Modal title="Cerrar mesa" onClose={() => setModalCierre(false)}>
          {errorModal && <div className="error-msg">{errorModal}</div>}
          <label>¿Qué empleado cierra?</label>
          <select value={empleadoCierreSeleccionado} onChange={(e) => setEmpleadoCierreSeleccionado(e.target.value)}>
            <option value="">Seleccioná un empleado...</option>
            {empleadosActivos.map((a) => (
              <option key={a.empleadoId} value={a.empleadoId}>{nombreDe(a.empleadoId)}</option>
            ))}
          </select>
          <button className="btn-peligro" style={{ marginTop: 14 }} onClick={confirmarCierre}>
            CONFIRMAR CIERRE
          </button>
        </Modal>
      )}
    </div>
  );
}