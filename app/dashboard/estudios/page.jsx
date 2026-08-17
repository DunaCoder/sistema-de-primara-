// app/dashboard/usuarios/page.jsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { obtenerUsuarios, actualizarUsuario } from '../../actions/usuarios';

export default function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', activo: true });
  const [savingId, setSavingId] = useState(null);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    const res = await obtenerUsuarios();
    if (res.success) {
      setUsuarios(res.data); // ya vienen con 'activo' y 'rol'
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const startEditing = (usr) => {
    setEditingId(usr.id);
    setEditForm({
      username: usr.username || '',
      activo: usr.activo !== undefined ? usr.activo : true,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ username: '', activo: true });
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/\s+/g, '');
    setEditForm(prev => ({ ...prev, username: val }));
  };

  const saveChanges = async (id) => {
    if (!editForm.username.trim()) return;
    setSavingId(id);

    // Llamada correcta: pasamos un objeto con id y campos
    const res = await actualizarUsuario({
      id,
      username: editForm.username,
      activo: editForm.activo
    });

    if (!res?.success) {
      alert(res?.error || 'Error al actualizar');
      setSavingId(null);
      return;
    }

    // Actualización optimista
    setUsuarios(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, username: editForm.username, activo: editForm.activo }
          : u
      )
    );
    setSavingId(null);
    setEditingId(null);
  };

  const toggleEstatus = async (usr) => {
    const nuevoActivo = !usr.activo;
    setSavingId(usr.id);

    const res = await actualizarUsuario({
      id: usr.id,
      activo: nuevoActivo
    });

    if (!res?.success) {
      alert(res?.error || 'Error al cambiar estatus');
      setSavingId(null);
      return;
    }

    setUsuarios(prev =>
      prev.map(u => (u.id === usr.id ? { ...u, activo: nuevoActivo } : u))
    );
    setSavingId(null);
  };

  const getRolBadge = (rol = '') => {
    const rolLower = rol.toLowerCase();
    if (rolLower.includes('admin') || rolLower.includes('director')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (rolLower.includes('docente')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (rolLower.includes('secretaria') || rolLower.includes('secretario')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const usuariosActivosCount = usuarios.filter(u => u.activo).length;
  const docentesCount = usuarios.filter(u => u.rol?.toLowerCase().includes('docente')).length;
  const secretariaCount = usuarios.filter(u => u.rol?.toLowerCase().includes('secretaria')).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Control de Usuarios y Personal</h1>
            <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
              Solo Admin 🔒
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de accesos a la plataforma, asignación de roles e intermediación de cuentas.
          </p>
        </div>

        <Link
          href="/dashboard/usuarios/nuevo"  // ← cambia a la ruta de creación real
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center gap-2 shrink-0"
        >
          ➕ Registrar Nuevo Usuario
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Usuarios Activos</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {loading ? '...' : usuariosActivosCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Docentes de Aula</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {loading ? '...' : docentesCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Personal de Secretaría</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {loading ? '...' : secretariaCount}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-700">Cuentas Registradas en el Sistema</h2>
          <span className="text-xs text-slate-400 font-mono">
            {loading ? 'Cargando...' : `Total: ${usuarios.length} registros`}
          </span>
        </div>

        {loading && (
          <div className="p-8 text-center text-slate-500 text-sm">
            ⏳ Cargando lista de usuarios desde PostgreSQL...
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-50 text-rose-700 text-xs font-medium border-b border-rose-100 flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button
              onClick={cargarUsuarios}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 rounded text-rose-800 font-bold transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Nombre de Usuario</th>
                  <th className="p-4 text-center">Rol en Sistema</th>
                  <th className="p-4 text-center">Estatus</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 text-xs font-medium">
                      No hay usuarios registrados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usr) => {
                    const isEditing = editingId === usr.id;
                    const isSaving = savingId === usr.id;

                    return (
                      <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono text-slate-600 font-medium">{usr.id}</td>

                        {/* Nombre de usuario editable */}
                        <td className="p-4 font-mono text-xs">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.username}
                              onChange={handleUsernameChange}
                              maxLength={12}
                              className="px-2 py-1 border border-indigo-400 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs text-black w-full max-w-[140px]"
                            />
                          ) : (
                            <span className="text-indigo-600 font-medium">{usr.username}</span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-md font-semibold border ${getRolBadge(usr.rol)}`}>
                            {usr.rol}
                          </span>
                        </td>

                        {/* Estatus Editable */}
                        <td className="p-4 text-center">
                          {isEditing ? (
                            <select
                              value={editForm.activo ? 'true' : 'false'}
                              onChange={(e) => setEditForm(prev => ({ ...prev, activo: e.target.value === 'true' }))}
                              className="text-xs px-2 py-1 border border-slate-300 rounded bg-white font-medium text-black"
                            >
                              <option value="true">Activo</option>
                              <option value="false">Inactivo</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => toggleEstatus(usr)}
                              disabled={isSaving}
                              title="Haz clic para alternar estatus"
                              className="cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                            >
                              {usr.activo ? (
                                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ● Activo
                                </span>
                              ) : (
                                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  ○ Inactivo
                                </span>
                              )}
                            </button>
                          )}
                        </td>

                        {/* Botones de Acción */}
                        <td className="p-4 text-center">
                          {isEditing ? (
                            <div className="flex justify-center items-center gap-1">
                              <button
                                onClick={() => saveChanges(usr.id)}
                                disabled={isSaving}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                {isSaving ? '...' : '💾 Guardar'}
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={isSaving}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(usr)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                            >
                              ✏️ Editar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}