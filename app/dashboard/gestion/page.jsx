'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  obtenerAsignacionesDocente,
  obtenerEstudiantesYNotas,
  guardarEvaluacionIndividual,
} from '../../actions/gestionNotas';

export default function GestionNotasPage() {
  // Estados para filtros
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [gradoSeccionId, setGradoSeccionId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [lapso, setLapso] = useState('1');

  // Estado de alumnos y selección
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [formNota, setFormNota] = useState({ nota: '', observacion: '' });
  const [guardando, setGuardando] = useState(false);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true);

  // ═══════════════════════════════════════════════════════
  //  FUNCIÓN seleccionarAlumno (declarada ANTES de usarla)
  // ═══════════════════════════════════════════════════════
  const seleccionarAlumno = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setFormNota({
      nota: alumno.nota || '',
      observacion: alumno.observacion || '',
    });
  };

  // ═══════════════════════════════════════════════════════
  //  EFECTOS (ya pueden usar seleccionarAlumno)
  // ═══════════════════════════════════════════════════════

  // Cargar asignaciones del docente al montar
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

  // Cargar alumnos cuando cambia sección, materia o lapso
  useEffect(() => {
    if (!gradoSeccionId || !materiaId) return;
    const cargarAlumnos = async () => {
      setCargandoAlumnos(true);
      const result = await obtenerEstudiantesYNotas(gradoSeccionId, materiaId, lapso);
      if (result.success) {
        const alumnosFormateados = result.data.map((item) => ({
          id: item.idInscripcion,
          cedula: item.cedula,
          nombre: item.nombre,
          representante: item.representante || 'Sin representante',
          nota: item.literal || '',
          observacion: item.apreciacion || '',
        }));
        setAlumnos(alumnosFormateados);
        if (alumnosFormateados.length > 0) {
          seleccionarAlumno(alumnosFormateados[0]);
        } else {
          setAlumnoSeleccionado(null);
        }
      } else {
        Swal.fire('Error', 'No se pudieron cargar los estudiantes', 'error');
        setAlumnos([]);
        setAlumnoSeleccionado(null);
      }
      setCargandoAlumnos(false);
    };
    cargarAlumnos();
  }, [gradoSeccionId, materiaId, lapso]);

  // ═══════════════════════════════════════════════════════
  //  MANEJADOR DEL FORMULARIO
  // ═══════════════════════════════════════════════════════
  const handleSubmitNota = async (e) => {
    e.preventDefault();
    if (!alumnoSeleccionado) {
      Swal.fire('Atención', 'Seleccione un alumno de la lista.', 'warning');
      return;
    }
    if (!formNota.nota) {
      Swal.fire('Nota vacía', 'Debe seleccionar una calificación (A, B, C, D, E).', 'warning');
      return;
    }

    setGuardando(true);
    const payload = {
      idInscripcion: alumnoSeleccionado.id,
      idMateria: materiaId,
      lapso: lapso,
      literal: formNota.nota,
      apreciacion: formNota.observacion,
    };
    const result = await guardarEvaluacionIndividual(payload);
    setGuardando(false);

    if (result.success) {
      const alumnosActualizados = alumnos.map((a) =>
        a.id === alumnoSeleccionado.id
          ? { ...a, nota: formNota.nota, observacion: formNota.observacion }
          : a
      );
      setAlumnos(alumnosActualizados);
      setAlumnoSeleccionado((prev) => ({
        ...prev,
        nota: formNota.nota,
        observacion: formNota.observacion,
      }));
      Swal.fire({
        icon: 'success',
        title: 'Evaluación Registrada',
        text: `Calificación asignada a ${alumnoSeleccionado.nombre}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire('Error', result.error || 'No se pudo guardar la evaluación', 'error');
    }
  };

  const notasCargadasCount = alumnos.filter((a) => a.nota).length;
  const seccionSeleccionada = secciones.find((s) => s.id === gradoSeccionId);
  const nombreSeccion = seccionSeleccionada ? seccionSeleccionada.nombre : '';

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📊 Carga de Evaluaciones Cualitativas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Asignación de notas descriptivas y literales por estudiante y lapso académico.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-xs">
          <span className="font-bold text-slate-600">Avance de Carga:</span>
          <span className="font-mono font-bold text-indigo-600">
            {notasCargadasCount} / {alumnos.length} Evaluados
          </span>
        </div>
      </div>

      {/* Filtros: Sección, Materia, Lapso */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Sección</label>
          <select
            value={gradoSeccionId}
            onChange={(e) => setGradoSeccionId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 text-black rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
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
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Materia</label>
          <select
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 text-black rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
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
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lapso Académico</label>
          <select
            value={lapso}
            onChange={(e) => setLapso(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 text-black rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="1">1er Lapso</option>
            <option value="2">2do Lapso</option>
            <option value="3">3er Lapso</option>
          </select>
        </div>
      </div>

      {/* Layout Principal en 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA 1: Lista de Alumnos */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nómina de Estudiantes ({nombreSeccion})
              </h2>
              <span className="text-xs text-slate-400 font-mono">{alumnos.length} Inscritos</span>
            </div>
            {cargandoAlumnos ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">Cargando alumnos...</div>
            ) : alumnos.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No hay alumnos registrados en esta sección.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                      <th className="p-3">Estudiante</th>
                      <th className="p-3 text-center">Nota</th>
                      <th className="p-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {alumnos.map((alumno) => {
                      const isSelected = alumnoSeleccionado?.id === alumno.id;
                      const tieneNota = Boolean(alumno.nota);
                      return (
                        <tr
                          key={alumno.id}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/80' : 'hover:bg-slate-50/80'
                          }`}
                          onClick={() => seleccionarAlumno(alumno)}
                        >
                          <td className="p-3">
                            <p className="font-medium text-slate-800 text-xs">{alumno.nombre}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{alumno.cedula}</p>
                          </td>
                          <td className="p-3 text-center">
                            {tieneNota ? (
                              <span className="inline-block w-7 h-7 leading-7 text-center rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-xs border border-emerald-200">
                                {alumno.nota}
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                seleccionarAlumno(alumno);
                              }}
                              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700'
                              }`}
                            >
                              {isSelected ? 'Evaluando' : 'Seleccionar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA 2: Formulario de Carga de Nota */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit sticky top-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              📝 Registrar Calificación
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Ingrese la evaluación del estudiante seleccionado.</p>
          </div>
          {alumnoSeleccionado ? (
            <form onSubmit={handleSubmitNota} className="space-y-4">
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <p className="text-xs font-bold text-indigo-950">{alumnoSeleccionado.nombre}</p>
                <div className="flex justify-between items-center text-[11px] text-indigo-700 mt-1">
                  <span>
                    Cédula: <strong className="font-mono">{alumnoSeleccionado.cedula}</strong>
                  </span>
                  <span>Rep: {alumnoSeleccionado.representante}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Calificación Literal *</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['A', 'B', 'C', 'D', 'E'].map((literal) => (
                    <button
                      key={literal}
                      type="button"
                      onClick={() => setFormNota((prev) => ({ ...prev, nota: literal }))}
                      className={`py-2 text-center rounded-lg font-bold font-mono text-sm border transition-all ${
                        formNota.nota === literal
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {literal}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Apreciación Descriptiva / Observación
                </label>
                <textarea
                  rows={4}
                  value={formNota.observacion}
                  onChange={(e) => setFormNota((prev) => ({ ...prev, observacion: e.target.value }))}
                  placeholder="Escriba aquí los logros alcanzados o aspectos a reforzar del alumno..."
                  className="w-full px-3 py-2 border border-slate-300 text-black rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {guardando ? 'Guardando Registro...' : '💾 Guardar Evaluación'}
              </button>
            </form>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-lg">
              👈 Seleccione un estudiante de la lista para cargar su nota.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}