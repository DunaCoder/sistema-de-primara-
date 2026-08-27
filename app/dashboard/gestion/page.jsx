"use client";

import React, { useState, useEffect } from "react";
import { 
  obtenerEstudiantesYNotas,
  obtenerSeccionesDisponibles,
  guardarCalificacionesSeccion
} from "@/actions/gestionNotas";

export default function GestionCalificacionesPage() {
  const [secciones, setSecciones] = useState([]);
  const [gradoSeccion, setGradoSeccion] = useState("");
  const [lapso, setLapso] = useState("1");
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState({ tipo: "", texto: "" });

  // 1. Cargar las secciones al montar el componente
  useEffect(() => {
    let isMounted = true;
    async function cargarSecciones() {
      try {
        const res = await obtenerSeccionesDisponibles();
        if (!isMounted) return;
        
        const listaSecciones = res && res.success && Array.isArray(res.secciones) ? res.secciones : [];
        setSecciones(listaSecciones);
        
        if (listaSecciones.length > 0) {
          setGradoSeccion(String(listaSecciones[0].idGradoSeccion));
        }
      } catch (error) {
        console.error("Error al cargar secciones:", error);
      }
    }
    cargarSecciones();
    return () => { isMounted = false; };
  }, []);

  // 2. Cargar estudiantes y sus notas cuando cambia la sección o el lapso
  useEffect(() => {
    if (!gradoSeccion) return;

    let isMounted = true;
    async function cargarEstudiantesDatos() {
      setLoading(true);
      try {
        const respuesta = await obtenerEstudiantesYNotas(gradoSeccion, null, lapso);

        if (!isMounted) return;

        const listaEstudiantes = respuesta && respuesta.success && Array.isArray(respuesta.estudiantes) 
          ? respuesta.estudiantes 
          : [];

        setEstudiantes(listaEstudiantes);
        if (listaEstudiantes.length > 0) {
          setEstudianteSeleccionado(listaEstudiantes[0]);
        } else {
          setEstudianteSeleccionado(null);
        }
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        if (isMounted) {
          setEstudiantes([]);
          setEstudianteSeleccionado(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    cargarEstudiantesDatos();
    return () => { isMounted = false; };
  }, [gradoSeccion, lapso]);

  // Manejar cambios locales en las notas del estudiante seleccionado
  const handleNotaChange = (idMateria, campo, valor) => {
    if (!estudianteSeleccionado) return;

    const nuevasEvaluaciones = estudianteSeleccionado.evaluaciones.map((ev) => {
      if (ev.idMateria === idMateria) {
        return { ...ev, [campo]: valor };
      }
      return ev;
    });

    const estudianteActualizado = {
      ...estudianteSeleccionado,
      evaluaciones: nuevasEvaluaciones,
    };

    setEstudianteSeleccionado(estudianteActualizado);

    // Actualizar también en el arreglo general
    setEstudiantes(estudiantes.map(est => 
      est.idInscripcion === estudianteActualizado.idInscripcion ? estudianteActualizado : est
    ));
  };

  // Guardar calificaciones del estudiante seleccionado
  const handleGuardarCalificaciones = async () => {
    if (!estudianteSeleccionado) return;

    setGuardando(true);
    setMensajeEstado({ tipo: "", texto: "" });

    try {
      for (const ev of estudianteSeleccionado.evaluaciones) {
        await guardarCalificacionesSeccion({
          idInscripcion: estudianteSeleccionado.idInscripcion,
          idMateria: ev.idMateria,
          lapso: Number(lapso),
          literalCalificacion: ev.literalCalificacion === "S/N" ? "" : ev.literalCalificacion,
          apreciacionDescriptiva: ev.apreciacionDescriptiva,
        });
      }

      setMensajeEstado({ tipo: "success", texto: "¡Calificaciones guardadas exitosamente!" });
      setTimeout(() => setMensajeEstado({ tipo: "", texto: "" }), 4000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensajeEstado({ tipo: "error", texto: "Ocurrió un error al guardar las calificaciones." });
    } finally {
      setGuardando(false);
    }
  };

  const seccionActual = secciones.find(s => String(s.idGradoSeccion) === String(gradoSeccion));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabecera y Filtros */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Carga y Gestión de Calificaciones
            </h1>
            <p className="text-sm text-gray-500">
              Seleccione la sección, el lapso y el estudiante para registrar sus notas y literales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              disabled={!estudianteSeleccionado}
              className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition cursor-pointer text-sm"
            >
              🖨️ Imprimir Boletín
            </button>
            <button
              onClick={handleGuardarCalificaciones}
              disabled={guardando || !estudianteSeleccionado}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer shadow-sm text-sm"
            >
              {guardando ? "Guardando..." : "💾 Guardar Calificaciones"}
            </button>
          </div>
        </div>

        {mensajeEstado.texto && (
          <div className={`mt-4 p-3 rounded-md text-sm font-medium ${
            mensajeEstado.tipo === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {mensajeEstado.texto}
          </div>
        )}

        <hr className="my-4 border-gray-200" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grado / Sección
            </label>
            <select
              value={gradoSeccion}
              onChange={(e) => setGradoSeccion(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 bg-white"
            >
              {secciones.length === 0 ? (
                <option value="">Cargando secciones...</option>
              ) : (
                secciones.map((sec) => (
                  <option key={sec.idGradoSeccion} value={sec.idGradoSeccion}>
                    {sec.grado} - Sección "{sec.seccion}"
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lapso Académico
            </label>
            <select
              value={lapso}
              onChange={(e) => setLapso(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 bg-white"
            >
              <option value="1">1er Lapso</option>
              <option value="2">2do Lapso</option>
              <option value="3">3er Lapso</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante
            </label>
            <select
              value={estudianteSeleccionado?.idInscripcion || ""}
              onChange={(e) => {
                const est = estudiantes.find(
                  (i) => i.idInscripcion === Number(e.target.value),
                );
                setEstudianteSeleccionado(est || null);
              }}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 bg-white"
              disabled={loading || estudiantes.length === 0}
            >
              {estudiantes.length === 0 ? (
                <option value="">No hay estudiantes disponibles</option>
              ) : (
                estudiantes.map((e) => (
                  <option key={e.idInscripcion} value={e.idInscripcion}>
                    {e.nombreCompleto}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Zona de Carga Interactiva de Notas */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-lg shadow text-gray-500">
          Cargando datos del estudiante...
        </div>
      ) : estudianteSeleccionado ? (
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300">
          <div className="text-center border-b pb-4 mb-6">
            <h2 className="text-base font-semibold uppercase text-gray-700">
              República Bolivariana de Venezuela
            </h2>
            <h3 className="text-xl font-bold uppercase tracking-wide text-gray-900">
              U.E.N.B. Bicentenario Republicano
            </h3>
            <p className="text-xs text-gray-500">
              Planilla de Carga de Notas y Apreciación Cualitativa — Año Escolar 2025-2026
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md mb-6 border border-gray-200 text-sm">
            <div>
              <span className="block text-xs font-semibold text-gray-500">ESTUDIANTE</span>
              <span className="font-bold text-gray-800">
                {estudianteSeleccionado.nombreCompleto}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500">CÉDULA ESCOLAR</span>
              <span className="font-medium text-gray-800">{estudianteSeleccionado.cedula}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500">GRADO Y SECCIÓN</span>
              <span className="font-medium text-gray-800">
                {seccionActual ? `${seccionActual.grado} - "${seccionActual.seccion}"` : "N/D"}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500">LAPSO EVALUADO</span>
              <span className="font-medium text-gray-800">Lapso {lapso}</span>
            </div>
          </div>

          {/* Tabla Editable */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-300 mb-6 text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <th className="border border-gray-300 p-3 w-1/4">Área de Aprendizaje</th>
                  <th className="border border-gray-300 p-3 w-28 text-center">Literal (A-E)</th>
                  <th className="border border-gray-300 p-3">Apreciación Descriptiva y Sugerencias</th>
                </tr>
              </thead>
              <tbody>
                {estudianteSeleccionado.evaluaciones && estudianteSeleccionado.evaluaciones.length > 0 ? (
                  estudianteSeleccionado.evaluaciones.map((ev) => (
                    <tr key={ev.idMateria} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 font-semibold text-gray-800">
                        {ev.materia}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <select
                          value={ev.literalCalificacion === "S/N" ? "" : ev.literalCalificacion}
                          onChange={(e) => handleNotaChange(ev.idMateria, "literalCalificacion", e.target.value)}
                          className="w-full border border-gray-300 rounded p-2 text-center font-bold text-base bg-white text-blue-900 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 p-3">
                        <textarea
                          rows="2"
                          value={ev.apreciacionDescriptiva === "Sin informe cualitativo registrado para este lapso." ? "" : ev.apreciacionDescriptiva}
                          onChange={(e) => handleNotaChange(ev.idMateria, "apreciacionDescriptiva", e.target.value)}
                          placeholder="Escriba la apreciación descriptiva o sugerencia pedagógica..."
                          className="w-full border border-gray-300 rounded p-2 text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="border border-gray-300 p-6 text-center text-gray-500">
                      No hay materias registradas para este grado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleGuardarCalificaciones}
              disabled={guardando}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer shadow"
            >
              {guardando ? "Guardando calificaciones..." : "💾 Guardar Calificaciones"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-lg shadow text-gray-500">
          No hay estudiantes inscritos en esta sección.
        </div>
      )}
    </div>
  );
}