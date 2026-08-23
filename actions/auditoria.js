'use server';

import { prisma } from "@/lib/db";

/**
 * Registrar un evento en la bitácora del sistema
 */
export async function registrarAuditoria({ usuarioId, usuarioNombre, rol, accion, modulo, detalles }) {
  try {
    const numId = usuarioId ? Number(usuarioId) : null;

    await prisma.bitacora.create({
      data: {
        usuarioId: !isNaN(numId) ? numId : null,
        usuarioNombre: usuarioNombre || 'SISTEMA',
        rol: rol || 'ADMINISTRADOR',
        accion,
        modulo,
        detalles: detalles || 'Sin detalles especificados.',
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
    return { success: false, error: "No se pudo registrar en la bitácora." };
  }
}

/**
 * Obtener historial unificado de eventos
 */
export async function obtenerAuditoria() {
  try {
    const logs = await prisma.bitacora.findMany({
      orderBy: { fecha: 'desc' },
    });
    return { success: true, logs };
  } catch (error) {
    console.error("Error al obtener auditoría:", error);
    return { success: false, error: "No se pudieron obtener los registros de auditoría." };
  }
}