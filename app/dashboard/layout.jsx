'use client';

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

  // Normalización estricta del rol (elimina acentos, espacios extra y convierte a mayúsculas)
  const rolBruto = typeof user.rol === 'string' ? user.rol : user.rol?.nombre || '';
  const userRol = rolBruto
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  // Matriz de accesos y navegación
  const menuItems = [
    { 
      label: 'Inicio', 
      path: '/dashboard', 
      icon: '🏠', 
      roles: ['ADMINISTRADOR', 'ADMIN', 'COORDINADOR', 'COORDINACION', 'DOCENTE', 'PROFESOR', 'SECRETARIA', 'SECRETARIO'] 
    },

    // --- ADMINISTRADOR (Mantenimiento Técnico y Seguridad) ---
    { 
      label: 'Gestión de Cuentas', 
      path: '/dashboard/usuarios', 
      icon: '👤', 
      roles: ['ADMINISTRADOR', 'ADMIN'] 
    },
    { 
      label: 'Bitácora de Auditoría', 
      path: '/dashboard/auditoria', 
      icon: '🛡️', 
      roles: ['ADMINISTRADOR', 'ADMIN'] 
    },

    // --- COORDINADOR (Gestión Académica y Asignaciones) ---
    { 
      label: 'Asignar Materias', 
      path: '/dashboard/asignaciones', 
      icon: '📚', 
      roles: ['COORDINADOR', 'COORDINACION'] 
    },
    { 
      label: 'Cierre de Lapso', 
      path: '/dashboard/cerra', 
      icon: '🔒', 
      roles: ['COORDINADOR', 'COORDINACION'] 
    },

    // --- SECRETARÍA (Registro y Matrícula) ---
    { 
      label: 'Inscribir Estudiante', 
      path: '/dashboard/inscripciones', 
      icon: '📝', 
      roles: ['SECRETARIA', 'SECRETARIO'] 
    },
    { 
      label: 'Matrícula Escolar', 
      path: '/dashboard/estudiante', 
      icon: '👨‍🎓', 
      roles: ['SECRETARIA', 'SECRETARIO'] 
    },

    // --- DOCENTE (Evaluación y Notas) ---
    { 
      label: 'Mis Secciones', 
      path: '/dashboard/reportes', 
      icon: '📄', 
      roles: ['DOCENTE', 'PROFESOR'] 
    },
    { 
      label: 'Cargar Calificaciones', 
      path: '/dashboard/gestion', 
      icon: '✏️', 
      roles: ['DOCENTE', 'PROFESOR'] 
    },

    // --- PERFIL GENERAL ---
    { 
      label: 'Mi Perfil', 
      path: '/dashboard/perfil', 
      icon: '⚙️', 
      roles: ['ADMINISTRADOR', 'ADMIN', 'COORDINADOR', 'COORDINACION', 'DOCENTE', 'PROFESOR', 'SECRETARIA', 'SECRETARIO'] 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-lg md:sticky md:top-0 md:h-screen">
        <div className="space-y-6">
          {/* Encabezado Institucional */}
          <div className="border-b border-slate-700 pb-4 text-center md:text-left">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">U.E.N. Bicentenario</h2>
            <p className="text-xs text-indigo-400 mt-1 font-medium">Gestión Escolar</p>
          </div>

          {/* Tarjeta de Usuario Activo */}
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Usuario activo:</p>
            <p className="text-sm font-bold text-emerald-400 truncate">
              {user.nombreCompleto || user.nombre || user.username}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Rol: <span className="text-indigo-300 font-semibold">{userRol}</span>
            </p>
          </div>

          {/* Menú de Navegación Dinámico */}
          <nav className="flex flex-col gap-1.5 pt-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-1">
              Módulos del Sistema
            </span>
            {menuItems.map((item) => {
              if (!item.roles.includes(userRol)) return null;

              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`w-full flex items-center gap-3 py-2.5 px-3 text-sm rounded-lg font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Cierre de Sesión */}
        <button 
          onClick={logout} 
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors shadow-sm mt-6 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🚪</span> Cerrar Sesión
        </button>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}