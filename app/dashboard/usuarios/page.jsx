// app/dashboard/usuarios/page.jsx
'use client'

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { crearUsuarioAction } from '../../actions/usuarios';
import { obtenerRoles } from '../../actions/roles';

export default function UsuariosPage() {
  const [formData, setFormData] = useState({ username: '', password: '', idRol: '' });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function cargarRoles() {
      const data = await obtenerRoles();
      // Filtramos Admin para que no aparezca en el select
      const rolesFiltrados = data.filter(rol => rol.nombre !== 'Admin');
      setRoles(rolesFiltrados);
    }
    cargarRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.username.trim()) {
      await Swal.fire({ icon: 'error', title: 'Campo vacío', text: 'El nombre de usuario es obligatorio.' });
      setLoading(false);
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      await Swal.fire({ icon: 'error', title: 'Contraseña inválida', text: 'Mínimo 6 caracteres.' });
      setLoading(false);
      return;
    }
    if (!formData.idRol) {
      await Swal.fire({ icon: 'error', title: 'Rol no seleccionado', text: 'Debes asignar un rol.' });
      setLoading(false);
      return;
    }

    const payload = {
      username: formData.username.trim(),
      password: formData.password,
      idRol: parseInt(formData.idRol)
    };

    const res = await crearUsuarioAction(payload);

    if (res.success) {
      setSuccess(res.message);
      await Swal.fire({ icon: 'success', title: '✅ Usuario creado', text: res.message, timer: 2000, timerProgressBar: true });
      setFormData({ username: '', password: '', idRol: '' });
    } else {
      setError(res.error);
      await Swal.fire({ icon: 'error', title: '❌ Error', text: res.error });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Control de Accesos (Usuarios)</h1>
        <p className="text-xs text-slate-500 mt-1">Módulo exclusivo de Dirección para dar de alta al personal en la plataforma.</p>
      </div>

      {error && <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-lg text-sm font-medium">⚠️ {error}</div>}
      {success && <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-lg text-sm font-medium">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre de Usuario *</label>
          <input type="text" name="username" maxLength={12} value={formData.username} onChange={handleChange} className="w-full px-3 py-2 text-black border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-mono" placeholder="Ej: jperez" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña *</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} name="password" maxLength={6} value={formData.password} onChange={handleChange} className="w-full px-3 text-black py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500" placeholder="Mínimo 6 caracteres" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-700 font-medium select-none">
              {showPassword ? '🙈 Ocultar' : '👁️ Mostrar'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Rol del Sistema *</label>
          <select name="idRol" value={formData.idRol} onChange={handleChange} className="w-full text-black px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500">
            <option value="">Seleccione un rol</option>
            {roles.map((rol) => (
              <option key={rol.idRol} value={rol.idRol}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-6 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
            {loading ? 'Registrando...' : 'Dar de Alta Usuario 👤'}
          </button>
        </div>
      </form>
    </div>
  );
}