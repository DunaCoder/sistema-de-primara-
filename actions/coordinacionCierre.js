"use server";

import { prisma } from "@/lib/prisma";

/**
 * 1. Obtener estado de avance de carga de notas
 */
export async function obtenerEstatusCargaDocente(lapso = "1") {
  try {
    const numLapso = Number(lapso);

    const secciones = await prisma.gradoSeccion.findMany({
      include: {
        inscripciones: {
          select: {
            idInscripcion: true,
            evaluacionesCualitativas: {
              where: { lapso: numLapso },
              select: { idEvaluacion: true },
              take: 1,
            },
          },
        },
      },
      orderBy: [{ grado: "asc" }, { seccion: "asc" }],
    });

    const reporte = secciones.map((sec) => {
      const totalInscritos = sec.inscripciones.length;
      const estudiantesConNotas = sec.inscripciones.filter(
        (ins) => ins.evaluacionesCualitativas.length > 0,
      ).length;

      const porcentaje =
        totalInscritos > 0
          ? Math.round((estudiantesConNotas / totalInscritos) * 100)
          : 0;

      return {
        idGradoSeccion: sec.idGradoSeccion,
        nombre: `${sec.grado}° Grado - Sección "${sec.seccion}"`,
        totalInscritos,
        estudiantesConNotas,
        porcentaje,
        completo: porcentaje === 100,
      };
    });

    return { success: true, reporte };
  } catch (error) {
    console.error("ERROR_ESTATUS_CARGA:", error);
    return { success: false, reporte: [] };
  }
}

/**
 * 2. Obtener lote completo de boletines
 */
export async function obtenerBoletinesMasivosPorSeccion(
  idGradoSeccion,
  lapso = "1",
) {
  try {
    const numSeccion = Number(idGradoSeccion);
    const numLapso = Number(lapso);

    const inscripciones = await prisma.inscripcion.findMany({
      where: { idGradoSeccion: numSeccion },
      include: {
        estudiante: true,
        gradoSeccion: true,
        evaluacionesCualitativas: {
          where: { lapso: numLapso },
          include: { materia: true },
        },
      },
      orderBy: { estudiante: { apellido: "asc" } },
    });

    const boletines = inscripciones.map((ins) => {
      const est = ins.estudiante;
      const sec = ins.gradoSeccion;

      return {
        idInscripcion: ins.idInscripcion,
        estudiante: `${est.apellido}, ${est.nombre}`,
        cedula: est.cedulaEscolar || est.idEstudiante || "S/C",
        grado: `${sec.grado}° Grado - "${sec.seccion}"`,
        evaluaciones: ins.evaluacionesCualitativas.map((e) => ({
          materia: e.materia.nombre,
          nota: e.literalCalificacion || "N/A",
          observacion:
            e.apreciacionDescriptiva || "Sin observación registrada.",
        })),
      };
    });

    return { success: true, boletines };
  } catch (error) {
    console.error("ERROR_BOLETINES_MASIVOS:", error);
    return { success: false, boletines: [], mensaje: error.message };
  }
}
