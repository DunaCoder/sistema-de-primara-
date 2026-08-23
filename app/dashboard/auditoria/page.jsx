'use client';

import { useState, useEffect } from 'react';
import { obtenerAuditoria } from '@/actions/auditoria';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const res = await obtenerAuditoria();
        if (res?.success) {
          setLogs(res.logs || []);
        }
      } catch (error) {
        console.error("Error al cargar la auditoría:", error);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Filtrado dinámico en tiempo real
  const logsFiltrados = logs.filter((log) =>
    log.usuarioNombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    log.modulo?.toLowerCase().includes(filtro.toLowerCase()) ||
    log.accion?.toLowerCase().includes(filtro.toLowerCase()) ||
    log.detalles?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Encabezado y Filtro Rápido */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🛡️ Bitácora y Auditoría del Sistema</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro inmutable de eventos de seguridad y operaciones del plantel
          </p>
        </div>
        <input
          type="text"
          placeholder="Buscar por usuario, módulo o acción..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full sm:w-72 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
        />
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-xs text-slate-400">Cargando registros de auditoría...</div>
        ) : logsFiltrados.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No se encontraron eventos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-slate-200 uppercase font-bold">
                <tr>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Detalle del Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logsFiltrados.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                      {log.fecha ? new Date(log.fecha).toLocaleString('es-VE') : 'N/A'}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{log.usuarioNombre || 'Desconocido'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {log.rol || 'SIN ROL'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800 uppercase">{log.modulo || 'GENERAL'}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700">{log.accion}</span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-md break-words">
                      {log.detalles}
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