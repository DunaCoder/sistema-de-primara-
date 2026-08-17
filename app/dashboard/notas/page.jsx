// app/dashboard/notas/page.jsx
'use client'

import { useState } from 'react';
import Link from 'next/link';

export default function ConsultaNotasSecretariaPage() {
  // Filtros de control (eliminamos 'momento' porque ahora se muestran todos juntos)
  const [grado, setGrado] = useState('1er Grado');
  const [seccion, setSeccion] = useState('A');
  const [materia, setMateria] = useState('Lengua y Comunicación');

  // Mock estructurado con los 3 lapsos por cada estudiante
  const [estudiantes] = useState([
    { 
      id: 1, grado: '1er Grado', seccion: 'A', materia: 'Lengua y Comunicación', 
      cedula: 'E-84123456', nombre: 'Carlos Eduardo', apellido: 'Mendoza Ruiz', 
      lapso1: 16, lapso2: 18, lapso3: 17, 
      apreciacion: 'Excelente rendimiento constante durante todo el año escolar.' 
    },
    { 
      id: 2, grado: '1er Grado', seccion: 'A', materia: 'Lengua y Comunicación', 
      cedula: 'E-84987654', nombre: 'María Valentina', apellido: 'Gómez Silva', 
      lapso1: 12, lapso2: 14, lapso3: 15, 
      apreciacion: 'Buena evolución positiva en sus hábitos de estudio.' 
    },
    { 
      id: 3, grado: '1er Grado', seccion: 'A', materia: 'Lengua y Comunicación', 
      cedula: 'E-84223344', nombre: 'Simón Alejandro', apellido: 'Padrón Martínez', 
      lapso1: 18, lapso2: 19, lapso3: 20, 
      apreciacion: 'Sobresaliente participación y dominio de los contenidos.' 
    },
    { 
      id: 4, grado: '1er Grado', seccion: 'B', materia: 'Lengua y Comunicación', 
      cedula: 'E-84556677', nombre: 'Andrés Ignacio', apellido: 'Rivas Pérez', 
      lapso1: 09, lapso2: 11, lapso3: 12, 
      apreciacion: 'Superó las dificultades iniciales con refuerzo académico.' 
    },
    { 
      id: 5, grado: '2do Grado', seccion: 'A', materia: 'Lengua y Comunicación', 
      cedula: 'E-84889900', nombre: 'Camila Isabel', apellido: 'Torres Blanco', 
      lapso1: 19, lapso2: 20, lapso3: 18, 
      apreciacion: 'Alto nivel académico sostenido en los tres periodos.' 
    }
  ]);

  // Filtrado reactivo (solo por Grado, Sección y Materia)
  const estudiantesFiltrados = estudiantes.filter(
    est => est.grado === grado && 
           est.seccion === seccion && 
           est.materia === materia
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Encabezado Principal */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Consulta de Evaluaciones y Calificaciones</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Vista Consolidada por Lapsos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Resumen detallado del rendimiento de los tres lapsos pedagógicos por estudiante.
          </p>
        </div>

        <Link 
          href="/dashboard/inscripciones" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 shrink-0"
        >
          ➕ Inscribir Alumno
        </Link>
      </div>

      {/* Selectores / Filtros de Consulta (Reducidos a 3 para simplificar) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Tabla Detallada con los Tres Lapsos y el Total */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Nómina Consolidada — {grado} "{seccion}" ({materia})
            </h2>
            <p className="text-xs text-slate-500">Visualización simultánea de 1er, 2do y 3er Lapso</p>
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
                <th className="p-4 text-center">1er Lapso</th>
                <th className="p-4 text-center">2do Lapso</th>
                <th className="p-4 text-center">3er Lapso</th>
                <th className="p-4 text-center bg-slate-800">Total / Promedio</th>
                <th className="p-4">Apreciación Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 text-xs font-medium">
                    No existen registros consolidados para {grado} "{seccion}" en {materia}.
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((est) => {
                  // Cálculo matemático automático del promedio de los tres lapsos
                  const promedio = ((est.lapso1 + est.lapso2 + est.lapso3) / 3).toFixed(1);
                  const esAprobado = parseFloat(promedio) >= 10;

                  return (
                    <tr key={est.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Datos del Estudiante */}
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{est.apellido}, {est.nombre}</p>
                        <p className="text-xs font-mono text-slate-500">{est.cedula}</p>
                      </td>
                      
                      {/* Nota 1er Lapso */}
                      <td className="p-4 text-center font-mono font-medium text-slate-700">
                        {est.lapso1}
                      </td>

                      {/* Nota 2do Lapso */}
                      <td className="p-4 text-center font-mono font-medium text-slate-700">
                        {est.lapso2}
                      </td>

                      {/* Nota 3er Lapso */}
                      <td className="p-4 text-center font-mono font-medium text-slate-700">
                        {est.lapso3}
                      </td>

                      {/* Total / Promedio Automático */}
                      <td className="p-4 text-center bg-slate-50/50">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold font-mono text-sm border ${
                          esAprobado 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {promedio} pts
                        </span>
                      </td>

                      {/* Apreciación */}
                      <td className="p-4 text-slate-600 text-xs italic">
                        {est.apreciacion}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de página informativo */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>🔒 Cálculo automatizado de calificaciones por periodos académicos.</span>
        </div>
      </div>

    </div>
  );
}