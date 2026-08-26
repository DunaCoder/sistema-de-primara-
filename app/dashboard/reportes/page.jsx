"use client";

import React, { useState, useEffect } from "react";
import { obtenerEstudiantesYNotas as obtenerEstudiantesPorSeccion } from "@/actions/gestionNotas";

export default function ReportesPage() {
  const [gradoSeccion, setGradoSeccion] = useState("1");
  const [lapso, setLapso] = useState("1");
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar estudiantes de la sección elegida de manera segura
  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      try {
        const respuesta = await obtenerEstudiantesPorSeccion(
          gradoSeccion,
          null,
          lapso,
        );

        // Garantizar que respuesta sea un arreglo antes de actualizar el estado
        const listaEstudiantes = Array.isArray(respuesta) ? respuesta : [];

        setEstudiantes(listaEstudiantes);
        setEstudianteSeleccionado(
          listaEstudiantes.length > 0 ? listaEstudiantes[0] : null,
        );
      } catch (error) {
        console.error("❌ Error al cargar estudiantes:", error);
        setEstudiantes([]);
        setEstudianteSeleccionado(null);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [gradoSeccion, lapso]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado y filtros (Ocultos al imprimir) */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Boletines Informativos
            </h1>
            <p className="text-sm text-gray-500">
              Seleccione la sección y el estudiante para emitir el boletín
              escolar.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            disabled={!estudianteSeleccionado}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
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
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1er Grado "A"</option>
              <option value="2">2do Grado "A"</option>
              <option value="3">3er Grado "A"</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lapso Académico
            </label>
            <select
              value={lapso}
              onChange={(e) => setLapso(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-blue-500"
              disabled={loading || estudiantes.length === 0}
            >
              {estudiantes.map((e) => (
                <option key={e.idInscripcion} value={e.idInscripcion}>
                  {e.apellido}, {e.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vista Previa del Boletín (Formato de Impresión Físico) */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-lg shadow text-gray-500">
          Cargando datos del estudiante...
        </div>
      ) : estudianteSeleccionado ? (
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 print:shadow-none print:border-none print:p-0">
          {/* Encabezado Institucional */}
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

          {/* Datos del Alumno */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md mb-6 border border-gray-200 text-sm">
            <div>
              <span className="block text-xs font-semibold text-gray-500">
                ESTUDIANTE
              </span>
              <span className="font-bold text-gray-800">
                {estudianteSeleccionado.apellido},{" "}
                {estudianteSeleccionado.nombre}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500">
                CÉDULA ESCOLAR
              </span>
              <span className="font-medium text-gray-800">
                {estudianteSeleccionado.idEstudiante}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500">
                GRADO Y SECCIÓN
              </span>
              <span className="font-medium text-gray-800">
                Grado {gradoSeccion}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500">
                LAPSO EVALUADO
              </span>
              <span className="font-medium text-gray-800">Lapso {lapso}</span>
            </div>
          </div>

          {/* Tabla Descriptiva del Boletín */}
          <table className="w-full text-left border-collapse border border-gray-300 mb-8 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="border border-gray-300 p-3 w-1/4">
                  Área de Aprendizaje
                </th>
                <th className="border border-gray-300 p-3 w-1/6 text-center">
                  Literal
                </th>
                <th className="border border-gray-300 p-3">
                  Apreciación Descriptiva y Sugerencias
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-3 font-semibold text-gray-800">
                  Evaluación Integral / Áreas Integradas
                </td>
                <td className="border border-gray-300 p-3 text-center font-bold text-lg text-blue-900">
                  {estudianteSeleccionado.literal || "S/N"}
                </td>
                <td className="border border-gray-300 p-3 text-gray-700 leading-relaxed">
                  {estudianteSeleccionado.apreciacion ||
                    "Sin informe cualitativo registrado para este lapso."}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Firmas Institucionales */}
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
          No hay estudiantes inscritos en este grado o no se encontraron datos.
        </div>
      )}
    </div>
  );
}
