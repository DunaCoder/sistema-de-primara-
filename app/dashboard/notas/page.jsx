// app/dashboard/notas/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import {
  obtenerAsignacionesDocente,
  obtenerEstudiantesYNotas,
} from '../../actions/gestionNotas';

export default function ConsultaNotasSecretariaPage() {
  // --- Estados para filtros (usando IDs numéricos) ---
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [gradoSeccionId, setGradoSeccionId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [lapso, setLapso] = useState('1');

  // --- Estado para los estudiantes y carga ---
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true);

  // --- Cargar asignaciones (secciones y materias) al montar ---
  useEffect(() => {
    const cargarAsignaciones = async () => {
      setCargandoAsignaciones(true);
      const result = await obtenerAsignacionesDocente();
      if (result.success) {
        setSecciones(result.secciones);
        setMaterias(result.materias);
        if (result.secciones.length > 0) setGradoSeccionId(result.secciones[0].id);
        if (result.materias.length > 0) setMateriaId(result.materias[0].id);
      } else {
        Swal.fire('Error', 'No se pudieron cargar las asignaciones', 'error');
      }
      setCargandoAsignaciones(false);
    };
    cargarAsignaciones();
  }, []);

  // --- Cargar estudiantes y notas cuando cambian filtros ---
  useEffect(() => {
    if (!gradoSeccionId || !materiaId) return;
    const cargarNotas = async () => {
      setCargando(true);
      const result = await obtenerEstudiantesYNotas(gradoSeccionId, materiaId, lapso);
      if (result.success) {
        // La acción ya devuelve los datos formateados con los campos necesarios
        setEstudiantes(result.data);
      } else {
        Swal.fire('Error', 'No se pudieron cargar las notas', 'error');
        setEstudiantes([]);
      }
      setCargando(false);
    };
    cargarNotas();
  }, [gradoSeccionId, materiaId, lapso]);

  // --- Obtener nombres para mostrar en la interfaz ---
  const seccionSeleccionada = secciones.find(s => s.id === gradoSeccionId);
  const nombreSeccion = seccionSeleccionada ? seccionSeleccionada.nombre : '';
  const materiaSeleccionada = materias.find(m => m.id === materiaId);
  const nombreMateria = materiaSeleccionada ? materiaSeleccionada.nombre : '';

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
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grado y Sección</label>
          <select 
            value={gradoSeccionId}
            onChange={(e) => setGradoSeccionId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:border-indigo-500"
            disabled={cargandoAsignaciones}
          >
            {secciones.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Área / Materia</label>
          <select 
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:border-indigo-500"
            disabled={cargandoAsignaciones}
          >
            {materias.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Momento / Lapso</label>
          <select 
            value={lapso}
            onChange={(e) => setLapso(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="1">1er Lapso</option>
            <option value="2">2do Lapso</option>
            <option value="3">3er Lapso</option>
          </select>
        </div>

        {/* Cuarto espacio vacío o podrías poner algo, pero lo dejamos así */}
        <div className="hidden lg:block"></div>
      </div>

      {/* Tabla de Solo Lectura de Notas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Nómina Evaluada — {nombreSeccion} ({nombreMateria})
            </h2>
            <p className="text-xs text-slate-500">{`${lapso}er Lapso`}</p>
          </div>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100 font-semibold">
            Matrícula: {estudiantes.length} Alumnos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Estudiante</th>
                <th className="p-4 text-center w-36">Calificación Literal</th>
                <th className="p-4">Apreciación / Observación Pedagógica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400 text-xs font-medium">
                    Cargando notas...
                  </td>
                </tr>
              ) : estudiantes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400 text-xs font-medium">
                    No existen registros cargados para {nombreSeccion} en {nombreMateria} ({lapso}er Lapso).
                  </td>
                </tr>
              ) : (
                estudiantes.map((est) => {
                  // Como es vista de secretaría, mostramos la nota literal (A, B, C, D, E)
                  const literal = est.literal || 'Sin nota';
                  const esAprobado = ['A', 'B', 'C'].includes(literal);
                  return (
                    <tr key={est.idInscripcion} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{est.nombre}</p>
                        <p className="text-xs font-mono text-slate-500">{est.cedula}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold font-mono text-sm border ${
                          esAprobado 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {literal}
                        </span>
                      </td>
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