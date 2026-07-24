import "./Login.css";

export default function Login() {
  return (
    <div className="login-screen">
      <div className="login-logo">🎱 BILLAR 306</div>

      <label>Usuario</label>
      <input type="text" placeholder="Usuario" />

      <label>Contraseña</label>
      <input type="password" placeholder="••••••••" />

      <button className="btn-primary">INGRESAR</button>
    </div>
  );
}