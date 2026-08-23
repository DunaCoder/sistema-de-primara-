'use client';

import { useState, useEffect } from 'react';
import { obtenerEstatusCargaDocente, obtenerBoletinesMasivosPorSeccion } from '@/actions/coordinacionCierre';

export default function CierreCoordinacionPage() {
  const [lapso, setLapso] = useState('1');
  const [reporte, setReporte] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [imprimiendoId, setImprimiendoId] = useState(null);
  const [boletinesImpresion, setBoletinesImpresion] = useState([]);

  useEffect(() => {
    async function cargarData() {
      setCargando(true);
      const res = await obtenerEstatusCargaDocente(lapso);
      if (res.success) setReporte(res.reporte);
      setCargando(false);
    }
    cargarData();
  }, [lapso]);

  const handleImprimir = async (idGradoSeccion) => {
    setImprimiendoId(idGradoSeccion);
    const data = await obtenerBoletinesMasivosPorSeccion(idGradoSeccion, lapso);

    if (data.success && data.boletines.length > 0) {
      setBoletinesImpresion(data.boletines);
      setTimeout(() => {
        window.print();
        setImprimiendoId(null);
      }, 300);
    } else {
      alert('No se encontraron boletines con notas cargadas en esta sección.');
      setImprimiendoId(null);
    }
  };

  return (
    <>
      {/* VISTA INTERACTIVA EN PANTALLA */}
      <div className="max-w-5xl mx-auto space-y-6 p-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 uppercase">Cierre Académico y Control de Boletines</h1>
            <p className="text-xs text-slate-500">
              Supervisión de notas cargadas por los docentes e impresión masiva por sección
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Lapso:</label>
            <select
              value={lapso}
              onChange={(e) => setLapso(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            >
              <option value="1">1er Lapso</option>
              <option value="2">2do Lapso</option>
              <option value="3">3er Lapso</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-xs text-slate-400">Cargando métricas de rendimiento...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reporte.map((item) => (
              <div key={item.idGradoSeccion} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800">{item.nombre}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.completo ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.porcentaje}% Cargado
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${item.completo ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${item.porcentaje}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                  <span>Estudiantes con notas: <strong>{item.estudiantesConNotas} / {item.totalInscritos}</strong></span>
                  <button
                    disabled={item.estudiantesConNotas === 0 || imprimiendoId === item.idGradoSeccion}
                    onClick={() => handleImprimir(item.idGradoSeccion)}
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {imprimiendoId === item.idGradoSeccion ? 'Generando...' : '🖨️ Imprimir Sección'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN OFICIAL (Oculta en pantalla, visible al imprimir) */}
      <div className="hidden print:block p-4">
        {boletinesImpresion.map((b) => (
          <div key={b.idInscripcion} className="border-b-2 border-slate-900 pb-6 mb-8 [page-break-after:always]">
            <div className="text-center mb-4">
              <h2 className="text-base font-bold uppercase">COMPLEJO EDUCATIVO BICENTENARIO REPUBLICANO</h2>
              <p className="text-xs font-semibold text-slate-600">BOLETÍN INFORMATIVO DE EVALUACIÓN - LAPSO {lapso}</p>
            </div>

            <div className="flex justify-between text-xs mb-4 font-semibold border-y py-2 border-slate-200">
              <div>
                <p>Estudiante: <span className="font-bold">{b.estudiante}</span></p>
                <p>Cédula Escolar: <span className="font-bold">{b.cedula}</span></p>
              </div>
              <div className="text-right">
                <p>Grado y Sección: <span className="font-bold">{b.grado}</span></p>
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Área de Formación / Materia</th>
                  <th className="border border-slate-300 p-2 text-center w-16">Literal</th>
                  <th className="border border-slate-300 p-2 text-left">Apreciación Descriptiva</th>
                </tr>
              </thead>
              <tbody>
                {b.evaluaciones.map((e, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-2 font-bold">{e.materia}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">{e.nota}</td>
                    <td className="border border-slate-300 p-2 text-slate-700">{e.observacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}