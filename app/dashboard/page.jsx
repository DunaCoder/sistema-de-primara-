'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

function ActionCard({ title, desc, icon, href }) {
  return (
    <Link 
      href={href} 
      className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
    >
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Normalización estricta del rol (remueve acentos, espacios y pasa a mayúsculas)
  const rolBruto = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombre || '';
  const userRol = rolBruto
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  // Banderas de validación de rol
  const esAdmin = ['ADMINISTRADOR', 'ADMIN'].includes(userRol);
  const esCoordinador = ['COORDINADOR', 'COORDINACION'].includes(userRol);
  const esSecretaria = ['SECRETARIA', 'SECRETARIO'].includes(userRol);
  const esDocente = ['DOCENTE', 'PROFESOR'].includes(userRol);

  const renderQuickActions = () => {
    if (esAdmin) {
      return (
        <>
          <ActionCard 
            title="Control de Cuentas" 
            desc="Gestión de usuarios, credenciales y asignación de roles." 
            icon="👥" 
            href="/dashboard/usuarios" 
          />
          <ActionCard 
            title="Bitácora de Auditoría" 
            desc="Trazabilidad de operaciones y seguridad del sistema." 
            icon="🛡️" 
            href="/dashboard/auditoria" 
          />
        </>
      );
    }

    if (esCoordinador) {
      return (
        <>
          <ActionCard 
            title="Estructura Escolar" 
            desc="Configurar grados, secciones y lapsos académicos." 
            icon="🏫" 
            href="/dashboard/estructura" 
          />
          <ActionCard 
            title="Asignar Materias" 
            desc="Vinculación de profesores a asignaturas y años escolares." 
            icon="📚" 
            href="/dashboard/asignaciones" 
          />
        </>
      );
    }

    if (esSecretaria) {
      return (
        <>
          <ActionCard 
            title="Inscribir Estudiante" 
            desc="Registrar nuevo ingreso con la Ficha de Representante." 
            icon="📝" 
            href="/dashboard/inscripciones" 
          />
          <ActionCard 
            title="Matrícula Escolar" 
            desc="Consultar expedientes de la matrícula general del plantel." 
            icon="👨‍🎓" 
            href="/dashboard/estudiante" 
          />
        </>
      );
    }

    if (esDocente) {
      return (
        <>
          <ActionCard 
            title="Mis Secciones" 
            desc="Consulta de listados de estudiantes asignados." 
            icon="📄" 
            href="/dashboard/reportes" 
          />
          <ActionCard 
            title="Cargar Calificaciones" 
            desc="Registro continuo de evaluaciones y notas." 
            icon="✏️" 
            href="/dashboard/gestion" 
          />
        </>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8">
      {/* Encabezado Institucional */}
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
          <span className="text-sm font-bold text-indigo-700">
            {user.nombreCompleto || user.nombre || user.username}
          </span>
          <span className="text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold">
            {userRol || 'INVITADO'}
          </span>
        </div>
      </div>

      {/* Acciones Recomendadas según el Rol */}
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
        </div>
      </div>
    </div>
  );
}