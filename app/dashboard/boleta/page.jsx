'use client';

import { useState } from 'react';

export default function BoletaConsolidadaPage() {
  const [lapso, setLapso] = useState('1');

  // Datos mock consolidados para previsualizar la boleta
  const boleta = {
    estudiante: "Rodríguez, Luis",
    cedula: "117321234561",
    grado: "1er Grado A",
    representante: "Elena Rodríguez",
    lapso: `${lapso}° Lapso`,
    docente: "María Docente",
    evaluaciones: [
      { materia: "Matemáticas", nota: "A", observacion: "Excelente desempeño en razonamiento lógico y conteo." },
      { materia: "Lengua y Literatura", nota: "A", observacion: "Muestra fluidez en lectura y correcta escritura." },
      { materia: "Ciencias Naturales", nota: "B", observacion: "Participación activa en actividades grupales." },
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Selector no imprimible */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center print:hidden">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lapso Académico</label>
          <select 
            value={lapso} 
            onChange={(e) => setLapso(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs text-black"
          >
            <option value="1">1er Lapso</option>
            <option value="2">2do Lapso</option>
            <option value="3">3er Lapso</option>
          </select>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          🖨️ Imprimir Boleta
        </button>
      </div>

      {/* Formato imprimible de la boleta */}
      <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="text-center border-b border-slate-300 pb-4">
          <h1 className="text-base font-bold text-slate-900 uppercase">U.E.N.B. Bicentenario Republicano</h1>
          <p className="text-xs text-slate-600">Ministerio del Poder Popular para la Educación</p>
          <p className="text-xs font-bold text-slate-800 mt-2 tracking-wider uppercase">Boleta Informativa de Rendimiento Escolar — {boleta.lapso}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
          <p><span className="font-bold text-slate-700">Estudiante:</span> {boleta.estudiante}</p>
          <p><span className="font-bold text-slate-700">Cédula Escolar:</span> <span className="font-mono">{boleta.cedula}</span></p>
          <p><span className="font-bold text-slate-700">Grado y Sección:</span> {boleta.grado}</p>
          <p><span className="font-bold text-slate-700">Representante:</span> {boleta.representante}</p>
          <p><span className="font-bold text-slate-700">Docente de Aula:</span> {boleta.docente}</p>
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
            {boleta.evaluaciones.map((item, idx) => (
              <tr key={idx}>
                <td className="p-3 border-r border-slate-300 font-bold text-slate-800">{item.materia}</td>
                <td className="p-3 border-r border-slate-300 text-center font-mono font-bold text-sm text-indigo-700 print:text-black">
                  {item.nota}
                </td>
                <td className="p-3 text-slate-700 leading-relaxed">{item.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
          <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">Firma del Docente de Aula</div>
          <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">Sello de la Institución / Coordinación</div>
        </div>
      </div>
    </div>
  );
}