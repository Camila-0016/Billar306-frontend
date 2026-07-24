import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { listarCatalogos, listarProductosPorCatalogo } from "../../api/productos";
import { buscarClientes } from "../../api/clientes";
import { crearVentaDirecta } from "../../api/confiteria";
import { listarTurnos, obtenerActivos } from "../../api/turnos";
import { listarUsuarios } from "../../api/usuarios";
import "./Venta.css";

export default function Venta() {
  const [catalogos, setCatalogos] = useState([]);
  const [productosPorCatalogo, setProductosPorCatalogo] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [empleadosActivos, setEmpleadosActivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [resultadosCliente, setResultadosCliente] = useState([]);
  const [clienteElegido, setClienteElegido] = useState(null);
  const [nombreClienteNuevo, setNombreClienteNuevo] = useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [exito, setExito] = useState(null);

  async function cargar() {
    try {
      setError(null);
      const cats = await listarCatalogos();
      setCatalogos(cats);

      const productosMap = {};
      for (const cat of cats) {
        productosMap[cat.id] = await listarProductosPorCatalogo(cat.id);
      }
      setProductosPorCatalogo(productosMap);

      const [usuariosData, turnos] = await Promise.all([listarUsuarios(), listarTurnos()]);
      setUsuarios(usuariosData);

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
  }, []);

  function nombreDe(empleadoId) {
    return usuarios.find((u) => u.id === empleadoId)?.nombreUsuario ?? "—";
  }

  function cambiarCantidad(productoId, delta) {
    setCantidades((prev) => {
      const actual = prev[productoId] ?? 0;
      const nueva = Math.max(0, actual + delta);
      return { ...prev, [productoId]: nueva };
    });
  }

  function itemsDelCarrito() {
    const todos = Object.values(productosPorCatalogo).flat();
    return Object.entries(cantidades)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => {
        const producto = todos.find((p) => p.id === Number(productoId));
        return { productoId: Number(productoId), cantidad, nombre: producto?.nombre, precio: producto?.precio };
      });
  }

  const carrito = itemsDelCarrito();
  const totalCarrito = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  async function buscarClienteInput(valor) {
    setBusquedaCliente(valor);
    setClienteElegido(null);
    setNombreClienteNuevo("");
    if (valor.length < 2) {
      setResultadosCliente([]);
      return;
    }
    setResultadosCliente(await buscarClientes(valor));
  }

  function escribirClienteNuevo(valor) {
    setNombreClienteNuevo(valor);
    if (valor.length > 0) {
      setClienteElegido(null);
      setBusquedaCliente("");
      setResultadosCliente([]);
    }
  }

  async function confirmarVenta() {
    try {
      setError(null);
      setExito(null);

      if (carrito.length === 0) {
        setError("Agregá al menos un producto con el +.");
        return;
      }

      const tieneExistente = Boolean(clienteElegido);
      const tieneNuevo = nombreClienteNuevo.trim().length > 0;
      if (tieneExistente === tieneNuevo) {
        setError(
          tieneExistente
            ? "No podés indicar un cliente existente y uno nuevo a la vez."
            : "Elegí un cliente existente o escribí uno nuevo."
        );
        return;
      }

      if (!empleadoSeleccionado) {
        setError("Seleccioná qué empleado registra la venta.");
        return;
      }

      await crearVentaDirecta({
        clienteId: clienteElegido ? clienteElegido.id : null,
        nombreClienteNuevo: clienteElegido ? null : nombreClienteNuevo.trim(),
        empleadoId: Number(empleadoSeleccionado),
        items: carrito.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
      });

      setExito("Venta registrada correctamente.");
      setCantidades({});
      setClienteElegido(null);
      setBusquedaCliente("");
      setNombreClienteNuevo("");
      setEmpleadoSeleccionado("");
      setConfirmando(false);
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) {
    return (
      <>
        <PageHeader Icon={ShoppingCart} title="VENTA DIRECTA" />
        <p>Cargando...</p>
      </>
    );
  }

  return (
    <>
      <PageHeader Icon={ShoppingCart} title="VENTA DIRECTA" />
      {error && <div className="error-msg">{error}</div>}
      {exito && <div className="exito-msg">{exito}</div>}

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

      {carrito.length > 0 && (
        <>
          <div className="seccion-titulo">Carrito</div>
          {carrito.map((i) => (
            <div key={i.productoId} className="fila-detalle">
              <span>{i.cantidad}x {i.nombre}</span>
              <span>${(i.precio * i.cantidad).toLocaleString("es-AR")}</span>
            </div>
          ))}
          <div className="fila-detalle total">
            <span>Total</span>
            <span>${totalCarrito.toLocaleString("es-AR")}</span>
          </div>

          {!confirmando && (
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => setConfirmando(true)}>
              CONFIRMAR VENTA
            </button>
          )}

          {confirmando && (
            <div className="confirmacion-venta">
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

              <label style={{ marginTop: 12 }}>Empleado</label>
              <select value={empleadoSeleccionado} onChange={(e) => setEmpleadoSeleccionado(e.target.value)}>
                <option value="">Seleccioná un empleado...</option>
                {empleadosActivos.map((a) => (
                  <option key={a.empleadoId} value={a.empleadoId}>{nombreDe(a.empleadoId)}</option>
                ))}
              </select>

              <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmarVenta}>
                FINALIZAR VENTA
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}