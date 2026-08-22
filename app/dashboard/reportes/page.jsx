'use client';

import { useState, useEffect, useCallback } from 'react';
import { obtenerAsignacionesDocente, obtenerEstudiantesYNotas } from '@/actions/notas';

// Función para limpiar cualquier duplicación que venga de la base de datos
const formatearGradoSeccion = (nombreOriginal) => {
  if (!nombreOriginal) return '---';

  // Extrae el número o texto ordinal (1er, 2do, 3er, etc.) y la Sección
  // Elimina duplicados como "Grado° Grado"
  let limpio = nombreOriginal
    .replace(/grado°?/gi, '')
    .replace(/grado/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Si tiene formato tipo "1er - Sección 'A'", lo reestructura a "1er Grado - Sección 'A'"
  if (limpio.includes('-')) {
    const [gradoPart, seccionPart] = limpio.split('-');
    return `${gradoPart.trim()} Grado - ${seccionPart.trim()}`;
  }

  return `${limpio} Grado`;
};

export default function ReportesDocentePage() {
  const [seccionesAsignadas, setSeccionesAsignadas] = useState([]);
  const [materiasAsignadas, setMateriasAsignadas] = useState([]);

  const [anoEscolar, setAnoEscolar] = useState('');
  const [gradoSeccion, setGradoSeccion] = useState('');
  const [materia, setMateria] = useState('TODAS');
  const [lapso, setLapso] = useState('1');

  const [nombreSeccion, setNombreSeccion] = useState('');
  const [nombreMateria, setNombreMateria] = useState('Todas las Áreas (Consolidado)');

  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    async function cargarFiltros() {
      try {
        const res = await obtenerAsignacionesDocente();
        if (res.success) {
          setSeccionesAsignadas(res.secciones || []);
          setMateriasAsignadas(res.materias || []);
          
          if (res.anoEscolar) {
            setAnoEscolar(res.anoEscolar);
          }

          if (res.secciones?.length > 0) {
            setGradoSeccion(res.secciones[0].id);
            setNombreSeccion(res.secciones[0].nombre);
          }
        }
      } catch (error) {
        console.error('Error al cargar filtros:', error);
      }
    }
    cargarFiltros();
  }, []);

  const cargarReporte = useCallback(async () => {
    if (!gradoSeccion) return;

    setCargando(true);
    try {
      const res = await obtenerEstudiantesYNotas(gradoSeccion, materia, lapso);
      if (res.success && Array.isArray(res.data)) {
        setEstudiantes(res.data);
      } else {
        setEstudiantes([]);
      }
    } catch (error) {
      console.error('Error al consultar planilla:', error);
      setEstudiantes([]);
    } finally {
      setCargando(false);
    }
  }, [gradoSeccion, materia, lapso]);

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  const handleSeccionChange = (e) => {
    const id = e.target.value;
    setGradoSeccion(id);
    const sec = seccionesAsignadas.find((s) => String(s.id) === String(id));
    if (sec) setNombreSeccion(sec.nombre);
  };

  const handleMateriaChange = (e) => {
    const id = e.target.value;
    setMateria(id);
    if (id === 'TODAS') {
      setNombreMateria('Todas las Áreas (Consolidado)');
    } else {
      const mat = materiasAsignadas.find((m) => String(m.id) === String(id));
      if (mat) setNombreMateria(mat.nombre);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const esConsolidado = materia === 'TODAS';

  const obtenerTextoLapso = (num) => {
    if (num === '1') return '1.er Lapso';
    if (num === '2') return '2.º Lapso';
    if (num === '3') return '3.er Lapso';
    return `${num}° Lapso`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 print:p-0 print:m-0">
      {/* Controles superiores */}
      <div className="bg-white p-4 rounded-lg shadow border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Grado y Sección
          </label>
          <select
            value={gradoSeccion}
            onChange={handleSeccionChange}
            className="w-full border border-slate-300 rounded-md p-2 text-sm text-slate-900 bg-white font-medium"
          >
            {seccionesAsignadas.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {formatearGradoSeccion(sec.nombre)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Materia / Área de Formación
          </label>
          <select
            value={materia}
            onChange={handleMateriaChange}
            className="w-full border border-slate-300 rounded-md p-2 text-sm text-slate-900 bg-white font-medium"
          >
            <option value="TODAS">📊 TODAS LAS MATERIAS (CONSOLIDADO)</option>
            {materiasAsignadas.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Lapso Escolar
          </label>
          <select
            value={lapso}
            onChange={(e) => setLapso(e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 text-sm text-slate-900 bg-white font-medium"
          >
            <option value="1">1.er Lapso</option>
            <option value="2">2.º Lapso</option>
            <option value="3">3.er Lapso</option>
          </select>
        </div>
      </div>

      {/* Encabezado y Acción */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📄 Generación de Reportes y Consolidados</h1>
          <p className="text-sm text-slate-600">
            Vista previa oficial conectada a la base de datos institucional.
          </p>
        </div>
        <button
          onClick={handleImprimir}
          disabled={cargando || estudiantes.length === 0}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-md font-semibold text-sm shadow cursor-pointer transition"
        >
          🖨️ Imprimir / Exportar a PDF
        </button>
      </div>

      {/* Planilla Imprimible */}
      <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* Encabezado Oficial */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
          <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase">
            COMPLEJO EDUCATIVO BICENTENARIO REPUBLICANO
          </h2>
          <p className="text-xs uppercase font-bold text-slate-700">
            Ministerio del Poder Popular para la Educación
          </p>
          <h3 className="text-sm font-extrabold text-slate-900 mt-2 uppercase tracking-wider">
            {esConsolidado
              ? 'CONSOLIDADO GENERAL DE EVALUACIÓN CUALITATIVA'
              : 'REGISTRO CUALITATIVO POR ÁREA DE FORMACIÓN'}
          </h3>

          {/* Recuadro de Metadatos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs text-left bg-slate-100 p-3 rounded border border-slate-300 text-slate-900 font-bold print:bg-white print:border-slate-800">
            <div>
              <span className="text-slate-600 font-normal">Grado / Sección:</span>{' '}
              {formatearGradoSeccion(nombreSeccion)}
            </div>
            <div><span className="text-slate-600 font-normal">Área / Materia:</span> {nombreMateria}</div>
            <div><span className="text-slate-600 font-normal">Lapso Escolar:</span> {obtenerTextoLapso(lapso)}</div>
            <div>
              <span className="text-slate-600 font-normal">Año Escolar:</span>{' '}
              {anoEscolar || 'Cargando...'}
            </div>
          </div>
        </div>

        {/* Tabla de Datos */}
        {cargando ? (
          <div className="p-12 text-center text-slate-600 text-sm font-medium animate-pulse">
            Cargando expedientes académicos desde la base de datos...
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="p-10 text-center text-slate-600 text-sm border-2 border-dashed border-slate-300 rounded-md">
            No existen registros cargados para los parámetros seleccionados.
          </div>
        ) : esConsolidado ? (
          <table className="w-full text-left border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-400 font-bold uppercase text-slate-900">
                <th className="p-2 border border-slate-400 w-8 text-center">N°</th>
                <th className="p-2 border border-slate-400 w-24 text-center">Cédula / C.E.</th>
                <th className="p-2 border border-slate-400">Apellidos y Nombres</th>
                {materiasAsignadas.map((mat) => (
                  <th key={mat.id} className="p-2 border border-slate-400 text-center w-16">
                    {mat.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est, idx) => (
                <tr key={est.idInscripcion || idx} className="border-b border-slate-300">
                  <td className="p-2 border border-slate-300 text-center font-mono font-bold">{idx + 1}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{est.cedula || 'S/C'}</td>
                  <td className="p-2 border border-slate-300 font-semibold text-slate-900">{est.nombre}</td>
                  {materiasAsignadas.map((mat) => (
                    <td key={mat.id} className="p-2 border border-slate-300 text-center font-bold text-sm">
                      {est.notasPorMateria?.[mat.id] || '--'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-400 font-bold uppercase text-slate-900">
                <th className="p-2 border border-slate-400 w-8 text-center">N°</th>
                <th className="p-2 border border-slate-400 w-24 text-center">Cédula / C.E.</th>
                <th className="p-2 border border-slate-400">Apellidos y Nombres del Estudiante</th>
                <th className="p-2 border border-slate-400 w-16 text-center">Literal</th>
                <th className="p-2 border border-slate-400">Observación / Apreciación Pedagógica</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est, idx) => (
                <tr key={est.idInscripcion || idx} className="border-b border-slate-300">
                  <td className="p-2 border border-slate-300 text-center font-mono font-bold">{idx + 1}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{est.cedula || 'S/C'}</td>
                  <td className="p-2 border border-slate-300 font-semibold text-slate-900">{est.nombre}</td>
                  <td className="p-2 border border-slate-300 text-center font-bold text-sm text-slate-900">
                    {est.literal || '--'}
                  </td>
                  <td className="p-2 border border-slate-300 text-slate-800">
                    {est.apreciacion || 'Sin observación registrada.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Firmas Oficiales */}
        <div className="mt-16 pt-4 grid grid-cols-2 gap-8 text-center text-xs font-bold text-slate-900 print:mt-20">
          <div>
            <div className="border-t border-slate-900 w-48 mx-auto mb-1"></div>
            <p>Firma del Docente / Guía de Aula</p>
          </div>
          <div>
            <div className="border-t border-slate-900 w-48 mx-auto mb-1"></div>
            <p>Sello y Firma / Control de Estudios</p>
          </div>
        </div>

      </div>
    </div>
  );
}