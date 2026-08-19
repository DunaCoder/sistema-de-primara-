'use client';

import { useState, useEffect } from 'react';
import { obtenerAuditoria } from '@/app/actions/auditoria';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const res = await obtenerAuditoria();
      if (res.success) setLogs(res.logs);
      setCargando(false);
    }
    cargar();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">🛡️ Bitácora y Auditoría del Sistema</h1>
        <p className="text-xs text-slate-500 mt-1">Historial de acciones de usuarios en el sistema local.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-xs text-slate-400">Cargando registros...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">Sin eventos registrados aún.</div>
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
                  <th className="p-3">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 whitespace-nowrap font-mono">{new Date(log.fecha).toLocaleString('es-VE')}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.usuarioNombre}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.rol}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{log.modulo}</td>
                    <td className="p-3">{log.accion}</td>
                    <td className="p-3 text-slate-600">{log.detalles}</td>
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