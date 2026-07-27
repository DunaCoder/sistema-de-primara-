// app/dashboard/usuarios/page.jsx
'use client'

import { useState } from 'react';
import { crearUsuarioAction } from '../../actions/usuarios';

export default function GestionUsuariosPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ error: '', success: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ error: '', success: '' });

    if (!formData.username || !formData.password || !formData.rol) {
      setStatus({ error: 'Todos los campos son obligatorios.', success: '' });
      setLoading(false);
      return;
    }

    const res = await crearUsuarioAction(formData);

    if (res.success) {
      setStatus({ error: '', success: res.message });
      setFormData({ username: '', password: '', rol: '' });
    } else {
      setStatus({ error: res.error, success: '' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Control de Accesos (Usuarios)</h1>
        <p className="text-xs text-slate-500 mt-1">Módulo exclusivo de Dirección para dar de alta al personal en la plataforma.</p>
      </div>

      {status.error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-lg text-sm font-medium">
          ⚠️ {status.error}
        </div>
      )}
      {status.success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-lg text-sm font-medium">
          ✅ {status.success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre de Usuario *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 text-black border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Ej: jperez"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña *</label>
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 text-black py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Rol del Sistema *</label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="w-full  text-black px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Seleccione un rol</option>
            <option value="Docente">Docente de Aula</option>
            <option value="Secretaria">Personal Administrativo / Secretaría</option>
            <option value="Admin">Administrador General / Directivo</option>
            <option value="Nomina">Nómina</option> {/* si aplica */}
          </select>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Dar de Alta Usuario 👤'}
          </button>
        </div>
      </form>
    </div>
  );
}