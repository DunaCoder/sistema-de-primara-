"use client";

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { obtenerMatriculaGeneral } from '@/actions/matricula';

export default function PaginaMatricula() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();

    async function cargarMatriculaBD() {
      try {
        setCargando(true);
        setError(null);
        const res = await obtenerMatriculaGeneral({ signal: controller.signal });

        if (res?.success) {
          setEstudiantes(res.data || []);
        } else {
          setError(res?.mensaje || 'No se pudo cargar la matrícula.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Error de conexión con el servidor.');
        }
      } finally {
        setCargando(false);
      }
    }

    cargarMatriculaBD();

    return () => controller.abort();
  }, []);

  const handleBusquedaChange = (e) => {
    const val = e.target.value;
    startTransition(() => {
      setBusqueda(val);
    });
  };

  const filtrados = useMemo(() => {
    const term = busqueda.toLowerCase().trim();
    if (!term) return estudiantes;

    return estudiantes.filter((e) => (
      (e.cedula || '').toLowerCase().includes(term) ||
      (e.estudiante || '').toLowerCase().includes(term) ||
      (e.representante || '').toLowerCase().includes(term)
    ));
  }, [estudiantes, busqueda]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Encabezado y Buscador */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Control de Matrícula General</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total matriculados: <span className="font-semibold text-slate-700">{estudiantes.length}</span>
            {busqueda && <span className="ml-2 text-blue-600 font-medium">(Filtrados: {filtrados.length})</span>}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            aria-label="Buscar estudiante"
            placeholder="Buscar por cédula, estudiante o representante..."
            defaultValue={busqueda}
            onChange={handleBusquedaChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">🔍</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">CÉDULA / DOC</th>
                <th className="p-4">ESTUDIANTE</th>
                <th className="p-4">GRADO / SECCIÓN</th>
                <th className="p-4">REPRESENTANTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {cargando || isPending ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">
                    <span className="inline-block animate-pulse">Cargando nómina desde la base de datos...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-red-500 font-medium">{error}</td>
                </tr>
              ) : filtrados.length > 0 ? (
                filtrados.map((item, index) => (
                  <tr key={item.id || item.cedula || index} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{item.cedula || 'N/A'}</td>
                    <td className="p-4 font-medium uppercase text-slate-800">{item.estudiante || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{item.gradoSeccion || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{item.representante || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">
                    {busqueda ? 'No se encontraron coincidencias.' : 'No hay estudiantes registrados en la base de datos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}