'use client'

import { useState, useEffect } from 'react';
import { obtenerMatriculaGeneral } from '@/app/actions/estudiante';

export default function EstudianteBuscadorPage() {
  const [matricula, setMatricula] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarMatricula() {
      try {
        setLoading(true);
        const res = await obtenerMatriculaGeneral();
        if (Array.isArray(res)) {
          setMatricula(res);
        } else if (res?.success && Array.isArray(res?.data)) {
          setMatricula(res.data);
        } else {
          setMatricula([]);
        }
      } catch (error) {
        console.error("Error al cargar matrícula:", error);
        setMatricula([]);
      } finally {
        setLoading(false);
      }
    }
    cargarMatricula();
  }, []);

  const estudiantesFiltrados = matricula.filter((item) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const cedulaEst = (item?.cedulaEscolar || item?.numDocEstudiante || '').toLowerCase();
    const nombreEst = (item?.nombreEstudiante || '').toLowerCase();
    const repNombre = (item?.representante || item?.nombreRep || '').toLowerCase();
    const cedulaRep = (item?.cedulaRep || item?.idRepresentante || '').toLowerCase();

    return (
      cedulaEst.includes(termino) ||
      nombreEst.includes(termino) ||
      repNombre.includes(termino) ||
      cedulaRep.includes(termino)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Control de Matrícula General</h1>
          <p className="text-xs text-slate-500 mt-1">Buscador centralizado de estudiantes inscritos.</p>
        </div>
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="🔍 Buscar por cédula, estudiante o rep..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-3 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium animate-pulse">
            Sincronizando el listado general con la base de datos...
          </div>
        ) : estudiantesFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {matricula.length === 0 
              ? "No hay ningún estudiante inscrito en el sistema todavía." 
              : "No se encontraron estudiantes que coincidan con la búsqueda."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">Cédula / Doc.</th>
                  <th className="p-4">Estudiante</th>
                  <th className="p-4">Grado / Sección</th>
                  <th className="p-4">Representante Legal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {estudiantesFiltrados.map((item, index) => (
                  <tr 
                    key={item.idInscripcion || item.idEstudiante || index} 
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 font-mono font-semibold text-slate-600">
                      {item.cedulaEscolar || item.numDocEstudiante || 'S/N'}
                    </td>
                    <td className="p-4 font-medium text-slate-800 uppercase">
                      {item.nombreEstudiante || 'Sin Nombre'}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {item.gradoSeccion || `${item.grado || ''} - ${item.seccion || ''}`}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800 font-medium uppercase">
                        {item.representante || item.nombreRep || 'Sin Datos'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {item.cedulaRep || item.idRepresentante || ''} 
                        {(item.telefonoRep || item.telefono) ? ` • ${item.telefonoRep || item.telefono}` : ''}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}