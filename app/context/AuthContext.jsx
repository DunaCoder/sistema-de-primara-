// app/context/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Al cargar, verificar si ya había una sesión guardada en el navegador
  useEffect(() => {
    const storedUser = localStorage.getItem("sesion_escolar");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("sesion_escolar", JSON.stringify(userData));

    // Redirección automática al Dashboard general
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sesion_escolar");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
