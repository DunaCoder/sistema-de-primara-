'use server';

import { prisma } from "@/lib/prisma";

export async function registrarAuditoria({ usuarioId, usuarioNombre, rol, accion, modulo, detalles }) {
  try {
    await prisma.bitacora.create({
      data: {
        usuarioId: usuarioId ? String(usuarioId) : null,
        usuarioNombre: usuarioNombre || 'SISTEMA',
        rol: rol || 'ADMINISTRADOR',
        accion,
        modulo,
        detalles,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
    return { success: false, error: "No se pudo registrar la bitácora." };
  }
}

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