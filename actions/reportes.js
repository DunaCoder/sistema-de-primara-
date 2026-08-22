'use server';

import { prisma } from "@/lib/db";

export async function obtenerBoletaPorInscripcion(idInscripcion, lapso) {
  try {
    if (!idInscripcion || !lapso) {
      return { success: false, mensaje: "Faltan parámetros para la consulta." };
    }

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { idInscripcion: Number(idInscripcion) },
      include: {
        estudiante: {
          include: { representante: true }
        },
        gradoSeccion: {
          include: {
            grado: true,
            seccion: true,
            docenteSeccion: {
              include: { docente: true }
            }
          }
        },
        evaluaciones: {
          where: { lapso: Number(lapso) },
          include: { materia: true }
        }
      }
    });

    if (!inscripcion) {
      return { success: false, mensaje: "No se encontró el registro de inscripción." };
    }

    // Formatear objeto listo para la boleta
    const est = inscripcion.estudiante;
    const rep = est?.representante;
    const gs = inscripcion.gradoSeccion;
    const docenteNombre = gs?.docenteSeccion?.[0]?.docente 
      ? `${gs.docenteSeccion[0].docente.apellido}, ${gs.docenteSeccion[0].docente.nombre}`
      : "Por Asignar";

    const boletaFormateada = {
      estudiante: `${est?.apellido || ''}, ${est?.nombre || ''}`,
      cedula: est?.cedulaEstudiantil || est?.cedula || 'S/C',
      grado: `${gs?.grado?.nombre || ''} - Sección ${gs?.seccion?.nombre || ''}`,
      representante: rep ? `${rep.apellido}, ${rep.nombre}` : 'Sin Asignar',
      lapso: `${lapso}° Lapso`,
      docente: docenteNombre,
      evaluaciones: inscripcion.evaluaciones.map((e) => ({
        materia: e.materia?.nombre || 'Asignatura',
        nota: e.literalCalificacion,
        observacion: e.apreciacionDescriptiva || 'Sin observaciones registradas.'
      }))
    };

    return { success: true, data: boletaFormateada };
  } catch (error) {
    console.error("Error al obtener boleta:", error);
    return { success: false, mensaje: "Error interno al consultar la boleta." };
  }
}