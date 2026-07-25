import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  listarCatalogos,
  listarProductosPorCatalogo,
  crearCatalogo,
  crearProducto,
  actualizarProducto,
} from "../../api/productos";
import Modal from "../../components/Modal";
import "./SubPagina.css";

export default function Catalogo() {
  const navigate = useNavigate();
  const [catalogos, setCatalogos] = useState([]);
  const [productosPorCatalogo, setProductosPorCatalogo] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalCategoria, setModalCategoria] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState("");

  const [modalProducto, setModalProducto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null); // null = alta nueva
  const [formProducto, setFormProducto] = useState({ nombre: "", precio: "", descripcion: "", catalogoId: "" });
  const [errorModal, setErrorModal] = useState(null);

  async function cargar() {
    try {
      setError(null);
      const cats = await listarCatalogos();
      setCatalogos(cats);
      const mapa = {};
      for (const cat of cats) {
        mapa[cat.id] = await listarProductosPorCatalogo(cat.id);
      }
      setProductosPorCatalogo(mapa);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarCategoria() {
    try {
      setErrorModal(null);
      if (!nombreCategoria.trim()) {
        setErrorModal("Ingresá un nombre de categoría.");
        return;
      }
      await crearCatalogo(nombreCategoria.trim());
      setNombreCategoria("");
      setModalCategoria(false);
      await cargar();
    } catch (e) {
      setErrorModal(e.message);
    }
  }

  function abrirAltaProducto(catalogoId) {
    setProductoEditando(null);
    setFormProducto({ nombre: "", precio: "", descripcion: "", catalogoId });
    setErrorModal(null);
    setModalProducto(true);
  }

  function abrirEdicionProducto(producto) {
    setProductoEditando(producto);
    setFormProducto({
      nombre: producto.nombre,
      precio: String(producto.precio),
      descripcion: producto.descripcion ?? "",
      catalogoId: producto.catalogoId,
      activo: producto.activo,
    });
    setErrorModal(null);
    setModalProducto(true);
  }

  async function confirmarProducto() {
    try {
      setErrorModal(null);
      const precioNum = Number(formProducto.precio);
      if (!formProducto.nombre.trim() || !precioNum || precioNum <= 0) {
        setErrorModal("Completá nombre y un precio válido.");
        return;
      }

      if (productoEditando) {
        await actualizarProducto(productoEditando.id, {
          nombre: formProducto.nombre.trim(),
          precio: precioNum,
          descripcion: formProducto.descripcion,
          activo: formProducto.activo,
        });
      } else {
        await crearProducto({
          nombre: formProducto.nombre.trim(),
          precio: precioNum,
          descripcion: formProducto.descripcion,
          catalogoId: Number(formProducto.catalogoId),
        });
      }

      setModalProducto(false);
      await cargar();
    } catch (e) {
      setErrorModal(e.message);
    }
  }

  if (cargando) return <p style={{ padding: 16 }}>Cargando...</p>;

  return (
    <div className="subpagina">
      <div className="subpagina-header">
        <button className="volver-btn" onClick={() => navigate("/mas")}>
          <ArrowLeft size={20} />
        </button>
        <span>Catálogo</span>
      </div>
      <div className="subpagina-body">
        {error && <div className="error-msg">{error}</div>}

        {catalogos.map((cat) => (
          <div key={cat.id}>
            <div className="categoria-titulo">{cat.categoria.toUpperCase()}</div>
            {(productosPorCatalogo[cat.id] ?? []).map((p) => (
              <div key={p.id} className="fila-detalle" onClick={() => abrirEdicionProducto(p)} style={{ cursor: "pointer" }}>
                <span>{p.nombre}{!p.activo ? " (inactivo)" : ""}</span>
                <span>${p.precio.toLocaleString("es-AR")} ✎</span>
              </div>
            ))}
            <button className="btn-secondary" style={{ marginTop: 8, marginBottom: 16 }} onClick={() => abrirAltaProducto(cat.id)}>
              + Producto en {cat.categoria}
            </button>
          </div>
        ))}

        <button className="btn-secondary" onClick={() => { setNombreCategoria(""); setErrorModal(null); setModalCategoria(true); }}>
          + Nueva categoría
        </button>
      </div>

      {modalCategoria && (
        <Modal title="Nueva categoría" onClose={() => setModalCategoria(false)}>
          {errorModal && <div className="error-msg">{errorModal}</div>}
          <label>Nombre</label>
          <input value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} />
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmarCategoria}>CREAR</button>
        </Modal>
      )}

      {modalProducto && (
        <Modal title={productoEditando ? "Editar producto" : "Nuevo producto"} onClose={() => setModalProducto(false)}>
          {errorModal && <div className="error-msg">{errorModal}</div>}
          <label>Nombre</label>
          <input
            value={formProducto.nombre}
            onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
          />
          <label>Precio</label>
          <input
            type="number"
            value={formProducto.precio}
            onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })}
          />
          <label>Descripción</label>
          <input
            value={formProducto.descripcion}
            onChange={(e) => setFormProducto({ ...formProducto, descripcion: e.target.value })}
          />
          {productoEditando && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={formProducto.activo}
                onChange={(e) => setFormProducto({ ...formProducto, activo: e.target.checked })}
              />
              Activo
            </label>
          )}
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmarProducto}>
            {productoEditando ? "GUARDAR CAMBIOS" : "CREAR PRODUCTO"}
          </button>
        </Modal>
      )}
    </div>
  );
}