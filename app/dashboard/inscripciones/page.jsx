"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { obtenerMatriculaGeneral } from '@/actions/matricula';

export default function PaginaMatricula() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Carga asíncrona con protección contra desmontaje
  useEffect(() => {
    let mounted = true;

    async function cargarMatriculaBD() {
      try {
        setCargando(true);
        setError(null);
        const res = await obtenerMatriculaGeneral();

        if (mounted) {
          if (res?.success) {
            setEstudiantes(res.data || []);
          } else {
            setError(res?.mensaje || 'No se pudo cargar la matrícula.');
          }
        }
      } catch (err) {
        if (mounted) setError('Error de conexión con el servidor.');
      } finally {
        if (mounted) setCargando(false);
      }
    }

    cargarMatriculaBD();

    return () => {
      mounted = false; // Cancela actualizaciones si se desmonta el componente
    };
  }, []);

  // Filtrado optimizado memoizado
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
      {/* Encabezado y buscador */}
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
            placeholder="Buscar por cédula, estudiante o representante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">🔍</span>
        </div>
      </div>

      {/* Tabla de matrículas */}
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
              {cargando ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">
                    <span className="inline-block animate-pulse">Cargando nómina desde la base de datos...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-red-500 font-medium">
                    {error}
                  </td>
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
=======
'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { registrarInscripcionAction, buscarRepresentanteAction } from '../../actions/students';
import Swal from 'sweetalert2';

import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es';
import 'flatpickr/dist/flatpickr.min.css';

// Componente DatePicker sincronizado en Español
function DatePickerEspanol({ value, onChange }) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);
  
  // Guardamos el valor inicial en una referencia para evitar re-crear Flatpickr si cambia 'value'
  const initialValueRef = useRef(value);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      locale: Spanish,
      dateFormat: 'd/m/Y',
      defaultDate: initialValueRef.current || null,
      onChange: (_, dateStr) => {
        onChange(dateStr);
      },
    });

    return () => {
      if (fpRef.current) fpRef.current.destroy();
    };
  }, [onChange]);

  useEffect(() => {
    if (fpRef.current && value !== undefined) {
      fpRef.current.setDate(value || '', false);
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value || ''}
      placeholder="DD/MM/AAAA"
      readOnly
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800 cursor-pointer"
    />
  );
}

const obtenerAnioEscolarActual = () => {
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();
  return mes >= 8 ? `${anio}-${anio + 1}` : `${anio - 1}-${anio}`;
};

const INITIAL_REP_STATE = {
  anioEscolar: obtenerAnioEscolarActual(),
  nacionalidad: 'V',
  cedulaNumero: '',
  idRepresentante: '',
  nombreRep: '',
  apellidoRep: '',
  codigoTelefono: '0412',
  telefonoNumero: '',
  telefono: '',
  direccionRep: ''
};

const ESTUDIANTE_TEMPLATE = {
  tipoDocEstudiante: 'CE',
  numDocEstudiante: '',
  idEstudiante: '',
  nombreEstudiante: '',
  apellidoEstudiante: '',
  fechaNacimiento: '',
  grado: '1er Grado',
  seccion: 'A'
};

export default function InscripcionesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_REP_STATE);
  const [estudiantes, setEstudiantes] = useState([{ ...ESTUDIANTE_TEMPLATE }]);
  const [loading, setLoading] = useState(false);
  const [repEncontrado, setRepEncontrado] = useState(false);

  // Lógica exacta para Cédula Escolar (12 dígitos MPPE)
  const calcularCedulaEscolar = (fechaNacStr, cedulaRepStr, numHijoIndex) => {
    if (!cedulaRepStr) return '';
    const prefijo = "1";
    let anio2Dig = "00";
    if (fechaNacStr && typeof fechaNacStr === 'string' && fechaNacStr.includes('/')) {
      const partes = fechaNacStr.split('/');
      if (partes[2] && partes[2].length === 4) {
        anio2Dig = partes[2].substring(2, 4);
      }
    }
    const cedulaClean = cedulaRepStr.replace(/\D/g, '');
    const cedula8Dig = cedulaClean.padStart(8, '0').slice(-8);
    const correlativo = String(numHijoIndex + 1).slice(-1);

    return `${prefijo}${anio2Dig}${cedula8Dig}${correlativo}`;
  };

  const verificarRepresentanteExistente = async () => {
    if (!formData.idRepresentante || formData.cedulaNumero.length < 6) return;

    const res = await buscarRepresentanteAction(formData.idRepresentante);
    if (res?.success && res?.data) {
      const rep = res.data;
      setRepEncontrado(true);
      let codTel = '0412', numTel = rep.telefono || '';
      if (numTel.length >= 10) {
        codTel = numTel.substring(0, 4);
        numTel = numTel.substring(4);
      }

      setFormData((prev) => ({
        ...prev,
        nombreRep: rep.nombre || '',
        apellidoRep: rep.apellido || '',
        codigoTelefono: codTel,
        telefonoNumero: numTel,
        telefono: rep.telefono || '',
        direccionRep: rep.direccion || ''
      }));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Representante encontrado',
        showConfirmButton: false,
        timer: 2500
      });
    }
  };

  const handleRepChange = (e) => {
    const { name, value } = e.target;

    if (name === 'nombreRep' || name === 'apellidoRep') {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '') }));
    } 
    else if (name === 'nacionalidad' || name === 'cedulaNumero') {
      const soloNumeros = name === 'cedulaNumero' ? value.replace(/\D/g, '').slice(0, 8) : formData.cedulaNumero;
      const nuevaNac = name === 'nacionalidad' ? value : (formData.nacionalidad || 'V');
      const nuevoIdRep = soloNumeros ? `${nuevaNac}-${soloNumeros}` : '';

      setFormData((prev) => ({
        ...prev,
        nacionalidad: nuevaNac,
        cedulaNumero: soloNumeros,
        idRepresentante: nuevoIdRep
      }));

      setEstudiantes((prevEst) =>
        prevEst.map((est, idx) => {
          if (est.tipoDocEstudiante === 'CE') {
            const nuevaCE = calcularCedulaEscolar(est.fechaNacimiento, soloNumeros, idx);
            return {
              ...est,
              numDocEstudiante: nuevaCE,
              idEstudiante: nuevaCE ? `CE-${nuevaCE}` : ''
            };
          }
          return est;
        })
      );
    } 
    else if (name === 'codigoTelefono' || name === 'telefonoNumero') {
      const soloNumeros = name === 'telefonoNumero' ? value.replace(/\D/g, '') : formData.telefonoNumero;
      const nuevoCod = name === 'codigoTelefono' ? value : formData.codigoTelefono;
      setFormData((prev) => ({
        ...prev,
        codigoTelefono: nuevoCod,
        telefonoNumero: soloNumeros,
        telefono: soloNumeros ? `${nuevoCod}${soloNumeros}` : ''
      }));
    } 
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEstudianteChange = (index, field, value) => {
    setEstudiantes((prev) => {
      const nuevos = [...prev];
      const est = { ...nuevos[index] };

      if (field === 'nombreEstudiante' || field === 'apellidoEstudiante') {
        est[field] = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '');
      } 
      else if (field === 'tipoDocEstudiante') {
        est.tipoDocEstudiante = value;
        if (value === 'CE') {
          const ceGenerada = calcularCedulaEscolar(est.fechaNacimiento, formData.cedulaNumero, index);
          est.numDocEstudiante = ceGenerada;
          est.idEstudiante = ceGenerada ? `CE-${ceGenerada}` : '';
        } else {
          est.numDocEstudiante = '';
          est.idEstudiante = '';
        }
      }
      else if (field === 'numDocEstudiante') {
        const maxLen = est.tipoDocEstudiante === 'CE' ? 12 : 8;
        const num = value.replace(/\D/g, '').slice(0, maxLen);
        est.numDocEstudiante = num;
        est.idEstudiante = num ? `${est.tipoDocEstudiante}-${num}` : '';
      }
      else if (field === 'fechaNacimiento') {
        est.fechaNacimiento = value;
        if (est.tipoDocEstudiante === 'CE') {
          const ceGenerada = calcularCedulaEscolar(value, formData.cedulaNumero, index);
          est.numDocEstudiante = ceGenerada;
          est.idEstudiante = ceGenerada ? `CE-${ceGenerada}` : '';
        }
      }
      else {
        est[field] = value;
      }

      nuevos[index] = est;
      return nuevos;
    });
  };

  const agregarEstudiante = () => {
    setEstudiantes((prev) => {
      const idx = prev.length;
      const ceGenerada = calcularCedulaEscolar('', formData.cedulaNumero, idx);
      return [
        ...prev,
        {
          ...ESTUDIANTE_TEMPLATE,
          numDocEstudiante: ceGenerada,
          idEstudiante: ceGenerada ? `CE-${ceGenerada}` : ''
        }
      ];
    });
  };

  const eliminarEstudiante = (index) => {
    if (estudiantes.length === 1) return;
    setEstudiantes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cedulaNumero || formData.cedulaNumero.length < 6 || !formData.nombreRep || !formData.apellidoRep) {
      return Swal.fire('Incompleto', 'Complete la cédula, nombre y apellido del representante', 'warning');
    }

    for (let i = 0; i < estudiantes.length; i++) {
      const est = estudiantes[i];
      if (!est.nombreEstudiante || !est.apellidoEstudiante || !est.fechaNacimiento) {
        return Swal.fire('Incompleto', `Complete todos los datos requeridos del estudiante #${i + 1}`, 'warning');
      }
      if (est.tipoDocEstudiante === 'CE' && est.numDocEstudiante.length !== 12) {
        return Swal.fire('Error Cédula Escolar', `La Cédula Escolar del estudiante #${i + 1} debe contener 12 dígitos exactos.`, 'warning');
      }
    }

    setLoading(true);

    const payload = {
      ...formData,
      estudiantes
    };

    const res = await registrarInscripcionAction(payload);
    setLoading(false);

    if (res?.success) {
      await Swal.fire('¡Éxito!', res.message || 'Inscripción completada correctamente', 'success');
      setFormData(INITIAL_REP_STATE);
      setEstudiantes([{ ...ESTUDIANTE_TEMPLATE }]);
      router.push('/dashboard/estudiantes');
    } else {
      Swal.fire('Error', res?.error || 'No se pudo guardar la inscripción', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      
      {/* HEADER Y ANIO ESCOLAR */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Ficha de Inscripción Escolar</h1>
          <p className="text-xs text-slate-500">U.E.N.B. Bicentenario Republicano</p>
        </div>

        <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 flex items-center gap-2 shrink-0">
          <label htmlFor="anioEscolar" className="text-xs font-bold text-slate-700 whitespace-nowrap">
            📅 Año Escolar:
          </label>
          <select
            id="anioEscolar"
            name="anioEscolar"
            value={formData.anioEscolar}
            onChange={handleRepChange}
            className="bg-white border border-slate-300 text-indigo-700 font-bold text-sm rounded-md px-3 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
            <option value="2027-2028">2027-2028</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS REPRESENTANTE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              👨‍👦 Datos del Representante Legal (Mamá / Papá / Tutor)
            </h2>
            {repEncontrado && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium">
                ✓ Encontrado
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nacionalidad *</label>
              <div className="flex gap-2">
                <select
                  name="nacionalidad"
                  value={formData.nacionalidad}
                  onChange={handleRepChange}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500 shrink-0 cursor-pointer"
                >
                  <option value="V">V-</option>
                  <option value="E">E-</option>
                </select>
                <input
                  type="text"
                  name="cedulaNumero"
                  value={formData.cedulaNumero}
                  onChange={handleRepChange}
                  onBlur={verificarRepresentanteExistente}
                  placeholder="12345678"
                  maxLength={8}
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
                onChange={handleRepChange} 
                placeholder=""
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos *</label>
              <input 
                type="text" 
                name="apellidoRep"  
                value={formData.apellidoRep} 
                onChange={handleRepChange} 
                placeholder=""
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono de Contacto</label>
              <div className="flex gap-2">
                <select
                  name="codigoTelefono"
                  value={formData.codigoTelefono}
                  onChange={handleRepChange}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500 shrink-0 cursor-pointer font-mono"
                >
                  <option value="0412">0412</option>
                  <option value="0414">0414</option>
                  <option value="0424">0424</option>
                  <option value="0416">0416</option>
                  <option value="0426">0426</option>
                  <option value="0212">0212</option>
                </select>
                <input
                  type="text"
                  name="telefonoNumero"
                  value={formData.telefonoNumero}
                  onChange={handleRepChange}
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
                onChange={handleRepChange} 
                placeholder="Municipio, Sector, Casa/Apto" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DE ESTUDIANTES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              🎒 Estudiantes a Inscribir ({estudiantes.length})
            </h2>

            <button
              type="button"
              onClick={agregarEstudiante}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>+</span> Agregar otro estudiante
            </button>
          </div>

          {estudiantes.map((est, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md">
                  Estudiante #{index + 1}
                </span>

                {estudiantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarEstudiante(index)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline cursor-pointer"
                  >
                    ✕ Quitar estudiante
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nacionalidad *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={est.tipoDocEstudiante}
                      onChange={(e) => handleEstudianteChange(index, 'tipoDocEstudiante', e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2 py-2 focus:outline-none focus:border-indigo-500 shrink-0 cursor-pointer"
                    >
                      <option value="CE">Cédula Escolar (12 Dígitos)</option>
                      <option value="V">Venezolano (V-)</option>
                      <option value="E">Extranjero (E-)</option>
                    </select>
                    <input
                      type="text"
                      value={est.numDocEstudiante}
                      onChange={(e) => handleEstudianteChange(index, 'numDocEstudiante', e.target.value)}
                      placeholder={est.tipoDocEstudiante === 'CE' ? "120123456781" : "12345678"}
                      maxLength={est.tipoDocEstudiante === 'CE' ? 12 : 8}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nombres *</label>
                  <input 
                    type="text" 
                    value={est.nombreEstudiante} 
                    onChange={(e) => handleEstudianteChange(index, 'nombreEstudiante', e.target.value)} 
                    placeholder=""
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos *</label>
                  <input 
                    type="text" 
                    value={est.apellidoEstudiante} 
                    onChange={(e) => handleEstudianteChange(index, 'apellidoEstudiante', e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Fecha de Nacimiento (Español) *
                  </label>
                  <DatePickerEspanol
                    value={est.fechaNacimiento}
                    onChange={(fechaFormateada) => handleEstudianteChange(index, 'fechaNacimiento', fechaFormateada)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Grado Escolar *</label>
                  <select 
                    value={est.grado} 
                    onChange={(e) => handleEstudianteChange(index, 'grado', e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800 cursor-pointer"
                  >
                    <option value="1er Grado">1er Grado</option>
                    <option value="2do Grado">2do Grado</option>
                    <option value="3er Grado">3er Grado</option>
                    <option value="4to Grado">4to Grado</option>
                    <option value="5to Grado">5to Grado</option>
                    <option value="6to Grado">6to Grado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sección *</label>
                  <select 
                    value={est.seccion} 
                    onChange={(e) => handleEstudianteChange(index, 'seccion', e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800 cursor-pointer"
                  >
                    <option value="A">Sección A</option>
                    <option value="B">Sección B</option>
                    <option value="C">Sección C</option>
                    <option value="D">Sección D</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Guardando...' : `Procesar Inscripción (${estudiantes.length} Estudiante${estudiantes.length > 1 ? 's' : ''})`}
          </button>
        </div>
      </form>

    </div>
  );
}