// app/dashboard/asignaciones/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { getDatosAsignacion, guardarAsignacionDocente } from '@/app/actions/coordinador';

export default function AsignacionesPage() {
  const [docentes, setDocentes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [materias, setMaterias] = useState([]);
  
  const [form, setForm] = useState({ idDocente: '', idGradoSeccion: '', idMateria: '' });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    async function cargar() {
      const res = await getDatosAsignacion();
      if (res.success) {
        setDocentes(res.docentes);
        setGrados(res.grados);
        setMaterias(res.materias);
      }
    }
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!form.idDocente || !form.idGradoSeccion || !form.idMateria) {
      setMensaje({ tipo: 'error', texto: 'Todos los campos son obligatorios.' });
      return;
    }

    const res = await guardarAsignacionDocente(form);
    if (res.success) {
      setMensaje({ tipo: 'exito', texto: 'Asignación registrada exitosamente.' });
      setForm({ idDocente: '', idGradoSeccion: '', idMateria: '' });
    } else {
      setMensaje({ tipo: 'error', texto: res.error });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Módulo de Coordinación: Asignar Materias</h2>

      {mensaje.texto && (
        <div className={`p-3 mb-4 rounded text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Docente</label>
          <select
            value={form.idDocente}
            onChange={(e) => setForm({ ...form, idDocente: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm text-slate-800"
          >
            <option value="">-- Seleccione Docente --</option>
            {docentes.map(d => (
              <option key={d.idPersonal} value={d.idPersonal}>{d.nombre} {d.apellido} ({d.idPersonal})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Grado y Sección</label>
          <select
            value={form.idGradoSeccion}
            onChange={(e) => setForm({ ...form, idGradoSeccion: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm text-slate-800"
          >
            <option value="">-- Seleccione Grado y Sección --</option>
            {grados.map(g => (
              <option key={g.idGradoSeccion} value={g.idGradoSeccion}>{g.grado} - Sección "{g.seccion}"</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Materia</label>
          <select
            value={form.idMateria}
            onChange={(e) => setForm({ ...form, idMateria: e.target.value })}
            className="w-full border rounded-lg p-2 text-sm text-slate-800"
          >
            <option value="">-- Seleccione Materia --</option>
            {materias.map(m => (
              <option key={m.idMateria} value={m.idMateria}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg">
          Guardar Asignación
        </button>
      </form>
    </div>
  );
}