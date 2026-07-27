// app/dashboard/page.jsx
'use client'

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  // Si por algún motivo el layout aún está procesando la redirección
  if (!user) return null;

  // Renderizar accesos directos en la pizarra según el rol del usuario (RBAC)
  const renderQuickActions = () => {
    switch (user.rol) {
      case 'Admin':
        return (
          <>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
              <span className="text-2xl">👥</span>
              <h3 className="font-bold text-slate-700 mt-2 text-sm">Control de Usuarios</h3>
              <p className="text-xs text-slate-500 mt-1">Gestionar credenciales, roles y permisos del personal.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
              <span className="text-2xl">📝</span>
              <h3 className="font-bold text-slate-700 mt-2 text-sm">Auditoría del Sistema</h3>
              <p className="text-xs text-slate-500 mt-1">Ver bitácoras y logs de movimientos en la base de datos.</p>
            </div>
          </>
        );
      case 'Secretaria':
        return (
          <Link href="/dashboard/inscripciones" className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group text-left">
            <span className="text-2xl">📝</span>
            <h3 className="font-bold text-slate-700 group-hover:text-indigo-600 mt-2 text-sm">Nueva Inscripción</h3>
            <p className="text-xs text-slate-500 mt-1">Registrar fichas de nuevos alumnos y sus representantes.</p>
          </Link>
        );
      case 'Docente':
        return (
          <Link href="/dashboard/notas" className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group text-left">
            <span className="text-2xl">📊</span>
            <h3 className="font-bold text-slate-700 group-hover:text-indigo-600 mt-2 text-sm">Cargar Calificaciones</h3>
            <p className="text-xs text-slate-500 mt-1">Subir literales y apreciaciones cualitativas por lapso.</p>
          </Link>
        );
      case 'Nomina':
        return (
          <Link href="/dashboard/nomina" className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group text-left">
            <span className="text-2xl">💼</span>
            <h3 className="font-bold text-slate-700 group-hover:text-indigo-600 mt-2 text-sm">Procesar Quincena</h3>
            <p className="text-xs text-slate-500 mt-1">Calcular asignaciones, deducciones y emitir recibos.</p>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TARJETA DE BIENVENIDA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Panel Operativo
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">
            ¡Saludos, {user.nombreCompleto}!
          </h1>
          <p className="text-sm text-slate-500">
            Conectado al Sistema de Control de la U.E.N.B. Crucita Delgado. Selecciona una acción para empezar.
          </p>
        </div>
        <div className="bg-slate-100 p-4 rounded-full text-3xl text-slate-700 border border-slate-200 hidden md:block select-none">
          🏢
        </div>
      </div>

      {/* ESTADÍSTICAS / RESUMEN DE CONTROL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-lg text-xl">📅</div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Año Escolar Activo</p>
            <p className="text-lg font-bold text-slate-800">2025 - 2026</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-lg text-xl">🛡️</div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Estatus de Conexión</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              PostgreSQL + Prisma 7
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="bg-amber-50 p-3 rounded-lg text-xl">🔑</div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Rol Asignado</p>
            <p className="text-lg font-bold text-slate-800">{user.rol}</p>
          </div>
        </div>

      </div>

      {/* PIZARRA DE ACCIONES RÁPIDAS (DINÁMICA POR ROL) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Acciones rápidas recomendadas para tu perfil
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderQuickActions()}
          
          {/* Acción común para todos los usuarios */}
          <Link href="/dashboard/perfil" className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
            <span className="text-2xl">👤</span>
            <h3 className="font-bold text-slate-700 mt-2 text-sm">Mi Perfil</h3>
            <p className="text-xs text-slate-500 mt-1">Ver tus datos personales, cargo y cambiar contraseña.</p>
          </Link>
        </div>
      </div>

    </div>
  );
}