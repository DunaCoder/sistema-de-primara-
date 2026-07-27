// app/dashboard/notas/page.jsx
'use client'

import { useState } from 'react';

export default function AdministrarNotasPage() {
  // --- FILTROS DE CONTROL ---
  const [grado, setGrado] = useState('1er Grado');
  const [seccion, setSeccion] = useState('A');
  const [lapso, setLapso] = useState('1er Lapso');
  const [materia, setMateria] = useState('Lengua y Comunicación');

  // --- MOCK DE ESTUDIANTES REGISTRADOS (CON FILTROS ASOCIADOS) ---
  const [estudiantes, setEstudiantes] = useState([
    { id: 1, grado: '1er Grado', seccion: 'A', lapso: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84123456', nombre: 'Carlos Eduardo', apellido: 'Mendoza Ruiz', nota: 'A', apreciacion: 'Demuestra excelente comprensión lectora y fluidez verbal.' },
    { id: 2, grado: '1er Grado', seccion: 'A', lapso: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84987654', nombre: 'María Valentina', apellido: 'Gómez Silva', nota: 'B', apreciacion: 'Buen trabajo en clase. Requiere repasar reglas ortográficas.' },
    { id: 3, grado: '1er Grado', seccion: 'A', lapso: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84223344', nombre: 'Simón Alejandro', apellido: 'Padrón Martínez', nota: 'A', apreciacion: 'Participativo, redacción clara y ordenada.' },
    
    // Alumnos para probar el filtrado con otras materias/secciones
    { id: 4, grado: '1er Grado', seccion: 'A', lapso: '1er Lapso', materia: 'Matemáticas', cedula: 'E-84123456', nombre: 'Carlos Eduardo', apellido: 'Mendoza Ruiz', nota: 'B', apreciacion: 'Domina las operaciones básicas de adición y sustracción.' },
    { id: 5, grado: '1er Grado', seccion: 'B', lapso: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84556677', nombre: 'Andrés Ignacio', apellido: 'Rivas Pérez', nota: 'C', apreciacion: 'Consistente, requiere reforzar caligrafía.' },
    { id: 6, grado: '2do Grado', seccion: 'A', lapso: '1er Lapso', materia: 'Lengua y Comunicación', cedula: 'E-84889900', nombre: 'Camila Isabel', apellido: 'Torres Blanco', nota: 'A', apreciacion: 'Rendimiento sobresaliente en todas las actividades.' },
  ]);

  // --- Escala de calificaciones por letras ---
  const opcionesLetras = ['A', 'B', 'C', 'D', 'E'];

  // --- FILTRADO DE ESTUDIANTES SEGÚN SELECCIÓN DE FILTROS ---
  const estudiantesFiltrados = estudiantes.filter(
    est => est.grado === grado && 
           est.seccion === seccion && 
           est.lapso === lapso && 
           est.materia === materia
  );

  // --- MANEJADORES DE NOTAS (UPDATE / EDIT) ---
  const handleNotaChange = (id, campo, valor) => {
    setEstudiantes(prev => prev.map(est => est.id === id ? { ...est, [campo]: valor } : est));
  };

  // Restablecer / Limpiar evaluación de un alumno
  const handleLimpiarNota = (id) => {
    setEstudiantes(prev => prev.map(est => est.id === id ? { ...est, nota: '', apreciacion: '' } : est));
  };

  const handleGuardarNotas = () => {
    alert(`[MOCK] Calificaciones guardadas exitosamente para ${grado} "${seccion}" - ${materia} (${lapso})`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Carga y Control de Calificaciones</h1>
          <p className="text-xs text-slate-500 mt-1">Asignación de calificación por letras (A–E) y apreciaciones cualitativas por sección.</p>
        </div>

        <button 
          onClick={handleGuardarNotas}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center gap-2 shrink-0"
        >
          💾 Guardar Calificaciones
        </button>
      </div>

      {/* Bar de Filtros: Grado, Sección, Lapso y Área de Aprendizaje */}
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
            value={lapso}
            onChange={(e) => setLapso(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="1er Lapso">1er Lapso</option>
            <option value="2do Lapso">2do Lapso</option>
            <option value="3er Lapso">3er Lapso</option>
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

      {/* Tabla Interactiva de Estudiantes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {grado} "{seccion}" — {materia}
            </h2>
            <p className="text-xs text-slate-500">{lapso}</p>
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
                <th className="p-4 text-center w-36">Calificación (A - E)</th>
                <th className="p-4">Apreciación / Observación Pedagógica</th>
                <th className="p-4 text-center w-16">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 text-xs font-medium">
                    No se encontraron estudiantes inscritos para {grado} "{seccion}" en {materia}.
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Estudiante e Identificación (Inmodificables) */}
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{est.apellido}, {est.nombre}</p>
                      <p className="text-xs font-mono text-slate-500">{est.cedula}</p>
                    </td>
                    
                    {/* Selector de Nota por Letras */}
                    <td className="p-4 text-center">
                      <select 
                        value={est.nota}
                        onChange={(e) => handleNotaChange(est.id, 'nota', e.target.value)}
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

                    {/* Input de Apreciación */}
                    <td className="p-4">
                      <input 
                        type="text"
                        value={est.apreciacion}
                        onChange={(e) => handleNotaChange(est.id, 'apreciacion', e.target.value)}
                        placeholder="Describa el rendimiento del alumno..."
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </td>

                    {/* Acción: Limpiar campo */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleLimpiarNota(est.id)}
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

        {/* Footer Informativo */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>* Los datos personales son gestionados por Secretaría. Modificaciones restringidas al docente.</span>
          <button 
            onClick={handleGuardarNotas}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

    </div>
  );
}