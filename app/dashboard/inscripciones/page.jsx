'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registrarInscripcionAction } from '../../actions/studens';
import Swal from 'sweetalert2';

const INITIAL_FORM_STATE = {
  idRepresentante: '',
  nombreRep: '',
  apellidoRep: '',
  codigoTelefono: '0412',
  telefonoNumero: '',
  telefono: '',
  direccionRep: '',
  nacionalidad: 'V',
  cedulaNumero: '',
  idAlumno: '',
  tipoDocAlumno: 'CE',
  numDocAlumno: '',
  nombreAlu: '',
  apellidoAlu: '',
  fechaNacimiento: '',
  idGradoSeccion: '1'
};

export default function InscripcionesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  
  // Rastrea si el usuario editó manualmente el apellido del alumno
  const [apellidoManual, setApellidoManual] = useState(false);

const handleChange = (e) => {
  const { name, value } = e.target;

  // 1. Manejo unificado de Nombres y Apellidos (Solo letras, en MAYÚSCULAS)
  if (['nombreRep', 'apellidoRep', 'nombreAlu', 'apellidoAlu'].includes(name)) {
    // Se limpia la cadena una sola vez para todos los campos de texto
    const soloLetrasMayusculas = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '');

    if (name === 'apellidoRep') {
      setFormData((prev) => ({
        ...prev,
        apellidoRep: soloLetrasMayusculas,
        // Copia automática solo si el usuario no ha editado el apellido del alumno manualmente
        apellidoAlu: apellidoManual ? prev.apellidoAlu : soloLetrasMayusculas
      }));
    } else if (name === 'apellidoAlu') {
      setApellidoManual(true); // Rompe el enlace de auto-copia
      setFormData((prev) => ({ ...prev, apellidoAlu: soloLetrasMayusculas }));
    } else {
      // Para 'nombreRep' y 'nombreAlu'
      setFormData((prev) => ({ ...prev, [name]: soloLetrasMayusculas }));
    }
  } 
  // 2. Manejo de Cédula de Representante
  else if (name === 'nacionalidad' || name === 'cedulaNumero') {
    const soloNumeros = name === 'cedulaNumero' ? value.replace(/\D/g, '') : formData.cedulaNumero;
    const nuevaNacionalidad = name === 'nacionalidad' ? value : (formData.nacionalidad || 'V');
    setFormData((prev) => ({
      ...prev,
      nacionalidad: nuevaNacionalidad,
      cedulaNumero: soloNumeros,
      idRepresentante: soloNumeros ? `${nuevaNacionalidad}-${soloNumeros}` : ''
    }));
  } 
  // 3. Manejo de Teléfono
  else if (name === 'codigoTelefono' || name === 'telefonoNumero') {
    const soloNumeros = name === 'telefonoNumero' ? value.replace(/\D/g, '') : formData.telefonoNumero;
    const nuevoCodigo = name === 'codigoTelefono' ? value : (formData.codigoTelefono || '0412');
    setFormData((prev) => ({
      ...prev,
      codigoTelefono: nuevoCodigo,
      telefonoNumero: soloNumeros,
      telefono: soloNumeros ? `${nuevoCodigo}${soloNumeros}` : ''
    }));
  } 
  // 4. Manejo de Documento de Alumno (Cédula o Escolar)
  else if (name === 'tipoDocAlumno' || name === 'numDocAlumno') {
    const soloNumeros = name === 'numDocAlumno' ? value.replace(/\D/g, '') : formData.numDocAlumno;
    const nuevoTipo = name === 'tipoDocAlumno' ? value : (formData.tipoDocAlumno || 'CE');
    const prefijo = nuevoTipo === 'CE' ? 'E' : nuevoTipo;
    setFormData((prev) => ({
      ...prev,
      tipoDocAlumno: nuevoTipo,
      numDocAlumno: soloNumeros,
      idAlumno: soloNumeros ? `${prefijo}-${soloNumeros}` : ''
    }));
  } 
  // 5. Resto de campos estándar
  else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.idRepresentante || !formData.idAlumno || !formData.nombreAlu || !formData.apellidoAlu) {
      await Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, rellene los campos obligatorios del Alumno y Representante.',
        confirmButtonColor: '#dc2626',
      });
      setLoading(false);
      return;
    }

    const confirmacion = await Swal.fire({
      title: '¿Confirmar inscripción?',
      text: 'Verifica que los datos sean correctos antes de continuar.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, inscribir',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) {
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      telefono: formData.telefono || '',
    };

    const res = await registrarInscripcionAction(payload);

    if (res.success) {
      await Swal.fire({
        icon: 'success',
        title: '🎉 Inscripción exitosa',
        text: res.message,
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        timerProgressBar: true,
      });

      // Limpiar formulario y resetear estado de copia manual
      setFormData(INITIAL_FORM_STATE);
      setApellidoManual(false);
      router.push('/dashboard/alumnos');
    } else {
      await Swal.fire({
        icon: 'error',
        title: '❌ Error al inscribir',
        text: res.error || 'Ocurrió un error inesperado.',
        confirmButtonColor: '#dc2626',
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Ficha de Inscripción Escolar</h1>
        <p className="text-xs text-slate-500 mt-1">Registrar nuevo ingreso en la matrícula para el Año Escolar 2025-2026.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN 1: DATOS DEL REPRESENTANTE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            👨‍👦 Datos del Representante Legal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula de Identidad *</label>
              <div className="flex gap-2">
                <select
                  name="nacionalidad"
                  value={formData.nacionalidad || 'V'}
                  onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 shrink-0 cursor-pointer"
                >
                  <option value="V">V- (Nacionalidad)</option>
                  <option value="E">E- (Extranjero)</option>
                </select>
                <input
                  type="text"
                  name="cedulaNumero"
                  value={formData.cedulaNumero || ''}
                  onChange={handleChange}
                  placeholder="12345678"
                  maxLength={12}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombres *</label>
              <input 
                type="text" 
                name="nombreRep"  
                value={formData.nombreRep} 
                onChange={handleChange} 
                placeholder="ej: carlos alberto"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 lowercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos *</label>
              <input 
                type="text" 
                name="apellidoRep"  
                value={formData.apellidoRep} 
                onChange={handleChange} 
                placeholder="ej: pérez mendoza"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 lowercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono de Contacto</label>
              <div className="flex gap-2">
                <select
                  name="codigoTelefono"
                  value={formData.codigoTelefono || '0412'}
                  onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 shrink-0 cursor-pointer font-mono"
                >
                  <option value="0412">0412</option>
                  <option value="0414">0414</option>
                  <option value="0416">0416</option>
                  <option value="0212">0212</option>
                </select>
                <input
                  type="text"
                  name="telefonoNumero"
                  value={formData.telefonoNumero || ''}
                  onChange={handleChange}
                  placeholder="1234567"
                  maxLength={7}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Dirección de Habitación</label>
              <input 
                type="text" 
                name="direccionRep" 
                value={formData.direccionRep} 
                onChange={handleChange} 
                placeholder="Municipio, Calle, Casa/Apto" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
              />
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula o ID Escolar *</label>
              <div className="flex gap-2">
                <select
                  name="tipoDocAlumno"
                  value={formData.tipoDocAlumno || 'CE'}
                  onChange={handleChange}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500 shrink-0 cursor-pointer"
                >
                  <option value="CE">E- (Escolar)</option>
                  <option value="V">V- (Nacionalidad)</option>
                  <option value="E">E- (Extranjero)</option>
                </select>
                <input
                  type="text"
                  name="numDocAlumno"
                  value={formData.numDocAlumno || ''}
                  onChange={handleChange}
                  placeholder="12345678"
                  maxLength={11}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombres *</label>
              <input 
                type="text" 
                name="nombreAlu"  
                value={formData.nombreAlu} 
                onChange={handleChange} 
                placeholder="ej: luis fernando"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 lowercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Apellidos * {apellidoManual && <span className="text-[10px] text-indigo-500 font-normal">(Editado)</span>}
              </label>
              <input 
                type="text" 
                name="apellidoAlu" 
                value={formData.apellidoAlu} 
                onChange={handleChange} 
                placeholder="ej: pérez mendoza"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 lowercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de Nacimiento</label>
              <input 
                type="date" 
                name="fechaNacimiento" 
                value={formData.fechaNacimiento} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Asignar Grado y Sección</label>
              <select 
                name="idGradoSeccion" 
                value={formData.idGradoSeccion} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
              >
                <option value="1">1er Grado - Sección A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Registrando en Postgres...' : 'Procesar Inscripción Completa'}
          </button>
        </div>
      </form>
    </div>
  );
}