// app/dashboard/page.jsx
'use client'

'use client'

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  // ESTOS DATOS SIMULADOS AHORA REPRESENTAN LA "PROYECCIÓN" DEL SISTEMA
  const stats = [
    { label: 'Estudiantes Inscritos', value: '142', icon: '🎓', color: 'bg-blue-50' },
    { label: 'Docentes Activos', value: '28', icon: '👩‍🏫', color: 'bg-emerald-50' },
    { label: 'Secciones / Grados', value: '12', icon: '📋', color: 'bg-amber-50' },
  ];

  const renderQuickActions = () => {
    switch (user.rol) {
      case 'Admin':
        return (
          <>
            <ActionCard title="Control de Usuarios" desc="Gestión integral de personal y jerarquías." icon="👥" href="/dashboard/usuarios" />
            <ActionCard title="Configurar Plan de Estudios" desc="Ajuste de materias y gestión de calificaciones." icon="⚙️" href="/dashboard/config" />
          </>
        );
      case 'Secretaria':
        return <ActionCard title="Registro de Inscripciones" desc="Formalizar estudiantes en el sistema escolar." icon="📝" href="/dashboard/inscripciones" />;
      case 'Docente':
        return <ActionCard title="Cargar Calificaciones" desc="Registro de notas por estudiante y lapso." icon="📊" href="/dashboard/notas" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER CON IDENTIDAD INSTITUCIONAL */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bienvenido al Sistema de Gestión</h1>
          <p className="text-slate-500 mt-2 max-w-lg">
            Plataforma digital para la gestión administrativa y académica de la <b>U.E.N. Bicentenario</b>. 
            Operando bajo el plan de estudios {new Date().getFullYear()}.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-full border border-indigo-100">
          <span className="text-sm font-bold text-indigo-700">{user.nombreCompleto}</span>
          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-md font-bold">{user.rol}</span>
        </div>
      </div>

      {/* KPI GRID (Lo que demuestra que el sistema funciona) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-4 rounded-xl text-2xl`}>{stat.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ACCIONES RÁPIDAS (Limpio y profesional) */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Acciones de Gestión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderQuickActions()}
          <ActionCard title="Perfil Académico" desc="Gestionar datos del docente y credenciales." icon="👤" href="/dashboard/perfil" />
        </div>
      </div>
    </div>
  );
}

// COMPONENTE AUXILIAR PARA LIMPIAR EL CÓDIGO
function ActionCard({ title, desc, icon, href }) {
  return (
    <Link href={href} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group">
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </Link>
  );
}