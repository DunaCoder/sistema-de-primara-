'use client';

import { useState, useEffect } from 'react';
import { obtenerAuditoria } from '@/actions/auditoria';

export default function HistorialDocentePage() {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarHistorial() {
      try {
        const res = await obtenerAuditoria();
        if (res.ok) {
          // Filtrar únicamente los movimientos del módulo de calificaciones del docente
          const misActividades = res.data.filter(
            item => item.modulo === 'CALIFICACIONES'
          );
          setLogs(misActividades);
        }
      } catch (err) {
        console.error('Error al cargar historial', err);
      } finally {
        setCargando(false);
      }
    }
    cargarHistorial();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📜 Historial de Actividad</h1>
        <p className="text-sm text-gray-600">
          Registro de seguimiento sobre las fechas y horas en las que guardaste o modificaste notas.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        {cargando ? (
          <p className="text-center text-gray-500 py-6 animate-pulse">Cargando actividad...</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No has registrado actividades recientemente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-100 text-sm text-gray-700">
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Acción Realizada</th>
                  <th className="p-3">Detalle del Registro</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-3 text-gray-600 font-mono">
                      {new Date(log.fecha).toLocaleString('es-VE')}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {log.accion}
                      </span>
                    </td>
                    <td className="p-3 text-gray-800">{log.detalles}</td>
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