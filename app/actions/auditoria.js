'use server';

import { prisma } from "@/lib/db";

/**
 * Registra un evento en la tabla de bitácora
 */
export async function registrarAuditoria({ usuarioId, usuarioNombre, rol, accion, modulo, detalles }) {
  try {
    await prisma.bitacora.create({
      data: {
        usuarioId,
        usuarioNombre,
        rol,
        accion,
        modulo,
        detalles,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Consulta los últimos 100 eventos para la vista del Administrador
 */
export async function obtenerAuditoria() {
  try {
    const logs = await prisma.bitacora.findMany({
      orderBy: { fecha: 'desc' },
      take: 100,
    });
    return { success: true, logs };
  } catch (error) {
    console.error("Error al consultar bitácora:", error);
    return { success: false, logs: [] };
  }
}