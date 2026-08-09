// app/page.jsx
'use client'

import { useState } from 'react';
import { loginAction } from './actions/auth';
import { useAuth } from './context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    if (!username || !password) {
      setError('Por favor, rellene todos los campos.');
      setIsPending(false);
      return;
    }

    // Ejecutamos el Server Action directamente como una función
    const res = await loginAction(username, password);

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
          <h1 className="text-xl font-bold text-slate-800 mt-2">Unidad Educativa Nacional Bicentanario Republicano </h1>
          <p className="text-sm text-slate-500">Sistema de Control y Gestión Escolar</p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-3 mb-4 rounded text-sm font-medium animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors mt-2"
          >
            {isPending ? 'Validando Credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Cuentas de prueba del seed: <br />
            <span className="font-mono text-slate-500">admin | docente | secretaria</span>
          </p>
        </div>

      </div>
    </main>
  );
}