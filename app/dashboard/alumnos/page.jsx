// app/dashboard/alumnos/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { obtenerMatriculaGeneral } from '../../actions/alumnos'; // Asegúrate de la ruta correcta

export default function AlumnosBuscadorPage() {
  const [matricula, setMatricula] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarMatricula() {
      setLoading(true);
      const data = await obtenerMatriculaGeneral();
      setMatricula(data);
      setLoading(false);
    }
    cargarMatricula();
  }, []);

  const alumnosFiltrados = matricula.filter(item => {
    const termino = busqueda.toLowerCase();
    return (
      item.cedulaEscolar.toLowerCase().includes(termino) ||
      item.nombreAlumno.toLowerCase().includes(termino) ||
      item.representante.toLowerCase().includes(termino)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">Cédula Escolar</th>
                  <th className="p-4">Alumno</th>
                  <th className="p-4">Grado / Sección</th>
                  <th className="p-4">Representante Legal</th>
                  {/* ❌ Columna "Expediente" eliminada */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {alumnosFiltrados.map((item) => (
                  <tr key={item.idInscripcion} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-600">{item.cedulaEscolar}</td>
                    <td className="p-4 font-medium text-slate-800">{item.nombreAlumno}</td>
                    <td className="p-4 text-slate-600 font-medium">{item.gradoSeccion}</td>
                    <td className="p-4">
                      <div className="text-slate-800 font-medium">{item.representante}</div>
                      <div className="text-xs text-slate-400 font-mono">{item.cedulaRep} • {item.telefonoRep}</div>
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