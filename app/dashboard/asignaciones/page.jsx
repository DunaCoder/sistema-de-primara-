"use client";

import { useState, useEffect } from "react";
import {
  getDatosAsignacion,
  guardarAsignacionDocente,
} from "@/app/actions/coordinador";

const GRADOS_LISTA = [
  { id: "1", nombre: "1° Grado" },
  { id: "2", nombre: "2° Grado" },
  { id: "3", nombre: "3° Grado" },
  { id: "4", nombre: "4° Grado" },
  { id: "5", nombre: "5° Grado" },
  { id: "6", nombre: "6° Grado" },
];

const SECCIONES_LISTA = ["A", "B", "C", "D"];

export default function AsignacionesPage() {
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const [idDocente, setIdDocente] = useState("");
  const [idMateria, setIdMateria] = useState("");

  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const res = await getDatosAsignacion();
      if (res && res.success) {
        setDocentes(res.docentes || []);
        setMaterias(res.materias || []);
        setResumen(res.asignaciones || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });

    if (
      !idDocente ||
      !gradoSeleccionado ||
      !seccionSeleccionada ||
      !idMateria
    ) {
      setMensaje({
        tipo: "error",
        texto: "Todos los campos son obligatorios.",
      });
      return;
    }

    const res = await guardarAsignacionDocente({
      idDocente,
      grado: gradoSeleccionado,
      seccion: seccionSeleccionada,
      idMateria,
    });

    if (res.success) {
      setMensaje({
        tipo: "exito",
        texto: "Asignación registrada exitosamente.",
      });
      setIdDocente("");
      setGradoSeleccionado("");
      setSeccionSeleccionada("");
      setIdMateria("");
      cargarDatos();
    } else {
      setMensaje({
        tipo: "error",
        texto: res.error || "Error al guardar la asignación.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Módulo de Coordinación: Asignar Materias
        </h2>

        {mensaje.texto && (
          <div
            className={`p-3 mb-4 rounded text-sm font-medium ${mensaje.tipo === "exito" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
          >
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Docente
            </label>
            <select
              value={idDocente}
              onChange={(e) => setIdDocente(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="text-slate-900 bg-white">
                {cargando
                  ? "-- Cargando docentes de la BD... --"
                  : "-- Seleccione Docente --"}
              </option>
              {docentes.map((d) => (
                <option
                  key={d.idPersonal}
                  value={d.idPersonal}
                  className="text-slate-900 bg-white"
                >
                  {d.nombre} {d.apellido}{" "}
                  {d.cedula ? `(C.I. V-${d.cedula})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Grado
              </label>
              <select
                value={gradoSeleccionado}
                onChange={(e) => setGradoSeleccionado(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="text-slate-900 bg-white">
                  -- Grado --
                </option>
                {GRADOS_LISTA.map((g) => (
                  <option
                    key={g.id}
                    value={g.id}
                    className="text-slate-900 bg-white"
                  >
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Sección
              </label>
              <select
                value={seccionSeleccionada}
                onChange={(e) => setSeccionSeleccionada(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="text-slate-900 bg-white">
                  -- Sección --
                </option>
                {SECCIONES_LISTA.map((sec) => (
                  <option
                    key={sec}
                    value={sec}
                    className="text-slate-900 bg-white"
                  >
                    Sección "{sec}"
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Materia / Especialidad
            </label>
            <select
              value={idMateria}
              onChange={(e) => setIdMateria(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="text-slate-900 bg-white">
                -- Seleccione Materia --
              </option>
              {materias.map((m) => (
                <option
                  key={m.idMateria}
                  value={m.idMateria}
                  className="text-slate-900 bg-white"
                >
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Guardar Asignación
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Resumen de Asignaciones
          </h3>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Total: {resumen.length} asignaciones
          </span>
        </div>

        {resumen.length === 0 ? (
          <p className="text-slate-600 text-sm">
            No hay asignaciones registradas hasta el momento.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-800">
              <thead className="text-xs uppercase bg-slate-100 text-slate-800">
                <tr>
                  <th className="px-4 py-3">Docente</th>
                  <th className="px-4 py-3">Grado y Sección</th>
                  <th className="px-4 py-3">Materia</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((item) => (
                  <tr
                    key={item.idAsignacion}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.docente
                        ? `${item.docente.nombre} ${item.docente.apellido}`
                        : item.idDocente}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {item.gradoSeccion
                        ? `${item.gradoSeccion.grado} - Secc "${item.gradoSeccion.seccion}"`
                        : item.idGradoSeccion}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {item.materia ? item.materia.nombre : item.idMateria}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
