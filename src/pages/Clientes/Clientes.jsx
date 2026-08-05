import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { buscarClientes, crearCliente, listarClientes } from "../../api/clientes";
import Modal from "../../components/Modal";

export default function Clientes() {
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [errorModal, setErrorModal] = useState(null);
  const [exito, setExito] = useState(null);

  async function cargarTodos() {
    try {
      setError(null);
      setClientes(await listarClientes());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTodos();
  }, []);

  async function buscar(valor) {
    setBusqueda(valor);
    setError(null);

    if (valor.length < 2) {
      await cargarTodos();
      return;
    }

    setBuscando(true);
    try {
      setClientes(await buscarClientes(valor));
    } catch (e) {
      setError(e.message);
    } finally {
      setBuscando(false);
    }
  }

  async function confirmarAlta() {
    try {
      setErrorModal(null);
      if (!nombreNuevo.trim()) {
        setErrorModal("Ingresá un nombre.");
        return;
      }
      await crearCliente(nombreNuevo.trim());
      setExito(`Cliente "${nombreNuevo.trim()}" creado correctamente.`);
      setNombreNuevo("");
      setModalAbierto(false);
      if (busqueda.length >= 2) {
        buscar(busqueda);
      } else {
        cargarTodos();
      }
    } catch (e) {
      setErrorModal(e.message);
    }
  }

  return (
    <>
      <PageHeader Icon={Users} title="CLIENTES" />
      {error && <div className="error-msg">{error}</div>}
      {exito && <div className="exito-msg">{exito}</div>}

      <input placeholder="Buscar..." value={busqueda} onChange={(e) => buscar(e.target.value)} />

      {(cargando || buscando) && <p className="hint-texto">Cargando...</p>}
      {!cargando && !buscando && clientes.length === 0 && (
        <p className="hint-texto">No hay clientes para mostrar.</p>
      )}

      {clientes.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-3 bg-white rounded-xl p-3 mt-2 shadow-sm border border-borde/40"
        >
          <div className="w-10 h-10 rounded-full bg-dorado/20 text-madera-oscura flex items-center justify-center font-bold text-sm shrink-0">
            {c.nombreCompleto.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sm text-[#2b1d12]">{c.nombreCompleto}</span>
        </div>
      ))}

      <button
        className="fixed bottom-[84px] z-40 w-[52px] h-[52px] rounded-full bg-dorado text-madera-oscura border-none flex items-center justify-center shadow-lg cursor-pointer hover:opacity-90 right-[max(24px,calc(50vw-216px))] lg:right-[max(24px,calc(50vw-360px))]"
        onClick={() => {
          setNombreNuevo("");
          setErrorModal(null);
          setModalAbierto(true);
        }}
      >
        <Plus size={22} />
      </button>

      {modalAbierto && (
        <Modal title="Nuevo cliente" onClose={() => setModalAbierto(false)}>
          {errorModal && <div className="error-msg">{errorModal}</div>}
          <label>Nombre completo</label>
          <input
            placeholder="Nombre y apellido"
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
          />
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmarAlta}>
            CREAR CLIENTE
          </button>
        </Modal>
      )}
    </>
  );
}