'use server';

import { prisma } from "@/lib/db";
import { registrarAuditoria } from "@/app/actions/auditoria";

export async function guardarOActualizarNota({ 
  estudianteId, 
  estudianteNombre, 
  materiaId, 
  materiaNombre, 
  lapso, 
  nota, 
  observacion, 
  usuarioId, 
  usuarioNombre, 
  usuarioRol 
}) {
  try {
    // 1. Verificar si ya existe calificación previa para este estudiante, materia y lapso
    const notaExistente = await prisma.nota.findFirst({
      where: {
        estudianteId: Number(estudianteId),
        materiaId: Number(materiaId),
        lapso: String(lapso),
      },
    });

    let resultado;
    let accionAudit = "";

    if (notaExistente) {
      // 2. Si existe, actualiza el registro (edición sin crear duplicados)
      resultado = await prisma.nota.update({
        where: { id: notaExistente.id },
        data: {
          calificacion: nota,
          observacion: observacion,
        },
      });
      accionAudit = "MODIFICACION_NOTA";
    } else {
      // 3. Si no existe, crea el registro nuevo
      resultado = await prisma.nota.create({
        data: {
          estudianteId: Number(estudianteId),
          materiaId: Number(materiaId),
          lapso: String(lapso),
          calificacion: nota,
          observacion: observacion,
        },
      });
      accionAudit = "CARGA_NOTA";
    }

    // 4. Auditoría automática del evento
    await registrarAuditoria({
      usuarioId,
      usuarioNombre,
      rol: usuarioRol,
      accion: accionAudit,
      modulo: "Notas",
      detalles: `${accionAudit === "CARGA_NOTA" ? "Asignó" : "Actualizó"} nota '${nota}' al estudiante ${estudianteNombre} en ${materiaNombre} (${lapso}° Lapso)`,
    });

    return {
      success: true,
      mensaje: notaExistente ? "Nota actualizada correctamente" : "Nota registrada con éxito",
      data: resultado,
    };
  } catch (error) {
    console.error("Error al procesar la nota:", error);
    return { success: false, mensaje: "Error de servidor al guardar la calificación." };
  }
}