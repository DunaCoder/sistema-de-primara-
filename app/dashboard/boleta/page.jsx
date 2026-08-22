'use client';

import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { obtenerBoletaPorInscripcion } from '@/app/actions/reportes';

export default function BoletaConsolidadaPage({ searchParams }) {
  const [idInscripcion, setIdInscripcion] = useState(searchParams?.idInscripcion || '1');
  const [lapso, setLapso] = useState('1');
  const [boleta, setBoleta] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarBoleta = useCallback(async () => {
    if (!idInscripcion) return;
    setCargando(true);
    const res = await obtenerBoletaPorInscripcion(idInscripcion, lapso);
    setCargando(false);

    if (res.success) {
      setBoleta(res.data);
    } else {
      setBoleta(null);
      Swal.fire('Atención', res.mensaje, 'info');
    }
  }, [idInscripcion, lapso]);

  useEffect(() => {
    cargarBoleta();
  }, [cargarBoleta]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Panel de control y búsqueda (No imprimible) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              N° Inscripción / ID Estudiante
            </label>
            <input
              type="number"
              value={idInscripcion}
              onChange={(e) => setIdInscripcion(e.target.value)}
              placeholder="Ej: 1"
              className="p-2 text-xs border border-slate-300 rounded-lg text-black font-mono w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Lapso Académico
            </label>
            <select 
              value={lapso} 
              onChange={(e) => setLapso(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg text-xs text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1">1er Lapso</option>
              <option value="2">2do Lapso</option>
              <option value="3">3er Lapso</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          disabled={!boleta || cargando}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          🖨️ Imprimir Boleta
        </button>
      </div>

      {/* Vista previa / Formato imprimible de la boleta */}
      {cargando ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs font-medium rounded-xl border border-slate-200">
          Cargando boleta informativa...
        </div>
      ) : boleta ? (
        <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="text-center border-b border-slate-300 pb-4">
            <h1 className="text-base font-bold text-slate-900 uppercase">
              U.E.N.B. Bicentenario Republicano
            </h1>
            <p className="text-xs text-slate-600">Ministerio del Poder Popular para la Educación</p>
            <p className="text-xs font-bold text-slate-800 mt-2 tracking-wider uppercase">
              Boleta Informativa de Rendimiento Escolar — {boleta.lapso}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
            <p><span className="font-bold text-slate-700">Estudiante:</span> {boleta.estudiante}</p>
            <p><span className="font-bold text-slate-700">Cédula Escolar:</span> <span className="font-mono">{boleta.cedula}</span></p>
            <p><span className="font-bold text-slate-700">Grado y Sección:</span> {boleta.grado}</p>
            <p><span className="font-bold text-slate-700">Representante:</span> {boleta.representante}</p>
            <p className="col-span-2"><span className="font-bold text-slate-700">Docente de Aula:</span> {boleta.docente}</p>
          </div>

          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-300 text-slate-800 font-bold uppercase">
                <th className="p-3 border-r border-slate-300">Área de Aprendizaje</th>
                <th className="p-3 text-center border-r border-slate-300 w-20">Nota</th>
                <th className="p-3">Apreciación Descriptiva / Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {boleta.evaluaciones.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-slate-400">
                    No se registraron evaluaciones cualitativas para este lapso.
                  </td>
                </tr>
              ) : (
                boleta.evaluaciones.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 border-r border-slate-300 font-bold text-slate-800">{item.materia}</td>
                    <td className="p-3 border-r border-slate-300 text-center font-mono font-bold text-sm text-indigo-700 print:text-black">
                      {item.nota}
                    </td>
                    <td className="p-3 text-slate-700 leading-relaxed">{item.observacion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
            <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">Firma del Docente de Aula</div>
            <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">Sello de la Institución / Coordinación</div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center text-slate-400 text-xs font-medium rounded-xl border border-slate-200">
          Ingrese un ID de inscripción válido para visualizar el boletín.
        </div>
      )}
    </div>
  );
}