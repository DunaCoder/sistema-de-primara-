'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  buscarRepresentanteAction, 
  registrarInscripcionAction 
} from '@/actions/estudiante';

export default function InscripcionNuevoEstudiantePage() {
  const router = useRouter();

  // Estados del formulario
  const [cedulaRep, setCedulaRep] = useState('');
  const [representante, setRepresentante] = useState(null);
  const [buscandoRep, setBuscandoRep] = useState(false);

  const [estudiante, setEstudiante] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
  });

  const [idGradoSeccion, setIdGradoSeccion] = useState('1');
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // 1. Buscar Representante
  const handleBuscarRepresentante = async () => {
    if (!cedulaRep) return;
    setBuscandoRep(true);
    setMensaje(null);

    const res = await buscarRepresentanteAction(cedulaRep);
    setBuscandoRep(false);

    if (res.success) {
      setRepresentante(res.data);
    } else {
      setRepresentante(null);
      setMensaje({ tipo: 'error', texto: res.message || 'Representante no encontrado' });
    }
  };

  // 2. Guardar Inscripción
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!representante) {
      setMensaje({ tipo: 'error', texto: 'Debes seleccionar un representante válido.' });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    const payload = {
      idRepresentante: representante.idRepresentante,
      idGradoSeccion,
      anioEscolar: "2025-2026",
      estudiantes: [estudiante],
    };

    const res = await registrarInscripcionAction(payload);
    setGuardando(false);

    if (res.success) {
      setMensaje({ tipo: 'exito', texto: res.message });
      setTimeout(() => router.push('/dashboard/estudiante'), 1500);
    } else {
      setMensaje({ tipo: 'error', texto: res.error });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Inscripción / Nuevo Estudiante</h1>

      {mensaje && (
        <div className={`p-4 mb-6 rounded-md text-sm ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Bloque 1: Búsqueda de Representante */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">1. Datos del Representante</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Cédula del Representante"
            value={cedulaRep}
            onChange={(e) => setCedulaRep(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white"
          />
          <button
            type="button"
            onClick={handleBuscarRepresentante}
            disabled={buscandoRep}
            className="px-4 py-2 bg-gray-800 text-white rounded font-medium hover:bg-gray-900 cursor-pointer disabled:opacity-50"
          >
            {buscandoRep ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {representante && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-sm">
            <strong>Representante Seleccionado:</strong> {representante.nombre} {representante.apellido} (C.I: {representante.cedula})
          </div>
        )}
      </div>

      {/* Bloque 2: Formulario del Estudiante */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">2. Datos del Estudiante y Grado</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / Identificador</label>
            <input
              type="text"
              required
              value={estudiante.cedula}
              onChange={(e) => setEstudiante({ ...estudiante, cedula: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              required
              value={estudiante.nombre}
              onChange={(e) => setEstudiante({ ...estudiante, nombre: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              required
              value={estudiante.apellido}
              onChange={(e) => setEstudiante({ ...estudiante, apellido: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grado / Sección</label>
          <select
            value={idGradoSeccion}
            onChange={(e) => setIdGradoSeccion(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white"
          >
            <option value="1">1° Grado "A"</option>
            <option value="2">2° Grado "A"</option>
            <option value="3">3° Grado "A"</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-blue-300 cursor-pointer"
          >
            {guardando ? 'Procesando...' : 'Completar Inscripción'}
          </button>
        </div>
      </form>
    </div>
  );
}