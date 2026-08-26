"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function obtenerEstudiantesPorSeccion(
  idGradoSeccion,
  idMateria,
  lapso = 1,
) {
  try {
    const idGS = Number(idGradoSeccion);
    const idMat = Number(idMateria);
    const lap = Number(lapso);

    if (isNaN(idGS)) return [];

    const inscritos = await prisma.inscripcion.findMany({
      where: {
        idGradoSeccion: idGS,
        anioEscolar: "2025-2026",
      },
      include: {
        estudiante: true,
        evaluaciones: {
          where: idMat ? { idMateria: idMat, lapso: lap } : { lapso: lap },
        },
      },
      orderBy: {
        estudiante: { apellido: "asc" },
      },
    });

    return inscritos.map((i) => {
      const evalActual = i.evaluaciones[0];
      return {
        idInscripcion: i.idInscripcion,
        idEstudiante: i.estudiante.idEstudiante,
        nombre: i.estudiante.nombre,
        apellido: i.estudiante.apellido,
        literal: evalActual?.literalCalificacion || "",
        apreciacion: evalActual?.apreciacionDescriptiva || "",
      };
    });
  } catch (error) {
    console.error("❌ Error al obtener estudiantes por sección:", error);
    return [];
  }
}

export async function guardarCalificacionesAction({
  idGradoSeccion,
  idMateria,
  lapso = 1,
  evaluaciones,
}) {
  try {
    if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
      return { success: false, error: "No hay evaluaciones para guardar." };
    }

    const idMateriaNum = Number(idMateria);
    const lapsoNum = Number(lapso);

    if (isNaN(idMateriaNum) || !idMateriaNum) {
      return { success: false, error: "El campo idMateria es obligatorio." };
    }

    await prisma.$transaction(
      evaluaciones.map((evalData) => {
        const idInscripcionNum = Number(evalData.idInscripcion);
        const literalCalificacion = evalData.literal
          ? String(evalData.literal).trim()
          : "";
        const apreciacionDescriptiva = evalData.apreciacion
          ? String(evalData.apreciacion).trim()
          : "";

        return prisma.evaluacionCualitativa.upsert({
          where: {
            idInscripcion_lapso_idMateria: {
              idInscripcion: idInscripcionNum,
              lapso: lapsoNum,
              idMateria: idMateriaNum,
            },
          },
          update: { literalCalificacion, apreciacionDescriptiva },
          create: {
            idInscripcion: idInscripcionNum,
            idMateria: idMateriaNum,
            lapso: lapsoNum,
            literalCalificacion,
            apreciacionDescriptiva,
          },
        });
      }),
    );

    revalidatePath("/dashboard/gestion");
    revalidatePath("/dashboard/notas");
    revalidatePath("/dashboard/reportes");

    return { success: true, message: "Notas guardadas con éxito." };
  } catch (error) {
    console.error("❌ Error al guardar calificaciones:", error);
    return { success: false, error: "Error en base de datos." };
  }
}

export const obtenerEstudiantesYNotas = obtenerEstudiantesPorSeccion;
