"use client";

import React, { useState, useEffect } from "react";
import { 
  obtenerEstudiantesYNotas as obtenerEstudiantesPorSeccion,
  obtenerSeccionesDisponibles 
} from "@/actions/gestionNotas";

export default function ReportesPage() {
  const [secciones, setSecciones] = useState([]);
  const [gradoSeccion, setGradoSeccion] = useState("");
  const [lapso, setLapso] = useState("1");
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Cargar las secciones reales al montar el componente
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

  // 2. Cargar estudiantes cuando cambia la sección o el lapso
  useEffect(() => {
    if (!gradoSeccion) return;

    let isMounted = true;
    async function cargarEstudiantes() {
      setLoading(true);
      try {
        const respuesta = await obtenerEstudiantesPorSeccion(
          gradoSeccion,
          null,
          lapso,
        );

        if (!isMounted) return;

        const listaEstudiantes = respuesta && respuesta.success && Array.isArray(respuesta.estudiantes) 
          ? respuesta.estudiantes 
          : [];

        setEstudiantes(listaEstudiantes);
        setEstudianteSeleccionado(
          listaEstudiantes.length > 0 ? listaEstudiantes[0] : null,
        );
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
    cargarEstudiantes();
    return () => { isMounted = false; };
  }, [gradoSeccion, lapso]);

  // Encontrar la sección actual seleccionada de forma segura
  const seccionActual = secciones.find(s => String(s.idGradoSeccion) === String(gradoSeccion));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Controles de filtro (Ocultos al imprimir) */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Boletines Informativos
            </h1>
            <p className="text-sm text-gray-500">
              Seleccione la sección y el estudiante para emitir el boletín escolar.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            disabled={!estudianteSeleccionado}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
          >
            🖨️ Imprimir Boletín
          </button>
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grado / Sección
            </label>
            <select
              value={gradoSeccion}
              onChange={(e) => setGradoSeccion(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
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
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
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
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800"
              disabled={loading || estudiantes.length === 0}
            >
              {estudiantes.length === 0 ? (
                <option value="">No hay estudiantes disponibles</option>
              ) : (
                estudiantes.map((e) => (
                  <option key={e.idInscripcion} value={e.idInscripcion}>
                    {/* CORREGIDO: Se usa nombreCompleto directamente para evitar duplicaciones */}
                    {e.nombreCompleto}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Vista Previa del Boletín */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-lg shadow text-gray-500">
          Cargando datos del estudiante...
        </div>
      ) : estudianteSeleccionado ? (
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 print:shadow-none print:border-none print:p-0">
          <div className="text-center border-b pb-4 mb-6">
            <h2 className="text-base font-semibold uppercase text-gray-700">
              República Bolivariana de Venezuela
            </h2>
            <h3 className="text-xl font-bold uppercase tracking-wide text-gray-900">
              U.E.N.B. Bicentenario Republicano
            </h3>
            <p className="text-xs text-gray-500">
              Informe Cualitativo de Rendimiento Escolar — Año Escolar 2025-2026
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md mb-6 border border-gray-200 text-sm">
            <div>
              <span className="block text-xs font-semibold text-gray-500">ESTUDIANTE</span>
              <span className="font-bold text-gray-800">
                {/* CORREGIDO: Se usa nombreCompleto para mostrarse limpio */}
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

          {/* Tabla Dinámica con todas las Materias */}
          <table className="w-full text-left border-collapse border border-gray-300 mb-8 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="border border-gray-300 p-3 w-1/4">Área de Aprendizaje</th>
                <th className="border border-gray-300 p-3 w-1/6 text-center">Literal</th>
                <th className="border border-gray-300 p-3">Apreciación Descriptiva y Sugerencias</th>
              </tr>
            </thead>
            <tbody>
              {estudianteSeleccionado.evaluaciones && estudianteSeleccionado.evaluaciones.length > 0 ? (
                estudianteSeleccionado.evaluaciones.map((ev, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3 font-semibold text-gray-800">
                      {ev.materia}
                    </td>
                    <td className="border border-gray-300 p-3 text-center font-bold text-lg text-blue-900">
                      {ev.literalCalificacion}
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700 leading-relaxed">
                      {ev.apreciacionDescriptiva}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="border border-gray-300 p-3 text-center text-gray-500">
                    No hay materias registradas para este grado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs font-semibold text-gray-700">
            <div>
              <div className="border-t border-gray-400 pt-2 w-3/4 mx-auto">
                Docente de Aula
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-2 w-3/4 mx-auto">
                Director(a) / Sello del Plantel
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-lg shadow text-gray-500">
          No hay estudiantes inscritos en esta sección o no se encontraron datos.
        </div>
      )}
    </div>
  );
}