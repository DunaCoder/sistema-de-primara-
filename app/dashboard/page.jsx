<<<<<<< HEAD
'use client';
=======
// app/dashboard/page.jsx
'use client'
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

<<<<<<< HEAD
  const rolBruto = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombre || '';
  const userRol = rolBruto.trim().toUpperCase();

  return (
    <div className="space-y-6">
      {/* Saludo de Bienvenida */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bienvenido al Sistema de Gestión</h1>
          <p className="text-sm text-slate-500 mt-1">
            Plataforma digital para la gestión administrativa y académica de la U.E.N. Bicentenario Republicano.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
          <span className="font-semibold text-indigo-900 text-sm">{user?.nombreCompleto || user?.username}</span>
          <span className="bg-indigo-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">{userRol}</span>
        </div>
      </div>

      {/* 📌 TARJETAS MÉTRICAS CONDICIONADAS SEGÚN LA MATRIZ DE ROLES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Métrica de Estudiantes: Visible para Secretaria, Coordinador y Admin */}
        {['SECRETARIA', 'COORDINADOR', 'ADMINISTRADOR'].includes(userRol) && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-2xl">🎓</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Estudiantes Inscritos</p>
              <p className="text-2xl font-extrabold text-slate-800">142</p>
            </div>
          </div>
        )}

        {/* Métrica de Docentes: OCURTADA PARA SECRETARÍA (Solo Admin y Coordinador) */}
        {['COORDINADOR', 'ADMINISTRADOR'].includes(userRol) && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-2xl">👩‍🏫</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Docentes Activos</p>
              <p className="text-2xl font-extrabold text-slate-800">28</p>
            </div>
          </div>
        )}

        {/* Métrica de Secciones / Grados */}
        {['SECRETARIA', 'COORDINADOR', 'ADMINISTRADOR'].includes(userRol) && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg text-2xl">📋</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Secciones / Grados</p>
              <p className="text-2xl font-extrabold text-slate-800">12</p>
            </div>
          </div>
        )}
      </div>

      {/* 📌 ACCIONES RECOMENDADAS ESPECÍFICAS PARA SECRETARÍA */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Acciones Recomendadas para tu Perfil
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userRol === 'SECRETARIA' && (
            <>
              <Link 
                href="/dashboard/inscripciones"
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-400 transition-all group"
              >
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">Inscribir Estudiante</h3>
                <p className="text-xs text-slate-500 mt-1">Registrar nuevo ingreso con la Ficha de Representante.</p>
              </Link>

              <Link 
                href="/dashboard/estudiante"
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-400 transition-all group"
              >
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">Consultar Matrícula</h3>
                <p className="text-xs text-slate-500 mt-1">Ver expedientes de la matrícula escolar institucional.</p>
              </Link>
            </>
          )}

          <Link 
            href="/dashboard/perfil"
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-400 transition-all group"
          >
            <div className="text-3xl mb-2">👤</div>
            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">Mi Perfil</h3>
            <p className="text-xs text-slate-500 mt-1">Gestionar datos personales, cargo y credenciales.</p>
          </Link>
=======
  if (!user) return null;

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
            <ActionCard 
              title="Control de Usuarios" 
              desc="Gestión integral de credenciales, roles y permisos del personal." 
              icon="👥" 
              href="/dashboard/usuarios" 
            />
            <ActionCard 
              title="Configurar Plan de Estudios" 
              desc="Ajuste de materias y gestión de calificaciones." 
              icon="⚙️" 
              href="/dashboard/config" 
            />
          </>
        );
      case 'Secretaria':
        return (
          <ActionCard 
            title="Registro de Inscripciones" 
            desc="Formalizar estudiantes y representantes en el sistema escolar." 
            icon="📝" 
            href="/dashboard/inscripciones" 
          />
        );
      case 'Docente':
        return (
          <ActionCard 
            title="Cargar Calificaciones" 
            desc="Registro de notas por estudiante y lapso." 
            icon="📊" 
            href="/dashboard/notas" 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER INSTITUCIONAL */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Bienvenido al Sistema de Gestión
          </h1>
          <p className="text-slate-500 mt-2 max-w-lg">
            Plataforma digital para la gestión administrativa y académica de la <b>U.E.N. Bicentenario Republicano</b>.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-full border border-indigo-100">
          <span className="text-sm font-bold text-indigo-700">{user.nombreCompleto || user.username}</span>
          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-md font-bold">{user.rol}</span>
        </div>
      </div>

      {/* KPI GRID */}
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

      {/* ACCIONES RÁPIDAS SEGÚN ROL */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
          Acciones Recomendadas para tu Perfil
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderQuickActions()}
          <ActionCard 
            title="Mi Perfil" 
            desc="Gestionar datos personales, cargo y credenciales." 
            icon="👤" 
            href="/dashboard/perfil" 
          />
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
=======
}

function ActionCard({ title, desc, icon, href }) {
  return (
    <Link href={href} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group">
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </Link>
  );
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
}