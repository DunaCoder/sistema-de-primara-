// app/dashboard/notas/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  obtenerAsignacionesDocente,
  obtenerEstudiantesYNotas,
  guardarEvaluacionIndividual,
} from '../../../actions/gestionNotas'; // Ajusta la ruta según tu estructura de carpetas

export default function AdministrarNotasPage() {
  // --- ESTADOS PARA FILTROS ---
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [gradoSeccionId, setGradoSeccionId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [lapso, setLapso] = useState('1');

  // --- ESTADOS PARA DATOS Y UI ---
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true);

  // --- CARGAR ASIGNACIONES (SECCIONES Y MATERIAS) AL INICIO ---
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

  // --- CARGAR ALUMNOS Y SUS NOTAS CUANDO CAMBIAN FILTROS ---
  useEffect(() => {
    if (!gradoSeccionId || !materiaId) return;
    const cargarAlumnos = async () => {
      setCargando(true);
      const result = await obtenerEstudiantesYNotas(gradoSeccionId, materiaId, lapso);
      if (result.success) {
        // Transformar al formato que espera la tabla
        const alumnosFormateados = result.data.map((item) => ({
          id: item.idInscripcion,
          cedula: item.cedula,
          nombre: item.nombre,
          representante: item.representante || 'Sin representante',
          nota: item.literal || '',
          apreciacion: item.apreciacion || '',
        }));
        setAlumnos(alumnosFormateados);
      } else {
        Swal.fire('Error', 'No se pudieron cargar los estudiantes', 'error');
        setAlumnos([]);
      }
      setCargando(false);
    };
    cargarAlumnos();
  }, [gradoSeccionId, materiaId, lapso]);

  // --- MANEJADORES DE CAMBIOS EN LA TABLA ---
  const handleNotaChange = (id, campo, valor) => {
    // Actualizar estado local inmediatamente (optimista)
    setAlumnos((prev) =>
      prev.map((alumno) =>
        alumno.id === id ? { ...alumno, [campo]: valor } : alumno
      )
    );
  };

  // --- GUARDAR CAMBIOS DE UN ALUMNO INDIVIDUAL (al perder foco o al guardar todo) ---
  const guardarCambiosAlumno = async (alumno) => {
    if (!alumno.nota) {
      Swal.fire('Nota vacía', 'Debe seleccionar una calificación (A, B, C, D, E).', 'warning');
      return;
    }

    setGuardando(true);
    const payload = {
      idInscripcion: alumno.id,
      idMateria: materiaId,
      lapso: lapso,
      literal: alumno.nota,
      apreciacion: alumno.apreciacion,
    };
    const result = await guardarEvaluacionIndividual(payload);
    setGuardando(false);

    if (!result.success) {
      Swal.fire('Error', result.error || 'No se pudo guardar la evaluación', 'error');
    }
  };

  // --- GUARDAR TODAS LAS NOTAS (botón principal) ---
  const handleGuardarTodas = async () => {
    // Verificar que todos tengan nota asignada
    const sinNota = alumnos.filter((a) => !a.nota);
    if (sinNota.length > 0) {
      Swal.fire(
        'Faltan notas',
        `Hay ${sinNota.length} alumnos sin calificación. ¿Desea continuar?`,
        'warning'
      );
      // Podrías continuar o detenerte, aquí decidimos continuar
    }

    setGuardando(true);
    let errores = 0;
    for (const alumno of alumnos) {
      if (!alumno.nota) continue; // saltar los que no tienen nota
      const payload = {
        idInscripcion: alumno.id,
        idMateria: materiaId,
        lapso: lapso,
        literal: alumno.nota,
        apreciacion: alumno.apreciacion,
      };
      const result = await guardarEvaluacionIndividual(payload);
      if (!result.success) errores++;
    }
    setGuardando(false);

    if (errores === 0) {
      Swal.fire({
        icon: 'success',
        title: '¡Calificaciones guardadas!',
        text: `Se actualizaron ${alumnos.filter(a => a.nota).length} alumnos.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire('Error', `Hubo ${errores} errores al guardar. Revise los datos.`, 'error');
    }
  };

  // --- OBTENER NOMBRE DE LA SECCIÓN SELECCIONADA ---
  const seccionSeleccionada = secciones.find((s) => s.id === gradoSeccionId);
  const nombreSeccion = seccionSeleccionada ? seccionSeleccionada.nombre : '';

  // --- ESCALA DE CALIFICACIONES ---
  const opcionesLetras = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Carga y Control de Calificaciones</h1>
          <p className="text-xs text-slate-500 mt-1">
            Asignación de calificación por letras (A–E) y apreciaciones cualitativas por sección.
          </p>
        </div>
        <button
          onClick={handleGuardarTodas}
          disabled={guardando || cargando}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : '💾 Guardar Calificaciones'}
        </button>
      </div>

      {/* Filtros (sección, materia, lapso) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Materia</label>
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
      </div>

      {/* Tabla de Estudiantes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {nombreSeccion} — {materias.find(m => m.id === materiaId)?.nombre || ''}
            </h2>
            <p className="text-xs text-slate-500">{`${lapso}er Lapso`}</p>
          </div>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100 font-semibold">
            Matrícula: {alumnos.length} Alumnos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Estudiante</th>
                <th className="p-4 text-center w-36">Calificación (A - E)</th>
                <th className="p-4">Apreciación / Observación Pedagógica</th>
                <th className="p-4 text-center w-20">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 text-xs font-medium">
                    Cargando estudiantes...
                  </td>
                </tr>
              ) : alumnos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 text-xs font-medium">
                    No se encontraron estudiantes inscritos para esta sección.
                  </td>
                </tr>
              ) : (
                alumnos.map((alumno) => (
                  <tr key={alumno.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{alumno.nombre}</p>
                      <p className="text-xs font-mono text-slate-500">{alumno.cedula}</p>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={alumno.nota}
                        onChange={(e) => {
                          const nuevaNota = e.target.value;
                          handleNotaChange(alumno.id, 'nota', nuevaNota);
                          // Guardar automáticamente al cambiar la nota
                          const alumnoActualizado = { ...alumno, nota: nuevaNota };
                          guardarCambiosAlumno(alumnoActualizado);
                        }}
                        className="w-full px-3 py-1.5 border rounded-lg font-bold text-center focus:outline-none focus:border-indigo-500 cursor-pointer bg-white text-slate-700 border-slate-300"
                      >
                        <option value="">Seleccionar</option>
                        {opcionesLetras.map((letra) => (
                          <option key={letra} value={letra}>
                            {letra}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={alumno.apreciacion}
                        onChange={(e) => {
                          const nuevoTexto = e.target.value;
                          handleNotaChange(alumno.id, 'apreciacion', nuevoTexto);
                        }}
                        onBlur={() => {
                          // Guardar al perder el foco si tiene nota
                          if (alumno.nota) {
                            guardarCambiosAlumno(alumno);
                          }
                        }}
                        placeholder="Describa el rendimiento del alumno..."
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          // Limpiar nota y apreciación
                          const alumnoLimpio = { ...alumno, nota: '', apreciacion: '' };
                          handleNotaChange(alumno.id, 'nota', '');
                          handleNotaChange(alumno.id, 'apreciacion', '');
                          // Si queremos persistir el borrado, llamar a guardarCambiosAlumno con la nota vacía
                          // Pero la acción requiere nota, así que podríamos no hacer nada o borrar en BD con una acción especial.
                          // Por simplicidad, solo limpiamos el estado local.
                        }}
                        className="text-slate-400 hover:text-rose-500 transition-colors text-xs p-1"
                        title="Limpiar nota y apreciación"
                      >
                        🧹
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>* Los datos personales son gestionados por Secretaría. Modificaciones restringidas al docente.</span>
          <button
            onClick={handleGuardarTodas}
            disabled={guardando || cargando}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}