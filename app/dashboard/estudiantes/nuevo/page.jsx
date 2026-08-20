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
        anoEscolar: "2025-2026", // Año escolar activo de la institución
      },
      include: {
        estudiante: true, // Relación directa con la tabla Estudiante
      },
      orderBy: {
        estudiante: {
          apellido: 'asc', // Orden alfabético por apellido
        },
      },
    });

    // Mapeo adaptado con la entidad 'estudiante'
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
    // Transacción atómica en PostgreSQL mediante el cliente centralizado
    await prisma.$transaction(async (tx) => {
      for (const evalData of evaluaciones) {
        // Búsqueda de evaluación previa para la inscripción activa
        const evaluacionExistente = await tx.evaluacionCualitativa.findFirst({
          where: {
            idInscripcion: Number(evalData.idInscripcion),
          },
        });

        if (evaluacionExistente) {
          // Actualización de apreciación / nota cualitativa existente
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
          // Registro nuevo en caso de primera evaluación
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