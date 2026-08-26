"use client";

import { useState, useEffect } from "react";
import {
  obtenerUsuarios,
  obtenerRoles,
  crearUsuarioAction,
} from "../../actions/usuarios";
import Swal from "sweetalert2";

export default function UsuariosPage() {
  const [tab, setTab] = useState("listado");
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    idRol: "",
    cedula: "",
    nombre: "",
    apellido: "",
    motivoResguardo: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    const resU = await obtenerUsuarios();
    const resR = await obtenerRoles();
    if (resU?.success) setUsuarios(resU.data);
    if (resR?.success) setRoles(resR.data);
    setCargando(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await crearUsuarioAction(formData);
    if (res?.success) {
      Swal.fire("¡Éxito!", res.message, "success");
      setFormData({
        username: "",
        password: "",
        idRol: "",
        cedula: "",
        nombre: "",
        apellido: "",
        motivoResguardo: "",
      });
      setTab("listado");
      cargarDatos();
    } else {
      Swal.fire("Error", res?.error || "No se pudo crear el usuario", "error");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestión de Usuarios
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administración de credenciales e identidades del sistema
          </p>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-2 pt-2">
        <button
          onClick={() => setTab("listado")}
          className={`py-2.5 px-5 font-semibold text-sm rounded-t-lg transition-colors ${
            tab === "listado"
              ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          📋 Listado de Usuarios
        </button>
        <button
          onClick={() => setTab("nuevo")}
          className={`py-2.5 px-5 font-semibold text-sm rounded-t-lg transition-colors ${
            tab === "nuevo"
              ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          ➕ Registrar Nuevo Usuario
        </button>
      </div>

      {cargando ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
          Cargando información...
        </div>
      ) : tab === "listado" ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">ID</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Personal</th>
                <th className="p-4">Cédula</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="text-sm text-slate-700 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="p-4 font-medium text-slate-400">#{u.id}</td>
                  <td className="p-4 font-bold text-slate-900">
                    @{u.username}
                  </td>
                  <td className="p-4 font-medium">{u.nombre}</td>
                  <td className="p-4 font-mono text-xs text-slate-600">
                    {u.cedula}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {u.rol}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.activo
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {u.activo ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto space-y-6"
        >
          {/* Sección 1: Credenciales */}
          <div>
            <h2 className="text-xs font-bold uppercase text-indigo-600 tracking-wider mb-4 border-b border-indigo-100 pb-2">
              1. Credenciales de Cuenta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="ej. jperez"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 bg-white text-slate-900 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 bg-white text-slate-900 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Datos del Usuario y Rol */}
          <div>
            <h2 className="text-xs font-bold uppercase text-indigo-600 tracking-wider mb-4 border-b border-indigo-100 pb-2">
              2. Ficha de Identificación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Rol Asignado *
                </label>
                <select
                  name="idRol"
                  required
                  value={formData.idRol}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 bg-white text-slate-900 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                >
                  <option value="" className="text-slate-400">
                    Seleccione un rol...
                  </option>
                  {roles.map((r) => (
                    <option
                      key={r.idRol}
                      value={r.idRol}
                      className="text-slate-900"
                    >
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  name="cedula"
                  placeholder="ej. 12345678"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 bg-white text-slate-900 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Nombres
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="ej. José David"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 bg-white text-slate-900 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="ej. Perez"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 bg-white text-slate-900 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span>💾</span> Guardar Registro
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
