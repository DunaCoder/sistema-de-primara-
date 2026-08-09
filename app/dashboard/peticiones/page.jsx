'use client'

import { useState } from 'react';

// 📌 Datos mock iniciales (simulan solicitudes de nuevos usuarios)
const initialRequests = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@escuela.com', rol: 'Docente', estado: 'pendiente' },
  { id: 2, nombre: 'María', apellido: 'Gómez', email: 'maria.gomez@escuela.com', rol: 'Secretaria', estado: 'pendiente' },
  { id: 3, nombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@escuela.com', rol: 'Docente', estado: 'pendiente' },
  { id: 4, nombre: 'Ana', apellido: 'Martínez', email: 'ana.martinez@escuela.com', rol: 'Admin', estado: 'pendiente' },
];

export default function PeticionesPage() {
  const [solicitudes, setSolicitudes] = useState(initialRequests);

  // ✅ Aprobar solicitud: cambia estado y simula creación de usuario
  const handleAprobar = (id) => {
    setSolicitudes((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, estado: 'aprobado' } : req
      )
    );
    // Aquí iría la llamada real al backend para crear el usuario
    console.log(`✅ Solicitud ${id} APROBADA. Usuario creado con rol correspondiente.`);
    // Podrías mostrar un toast o notificación
  };

  // ❌ Rechazar solicitud
  const handleRechazar = (id) => {
    setSolicitudes((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, estado: 'rechazado' } : req
      )
    );
    console.log(`❌ Solicitud ${id} RECHAZADA.`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📋 Peticiones de Personal</h1>
      <p className="text-gray-600 mb-4">
        Aquí puedes revisar las solicitudes de nuevos usuarios. Al aprobar, se creará automáticamente un usuario con el rol solicitado.
      </p>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre completo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol solicitado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                  No hay solicitudes pendientes.
                </td>
              </tr>
            ) : (
              solicitudes.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {req.nombre} {req.apellido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{req.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {req.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${req.estado === 'pendiente' && 'bg-yellow-100 text-yellow-800'}
                        ${req.estado === 'aprobado' && 'bg-green-100 text-green-800'}
                        ${req.estado === 'rechazado' && 'bg-red-100 text-red-800'}
                      `}
                    >
                      {req.estado === 'pendiente' && '⏳ Pendiente'}
                      {req.estado === 'aprobado' && '✅ Aprobado'}
                      {req.estado === 'rechazado' && '❌ Rechazado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {req.estado === 'pendiente' ? (
                      <>
                        <button
                          onClick={() => handleAprobar(req.id)}
                          className="text-green-600 hover:text-green-900 mr-4 transition-colors"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(req.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contador de pendientes */}
      <div className="mt-6 text-sm text-gray-600">
        <span className="font-semibold">
          {solicitudes.filter((s) => s.estado === 'pendiente').length}
        </span>{' '}
        solicitudes pendientes.
      </div>
    </div>
  );
}