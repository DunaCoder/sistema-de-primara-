"use server";

import { prisma } from "@/lib/prisma";

/**
 * 1. Obtener estado de avance de carga de notas (Corregido para validar por materias reales)
 */
export async function obtenerEstatusCargaDocente(lapso = "1") {
  try {
    const numLapso = Number(lapso);

    // 1. Traemos las secciones junto con sus inscripciones, las evaluaciones del lapso y las materias del grado
    const secciones = await prisma.gradoSeccion.findMany({
      include: {
        inscripciones: {
          include: {
            evaluaciones: {
              where: { lapso: numLapso },
              select: { idMateria: true }, // Solo necesitamos saber qué materias ya tienen nota
            },
          },
        },
      },
      orderBy: [{ grado: "asc" }, { seccion: "asc" }],
    });

    // 2. Traemos todas las materias para saber cuántas corresponden a cada grado exacto
    const todasLasMaterias = await prisma.materia.findMany();

    const reporte = secciones.map((sec) => {
      const totalInscritos = sec.inscripciones.length;
      
      // Filtramos cuántas materias pertenecen específicamente al grado de esta sección
      const materiasDelGradoCount = todasLasMaterias.filter(
        (m) => m.grado === sec.grado
      ).length;

      // Un estudiante se considera "con notas completas" si el número de evaluaciones 
      // en ese lapso coincide con el total de materias que debe cursar su grado.
      // (Si en tu colegio un docente integral sube una sola nota global, ajusta esta validación a > 0)
      const estudiantesConNotas = sec.inscripciones.filter((ins) => {
        if (materiasDelGradoCount === 0) {
          // Fallback por si las materias no están asociadas por número de grado estricto
          return ins.evaluaciones.length > 0;
        }
        // Valida que tenga notas en todas las materias del grado
        return ins.evaluaciones.length >= materiasDelGradoCount;
      }).length;

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
        evaluaciones: {
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
        evaluaciones: ins.evaluaciones.map((e) => ({
          materia: e.materia?.nombre || "Materia General",
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