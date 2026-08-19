'use server'

import { revalidatePath } from 'next/cache';

// 1. Buscar representante previo por cédula
export async function buscarRepresentanteAction(idRepresentante) {
  try {
    if (!idRepresentante) {
      return { success: false, message: 'ID de representante requerido' };
    }

    // TODO: Reemplaza con tu consulta real a base de datos (ej. Prisma/PostgreSQL)
    // const rep = await db.representante.findUnique({ where: { idRepresentante } });

    /* 
    if (rep) {
      return { success: true, data: rep };
    }
    */

    return { success: false, message: 'Representante no encontrado' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. Registrar inscripción completa (Representante + Lista de Estudiantes)
export async function registrarInscripcionAction(payload) {
  try {
    const { 
      anioEscolar, 
      idRepresentante, 
      nombreRep, 
      apellidoRep, 
      telefono, 
      direccionRep, 
      estudiantes 
    } = payload;

    if (!idRepresentante || !nombreRep || !estudiantes || estudiantes.length === 0) {
      return { success: false, error: 'Faltan datos obligatorios para la inscripción' };
    }

    // TODO: Guarda aquí en base de datos la inscripción del representante y sus estudiantes

    // Revalidamos las rutas para actualizar los listados en tiempo real
    revalidatePath('/dashboard/estudiantes');
    revalidatePath('/dashboard/matricula');

    return { success: true, message: 'Inscripción procesada correctamente' };
  } catch (error) {
    console.error('Error al registrar inscripción:', error);
    return { success: false, error: 'Error interno en el servidor al guardar' };
  }
}

// 3. Obtener la matrícula general para la vista de consulta/secretaría
export async function obtenerMatriculaGeneral() {
  try {
    // TODO: Reemplaza con tu consulta real a la BD
    // const lista = await db.estudiante.findMany({ include: { representante: true } });

    // Retorna el array de la matrícula
    return [];
  } catch (error) {
    console.error('Error al obtener matrícula general:', error);
    return [];
  }
}