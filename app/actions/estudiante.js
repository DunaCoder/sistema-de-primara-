'use server'

import { revalidatePath } from 'next/cache';

// 1. Buscar representante previo por cédula/ID
export async function buscarRepresentanteAction(idRepresentante) {
  try {
    if (!idRepresentante) {
      return { success: false, message: 'ID de representante requerido' };
    }

    return { success: false, message: 'Representante no encontrado' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. Registrar inscripción completa
export async function registrarInscripcionAction(payload) {
  try {
    const { idRepresentante, estudiantes } = payload;

    if (!idRepresentante || !estudiantes || estudiantes.length === 0) {
      return { success: false, error: 'Faltan datos obligatorios' };
    }

    revalidatePath('/dashboard/estudiante');

    return { success: true, message: 'Inscripción procesada correctamente' };
  } catch (error) {
    console.error('Error al registrar inscripción:', error);
    return { success: false, error: 'Error interno al guardar' };
  }
}

// 3. Obtener la matrícula general para la tabla
export async function obtenerMatriculaGeneral() {
  try {
    return [];
  } catch (error) {
    console.error('Error al obtener matrícula general:', error);
    return [];
  }
}

// ALIAS: Mantiene compatibilidad con el componente de la interfaz de tu compañero
export const registrarEstudianteCompleto = registrarInscripcionAction;