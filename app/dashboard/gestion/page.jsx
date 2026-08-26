"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserCheck,
  FileSpreadsheet,
} from "lucide-react";
import {
  obtenerAsignacionesDocente,
  obtenerEstudiantesYNotas,
  guardarCalificacionesSeccion,
} from "@/actions/gestionNotas";

export default function GestionDocentePage() {
  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [anoEscolar, setAnoEscolar] = useState("");

  const [gradoSeccion, setGradoSeccion] = useState("");
  const [materia, setMateria] = useState("");
  const [lapso, setLapso] = useState("1");

  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    async function cargarInicial() {
      const res = await obtenerAsignacionesDocente();
      if (res.success) {
        setSecciones(res.secciones);
        setMaterias(res.materias);
        setAnoEscolar(res.anoEscolar);

        if (res.secciones.length > 0) setGradoSeccion(res.secciones[0].id);
        if (res.materias.length > 0) setMateria(res.materias[0].id);
      }
    }
    cargarInicial();
  }, []);

  useEffect(() => {
    async function cargarNomina() {
      if (!gradoSeccion || !materia) return;

      setCargando(true);
      setMensaje({ tipo: "", texto: "" });

      const res = await obtenerEstudiantesYNotas(gradoSeccion, materia, lapso);
      if (res.success) {
        setEstudiantes(res.data);
      } else {
        setMensaje({
          tipo: "error",
          texto: res.mensaje || "Error al cargar los estudiantes.",
        });
      }
      setCargando(false);
    }

    cargarNomina();
  }, [gradoSeccion, materia, lapso]);

  const handleNotaChange = (idInscripcion, campo, valor) => {
    setEstudiantes((prev) =>
      prev.map((est) =>
        est.idInscripcion === idInscripcion ? { ...est, [campo]: valor } : est,
      ),
    );
  };

  const handleGuardar = async () => {
    if (!materia) {
      setMensaje({
        tipo: "error",
        texto: "Seleccione una materia específica para cargar notas.",
      });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: "", texto: "" });

    const datosGuardar = {
      idGradoSeccion: gradoSeccion,
      materiaId: materia,
      lapso,
      calificaciones: estudiantes.map((e) => ({
        idInscripcion: e.idInscripcion,
        literal: e.literal,
        apreciacion: e.apreciacion,
      })),
    };

    const res = await guardarCalificacionesSeccion(datosGuardar);

    if (res.success) {
      setMensaje({
        tipo: "exito",
        texto: "¡Calificaciones guardadas exitosamente!",
      });
    } else {
      setMensaje({
        tipo: "error",
        texto: res.error || "Error al guardar las calificaciones.",
      });
    }

    setGuardando(false);
  };

  const notasCargadasCount = estudiantes.filter((a) =>
    Boolean(a.literal),
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Gestión de Calificaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Carga y consulta de notas cualitativas para el período escolar
            activo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium text-xs border border-slate-200">
            Avance:{" "}
            <strong className="text-indigo-600">
              {notasCargadasCount} / {estudiantes.length}
            </strong>{" "}
            Evaluados
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm border border-blue-100">
            <Calendar className="h-4 w-4" />
            <span>
              Año Escolar: <strong>{anoEscolar || "Cargando..."}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {mensaje.texto && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {mensaje.tipo === "exito" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium text-sm">{mensaje.texto}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Grado y Sección
          </label>
          <select
            value={gradoSeccion}
            onChange={(e) => setGradoSeccion(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {secciones.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Asignatura / Materia
          </label>
          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {materias.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Lapso / Momento
          </label>
          <select
            value={lapso}
            onChange={(e) => setLapso(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            <option value="1">1er Lapso</option>
            <option value="2">2do Lapso</option>
            <option value="3">3er Lapso</option>
          </select>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-slate-700">
              Nómina de Estudiantes ({estudiantes.length})
            </h2>
          </div>
          <button
            onClick={handleGuardar}
            disabled={guardando || cargando || estudiantes.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {guardando ? "Guardando..." : "Guardar Calificaciones"}
          </button>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-sm">Cargando lista de estudiantes...</p>
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-600">
              No hay estudiantes inscritos en esta sección.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Verifica la inscripción realizada en el módulo de Control
              Estudiantil.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold w-16 text-center">
                    N°
                  </th>
                  <th className="py-3 px-4 font-semibold w-32">Cédula</th>
                  <th className="py-3 px-4 font-semibold">
                    Nombres y Apellidos
                  </th>
                  <th className="py-3 px-4 font-semibold w-40 text-center">
                    Literal
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    Apreciación / Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {estudiantes.map((est, index) => (
                  <tr
                    key={est.idInscripcion || index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-medium text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {est.cedula}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {est.nombre}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={est.literal || ""}
                        onChange={(e) =>
                          handleNotaChange(
                            est.idInscripcion,
                            "literal",
                            e.target.value,
                          )
                        }
                        className="bg-white border border-slate-300 font-bold text-center text-blue-700 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">--</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Observación sobre el rendimiento..."
                        value={est.apreciacion || ""}
                        onChange={(e) =>
                          handleNotaChange(
                            est.idInscripcion,
                            "apreciacion",
                            e.target.value,
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
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
