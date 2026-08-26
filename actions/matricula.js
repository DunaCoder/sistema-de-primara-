"use server";

import { prisma } from "@/lib/prisma";

export async function obtenerMatriculaGeneral() {
  try {
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        estudiante: {
          include: {
            representante: true,
          },
        },
        gradoSeccion: true,
      },
      orderBy: {
        idInscripcion: "desc",
      },
    });

    const data = inscripciones.map((ins) => {
      const est = ins.estudiante;
      const rep = est?.representante;
      const gs = ins.gradoSeccion;

      // 1. Obtener Cédula
      let cedulaMostrada = "S/C";

      if (est?.idEstudiante) {
        cedulaMostrada = est.idEstudiante;
      } else if (est?.cedulaEscolar) {
        cedulaMostrada = est.cedulaEscolar;
      }

      // 2. Formato de Nombres (Apellido, Nombre)
      const nombreEstudiante =
        [est?.apellido, est?.nombre].filter(Boolean).join(", ") || "Sin Nombre";
      const nombreRepresentante = rep
        ? [rep.apellido, rep.nombre].filter(Boolean).join(", ") || "Sin Nombre"
        : "Sin Representante";

      return {
        id: ins.idInscripcion,
        cedula: cedulaMostrada,
        estudiante: nombreEstudiante,
        gradoSeccion: gs ? `${gs.grado} - "${gs.seccion}"` : "Sin Asignar",
        representante: nombreRepresentante,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("ERROR_OBTENER_MATRICULA:", error);
    const mensajeError =
      error instanceof Error ? error.message : "Error al obtener la matrícula";
    return { success: false, data: [], mensaje: mensajeError };
  }
}
