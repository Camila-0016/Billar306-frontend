import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listarUsuarios, crearUsuario, actualizarUsuario } from "../../api/usuarios";
import Modal from "../../components/Modal";

const ROLES = [
  { valor: 1, nombre: "Empleado" },
  { valor: 2, nombre: "Encargado" },
  { valor: 3, nombre: "Jefe" },
];

function nombreRol(valor) {
  return ROLES.find((r) => r.valor === valor)?.nombre ?? "—";
}

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null); // null = alta nueva
  const [form, setForm] = useState({ nombreUsuario: "", password: "", rol: 1, activo: true });
  const [errorModal, setErrorModal] = useState(null);

  async function cargar() {
    try {
      setError(null);
      setUsuarios(await listarUsuarios());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirAlta() {
    setUsuarioEditando(null);
    setForm({ nombreUsuario: "", password: "", rol: 1, activo: true });
    setErrorModal(null);
    setModalAbierto(true);
  }

  function abrirEdicion(usuario) {
    setUsuarioEditando(usuario);
    setForm({ nombreUsuario: usuario.nombreUsuario, password: "", rol: usuario.rol, activo: usuario.activo });
    setErrorModal(null);
    setModalAbierto(true);
  }

  async function confirmar() {
    try {
      setErrorModal(null);
      if (!form.nombreUsuario.trim()) {
        setErrorModal("Ingresá un nombre de usuario.");
        return;
      }

      if (usuarioEditando) {
        await actualizarUsuario(usuarioEditando.id, {
          nombreUsuario: form.nombreUsuario.trim(),
          rol: Number(form.rol),
          activo: form.activo,
        });
      } else {
        if (!form.password) {
          setErrorModal("Ingresá una contraseña.");
          return;
        }
        await crearUsuario({
          nombreUsuario: form.nombreUsuario.trim(),
          password: form.password,
          rol: Number(form.rol),
        });
      }

      setModalAbierto(false);
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
        <span>Usuarios</span>
      </div>
      <div className="subpagina-body">
        {error && <div className="error-msg">{error}</div>}

        {usuarios.map((u) => (
          <div key={u.id} className="fila-detalle" onClick={() => abrirEdicion(u)} style={{ cursor: "pointer" }}>
            <span>{u.nombreUsuario}{!u.activo ? " (inactivo)" : ""}</span>
            <span>{nombreRol(u.rol)} ✎</span>
          </div>
        ))}

        <button className="btn-secondary" style={{ marginTop: 14 }} onClick={abrirAlta}>
          + Nuevo usuario
        </button>
      </div>

      {modalAbierto && (
        <Modal title={usuarioEditando ? "Editar usuario" : "Nuevo usuario"} onClose={() => setModalAbierto(false)}>
          {errorModal && <div className="error-msg">{errorModal}</div>}

          <label>Nombre de usuario</label>
          <input
            value={form.nombreUsuario}
            onChange={(e) => setForm({ ...form, nombreUsuario: e.target.value })}
          />

          {!usuarioEditando && (
            <>
              <label>Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </>
          )}

          <label>Rol</label>
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            {ROLES.map((r) => (
              <option key={r.valor} value={r.valor}>{r.nombre}</option>
            ))}
          </select>

          {usuarioEditando && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Activo
            </label>
          )}

          <button className="btn-primary" style={{ marginTop: 14 }} onClick={confirmar}>
            {usuarioEditando ? "GUARDAR CAMBIOS" : "CREAR USUARIO"}
          </button>
        </Modal>
      )}
    </div>
  );
}