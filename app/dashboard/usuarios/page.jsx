'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  crearUsuarioAction, 
  obtenerUsuarios, 
  obtenerRoles, 
  actualizarUsuario, 
  cambiarEstadoUsuario 
} from '../../actions/usuarios';

export default function UsuariosPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    idRol: '',
    motivoResguardo: ''
  });

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalReset, setModalReset] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevaClave, setNuevaClave] = useState('');

  // Simulación/Obtención de usuario administrador conectado
  // Reemplaza estos valores por la lectura de tu contexto de sesión (JWT, NextAuth, etc.)
  const adminSesion = {
    id: '1',
    nombre: 'ADMINISTRADOR_SISTEMA'
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resRoles = await obtenerRoles();
      if (resRoles.success) {
        setRoles(resRoles.data);
      } else {
        console.error("Error al obtener roles:", resRoles.error);
      }

      const resUsuarios = await obtenerUsuarios();
      if (resUsuarios.success) {
        setUsuarios(resUsuarios.data);
      } else {
        console.error("Error al obtener usuarios:", resUsuarios.error);
        Swal.fire('Error de Consulta', resUsuarios.error || 'No se pudieron obtener los datos de la base de datos.', 'error');
      }
    } catch (error) {
      console.error("Error crítico de conexión:", error);
      Swal.fire('Error', 'No se pudo conectar con el servidor PostgreSQL.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const res = await crearUsuarioAction({
        username: formData.username,
        password: formData.password,
        idRol: formData.idRol,
        motivoResguardo: formData.motivoResguardo,
        adminId: adminSesion.id,
        adminNombre: adminSesion.nombre
      });

      if (res.success) {
        Swal.fire({
          title: '¡Usuario Creado!',
          text: res.message,
          icon: 'success',
          confirmColor: '#4f46e5'
        });
        setFormData({ username: '', password: '', idRol: '', motivoResguardo: '' });
        cargarDatos();
      } else {
        Swal.fire('Atención', res.error, 'warning');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo procesar el registro.', 'error');
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    try {
      const res = await cambiarEstadoUsuario(
        id, 
        nuevoEstado, 
        adminSesion.id, 
        adminSesion.nombre
      );

      if (res.success) {
        Swal.fire('Estatus Actualizado', res.message, 'success');
        cargarDatos();
      } else {
        Swal.fire('Error', res.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el estado del usuario.', 'error');
    }
  };

  const abrirResetClave = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevaClave('');
    setModalReset(true);
  };

  const handleResetClave = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;

    try {
      const res = await actualizarUsuario(usuarioSeleccionado.id, { 
        password: nuevaClave,
        adminId: adminSesion.id,
        adminNombre: adminSesion.nombre
      });

      if (res.success) {
        setModalReset(false);
        Swal.fire('Éxito', res.message, 'success');
        cargarDatos();
      } else {
        Swal.fire('Error', res.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo restablecer la contraseña.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* CABECERA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Control de Accesos y Gestión de Usuarios</h1>
        <p className="text-xs text-slate-500 mt-1">
          Módulo de Administración para dar de alta al personal con resguardo institucional y trazabilidad en auditoría.
        </p>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dar de Alta Nuevo Usuario</h2>
        </div>

        <form onSubmit={handleCrearUsuario} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre de Usuario (Login) *</label>
            <input
              type="text"
              placeholder="Ej: jperez"
              className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Contraseña Inicial *</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Rol del Sistema *</label>
            <select
              className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={formData.idRol}
              onChange={(e) => setFormData({ ...formData, idRol: e.target.value })}
              required
            >
              <option value="">Seleccione un rol</option>
              {roles.map((r) => (
                <option key={r.idRol} value={r.idRol}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Resguardo Administrativo (Soporte) *</label>
            <input
              type="text"
              placeholder="Ej: Oficio N° 045 / Cargo Contratado"
              className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.motivoResguardo}
              onChange={(e) => setFormData({ ...formData, motivoResguardo: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              Dar de Alta Usuario 👤
            </button>
          </div>
        </form>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Cuentas Registradas en PostgreSQL</h2>
        </div>

        {cargando ? (
          <p className="text-xs text-slate-500 animate-pulse">Cargando datos desde la base de datos...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">#{u.id}</td>
                    <td className="py-3 px-4 font-medium">@{u.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => abrirResetClave(u)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold py-1.5 px-3 rounded-lg border border-amber-200 transition-colors"
                      >
                        🔑 Resetear Clave
                      </button>
                      <button
                        onClick={() => handleToggleEstado(u.id, u.activo)}
                        className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors ${
                          u.activo 
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                        }`}
                      >
                        {u.activo ? '🚫 Desactivar' : '✅ Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL RESETEAR CONTRASEÑA */}
      {modalReset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Restablecer Contraseña</h3>
            <p className="text-xs text-slate-500">
              Ingresa la nueva clave para <strong className="text-slate-700">@{usuarioSeleccionado?.username}</strong>.
            </p>

            <form onSubmit={handleResetClave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nueva Contraseña *</label>
                <input
                  type="password"
                  value={nuevaClave}
                  onChange={(e) => setNuevaClave(e.target.value)}
                  placeholder="Ingresa la nueva clave"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalReset(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
                >
                  Confirmar Cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}