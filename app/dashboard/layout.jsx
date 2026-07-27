// app/dashboard/layout.jsx
'use client'

import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 font-medium animate-pulse">Cargando sistema...</p>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { label: 'Inicio Dashboard', path: '/dashboard', icon: '🏠', roles: ['Admin', 'Secretaria', 'Docente', 'Nomina'] },
    { label: 'Control de Estudios', path: '/dashboard/inscripciones', icon: '📂', roles: ['Docente', 'Secretaria'] },
    { label: 'Gestión de Estudiantes', path: '/dashboard/estudiantes/nuevo', icon: '👥', roles: ['Docente'] },
    { label: 'Notas y Asistencia', path: '/dashboard/notas', icon: '📊', roles: ['Secretaria'] },
    { label: 'Control de Nómina', path: '/dashboard/nomina', icon: '💼', roles: ['Admin', 'Nomina'] }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-lg md:sticky md:top-0 md:h-screen">
        <div className="space-y-6">
          <div className="border-b border-slate-700 pb-4 text-center md:text-left">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">U.E.N.B. Crucita Delgado</h2>
            <p className="text-xs text-indigo-400 mt-1 font-medium">Gestión Escolar</p>
          </div>

          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Usuario:</p>
            <p className="text-sm font-bold text-emerald-400 truncate">{user.nombreCompleto}</p>
            {user.rol === 'Secretaria' && (
  <>
    {/* Pestaña que ya tenías: Registrar Inscripción */}
    <Link 
      href="/dashboard/inscripciones" 
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
    >
      <span>📝</span>
      <span>Inscribir Alumno</span>
    </Link>

    {/* NUEVA PESTAÑA: Matrícula / Buscador de Alumnos */}
    <Link 
      href="/dashboard/alumnos" 
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
    >
      <span>👥</span>
      <span>Ver Matrícula</span>
    </Link>
  </>
)}
          </div>
          {user.rol === 'Admin' && (
        <Link 
          href="/dashboard/usuarios" 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <span>👤</span>
          <span>Gestionar Usuarios</span>
        </Link>
      )}

          <nav className="flex flex-col gap-1.5 pt-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-1">Módulos</span>
            {menuItems.map((item) => {
              if (!item.roles.includes(user.rol)) return null;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`w-full flex items-center gap-3 py-2.5 px-3 text-sm rounded-lg font-medium transition-all ${
                    isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button onClick={logout} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors shadow-sm">
          Cerrar Sesión 🚪
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}