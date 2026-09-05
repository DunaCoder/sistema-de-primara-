// app/dashboard/alumnos/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { obtenerMatriculaGeneral } from '../../actions/alumnos';

export default function AlumnosBuscadorPage() {
  const [matricula, setMatricula] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarMatricula() {
      setLoading(true);
      const data = await obtenerMatriculaGeneral();
      setMatricula(data || []); // Asegurar que sea un array
      setLoading(false);
    }
    cargarMatricula();
  }, []);

  // ✅ Filtro seguro (evita errores si algún campo es undefined)
  const alumnosFiltrados = matricula.filter(item => {
    const termino = busqueda.toLowerCase();
    const id = item.idAlumno || '';
    const nombre = item.nombreAlumno || '';
    const rep = item.representante || '';
    return (
      id.toLowerCase().includes(termino) ||
      nombre.toLowerCase().includes(termino) ||
      rep.toLowerCase().includes(termino)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Control de Matrícula General</h1>
          <p className="text-xs text-slate-500 mt-1">Buscador centralizado de estudiantes inscritos.</p>
        </div>
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="🔍 Buscar por cédula, alumno o rep..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium animate-pulse">
            Sincronizando el listado general con la base de datos...
          </div>
        ) : alumnosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {matricula.length === 0 
              ? "No hay ningún alumno inscrito en el sistema todavía." 
              : "No se encontraron alumnos que coincidan con la búsqueda."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">Cédula</th>
                  <th className="p-4">Alumno</th>
                  <th className="p-4">Grado / Sección</th>
                  <th className="p-4">Representante Legal</th>
                  <th className="p-4 text-center">Discapacidad</th>
                  <th className="p-4 text-center">Alergias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumnosFiltrados.map((item) => (
                 <tr key={item.idAlumno || `alumno-${index}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-600">{item.idAlumno || 'S/C'}</td>
                    <td className="p-4 font-medium text-slate-800">{item.nombreAlumno || 'Sin nombre'}</td>
                    <td className="p-4 text-slate-600 font-medium">{item.gradoSeccion || 'Sin asignar'}</td>
                    <td className="p-4">
                      <div className="text-slate-800 font-medium">{item.representante || 'Sin representante'}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {item.cedulaRep || ''} • {item.telefonoRep || 'Sin teléfono'}
                      </div>
                      {item.telefonos && item.telefonos.length > 1 && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          + {item.telefonos.length - 1} teléfonos más
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.discapacidad ? (
                        <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          {item.discapacidad}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.alergias ? (
                        <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                          {item.alergias}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
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