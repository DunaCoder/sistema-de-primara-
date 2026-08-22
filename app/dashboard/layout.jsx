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

<<<<<<< HEAD
  // Normalización del rol (soporta string directo o un objeto rol)
  const rolBruto = typeof user.rol === 'string' ? user.rol : user.rol?.nombre || '';
  const userRol = rolBruto
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .toUpperCase();

  // 📌 Menú estricto derivado de la Matriz de Alcance Operativo
=======
  // Normalizar el rol ignorando espacios extra o diferencias de mayúsculas
  const rolBruto = typeof user.rol === 'string' ? user.rol : user.rol?.nombre || '';
  const userRol = rolBruto.trim();

  // 📌 Mapeo corregido: Secretaría solo actúa como Data Entry
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
  const menuItems = [
    { 
      label: 'Inicio Dashboard', 
      path: '/dashboard', 
      icon: '🏠', 
<<<<<<< HEAD
      roles: ['ADMINISTRADOR', 'COORDINADOR', 'DOCENTE', 'SECRETARIA', 'ESTUDIANTE', 'REPRESENTANTE'] 
    },

    // --- ADMINISTRADOR ---
    { 
      label: 'Gestión de Cuentas', 
      path: '/dashboard/usuarios', 
      icon: '👤', 
      roles: ['ADMINISTRADOR'] 
    },
    { 
      label: 'Bitácora de Auditoría', 
      path: '/dashboard/auditoria', 
      icon: '🛡️', 
      roles: ['ADMINISTRADOR'] 
    },

    // --- COORDINADOR ---
    { 
      label: 'Estructura Escolar', 
      path: '/dashboard/estructura', 
      icon: '🏫', 
      roles: ['COORDINADOR'] 
    },
    { 
      label: 'Asignar Asignaturas', 
      path: '/dashboard/asignaciones', 
      icon: '📚', 
      roles: ['COORDINADOR'] 
    },
    { 
      label: 'Control Cierre de Lapso', 
      path: '/dashboard/cierre-lapso', 
      icon: '🔒', 
      roles: ['COORDINADOR'] 
    },

    // --- DOCENTE ---
    { 
      label: 'Registro de Estudiantes y Reportes', 
      path: '/dashboard/reportes', 
      icon: '📄', 
      roles: ['DOCENTE'] 
    },
    { 
      label: 'Carga de Calificaciones', 
      path: '/dashboard/gestion', 
      icon: '✏️', 
      roles: ['DOCENTE'] 
    },
    { 
      label: 'Historial de Actividades', 
      path: '/dashboard/historial', 
      icon: '📜', 
      roles: ['DOCENTE'] 
    },

    // --- SECRETARÍA (RUTAS CORREGIDAS) ---
    { 
      label: 'Matrícula General', 
      path: '/dashboard/inscripciones', 
      icon: '👨‍🎓', 
      roles: ['SECRETARIA'] 
    },
    { 
      label: 'Ficha de Inscripción', 
      path: '/dashboard/estudiante', 
      icon: '📝', 
      roles: ['SECRETARIA'] 
    },

    // --- ESTUDIANTES Y REPRESENTANTES ---
    { 
      label: 'Solicitud Constancias', 
      path: '/dashboard/constancias', 
      icon: '📑', 
      roles: ['ESTUDIANTE', 'REPRESENTANTE'] 
=======
      roles: ['Administrador', 'ADMINISTRADOR', 'Secretaria', 'SECRETARIA', 'Docente', 'DOCENTE', 'Coordinador', 'COORDINADOR'] 
    },
    // --- MÓDULOS DEL ADMINISTRADOR (TÉCNICO / AUDITOR) ---
    { 
      label: 'Gestionar Usuarios', 
      path: '/dashboard/usuarios', 
      icon: '👤', 
      roles: ['Administrador', 'ADMINISTRADOR'] 
    },
    { 
      label: 'Auditoría del Sistema', 
      path: '/dashboard/auditoria', 
      icon: '🛡️', 
      roles: ['Administrador', 'ADMINISTRADOR'] 
    },
    // --- MÓDULOS DEL COORDINADOR (ESTRUCTURA Y ASIGNACIÓN) ---
    { 
      label: 'Asignar Materias', 
      path: '/dashboard/asignaciones', 
      icon: '📚', 
      roles: ['Coordinador', 'COORDINADOR'] 
    },
    // --- MÓDULOS DE SECRETARÍA (DATA ENTRY / REGISTRO MATRÍCULA) ---
    { 
      label: 'Inscribir Estudiante', 
      path: '/dashboard/inscripciones', 
      icon: '📝', 
      roles: ['Secretaria', 'SECRETARIA'] 
    },
    { 
      label: 'Ver Matrícula', 
      path: '/dashboard/estudiante', 
      icon: '👥', 
      roles: ['Secretaria', 'SECRETARIA'] 
    },
    // --- MÓDULOS DEL DOCENTE (EVALUACIÓN Y CALIFICACIONES) ---
    { 
      label: 'Gestión de Estudiantes', 
      path: '/dashboard/estudiantes/nuevo', 
      icon: '👥', 
      roles: ['Docente', 'DOCENTE'] 
    },
    { 
      label: 'Gestión de Notas', 
      path: '/dashboard/gestion', 
      icon: '📝', 
      roles: ['Docente', 'DOCENTE'] 
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
<<<<<<< HEAD
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-lg md:sticky md:top-0 md:h-screen">
        <div className="space-y-6">
          {/* Encabezado del Sistema */}
          <div className="border-b border-slate-700 pb-4 text-center md:text-left">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">U.E.N.B. Republicano</h2>
            <p className="text-xs text-indigo-400 mt-1 font-medium">Gestión Escolar</p>
          </div>

          {/* Tarjeta del Usuario Activo */}
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Usuario:</p>
            <p className="text-sm font-bold text-emerald-400 truncate">
              {user.nombreCompleto || user.username}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Rol: <span className="text-indigo-300 font-semibold">{userRol}</span>
            </p>
          </div>

          {/* Menú Dinámico según Permisos */}
          <nav className="flex flex-col gap-1.5 pt-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-1">
              Módulos Asignados
            </span>
            {menuItems.map((item) => {
              if (!item.roles.includes(userRol)) return null;
              
=======
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-lg md:sticky md:top-0 md:h-screen">
        <div className="space-y-6">
          <div className="border-b border-slate-700 pb-4 text-center md:text-left">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">U.E.N.B.Republicano</h2>
            <p className="text-xs text-indigo-400 mt-1 font-medium">Gestión Escolar</p>
          </div>

          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Usuario:</p>
            <p className="text-sm font-bold text-emerald-400 truncate">{user.nombreCompleto || user.username}</p>
            <p className="text-xs text-slate-400 mt-1">Rol: <span className="text-indigo-300 font-semibold">{userRol}</span></p>
          </div>

          <nav className="flex flex-col gap-1.5 pt-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-1">Módulos</span>
            {menuItems.map((item) => {
              if (!item.roles.includes(userRol)) return null;
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`w-full flex items-center gap-3 py-2.5 px-3 text-sm rounded-lg font-medium transition-all ${
<<<<<<< HEAD
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
=======
                    isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

<<<<<<< HEAD
        {/* Botón de Cierre de Sesión */}
        <button 
          onClick={logout} 
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors shadow-sm mt-6 cursor-pointer"
        >
=======
        <button onClick={logout} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors shadow-sm mt-6">
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
          Cerrar Sesión 🚪
        </button>
      </aside>

<<<<<<< HEAD
      {/* Área Principal de Contenido */}
=======
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}