'use client'

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Datos de prueba (MOCK)
const MOCK_ASIGNACIONES = [
  { id: 1, materia: 'Matemáticas', seccion: '1er Grado A' },
  { id: 2, materia: 'Lengua', seccion: '1er Grado A' },
  { id: 3, materia: 'Ciencias', seccion: '1er Grado B' },
];

const MOCK_ESTUDIANTES_POR_SECCION = {
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
  const [estudiantes, setEstudiantes] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Estado del estudiante seleccionado para el formulario de nota
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [formNota, setFormNota] = useState({
    nota: '',
    observacion: '',
  });

  // Inicialización y cambio de materia
  useEffect(() => {
    const asignacion = MOCK_ASIGNACIONES.find(a => a.id === Number(materiaSeleccionada));
    if (asignacion) {
      const lista = MOCK_ESTUDIANTES_POR_SECCION[asignacion.seccion] || [];
      setEstudiantes(lista);
      if (lista.length > 0) {
        seleccionarEstudianteParaEvaluar(lista[0]);
      } else {
        setEstudianteSeleccionado(null);
      }
    } else {
      setEstudiantes([]);
      setEstudianteSeleccionado(null);
    }
  }, [materiaSeleccionada]);

  // Cargar datos del Estudiante en el formulario
  const seleccionarEstudianteParaEvaluar = (estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setFormNota({
      nota: estudiante.nota || '',
      observacion: estudiante.observacion || '',
    });
  };

  const handleMateriaChange = (e) => {
    setMateriaSeleccionada(Number(e.target.value));
  };

  const handleSubmitNota = async (e) => {
    e.preventDefault();
    if (!estudianteSeleccionado) {
      Swal.fire('Atención', 'Seleccione un estudiante de la lista.', 'warning');
      return;
    }
    if (!formNota.nota) {
      Swal.fire('Nota vacía', 'Debe seleccionar una calificación (A, B, C, D, E).', 'warning');
      return;
    }

    setGuardando(true);
    // Simulación de respuesta de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Actualizar estado local del array de Estudiantes
    const estudiantesActualizados = estudiantes.map((alu) => {
      if (alu.id === estudianteSeleccionado.id) {
        return {
          ...alu,
          nota: formNota.nota.toUpperCase(),
          observacion: formNota.observacion,
        };
      }
      return alu;
    });

    setEstudiantes(estudiantesActualizados);
    setEstudianteSeleccionado((prev) => ({
      ...prev,
      nota: formNota.nota.toUpperCase(),
      observacion: formNota.observacion,
    }));
    setGuardando(false);

    await Swal.fire({
      icon: 'success',
      title: 'Evaluación Registrada',
      text: `Calificación asignada a ${estudianteSeleccionado.nombre}`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const asignacionActual = MOCK_ASIGNACIONES.find((a) => a.id === Number(materiaSeleccionada));
  const notasCargadasCount = estudiantes.filter((a) => a.nota).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Carga de Evaluaciones Cualitativas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Asignación de notas descriptivas y literales por estudiante y lapso académico.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-xs">
          <span className="font-bold text-slate-600">Avance de Carga:</span>
          <span className="font-mono font-bold text-indigo-600">
            {notasCargadasCount} / {estudiantes.length} Evaluados
          </span>
        </div>
      </div>

      {/* Selectores de Materia y Lapso */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Materia y Sección
          </label>
          <select
            value={materiaSeleccionada}
            onChange={handleMateriaChange}
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {MOCK_ASIGNACIONES.map((asig) => (
              <option key={asig.id} value={asig.id}>
                {asig.materia} - {asig.seccion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Momento / Lapso
          </label>
          <select
            value={lapsoSeleccionado}
            onChange={(e) => setLapsoSeleccionado(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="1">1er Lapso</option>
            <option value="2">2do Lapso</option>
            <option value="3">3er Lapso</option>
          </select>
        </div>
      </div>

      {/* Grid Principal: Lista + Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tabla / Lista de Estudiantes (Columna 7) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Estudiantes de {asignacionActual?.seccion || ''}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {estudiantes.length} Inscritos
            </span>
          </div>

          {estudiantes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No hay estudiantes registrados en esta sección.
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
                  {estudiantes.map((estudiante) => {
                    const isSelected = estudianteSeleccionado?.id === estudiante.id;
                    const tieneNota = Boolean(estudiante.nota);
                    return (
                      <tr 
                        key={estudiante.id} 
                        className={`transition-colors ${isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-3">
                          <p className="font-semibold text-slate-800 text-xs">{estudiante.nombre}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{estudiante.cedula}</p>
                        </td>
                        <td className="p-3 text-center">
                          {tieneNota ? (
                            <span className="inline-block w-7 h-7 line-height-7 text-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200">
                              {estudiante.nota}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs font-mono">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => seleccionarEstudianteParaEvaluar(estudiante)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              isSelected 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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

        {/* Formulario de Evaluación (Columna 5) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit sticky top-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Registrar Calificación
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingrese la evaluación del estudiante seleccionado.
            </p>
          </div>

          {estudianteSeleccionado ? (
            <form onSubmit={handleSubmitNota} className="space-y-4">
              {/* Tarjeta del Estudiante activo */}
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <p className="text-xs font-bold text-indigo-950">
                  {estudianteSeleccionado.nombre}
                </p>
                <div className="flex justify-between items-center text-[11px] text-indigo-700 mt-1">
                  <span>Cédula: <strong className="font-mono">{estudianteSeleccionado.cedula}</strong></span>
                  <span>Rep: {estudianteSeleccionado.representante}</span>
                </div>
              </div>

              {/* Selector de Literal (A, B, C, D, E) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Calificación Literal *
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['A', 'B', 'C', 'D', 'E'].map((literal) => (
                    <button
                      key={literal}
                      type="button"
                      onClick={() => setFormNota({ ...formNota, nota: literal })}
                      className={`py-2 rounded-lg font-bold text-sm border transition-all ${
                        formNota.nota === literal
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {literal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apreciación / Observación Pedagógica */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Observación Pedagógica
                </label>
                <textarea
                  rows="4"
                  value={formNota.observacion}
                  onChange={(e) => setFormNota({ ...formNota, observacion: e.target.value })}
                  placeholder="Escriba aquí los logros alcanzados o aspectos a reforzar del estudiante..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs py-3 rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2"
              >
                {guardando ? 'Guardando...' : '💾 Guardar Evaluación'}
              </button>
            </form>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-lg">
              Seleccione un estudiante de la lista para cargar su nota.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}