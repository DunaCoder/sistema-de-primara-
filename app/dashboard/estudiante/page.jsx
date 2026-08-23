"use client";

import React, { useState, useRef, useEffect } from 'react';
import { registrarEstudianteCompleto } from '@/actions/estudiante';

export default function PaginaInscripciones() {
  const [cargando, setCargando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const [form, setForm] = useState({
    nacRepresentante: 'V-',
    cedulaRepresentante: '',
    nombresRepresentante: '',
    apellidosRepresentante: '',
    operadoraTelefono: '0412',
    numeroTelefono: '',
    correo: '',
    direccion: '',
    docEstudianteTipo: 'C.E.',
    cedulaEstudiante: '',
    nombresEstudiante: '',
    apellidosEstudiante: '',
    fechaNacimiento: '',
    gradoEscolar: '1er Grado',
    seccion: 'Sección A'
  });

  const [mostrarAlmanaque, setMostrarAlmanaque] = useState(false);
  const [fechaBase, setFechaBase] = useState(new Date(2018, 0, 1));
  const almanaqueRef = useRef(null);

  const mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    const handleClickAfuera = (event) => {
      if (almanaqueRef.current && !almanaqueRef.current.contains(event.target)) {
        setMostrarAlmanaque(false);
      }
    };
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const seleccionarDia = (dia) => {
    const mes = String(fechaBase.getMonth() + 1).padStart(2, '0');
    const anio = fechaBase.getFullYear();
    const diaFormateado = String(dia).padStart(2, '0');
    setForm(prev => ({ ...prev, fechaNacimiento: `${anio}-${mes}-${diaFormateado}` }));
    setMostrarAlmanaque(false);
  };

  const cambiarMes = (e) => {
    const nuevoMes = parseInt(e.target.value, 10);
    setFechaBase(new Date(fechaBase.getFullYear(), nuevoMes, 1));
  };

  const cambiarAnio = (e) => {
    const nuevoAnio = parseInt(e.target.value, 10);
    setFechaBase(new Date(nuevoAnio, fechaBase.getMonth(), 1));
  };

  const obtenerDiasDelMes = () => {
    const anio = fechaBase.getFullYear();
    const mes = fechaBase.getMonth();
    const primerDiaSemana = new Date(anio, mes, 1).getDay();
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const inicioAjustado = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    
    const dias = [];
    for (let i = 0; i < inicioAjustado; i++) dias.push(null);
    for (let d = 1; d <= totalDias; d++) dias.push(d);
    return dias;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError('');

    const telefonoCompleto = form.numeroTelefono ? `${form.operadoraTelefono}-${form.numeroTelefono}` : '';

    const payload = {
      cedulaEstudiante: `${form.docEstudianteTipo}${form.cedulaEstudiante}`,
      nombreEstudiante: form.nombresEstudiante.toUpperCase(),
      apellidoEstudiante: form.apellidosEstudiante.toUpperCase(),
      fechaNacimiento: form.fechaNacimiento || new Date().toISOString().split('T')[0],
      
      cedulaRepresentante: `${form.nacRepresentante}${form.cedulaRepresentante}`,
      nombreRepresentante: form.nombresRepresentante.toUpperCase(),
      apellidoRepresentante: form.apellidosRepresentante.toUpperCase(),
      telefonoRepresentante: telefonoCompleto,
      emailRepresentante: form.correo,
      direccionRepresentante: form.direccion,
      
      idGradoSeccion: 1
    };

    const res = await registrarEstudianteCompleto(payload);

    setCargando(false);

    if (res.success) {
      setMostrarExito(true);
      setForm({
        nacRepresentante: 'V-',
        cedulaRepresentante: '',
        nombresRepresentante: '',
        apellidosRepresentante: '',
        operadoraTelefono: '0412',
        numeroTelefono: '',
        correo: '',
        direccion: '',
        docEstudianteTipo: 'C.E.',
        cedulaEstudiante: '',
        nombresEstudiante: '',
        apellidosEstudiante: '',
        fechaNacimiento: '',
        gradoEscolar: '1er Grado',
        seccion: 'Sección A'
      });
      setTimeout(() => setMostrarExito(false), 3500);
    } else {
      setMensajeError(res.mensaje || 'Error al guardar en la base de datos');
    }
  };

  const aniosDisponibles = Array.from({ length: 30 }, (_, i) => 2026 - i);

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 relative">
      {mostrarExito && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center max-w-sm w-full text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">¡Inscripción Exitosa!</h3>
            <p className="text-xs text-slate-500 font-medium">
              El estudiante se guardó con éxito en la Base de Datos.
            </p>
          </div>
        </div>
      )}

      {mensajeError && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm font-semibold">
          ⚠️ Error: {mensajeError}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-slate-800">Ficha de Inscripción Escolar</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="border-b border-gray-200 pb-2">
            <h2 className="text-sm font-bold text-blue-900 tracking-wide uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              DATOS DEL REPRESENTANTE LEGAL
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Nacionalidad y Cédula *</label>
              <div className="flex gap-2">
                <select name="nacRepresentante" value={form.nacRepresentante} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white outline-none">
                  <option value="V-">V-</option>
                  <option value="E-">E-</option>
                </select>
                <input type="text" name="cedulaRepresentante" value={form.cedulaRepresentante} onChange={handleChange} placeholder="Ej: 12345678" className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" required />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Nombres *</label>
              <input type="text" name="nombresRepresentante" value={form.nombresRepresentante} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" required />
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Apellidos *</label>
              <input type="text" name="apellidosRepresentante" value={form.apellidosRepresentante} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" required />
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Teléfono de Contacto</label>
              <div className="flex gap-2">
                <select name="operadoraTelefono" value={form.operadoraTelefono} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white outline-none">
                  <option value="0412">0412</option>
                  <option value="0414">0414</option>
                  <option value="0424">0424</option>
                  <option value="0416">0416</option>
                  <option value="0426">0426</option>
                  <option value="0212">0212</option>
                </select>
                <input type="text" name="numeroTelefono" value={form.numeroTelefono} onChange={handleChange} placeholder="7654321" className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="correo@ejemplo.com" className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" />
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Dirección de Habitación</label>
              <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="border-b border-gray-200 pb-2">
            <h2 className="text-sm font-bold text-emerald-900 tracking-wide uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              DATOS DEL ESTUDIANTE
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Nacionalidad y Documento *</label>
              <div className="flex gap-2">
                <select name="docEstudianteTipo" value={form.docEstudianteTipo} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white outline-none">
                  <option value="C.E.">C.E.</option>
                  <option value="V-">V-</option>
                  <option value="E-">E-</option>
                </select>
                <input type="text" name="cedulaEstudiante" value={form.cedulaEstudiante} onChange={handleChange} placeholder="Número de Cédula / C.E." className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" required />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Nombres del Estudiante *</label>
              <input type="text" name="nombresEstudiante" value={form.nombresEstudiante} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" required />
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Apellidos del Estudiante *</label>
              <input type="text" name="apellidosEstudiante" value={form.apellidosEstudiante} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 outline-none" required />
            </div>

            <div className="flex flex-col justify-end relative" ref={almanaqueRef}>
              <label className="text-xs font-semibold text-gray-700 mb-1">Fecha de Nacimiento *</label>
              <div className="relative cursor-pointer" onClick={() => setMostrarAlmanaque(!mostrarAlmanaque)}>
                <input 
                  type="text" 
                  readOnly
                  name="fechaNacimiento" 
                  value={form.fechaNacimiento} 
                  placeholder="aaaa-mm-dd"
                  className="w-full p-2 pr-10 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white outline-none cursor-pointer" 
                  required 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  📅
                </div>
              </div>

              {mostrarAlmanaque && (
                <div className="absolute z-50 bottom-full mb-2 left-0 w-72 bg-white border border-gray-200 shadow-xl rounded-xl p-3">
                  <div className="flex gap-2 mb-3">
                    <select 
                      value={fechaBase.getMonth()} 
                      onChange={cambiarMes} 
                      className="w-1/2 p-1 border border-gray-300 rounded text-xs text-slate-800 bg-white font-medium"
                    >
                      {mesesNombres.map((mes, idx) => (
                        <option key={mes} value={idx}>{mes}</option>
                      ))}
                    </select>
                    <select 
                      value={fechaBase.getFullYear()} 
                      onChange={cambiarAnio} 
                      className="w-1/2 p-1 border border-gray-300 rounded text-xs text-slate-800 bg-white font-medium"
                    >
                      {aniosDisponibles.map(anio => (
                        <option key={anio} value={anio}>{anio}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-gray-600 mb-1">
                    <span>Lu</span>
                    <span>Ma</span>
                    <span>Mi</span>
                    <span>Ju</span>
                    <span>Vi</span>
                    <span>Sá</span>
                    <span>Do</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {obtenerDiasDelMes().map((dia, idx) => (
                      <div key={idx}>
                        {dia ? (
                          <button
                            type="button"
                            onClick={() => seleccionarDia(dia)}
                            className="w-full h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 hover:text-blue-700 font-medium text-slate-800 transition-colors"
                          >
                            {dia}
                          </button>
                        ) : (
                          <div className="w-full h-7"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Grado Escolar</label>
              <select name="gradoEscolar" value={form.gradoEscolar} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white outline-none">
                <option value="1er Grado">1er Grado</option>
                <option value="2do Grado">2do Grado</option>
                <option value="3er Grado">3er Grado</option>
                <option value="4to Grado">4to Grado</option>
                <option value="5to Grado">5to Grado</option>
                <option value="6to Grado">6to Grado</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-700 mb-1">Sección</label>
              <select name="seccion" value={form.seccion} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white outline-none">
                <option value="Sección A">Sección A</option>
                <option value="Sección B">Sección B</option>
                <option value="Sección C">Sección C</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={cargando} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl transition-colors shadow-md disabled:opacity-50">
          {cargando ? 'Guardando Registro en BD...' : 'Completar y Registrar Inscripción'}
        </button>
      </form>
    </div>
  );
}