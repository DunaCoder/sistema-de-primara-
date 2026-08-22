<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { 
  obtenerAsignacionesDocente, 
  obtenerEstudiantesYNotas, 
  guardarCalificacionesSeccion 
} from '@/actions/gestionNotas';

export default function GestionDocentePage() {
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [anoEscolar, setAnoEscolar] = useState('');

  const [gradoSeccion, setGradoSeccion] = useState('');
  const [materia, setMateria] = useState('');
  const [lapso, setLapso] = useState('1');

  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    async function cargarInicial() {
      const res = await obtenerAsignacionesDocente();
      if (res.success) {
        setSecciones(res.secciones);
        setMaterias(res.materias);
        setAnoEscolar(res.anoEscolar);

        if (res.secciones.length > 0) setGradoSeccion(res.secciones[0].id);
        if (res.materias.length > 0) setMateria(res.materias[0].id);
      }
    }
    cargarInicial();
  }, []);

  useEffect(() => {
    async function cargarNomina() {
      if (!gradoSeccion || !materia) return;
      
      setCargando(true);
      setMensaje({ tipo: '', texto: '' });

      const res = await obtenerEstudiantesYNotas(gradoSeccion, materia, lapso);
      if (res.success) {
        setEstudiantes(res.data);
      } else {
        setMensaje({ tipo: 'error', texto: res.mensaje || 'Error al cargar los estudiantes.' });
      }
      setCargando(false);
    }

    cargarNomina();
  }, [gradoSeccion, materia, lapso]);

  const handleNotaChange = (idInscripcion, campo, valor) => {
    setEstudiantes((prev) =>
      prev.map((est) =>
        est.idInscripcion === idInscripcion
          ? { ...est, [campo]: valor }
          : est
      )
    );
  };

  const handleGuardar = async () => {
    if (!materia) {
      setMensaje({ tipo: 'error', texto: 'Seleccione una materia específica para cargar notas.' });
=======
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
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      return;
    }

    setGuardando(true);
<<<<<<< HEAD
    setMensaje({ tipo: '', texto: '' });

    const datosGuardar = {
      idGradoSeccion: gradoSeccion,
      materiaId: materia,
      lapso,
      calificaciones: estudiantes.map((e) => ({
        idInscripcion: e.idInscripcion,
        literal: e.literal,
        apreciacion: e.apreciacion,
      })),
    };

    const res = await guardarCalificacionesSeccion(datosGuardar);

    if (res.success) {
      setMensaje({ tipo: 'exito', texto: '¡Calificaciones guardadas exitosamente!' });
    } else {
      setMensaje({ tipo: 'error', texto: res.error || 'Error al guardar las calificaciones.' });
    }

    setGuardando(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Gestión de Calificaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Carga y consulta de notas para el período escolar activo.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm border border-blue-100">
          <Calendar className="h-4 w-4" />
          <span>Año Escolar: <strong>{anoEscolar || 'Cargando...'}</strong></span>
        </div>
      </div>

      {/* Alertas */}
      {mensaje.texto && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            mensaje.tipo === 'exito'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {mensaje.tipo === 'exito' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium text-sm">{mensaje.texto}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Grado y Sección
          </label>
          <select
            value={gradoSeccion}
            onChange={(e) => setGradoSeccion(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {secciones.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.nombre}
=======
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
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
              </option>
            ))}
          </select>
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Asignatura / Materia
          </label>
          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {materias.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Lapso / Momento
          </label>
          <select
            value={lapso}
            onChange={(e) => setLapso(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
=======
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Momento / Lapso
          </label>
          <select
            value={lapsoSeleccionado}
            onChange={(e) => setLapsoSeleccionado(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
          >
            <option value="1">1er Lapso</option>
            <option value="2">2do Lapso</option>
            <option value="3">3er Lapso</option>
          </select>
        </div>
      </div>

<<<<<<< HEAD
      {/* Tabla de Estudiantes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-slate-700">
              Nómina de Estudiantes ({estudiantes.length})
            </h2>
          </div>
          <button
            onClick={handleGuardar}
            disabled={guardando || cargando || estudiantes.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {guardando ? 'Guardando...' : 'Guardar Calificaciones'}
          </button>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-sm">Cargando lista de estudiantes...</p>
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-600">No hay estudiantes inscritos en esta sección.</p>
            <p className="text-xs text-slate-400 mt-1">Verifica la inscripción realizada en el módulo de Secretaría.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold w-16 text-center">N°</th>
                  <th className="py-3 px-4 font-semibold w-32">Cédula</th>
                  <th className="py-3 px-4 font-semibold">Nombres y Apellidos</th>
                  <th className="py-3 px-4 font-semibold w-32 text-center">Literal</th>
                  <th className="py-3 px-4 font-semibold">Apreciación / Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {estudiantes.map((est, index) => (
                  <tr key={est.idInscripcion || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {est.cedula}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {est.nombre}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={est.literal || ''}
                        onChange={(e) =>
                          handleNotaChange(est.idInscripcion, 'literal', e.target.value)
                        }
                        className="bg-white border border-slate-300 font-bold text-center text-blue-700 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">--</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Observación sobre el rendimiento..."
                        value={est.apreciacion || ''}
                        onChange={(e) =>
                          handleNotaChange(est.idInscripcion, 'apreciacion', e.target.value)
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
=======
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

>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      </div>
    </div>
  );
}