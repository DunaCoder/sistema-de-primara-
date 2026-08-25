'use server'

import { prisma } from "@/lib/prisma";

/**
 * 1. Obtener todos los estudiantes inscritos en un Grado/Sección específico
 */
export async function obtenerEstudiantesPorSeccion(idGradoSeccion) {
  try {
    const inscritos = await prisma.inscripcion.findMany({
      where: {
        idGradoSeccion: Number(idGradoSeccion),
        anoEscolar: "2025-2026",
      },
      include: {
        estudiante: true,
      },
      orderBy: {
        estudiante: {
          apellido: 'asc',
        },
      },
    });

    return inscritos.map((i) => ({
      idInscripcion: i.idInscripcion,
      idEstudiante: i.estudiante.idEstudiante,
      nombre: i.estudiante.nombre,
      apellido: i.estudiante.apellido,
      literal: '',
      apreciacion: '',
    }));

  } catch (error) {
    console.error("❌ Error al obtener estudiantes por sección:", error);
    return [];
  }
}

/**
 * 2. Guardar o actualizar la lista de calificaciones cualitativas
 */
export async function guardarCalificacionesAction(idGradoSeccion, evaluaciones) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const evalData of evaluaciones) {
        const evaluacionExistente = await tx.evaluacionCualitativa.findFirst({
          where: {
            idInscripcion: Number(evalData.idInscripcion),
          },
        });

        if (evaluacionExistente) {
          await tx.evaluacionCualitativa.update({
            where: { 
              idEvaluacionCualitativa: evaluacionExistente.idEvaluacionCualitativa 
            },
            data: {
              literal: evalData.literal,
              apreciacion: evalData.apreciacion,
            },
          });
        } else {
          await tx.evaluacionCualitativa.create({
            data: {
              idInscripcion: Number(evalData.idInscripcion),
              literal: evalData.literal,
              apreciacion: evalData.apreciacion,
            },
          });
        }
      }
    });

    return { 
      success: true, 
      message: "Todas las calificaciones del grupo han sido guardadas con éxito en PostgreSQL." 
    };

  } catch (error) {
    console.error("❌ Error al guardar calificaciones:", error);
    return { 
      success: false, 
      error: "No se pudieron almacenar las notas. Revisa los campos de tu esquema." 
    };
  }
}

// ALIAS: Mantiene compatibilidad con el componente de la interfaz de tu compañero
export const obtenerEstudiantesYNotas = obtenerEstudiantesPorSeccion;