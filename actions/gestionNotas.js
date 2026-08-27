"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function obtenerSeccionesDisponibles() {
  try {
    const secciones = await prisma.gradoSeccion.findMany({
      orderBy: [{ grado: "asc" }, { seccion: "asc" }],
    });
    return { 
      success: true, 
      secciones: secciones.map(s => ({
        idGradoSeccion: s.idGradoSeccion,
        grado: s.grado,
        seccion: s.seccion,
        anioEscolar: s.anioEscolar || "2025-2026"
      })) 
    };
  } catch (error) {
    console.error("ERROR_OBTENER_SECCIONES:", error);
    return { success: false, secciones: [] };
  }
}

export async function obtenerMateriasPorGrado(grado) {
  try {
    let materias = await prisma.materia.findMany({
      where: { grado: grado },
      orderBy: { nombre: "asc" },
    });

    if (!materias || materias.length === 0) {
      materias = await prisma.materia.findMany({ orderBy: { nombre: "asc" } });
    }

    return { success: true, materias };
  } catch (error) {
    console.error("ERROR_OBTENER_MATERIAS:", error);
    return { success: false, materias: [] };
  }
}

export async function guardarCalificacionesSeccion(data) {
  try {
    const { idInscripcion, idMateria, lapso, literalCalificacion, apreciacionDescriptiva } = data;

    if (!idInscripcion || !idMateria || !lapso) {
      return { success: false, error: "Faltan datos obligatorios." };
    }

    const evaluacionExistente = await prisma.evaluacion.findFirst({
      where: {
        idInscripcion: Number(idInscripcion),
        idMateria: Number(idMateria),
        lapso: Number(lapso),
      },
    });

    if (evaluacionExistente) {
      await prisma.evaluacion.update({
        where: { idEvaluacion: evaluacionExistente.idEvaluacion },
        data: {
          literalCalificacion: literalCalificacion || "",
          apreciacionDescriptiva: apreciacionDescriptiva || "",
        },
      });
    } else {
      await prisma.evaluacion.create({
        data: {
          idInscripcion: Number(idInscripcion),
          idMateria: Number(idMateria),
          lapso: Number(lapso),
          literalCalificacion: literalCalificacion || "",
          apreciacionDescriptiva: apreciacionDescriptiva || "",
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("ERROR_GUARDAR_CALIFICACIONES:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Consulta directa general para boletines (replica el éxito de la matrícula)
 */
export async function obtenerDatosBoletin(idGradoSeccion, idEstudiante = null, lapso = "1") {
  try {
    const numLapso = Number(lapso) || 1;

    const materiasGrado = await prisma.materia.findMany({ orderBy: { nombre: "asc" } });

    // Traemos todas las inscripciones directamente tal cual como en matrícula
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        estudiante: true,
        gradoSeccion: true,
        evaluaciones: {
          where: { lapso: numLapso },
          include: { materia: true },
        },
      },
      orderBy: { estudiante: { apellido: "asc" } },
    });

    const boletines = inscripciones.map((ins) => {
      const est = ins.estudiante;
      if (!est) return null;

      const gSec = ins.gradoSeccion;

      const evaluacionesCompletas = materiasGrado.map((mat) => {
        const evalEncontrada = ins.evaluaciones.find((e) => e.idMateria === mat.idMateria);
        return {
          idMateria: mat.idMateria,
          materia: mat.nombre,
          literalCalificacion: evalEncontrada?.literalCalificacion || "-",
          apreciacionDescriptiva: evalEncontrada?.apreciacionDescriptiva || "Sin informe cualitativo registrado.",
        };
      });

      return {
        idInscripcion: ins.idInscripcion,
        nombreCompleto: `${est.apellido || ""}, ${est.nombre || ""}`,
        cedula: est.cedulaEscolar || est.cedula || "S/C",
        grado: gSec?.grado || "1er Grado",
        seccion: gSec?.seccion || "A",
        lapso: numLapso,
        evaluaciones: evaluacionesCompletas,
      };
    }).filter(Boolean);

    return { success: true, boletines };
  } catch (error) {
    console.error("ERROR_OBTENER_DATOS_BOLETIN:", error);
    return { success: false, boletines: [] };
  }
}

/**
 * Consulta directa general para notas (replica el éxito de la matrícula)
 */
export async function obtenerEstudiantesYNotas(idGradoSeccion, idMateria = null, lapso = "1") {
  try {
    const numLapso = Number(lapso) || 1;

    const materiasGrado = await prisma.materia.findMany({ orderBy: { nombre: "asc" } });

    // Traemos las inscripciones directamente sin filtros de ID restrictivos
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        estudiante: true,
        gradoSeccion: true,
        evaluaciones: {
          where: { lapso: numLapso },
          include: { materia: true },
        },
      },
      orderBy: { estudiante: { apellido: "asc" } },
    });

    const estudiantesMapeados = inscripciones.map((ins) => {
      const est = ins.estudiante;
      if (!est) return null;

      const evaluacionesCompletas = materiasGrado.map((mat) => {
        const evalEncontrada = ins.evaluaciones.find((e) => e.idMateria === mat.idMateria);
        return {
          idMateria: mat.idMateria,
          materia: mat.nombre,
          literalCalificacion: evalEncontrada?.literalCalificacion || "",
          apreciacionDescriptiva: evalEncontrada?.apreciacionDescriptiva || "",
        };
      });

      return {
        idInscripcion: ins.idInscripcion,
        idEstudiante: est.idEstudiante,
        idGradoSeccion: ins.idGradoSeccion,
        nombre: est.nombre,
        apellido: est.apellido,
        nombreCompleto: `${est.apellido || ""}, ${est.nombre || ""}`,
        cedula: est.cedulaEscolar || est.cedula || est.idEstudiante || "S/C",
        evaluaciones: evaluacionesCompletas,
      };
    }).filter(Boolean);

    return { success: true, estudiantes: estudiantesMapeados };
  } catch (error) {
    console.error("ERROR_OBTENER_ESTUDIANTES_Y_NOTAS:", error);
    return { success: false, estudiantes: [] };
  }
}