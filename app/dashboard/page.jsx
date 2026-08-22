'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

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
        </div>
      </div>
    </div>
  );
}