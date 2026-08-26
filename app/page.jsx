"use client";

import { useState } from "react";
import { loginAction, cambiarPasswordObligatorioAction } from "./actions/auth";
import { useAuth } from "./context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Estados de visibilidad para cada campo de contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [showConfirmarPassword, setShowConfirmarPassword] = useState(false);

  // Estados para el flujo de Cambio de Clave Provisional
  const [requiereCambio, setRequiereCambio] = useState(false);
  const [usuarioTemporal, setUsuarioTemporal] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const { login } = useAuth();

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    if (!username || !password) {
      setError("Por favor, rellene todos los campos.");
      setIsPending(false);
      return;
    }

    const res = await loginAction(username, password);

    if (res.success) {
      if (res.user.debeCambiarPassword) {
        setUsuarioTemporal(res.user);
        setRequiereCambio(true);
        setIsPending(false);
      } else {
        login(res.user);
      }
    } else {
      setError(res.error);
      setIsPending(false);
    }
  };

  const handleSubmitCambioPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!nuevaPassword || !confirmarPassword) {
      setError("Por favor, complete ambos campos.");
      return;
    }

    if (nuevaPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsPending(true);

    const res = await cambiarPasswordObligatorioAction(
      usuarioTemporal.id,
      nuevaPassword,
      usuarioTemporal.username,
      usuarioTemporal.rol,
    );

    if (res.success) {
      login(res.user);
    } else {
      setError(res.error);
      setIsPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full max-w-md">
        {/* Encabezado Institucional */}
        <div className="text-center mb-6">
          <span className="text-4xl">🏫</span>
          <h1 className="text-xl font-bold text-slate-800 mt-2">
            Unidad Educativa Nacional Bicentenario Republicano
          </h1>
          <p className="text-sm text-slate-500">
            Sistema de Control y Gestión Escolar
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-3 mb-4 rounded text-sm font-medium animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {!requiereCambio ? (
          /* FORMULARIO 1: INICIO DE SESIÓN NORMAL */
          <form onSubmit={handleSubmitLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Usuario de Acceso
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: test_admin"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors mt-2"
            >
              {isPending ? "Validando Credenciales..." : "Iniciar Sesión"}
            </button>
          </form>
        ) : (
          /* FORMULARIO 2: CAMBIO OBLIGATORIO DE CLAVE PROVISIONAL */
          <form onSubmit={handleSubmitCambioPassword} className="space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-3 rounded text-xs mb-2">
              🔒 <strong>Seguridad y Auditoría:</strong> Su contraseña actual es
              provisional. Debe asignar una clave personal para continuar.
            </div>

            {/* NUEVA CONTRASEÑA */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNuevaPassword ? "text" : "password"}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowNuevaPassword(!showNuevaPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showNuevaPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* CONFIRMAR NUEVA CONTRASEÑA */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmarPassword ? "text" : "password"}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repita su nueva clave"
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmarPassword(!showConfirmarPassword)
                  }
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmarPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors mt-2"
            >
              {isPending
                ? "Actualizando Contraseña..."
                : "Establecer Clave y Continuar"}
            </button>
          </form>
        )}

        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Cuentas de prueba del seed: <br />
            <span className="font-mono text-slate-500">
              admin | coordinador | docente | secretaria
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
