// app/dashboard/notas/gestion/page.jsx
'use client'

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// 📌 Datos mock (simulan lo que vendría de la base de datos)
const MOCK_ASIGNACIONES = [
  { id: 1, materia: 'Matemáticas', seccion: '1er Grado A' },
  { id: 2, materia: 'Lengua', seccion: '1er Grado A' },
  { id: 3, materia: 'Ciencias', seccion: '1er Grado B' },
];

const MOCK_ALUMNOS_POR_SECCION = {
  '1er Grado A': [
    { id: 1, cedula: 'E-10123456', nombre: 'Pérez, Carlos', representante: 'Pérez, María', nota: 'A', observacion: 'Excelente desempeño y participación en clase.' },
    { id: 2, cedula: 'E-10123457', nombre: 'Gómez, Ana', representante: 'Gómez, Luis', nota: 'B', observacion: 'Mantiene buen ritmo, debe practicar cálculo mental.' },
    { id: 3, cedula: 'V-32123456', nombre: 'Rodríguez, Luis', representante: 'Rodríguez, Elena', nota: '', observacion: '' },
    { id: 4, cedula: 'E-10123458', nombre: 'Martínez, Sofía', representante: 'Martínez, José', nota: 'C', observacion: 'Requiere apoyo adicional en comprensión lectora.' },
  ],
  '1er Grado B': [
    { id: 5, cedula: 'E-10123459', nombre: 'Fernández, Laura', representante: 'Fernández, Carlos', nota: '', observacion: '' },
    { id: 6, cedula: 'V-32123457', nombre: 'Díaz, Diego', representante: 'Díaz, Patricia', nota: 'B', observacion: 'Cumple con todas las asignaciones.' },
  ],
};

export default function GestionNotasPage() {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(MOCK_ASIGNACIONES[0]?.id || '');
  const [lapsoSeleccionado, setLapsoSeleccionado] = useState('1');
  const [alumnos, setAlumnos] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Estado del estudiante seleccionado para el formulario de nota
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [formNota, setFormNota] = useState({
    nota: '',
    observacion: '',
  });

  // Inicialización y cambio de materia
  useEffect(() => {
    const asignacion = MOCK_ASIGNACIONES.find(a => a.id === Number(materiaSeleccionada));
    if (asignacion) {
      const lista = MOCK_ALUMNOS_POR_SECCION[asignacion.seccion] || [];
      setAlumnos(lista);
      
      // Auto-seleccionar el primer estudiante por defecto
      if (lista.length > 0) {
        seleccionarAlumnoParaEvaluar(lista[0]);
      } else {
        setAlumnoSeleccionado(null);
      }
    } else {
      setAlumnos([]);
      setAlumnoSeleccionado(null);
    }
  }, [materiaSeleccionada]);

  // Cargar datos del alumno en el formulario
  const seleccionarAlumnoParaEvaluar = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setFormNota({
      nota: alumno.nota || '',
      observacion: alumno.observacion || '',
    });
  };

  const handleMateriaChange = (e) => {
    setMateriaSeleccionada(Number(e.target.value));
  };

  // Manejar submit del formulario individual
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

    // Simulación de respuesta de red / Server Action
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Actualizar estado local del array de alumnos
    const alumnosActualizados = alumnos.map((alu) => {
      if (alu.id === alumnoSeleccionado.id) {
        return {
          ...alu,
          nota: formNota.nota.toUpperCase(),
          observacion: formNota.observacion,
        };
      }
      return alu;
    });

    setAlumnos(alumnosActualizados);

    // Actualizar también la referencia del alumno seleccionado actualmente
    setAlumnoSeleccionado((prev) => ({
      ...prev,
      nota: formNota.nota.toUpperCase(),
      observacion: formNota.observacion,
    }));

    setGuardando(false);

    await Swal.fire({
      icon: 'success',
      title: 'Evaluación Registrada',
      text: `Calificación asignada a ${alumnoSeleccionado.nombre}`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const asignacionActual = MOCK_ASIGNACIONES.find((a) => a.id === Number(materiaSeleccionada));
  const notasCargadasCount = alumnos.filter((a) => a.nota).length;

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

        {/* Métrica rápida */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-xs">
          <span className="font-bold text-slate-600">Avance de Carga:</span>
          <span className="font-mono font-bold text-indigo-600">
            {notasCargadasCount} / {alumnos.length} Evaluados
          </span>
        </div>
      </div>

      {/* Selector de Materia y Lapso */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Materia y Sección</label>
          <select
            value={materiaSeleccionada}
            onChange={handleMateriaChange}
            className="w-full px-3 py-2 border border-slate-300 text-black rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
          >
            {MOCK_ASIGNACIONES.map((asig) => (
              <option key={asig.id} value={asig.id}>
                {asig.materia} — ({asig.seccion})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lapso Académico</label>
          <select
            value={lapsoSeleccionado}
            onChange={(e) => setLapsoSeleccionado(e.target.value)}
            className="w-full px-3 py-2 border text-black border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="1">1er Lapso</option>
            <option value="2">2do Lapso</option>
            <option value="3">3er Lapso</option>
          </select>
        </div>
      </div>

      {/* Layout Principal en 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA 1: Lista de Alumnos (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nómina de Estudiantes ({asignacionActual?.seccion || ''})
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {alumnos.length} Inscritos
              </span>
            </div>

            {alumnos.length === 0 ? (
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
                          onClick={() => seleccionarAlumnoParaEvaluar(alumno)}
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
                                seleccionarAlumnoParaEvaluar(alumno);
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

        {/* COLUMNA 2: Formulario de Carga de Nota (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit sticky top-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              📝 Registrar Calificación
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingrese la evaluación del estudiante seleccionado.
            </p>
          </div>

          {alumnoSeleccionado ? (
            <form onSubmit={handleSubmitNota} className="space-y-4">
              {/* Info del Alumno Fijo */}
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <p className="text-xs font-bold text-indigo-950">{alumnoSeleccionado.nombre}</p>
                <div className="flex justify-between items-center text-[11px] text-indigo-700 mt-1">
                  <span>Cédula: <strong className="font-mono">{alumnoSeleccionado.cedula}</strong></span>
                  <span>Rep: {alumnoSeleccionado.representante}</span>
                </div>
              </div>

              {/* Selección de Literal (A, B, C, D, E) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Calificación Literal *
                </label>
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

              {/* Apreciación Descriptiva / Observación */}
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

              {/* Botón de Guardado */}
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