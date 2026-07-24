import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function manejarIngreso() {
    try {
      setError(null);
      if (!nombreUsuario.trim() || !password) {
        setError("Completá usuario y contraseña.");
        return;
      }
      setCargando(true);
      const resultado = await login(nombreUsuario.trim(), password);
      iniciarSesion(resultado);
      navigate("/turno");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  function manejarEnter(e) {
    if (e.key === "Enter") manejarIngreso();
  }

  return (
    <div className="login-screen">
      <div className="login-logo">🎱 BILLAR 306</div>

      {error && <div className="error-msg login-error">{error}</div>}

      <label>Usuario</label>
      <input
        type="text"
        placeholder="Usuario"
        value={nombreUsuario}
        onChange={(e) => setNombreUsuario(e.target.value)}
        onKeyDown={manejarEnter}
      />

      <label>Contraseña</label>
      <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={manejarEnter}
      />

      <button className="btn-primary" disabled={cargando} onClick={manejarIngreso}>
        {cargando ? "INGRESANDO..." : "INGRESAR"}
      </button>
    </div>
  );
}