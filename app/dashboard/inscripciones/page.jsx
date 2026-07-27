// app/dashboard/inscripciones/page.jsx
'use client'

import { useState } from 'react';
import { registrarInscripcionAction } from '../../actions/student';

export default function InscripcionesPage() {
  const [formData, setFormData] = useState({
    idRepresentante: '', nombreRep: '', apellidoRep: '', telefonoRep: '', direccionRep: '',
    idAlumno: '', nombreAlu: '', apellidoAlu: '', fechaNacimiento: '', expedienteCompleto: 'si',
    idGradoSeccion: '1' // ID de la sección muestra (1er Grado A) generada en el seed
  });

  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    // Validaciones básicas de campos vacíos
    if (!formData.idRepresentante || !formData.idAlumno || !formData.nombreAlu || !formData.apellidoAlu) {
      setStatus({ loading: false, error: 'Por favor, rellene los campos obligatorios del Alumno y Representante.', success: '' });
      return;
    }

    const res = await registrarInscripcionAction(formData);

    if (res.success) {
      setStatus({ loading: false, error: '', success: res.message });
      // Limpiar formulario excepto la sección asignada
      setFormData({
        idRepresentante: '', nombreRep: '', apellidoRep: '', telefonoRep: '', direccionRep: '',
        idAlumno: '', nombreAlu: '', apellidoAlu: '', fechaNacimiento: '', expedienteCompleto: 'si',
        idGradoSeccion: '1'
      });
    } else {
      setStatus({ loading: false, error: res.error, success: '' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Ficha de Inscripción Escolar</h1>
        <p className="text-xs text-slate-500 mt-1">Registrar nuevo ingreso en la matrícula para el Año Escolar 2025-2026.</p>
      </div>

      {/* Alertas */}
      {status.error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-lg text-sm font-medium">
          ⚠️ {status.error}
        </div>
      )}
      {status.success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-lg text-sm font-medium">
          ✅ {status.success}
        </div>
      )}

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS DEL REPRESENTANTE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            👨‍👦 Datos del Representante Legal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula Identidad *</label>
              <input type="text" name="idRepresentante" value={formData.idRepresentante} onChange={handleChange} placeholder="Ej: V-12345678" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombres</label>
              <input type="text" name="nombreRep" value={formData.nombreRep} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos</label>
              <input type="text" name="apellidoRep" value={formData.apellidoRep} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono de Contacto</label>
              <input type="text" name="telefonoRep" value={formData.telefonoRep} onChange={handleChange} placeholder="Ej: 0412-0000000" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Dirección de Habitación</label>
              <input type="text" name="direccionRep" value={formData.direccionRep} onChange={handleChange} placeholder="Municipio, Calle, Casa/Apto" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DEL ALUMNO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            🎒 Datos del Estudiante
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula Escolar / ID *</label>
              <input type="text" name="idAlumno" value={formData.idAlumno} onChange={handleChange} placeholder="Ej: E-84123456" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombres *</label>
              <input type="text" name="nombreAlu" value={formData.nombreAlu} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos *</label>
              <input type="text" name="apellidoAlu" value={formData.apellidoAlu} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de Nacimiento</label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Asignar Grado y Sección</label>
              <select name="idGradoSeccion" value={formData.idGradoSeccion} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800">
                <option value="1">1er Grado - Sección A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">¿Expediente Completo?</label>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center text-sm text-slate-700">
                  <input type="radio" name="expedienteCompleto" value="si" checked={formData.expedienteCompleto === 'si'} onChange={handleChange} className="mr-2 text-indigo-600"/> Sí
                </label>
                <label className="inline-flex items-center text-sm text-slate-700">
                  <input type="radio" name="expedienteCompleto" value="no" checked={formData.expedienteCompleto === 'no'} onChange={handleChange} className="mr-2 text-indigo-600"/> No
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN DE ENVÍO */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status.loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-6 rounded-lg transition-colors shadow-sm"
          >
            {status.loading ? 'Registrando en Postgres...' : 'Procesar Inscripción Completa'}
          </button>
        </div>

      </form>
    </div>
  );
}