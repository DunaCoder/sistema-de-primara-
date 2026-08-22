// app/dashboard/perfil/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { obtenerPerfilAction } from '../../actions/perfil';

export default function PerfilPage() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // 🔁 REEMPLAZA este ID con el del usuario autenticado (desde sesión, token, etc.)
  const usuarioLogueadoId = 1; // <-- Cambia por el ID real del usuario actual

  useEffect(() => {
    const cargarPerfil = async () => {
      const res = await obtenerPerfilAction(usuarioLogueadoId);
      if (res.success) {
        setPerfil(res.data);
      } else {
        setError(res.error || 'Error al cargar perfil');
      }
      setCargando(false);
    };
    cargarPerfil();
  }, [usuarioLogueadoId]);

  // Colores según rol
  const getRolBadge = (rol) => {
    switch (rol) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Docente':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Secretaria':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Estados de carga y error
  if (cargando) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-500">
        Cargando perfil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-rose-600">
        ❌ {error}
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-500">
        No se encontró el perfil.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Mi Perfil de Usuario</h1>
        <p className="text-xs text-slate-500 mt-1">
          Información de cuenta, credenciales de acceso y asignación de rol.
        </p>
      </div>

      {/* Tarjeta de Perfil */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Banner superior */}
        <div className="h-24 bg-gradient-to-r from-slate-800 to-indigo-900 w-full" />

        <div className="px-6 pb-6 pt-0 relative">
          
          {/* Avatar y nombre */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 mb-6 gap-4">
            <div className="flex items-end gap-4">
              
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden text-2xl font-bold text-slate-500">
                  {perfil.nombre && perfil.apellido ? (
                    <span>{perfil.nombre.charAt(0)}{perfil.apellido.charAt(0)}</span>
                  ) : (
                    <span>{perfil.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button 
                  onClick={() => alert('Función opcional: Subir foto de perfil')}
                  className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full shadow border-2 border-white text-xs"
                  title="Cambiar foto de perfil"
                >
                  📷
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {perfil.nombre} {perfil.apellido}
                </h2>
                <p className="text-xs font-mono text-indigo-600 font-medium">@{perfil.username}</p>
              </div>
            </div>

            {/* Badge de Rol */}
            <div className="self-start sm:self-auto">
              <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold border ${getRolBadge(perfil.rol)}`}>
                Rol: {perfil.rol}
              </span>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
            
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase block">Cédula de Identidad</span>
              <span className="text-sm font-mono font-semibold text-slate-700">
                {perfil.cedula || 'No registrada'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase block">Correo Electrónico</span>
              <span className="text-sm font-medium text-slate-700">
                {perfil.email || 'No registrado'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase block">Nombre de Usuario (Login)</span>
              <span className="text-sm font-mono text-indigo-700 font-semibold">{perfil.username}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase block">Estatus de la Cuenta</span>
              <span className={`text-sm font-semibold ${perfil.estado ? 'text-emerald-600' : 'text-rose-600'}`}>
                {perfil.estado ? '● Activa en la Plataforma' : '● Inactiva'}
              </span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}