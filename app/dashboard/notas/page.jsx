// app/dashboard/notas/page.jsx
'use client'

import { useState } from 'react';
import Link from 'next/link';

export default function ConsultaNotasSecretariaPage() {
  // Filtros de control
  const [grado, setGrado] = useState('1er Grado');
  const [seccion, setSeccion] = useState('A');
  const [momento, setMomento] = useState('1er Lapso');
  const [materia, setMateria] = useState('Lengua y Comunicación');

  // Mock ampliado de estudiantes con calificaciones registradas
  const [estudiantes] = useState([
    { id: 1, grado: '1er Grado', seccion: 'A', momento: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84123456', nombre: 'Carlos Eduardo', apellido: 'Mendoza Ruiz', nota: '18', apreciacion: 'Excelente desempeño en lectura y análisis de textos.' },
    { id: 2, grado: '1er Grado', seccion: 'A', momento: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84987654', nombre: 'María Valentina', apellido: 'Gómez Silva', nota: '14', apreciacion: 'Buen avance, requiere consolidar hábitos de ortografía.' },
    { id: 3, grado: '1er Grado', seccion: 'A', momento: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84223344', nombre: 'Simón Alejandro', apellido: 'Padrón Martínez', nota: '19', apreciacion: 'Participativo y colaborador en actividades grupales.' },
    
    // Mocks adicionales para probar la interacción del filtro
    { id: 4, grado: '1er Grado', seccion: 'A', momento: '1er Lapso', materia: 'Matemáticas', cedula: 'E-84123456', nombre: 'Carlos Eduardo', apellido: 'Mendoza Ruiz', nota: '16', apreciacion: 'Domina las operaciones numéricas básicas con fluidez.' },
    { id: 5, grado: '1er Grado', seccion: 'B', momento: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84556677', nombre: 'Andrés Ignacio', apellido: 'Rivas Pérez', nota: '09', apreciacion: 'Requiere refuerzo continuo en comprensión lectora.' },
    { id: 6, grado: '2do Grado', seccion: 'A', momento: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84889900', nombre: 'Camila Isabel', apellido: 'Torres Blanco', nota: '20', apreciacion: 'Rendimiento sobresaliente y constante durante todo el lapso.' }
  ]);

  // Filtrado reactivo en base a las opciones seleccionadas
  const estudiantesFiltrados = estudiantes.filter(
    est => est.grado === grado && 
           est.seccion === seccion && 
           est.momento === momento &&
           est.materia === materia
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Encabezado Principal (Secretaría) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Consulta de Evaluaciones y Calificaciones</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Vista Secretaría
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Módulo de consulta general de actas de notas y apreciaciones emitidas por los docentes.
          </p>
        </div>

        <Link 
          href="/dashboard/inscripciones" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 shrink-0"
        >
          ➕ Inscribir Alumno
        </Link>
      </div>

      {/* Selectores / Filtros de Consulta */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grado</label>
          <select 
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="1er Grado">1er Grado</option>
            <option value="2do Grado">2do Grado</option>
            <option value="3er Grado">3er Grado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sección</label>
          <select 
            value={seccion}
            onChange={(e) => setSeccion(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="A">Sección "A"</option>
            <option value="B">Sección "B"</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Momento / Lapso</label>
          <select 
            value={momento}
            onChange={(e) => setMomento(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="1er Lapso">1er Lapso Pedagógico</option>
            <option value="2do Lapso">2do Lapso Pedagógico</option>
            <option value="3er Lapso">3er Lapso Pedagógico</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Área / Materia</label>
          <select 
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="Lengua y Comunicación">Lengua y Comunicación</option>
            <option value="Matemáticas">Matemáticas</option>
            <option value="Ciencias Naturales">Ciencias Naturales</option>
            <option value="Ciencias Sociales">Ciencias Sociales</option>
          </select>
        </div>
      </div>

      {/* Tabla de Solo Lectura de Notas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Nómina Evaluada — {grado} "{seccion}" ({materia})
            </h2>
            <p className="text-xs text-slate-500">{momento}</p>
          </div>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100 font-semibold">
            Matrícula: {estudiantesFiltrados.length} Alumnos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Estudiante</th>
                <th className="p-4 text-center w-36">Nota (01 - 20)</th>
                <th className="p-4">Apreciación / Observación Pedagógica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400 text-xs font-medium">
                    No existen registros cargados para {grado} "{seccion}" en {materia} ({momento}).
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((est) => {
                  const notaNum = parseInt(est.nota, 10);
                  const esAprobado = notaNum >= 10;

                  return (
                    <tr key={est.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Información del Estudiante (Inmodificable) */}
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{est.apellido}, {est.nombre}</p>
                        <p className="text-xs font-mono text-slate-500">{est.cedula}</p>
                      </td>
                      
                      {/* Visualización de Calificación Vigesimal */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold font-mono text-sm border ${
                          esAprobado 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {est.nota} pts
                        </span>
                      </td>

                      {/* Apreciación en Texto Plano */}
                      <td className="p-4 text-slate-600 text-xs italic">
                        {est.apreciacion || 'Sin observaciones registradas por el docente.'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Banner Informativo Inferior */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Vista restringida. Las modificaciones deben ser procesadas directamente por el docente asignado.</span>
          </div>
        </div>
      </div>

    </div>
  );
}