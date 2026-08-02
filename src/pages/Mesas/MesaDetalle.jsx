import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { obtenerCuenta } from "../../api/cuentas";
import { cerrarSesion } from "../../api/sesionesMesa";
import { obtenerVenta, agregarAMesa, quitarItem } from "../../api/confiteria";
import { listarCatalogos, listarProductosPorCatalogo } from "../../api/productos";
import { listarTurnos, obtenerActivos } from "../../api/turnos";
import { listarUsuarios } from "../../api/usuarios";
import { obtenerCliente } from "../../api/clientes";
import { formatearHora, formatearDuracion, parsearFechaUtc } from "../../utils/fecha";
import Modal from "../../components/Modal";
import "./MesaDetalle.css";

export default function MesaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cuenta, setCuenta] = useState(null);
  const [venta, setVenta] = useState(null);
  const [clienteNombre, setClienteNombre] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [ahora, setAhora] = useState(Date.now());

  const [modalConsumicion, setModalConsumicion] = useState(false);
  const [catalogos, setCatalogos] = useState([]);
  const [productosPorCatalogo, setProductosPorCatalogo] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [errorModal, setErrorModal] = useState(null);

  const [ticket, setTicket] = useState(null);

  async function cargar() {
    try {
      setError(null);
      const cuentaData = await obtenerCuenta(id);
      setCuenta(cuentaData);

      const cliente = await obtenerCliente(cuentaData.clienteId);
      setClienteNombre(cliente?.nombreCompleto ?? "—");

      setVenta(cuentaData.ventaConfiteriaId ? await obtenerVenta(cuentaData.ventaConfiteriaId) : null);

      const [usuariosData] = await Promise.all([listarUsuarios()]);
      setUsuarios(usuariosData);
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

      await agregarAMesa(cuenta.id, items);
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
      await cerrarSesion(cuenta.id);

      const cuentaFinal = await obtenerCuenta(cuenta.id);
      const ventaFinal = cuentaFinal.ventaConfiteriaId ? await obtenerVenta(cuentaFinal.ventaConfiteriaId) : null;

      setTicket({ cuenta: cuentaFinal, venta: ventaFinal });
    } catch (e) {
      setErrorModal(e.message);
    }
  }

  if (cargando) return <p style={{ padding: 16 }}>Cargando...</p>;
  if (error) return <p style={{ padding: 16 }} className="error-msg">{error}</p>;
  if (!cuenta) return <p style={{ padding: 16 }}>No se encontró la cuenta.</p>;

  const esMesa = cuenta.mesaId != null;

  return (
    <div className="mesa-detalle">
      <div className="mesa-detalle-header">
        <button className="volver-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <span>{esMesa ? `Mesa ${cuenta.numeroMesa}` : "Venta directa"}</span>
      </div>

      <div className="mesa-detalle-body">
        <div className="fila-detalle">
          <span>Cliente</span>
          <span>{clienteNombre}</span>
        </div>

        {esMesa ? (
          <>
            <div className="fila-detalle">
              <span>Desde</span>
              <span>{formatearHora(cuenta.fechaInicio)}</span>
            </div>
            <div className="fila-detalle">
              <span>Hasta</span>
              <span>{cuenta.fechaFin ? formatearHora(cuenta.fechaFin) : "en curso"}</span>
            </div>
            <div className="fila-detalle">
              <span>Abrió</span>
              <span>{nombreDe(cuenta.empleadoAperturaId)}</span>
            </div>
            {esMesa && cuenta.empleadoCierreId && (
              <div className="fila-detalle">
                <span>Cerró</span>
                <span>{nombreDe(cuenta.empleadoCierreId)}</span>
              </div>
            )}
            <div className="fila-detalle">
              <span>Tiempo de mesa ({formatearDuracion(cuenta.fechaInicio, cuenta.fechaFin, ahora)})</span>
              <span>${cuenta.montoMesaActual.toLocaleString("es-AR")}</span>
            </div>
          </>
        ) : (
          <>
            <div className="fila-detalle">
              <span>Realizada</span>
              <span>{formatearHora(cuenta.fechaInicio)}</span>
            </div>
            <div className="fila-detalle">
              <span>Empleado</span>
              <span>{nombreDe(cuenta.empleadoAperturaId)}</span>
            </div>
          </>
        )}

        {venta && venta.items.length > 0 && (
          <>
            <h4 className="seccion-titulo">Consumiciones</h4>
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
          <span>${cuenta.totalActual.toLocaleString("es-AR")}</span>
        </div>

        {esMesa && !cuenta.fechaFin && (
          <>
            <button className="btn-secondary" style={{ marginTop: 14 }} onClick={abrirModalConsumicion}>
              + AGREGAR CONSUMICIÓN
            </button>
            <button
              className="btn-peligro"
              style={{ marginTop: 10 }}
              onClick={confirmarCierre}
            >
              CERRAR MESA
            </button>
          </>
        )}

        {esMesa && cuenta.fechaFin && <div className="badge-cerrada">MESA CERRADA</div>}
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
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmarConsumicion}>
            CONFIRMAR PEDIDO
          </button>
        </Modal>
      )}

      {ticket && (
        <Modal title="Mesa cerrada" onClose={() => navigate(-1)}>
          <div className="ticket">
            <div className="ticket-linea"><span>Mesa</span><span>{ticket.cuenta.numeroMesa}</span></div>
            <div className="ticket-linea"><span>Cliente</span><span>{clienteNombre}</span></div>
            <div className="ticket-linea"><span>Desde</span><span>{formatearHora(ticket.cuenta.fechaInicio)}</span></div>
            <div className="ticket-linea"><span>Hasta</span><span>{formatearHora(ticket.cuenta.fechaFin)}</span></div>
            <div className="ticket-linea"><span>Abrió</span><span>{nombreDe(ticket.cuenta.empleadoAperturaId)}</span></div>
            <div className="ticket-linea">
            <span>Tiempo de mesa ({formatearDuracion(ticket.cuenta.fechaInicio, ticket.cuenta.fechaFin, ahora)})</span>
            <span>${ticket.cuenta.montoMesaActual.toLocaleString("es-AR")}</span>
            </div>
            {ticket.venta && ticket.venta.items.length > 0 && (
              <>
                <div className="ticket-subtitulo">Consumiciones</div>
                {ticket.venta.items.map((i) => (
                  <div className="ticket-linea" key={i.id}>
                    <span>{i.cantidad}x {i.nombre}</span>
                    <span>${i.total.toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </>
            )}
            <div className="ticket-linea ticket-total"><span>TOTAL</span><span>${ticket.cuenta.totalActual.toLocaleString("es-AR")}</span></div>
            <div className="ticket-linea"><span>Cerró</span><span>{nombreDe(ticket.cuenta.empleadoCierreId)}</span></div>
          </div>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => navigate(-1)}>LISTO</button>
        </Modal>
      )}
    </div>
  );
}