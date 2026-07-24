import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => {
    const guardada = localStorage.getItem("billar306_sesion");
    return guardada ? JSON.parse(guardada) : null;
  });

  useEffect(() => {
    if (sesion) {
      localStorage.setItem("billar306_sesion", JSON.stringify(sesion));
    } else {
      localStorage.removeItem("billar306_sesion");
    }
  }, [sesion]);

  function iniciarSesion(datos) {
    setSesion(datos);
  }

  function cerrarSesion() {
    setSesion(null);
  }

  return (
    <AuthContext.Provider value={{ sesion, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}