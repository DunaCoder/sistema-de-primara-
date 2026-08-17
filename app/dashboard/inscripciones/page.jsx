'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registrarInscripcionAction, buscarRepresentanteAction } from '../../actions/studens';
import Swal from 'sweetalert2';

const INITIAL_REP_STATE = {
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

const ALUMNO_TEMPLATE = {
  tipoDocAlumno: 'CE',
  numDocAlumno: '',
  idAlumno: '',
  nombreAlu: '',
  apellidoAlu: '',
  fechaNacimiento: '',
  idGradoSeccion: '1'
};

export default function InscripcionesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_REP_STATE);
  
  // Arreglo dinámico de alumnos (hermanos)
  const [alumnos, setAlumnos] = useState([ { ...ALUMNO_TEMPLATE } ]);

  const [loading, setLoading] = useState(false);
  const [repEncontrado, setRepEncontrado] = useState(false);
  const [cargandoRep, setCargandoRep] = useState(false);

  // Consulta en PostgreSQL si la cédula ingresada ya existe
  const verificarRepresentanteExistente = async (idRep) => {
    if (!idRep || idRep.length < 5) return;

    setCargandoRep(true);
    const res = await buscarRepresentanteAction(idRep);
    setCargandoRep(false);

    if (res.success && res.data) {
      const rep = res.data;
      setRepEncontrado(true);

      let codTel = '0412';
      let numTel = rep.telefono || '';
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

      // Copiar el apellido del representante encontrado a todos los alumnos
      const apellidoEncontrado = (rep.apellido || '').toUpperCase();
      setAlumnos((prevAlumnos) =>
        prevAlumnos.map((alu) => ({ ...alu, apellidoAlu: apellidoEncontrado }))
      );

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Representante encontrado',
        text: 'Se han autocompletado sus datos.',
        showConfirmButton: false,
        timer: 3000
      });
    } else {
      setRepEncontrado(false);
    }
  };

  // Manejador para los datos del Representante
  const handleRepChange = (e) => {
    const { name, value } = e.target;

    if (['nombreRep', 'apellidoRep'].includes(name)) {
      const soloLetras = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '');
      setFormData((prev) => ({ ...prev, [name]: soloLetras }));

      // Si cambia el apellido del representante, copialo a todos los alumnos automáticamente
      if (name === 'apellidoRep') {
        setAlumnos((prevAlumnos) =>
          prevAlumnos.map((alu) => ({ ...alu, apellidoAlu: soloLetras }))
        );
      }
    } 
    else if (name === 'nacionalidad' || name === 'cedulaNumero') {
      const soloNumeros = name === 'cedulaNumero' ? value.replace(/\D/g, '') : formData.cedulaNumero;
      const nuevaNac = name === 'nacionalidad' ? value : (formData.nacionalidad || 'V');
      const nuevoIdRep = soloNumeros ? `${nuevaNac}-${soloNumeros}` : '';

      setFormData((prev) => ({
        ...prev,
        nacionalidad: nuevaNac,
        cedulaNumero: soloNumeros,
        idRepresentante: nuevoIdRep
      }));
    } 
    else if (name === 'codigoTelefono' || name === 'telefonoNumero') {
      const soloNumeros = name === 'telefonoNumero' ? value.replace(/\D/g, '') : formData.telefonoNumero;
      const nuevoCod = name === 'codigoTelefono' ? value : (formData.codigoTelefono || '0412');
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

  // Manejador para cada alumno en la lista dinámicamente
  const handleAlumnoChange = (index, field, value) => {
    setAlumnos((prev) => {
      const nuevosAlumnos = [...prev];
      const alumnoActual = { ...nuevosAlumnos[index] };

      if (field === 'nombreAlu') {
        alumnoActual.nombreAlu = value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '');
      } 
      else if (field === 'tipoDocAlumno' || field === 'numDocAlumno') {
        const tipo = field === 'tipoDocAlumno' ? value : alumnoActual.tipoDocAlumno;
        const num = field === 'numDocAlumno' ? value.replace(/\D/g, '') : alumnoActual.numDocAlumno;
        const prefijo = tipo === 'CE' ? 'E' : tipo;

        alumnoActual.tipoDocAlumno = tipo;
        alumnoActual.numDocAlumno = num;
        alumnoActual.idAlumno = num ? `${prefijo}-${num}` : '';
      } 
      else {
        alumnoActual[field] = value;
      }

      nuevosAlumnos[index] = alumnoActual;
      return nuevosAlumnos;
    });
  };

  // Función para AGREGAR un alumno (Hermano)
  const agregarAlumno = () => {
    setAlumnos((prev) => [
      ...prev,
      {
        ...ALUMNO_TEMPLATE,
        // Copia automáticamente el apellido actual del representante
        apellidoAlu: formData.apellidoRep || ''
      }
    ]);
  };

  // Función para ELIMINAR un alumno de la lista
  const eliminarAlumno = (index) => {
    if (alumnos.length === 1) return; // Mínimo un alumno
    setAlumnos((prev) => prev.filter((_, i) => i !== index));
  };

  // Envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validación básica
    if (!formData.idRepresentante || !formData.nombreRep || !formData.apellidoRep) {
      await Swal.fire({
        icon: 'error',
        title: 'Datos del Representante Incompletos',
        text: 'Por favor, rellene la cédula, nombre y apellido del representante.',
        confirmButtonColor: '#dc2626',
      });
      setLoading(false);
      return;
    }

    // Validar que cada alumno tenga id y nombre
    for (let i = 0; i < alumnos.length; i++) {
      if (!alumnos[i].idAlumno || !alumnos[i].nombreAlu) {
        await Swal.fire({
          icon: 'error',
          title: `Datos incompletos en Alumno #${i + 1}`,
          text: 'Asegúrese de ingresar el Documento y Nombre para todos los alumnos.',
          confirmButtonColor: '#dc2626',
        });
        setLoading(false);
        return;
      }
    }

    const confirmacion = await Swal.fire({
      title: '¿Confirmar inscripción?',
      text: alumnos.length > 1
        ? `Se inscribirán ${alumnos.length} alumnos vinculados a ${formData.nombreRep} ${formData.apellidoRep}.`
        : `Se inscribirá a 1 alumno vinculado a ${formData.nombreRep} ${formData.apellidoRep}.`,
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
      alumnos
    };

    const res = await registrarInscripcionAction(payload);

    if (res.success) {
      await Swal.fire({
        icon: 'success',
        title: '🎉 Inscripción exitosa',
        text: res.message,
        confirmButtonColor: '#4f46e5',
        timer: 2500,
        timerProgressBar: true,
      });

      setFormData(INITIAL_REP_STATE);
      setAlumnos([{ ...ALUMNO_TEMPLATE }]);
      setRepEncontrado(false);
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
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Ficha de Inscripción Escolar</h1>
        <p className="text-xs text-slate-500 mt-1">
          Registrar nuevo ingreso (individual o hermanos) para el Año Escolar 2025-2026.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS DEL REPRESENTANTE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              👨‍👦 Datos del Representante Legal
            </h2>
            {repEncontrado && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium">
                ✓ Representante Registrado
              </span>
            )}
            {cargandoRep && (
              <span className="text-xs text-indigo-600 font-medium animate-pulse">
                Buscando cédula en la BD...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula de Identidad *</label>
              <div className="flex gap-2">
                <select
                  name="nacionalidad"
                  value={formData.nacionalidad || 'V'}
                  onChange={handleRepChange}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 shrink-0 cursor-pointer"
                >
                  <option value="V">V-</option>
                  <option value="E">E-</option>
                </select>
                <input
                  type="text"
                  name="cedulaNumero"
                  value={formData.cedulaNumero || ''}
                  onChange={handleRepChange}
                  onBlur={() => verificarRepresentanteExistente(formData.idRepresentante)}
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
                onChange={handleRepChange} 
                placeholder="CARLOS ALBERTO"
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
                placeholder="PÉREZ MENDOZA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono de Contacto</label>
              <div className="flex gap-2">
                <select
                  name="codigoTelefono"
                  value={formData.codigoTelefono || '0412'}
                  onChange={handleRepChange}
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
                placeholder="Municipio, Calle, Casa/Apto" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: ALUMNOS / ESTUDIANTES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              🎒 Estudiante(s) a Inscribir ({alumnos.length})
            </h2>

            {/* BOTÓN PARA AGREGAR OTRO ALUMNO */}
            <button
              type="button"
              onClick={agregarAlumno}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>+</span> Agregar otro alumno (Hermano)
            </button>
          </div>

          {alumnos.map((alu, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md">
                  Alumno #{index + 1} {index > 0 && "(Hermano)"}
                </span>

                {alumnos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarAlumno(index)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline cursor-pointer"
                  >
                    ✕ Quitar este alumno
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* ID / CÉDULA ESCOLAR */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ID / Cédula Escolar *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={alu.tipoDocAlumno || 'CE'}
                      onChange={(e) => handleAlumnoChange(index, 'tipoDocAlumno', e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2 py-2 focus:outline-none focus:border-indigo-500 shrink-0 cursor-pointer"
                    >
                      <option value="CE">E-</option>
                      <option value="V">V-</option>
                      <option value="E">E-</option>
                    </select>
                    <input
                      type="text"
                      value={alu.numDocAlumno || ''}
                      onChange={(e) => handleAlumnoChange(index, 'numDocAlumno', e.target.value)}
                      placeholder="12345678"
                      maxLength={11}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* NOMBRE DEL ALUMNO */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    value={alu.nombreAlu} 
                    onChange={(e) => handleAlumnoChange(index, 'nombreAlu', e.target.value)} 
                    placeholder="LUIS FERNANDO"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 uppercase"
                  />
                </div>

                {/* APELLIDO (COPIADO DEL REPRESENTANTE) */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Apellido <span className="text-[10px] text-indigo-500 font-normal">(Copiado del Rep.)</span>
                  </label>
                  <input 
                    type="text" 
                    value={alu.apellidoAlu} 
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 font-medium uppercase cursor-not-allowed"
                  />
                </div>

                {/* FECHA DE NACIMIENTO */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Nacimiento</label>
                  <input 
                    type="date" 
                    value={alu.fechaNacimiento} 
                    onChange={(e) => handleAlumnoChange(index, 'fechaNacimiento', e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                {/* ASIGNAR GRADO Y SECCIÓN */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Grado y Sección *</label>
                  <select 
                    value={alu.idGradoSeccion} 
                    onChange={(e) => handleAlumnoChange(index, 'idGradoSeccion', e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                  >
                    <option value="1">1er Grado - Sección A</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN SUBMIT */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Guardando en la base de datos...' : `Procesar Inscripción (${alumnos.length} Alumno${alumnos.length > 1 ? 's' : ''})`}
          </button>
        </div>
      </form>
    </div>
  );
}