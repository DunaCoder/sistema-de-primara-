"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function obtenerBoletaPorInscripcion(idInscripcion, lapso) {
  try {
    if (!idInscripcion || !lapso) {
      return { success: false, mensaje: "Faltan parámetros para la consulta." };
    }

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { idInscripcion: Number(idInscripcion) },
      include: {
        estudiante: {
          include: { representante: true },
        },
        gradoSeccion: {
          include: {
            docenteGuia: true,
            asignaciones: {
              include: {
                docente: true,
                materia: true,
              },
            },
          },
        },
        evaluaciones: {
          where: { lapso: Number(lapso) },
          include: { materia: true },
        },
      },
    });

    if (!inscripcion) {
      return {
        success: false,
        mensaje: "No se encontró el registro de inscripción.",
      };
    }

    const est = inscripcion.estudiante;
    const rep = est?.representante;
    const gs = inscripcion.gradoSeccion;

    const guia = gs?.docenteGuia;
    const docenteGuiaNombre = guia 
      ? `${guia.apellido}, ${guia.nombre}` 
      : "Por Asignar";

    const evaluacionesFormateadas = inscripcion.evaluaciones.map((e) => {
      const asignacionEspecialista = gs?.asignaciones?.find(
        (asig) => asig.idMateria === e.idMateria
      );

      const docenteMateria = asignacionEspecialista?.docente
        ? `${asignacionEspecialista.docente.apellido}, ${asignacionEspecialista.docente.nombre}`
        : docenteGuiaNombre;

      return {
        materia: e.materia?.nombre || "Asignatura",
        nota: e.literalCalificacion,
        observacion: e.apreciacionDescriptiva || "Sin observaciones registradas.",
        docenteAsignado: docenteMateria,
      };
    });

    const boletaFormateada = {
      estudiante: `${est?.apellido || ""}, ${est?.nombre || ""}`,
      cedula: `${est?.nacionalidad || "V"}-${est?.cedulaEscolar || est?.idEstudiante}`,
      grado: `${gs?.grado || ""} - Sección ${gs?.seccion || ""}`, 
      representante: rep ? `${rep.apellido}, ${rep.nombre}` : "Sin Asignar",
      lapso: `${lapso}° Lapso`,
      docente: docenteGuiaNombre,
      evaluaciones: evaluacionesFormateadas,
    };

    return { success: true, data: boletaFormateada };
  } catch (error) {
    console.error("Error al obtener boleta:", error);
    return { success: false, mensaje: "Error interno al consultar la boleta." };
  }
}

/**
 * 1. Estado de avance de carga de notas por lapso
 */
export async function obtenerEstatusCargaDocente(lapso = "1") {
  try {
    const numLapso = Number(lapso);

    const secciones = await prisma.gradoSeccion.findMany({
      include: {
        inscripciones: {
          include: {
            evaluaciones: {
              where: { lapso: numLapso },
              select: { idMateria: true },
            },
          },
        },
      },
      orderBy: [{ grado: "asc" }, { seccion: "asc" }],
    });

    const todasLasMaterias = await prisma.materia.findMany();

    const reporte = secciones.map((sec) => {
      const totalInscritos = sec.inscripciones.length;
      const materiasDelGradoCount = todasLasMaterias.filter((m) => m.grado === sec.grado).length;

      const estudiantesConNotas = sec.inscripciones.filter((ins) => {
        if (materiasDelGradoCount === 0) return ins.evaluaciones.length > 0;
        return ins.evaluaciones.length >= materiasDelGradoCount;
      }).length;

      const porcentaje = totalInscritos > 0 ? Math.round((estudiantesConNotas / totalInscritos) * 100) : 0;

      return {
        idGradoSeccion: sec.idGradoSeccion,
        // CORREGIDO: Se usa sec.grado directamente para evitar duplicar la palabra Grado
        nombre: `${sec.grado} - Sección "${sec.seccion}"`,
        totalInscritos,
        estudiantesConNotas,
        porcentaje,
        completo: porcentaje === 100,
      };
    });

    return { success: true, reporte };
  } catch (error) {
    console.error("ERROR_ESTATUS_CARGA:", error);
    return { success: false, reporte: [] };
  }
}

/**
 * 2. Obtener lote completo de boletines masivos filtrados por lapso
 */
export async function obtenerBoletinesMasivosPorSeccion(idGradoSeccion, lapso = "1") {
  try {
    const numSeccion = Number(idGradoSeccion);
    const numLapso = Number(lapso);

    const inscripciones = await prisma.inscripcion.findMany({
      where: { idGradoSeccion: numSeccion },
      include: {
        estudiante: true,
        gradoSeccion: true,
        evaluaciones: {
          where: { lapso: numLapso },
          include: { materia: true },
        },
      },
      orderBy: { estudiante: { apellido: "asc" } },
    });

    const boletines = inscripciones.map((ins) => {
      const est = ins.estudiante;
      const sec = ins.gradoSeccion;

      return {
        idInscripcion: ins.idInscripcion,
        estudiante: `${est.apellido}, ${est.nombre}`,
        cedula: est.cedulaEscolar || est.idEstudiante || "S/C",
        // CORREGIDO: Se usa sec.grado de forma limpia
        grado: `${sec.grado} - "${sec.seccion}"`,
        evaluaciones: ins.evaluaciones.map((e) => ({
          materia: e.materia?.nombre || "Materia General",
          nota: e.literalCalificacion || "N/A",
          observacion: e.apreciacionDescriptiva || "Sin observación registrada.",
        })),
      };
    });

    return { success: true, boletines };
  } catch (error) {
    console.error("ERROR_BOLETINES_MASIVOS:", error);
    return { success: false, boletines: [], mensaje: error.message };
  }
}

/**
 * 3. Guardar calificaciones de la sección
 */
export async function guardarCalificacionesSeccion(data) {
  try {
    const { idInscripcion, idMateria, lapso, literalCalificacion, apreciacionDescriptiva, idDocente } = data;

    const numInscripcion = Number(idInscripcion);
    const numMateria = Number(idMateria);
    const numLapso = Number(lapso);

    if (!numInscripcion || !numMateria || !numLapso) {
      return { success: false, error: "Faltan datos obligatorios para guardar la calificación." };
    }

    const evaluacionExistente = await prisma.evaluacion.findFirst({
      where: {
        idInscripcion: numInscripcion,
        idMateria: numMateria,
        lapso: numLapso,
      },
    });

    if (evaluacionExistente) {
      await prisma.evaluacion.update({
        where: { idEvaluacion: evaluacionExistente.idEvaluacion },
        data: {
          literalCalificacion: literalCalificacion || null,
          apreciacionDescriptiva: apreciacionDescriptiva || null,
          idDocente: idDocente ? Number(idDocente) : undefined,
        },
      });
    } else {
      await prisma.evaluacion.create({
        data: {
          idInscripcion: numInscripcion,
          idMateria: numMateria,
          lapso: numLapso,
          literalCalificacion: literalCalificacion || null,
          apreciacionDescriptiva: apreciacionDescriptiva || null,
          idDocente: idDocente ? Number(idDocente) : undefined,
        },
      });
    }

    revalidatePath("/dashboard/gestion");
    return { success: true, message: "Calificación guardada correctamente." };
  } catch (error) {
    console.error("ERROR_GUARDAR_CALIFICACIONES:", error);
    return { success: false, error: "No se pudo guardar la calificación." };
  }
}

/**
 * 4. Obtener asignaciones del docente para la interfaz de gestión
 */
export async function obtenerAsignacionesDocente(idDocente = null) {
  try {
    const whereCondition = idDocente ? { idDocente: Number(idDocente) } : {};

    const asignaciones = await prisma.asignacionDocente.findMany({
      where: whereCondition,
      include: {
        gradoSeccion: true,
        materia: true,
      },
    });

    const seccionesMap = new Map();
    const materiasMap = new Map();

    asignaciones.forEach((asig) => {
      if (asig.gradoSeccion) {
        seccionesMap.set(asig.gradoSeccion.idGradoSeccion, {
          id: asig.gradoSeccion.idGradoSeccion,
          // CORREGIDO: Se elimina el "° Grado" repetido
          nombre: `${asig.gradoSeccion.grado} - Sección "${asig.gradoSeccion.seccion}"`,
          grado: asig.gradoSeccion.grado,
          seccion: asig.gradoSeccion.seccion,
        });
      }
      if (asig.materia) {
        materiasMap.set(asig.materia.idMateria, {
          id: asig.materia.idMateria,
          nombre: asig.materia.nombre,
          grado: asig.materia.grado,
        });
      }
    });

    return { 
      success: true, 
      asignaciones, 
      secciones: Array.from(seccionesMap.values()),
      materias: Array.from(materiasMap.values()),
      anoEscolar: "2025-2026"
    };
  } catch (error) {
    console.error("ERROR_OBTENER_ASIGNACIONES_DOCENTE:", error);
    return { success: false, asignaciones: [], secciones: [], materias: [] };
  }
}

/**
 * 5. Obtener estudiantes y todas sus materias/notas para el boletín
 */
export async function obtenerEstudiantesYNotas(idGradoSeccion, idMateria = null, lapso = "1") {
  try {
    const numSeccion = Number(idGradoSeccion);
    const numLapso = Number(lapso);

    const gradoSeccionObj = await prisma.gradoSeccion.findUnique({
      where: { idGradoSeccion: numSeccion },
    });

    if (!gradoSeccionObj) return { success: false, estudiantes: [] };

    const materiasGrado = await prisma.materia.findMany({
      where: { grado: gradoSeccionObj.grado },
      orderBy: { nombre: "asc" },
    });

    let inscripciones = await prisma.inscripcion.findMany({
      where: { idGradoSeccion: numSeccion },
      include: {
        estudiante: true,
        evaluaciones: {
          where: { lapso: numLapso },
          include: { materia: true },
        },
      },
      orderBy: { estudiante: { apellido: "asc" } },
    });

    let estudiantesMapeados = [];

    if (inscripciones.length > 0) {
      estudiantesMapeados = inscripciones.map((ins) => {
        const est = ins.estudiante;
        if (!est) return null;

        const evaluacionesCompletas = materiasGrado.map((mat) => {
          const evalEncontrada = ins.evaluaciones.find((e) => e.idMateria === mat.idMateria);
          return {
            idMateria: mat.idMateria,
            materia: mat.nombre,
            literalCalificacion: evalEncontrada?.literalCalificacion || "S/N",
            apreciacionDescriptiva: evalEncontrada?.apreciacionDescriptiva || "Sin informe cualitativo registrado para este lapso.",
          };
        });

        return {
          idInscripcion: ins.idInscripcion,
          idEstudiante: est.idEstudiante,
          nombre: est.nombre,
          apellido: est.apellido,
          cedula: est.cedulaEscolar || est.cedula || est.idEstudiante || "S/C",
          evaluaciones: evaluacionesCompletas,
        };
      }).filter(Boolean);
    }

    if (estudiantesMapeados.length === 0) {
      const todosLosEstudiantes = await prisma.estudiante.findMany({
        orderBy: { apellido: "asc" },
      }).catch(() => []);

      estudiantesMapeados = todosLosEstudiantes.map((est) => {
        const evaluacionesCompletas = materiasGrado.map((mat) => ({
          idMateria: mat.idMateria,
          materia: mat.nombre,
          literalCalificacion: "S/N",
          apreciacionDescriptiva: "Sin informe cualitativo registrado para este lapso.",
        }));

        return {
          idInscripcion: est.idEstudiante,
          idEstudiante: est.idEstudiante,
          nombre: est.nombre,
          apellido: est.apellido,
          cedula: est.cedulaEscolar || est.cedula || est.idEstudiante || "S/C",
          evaluaciones: evaluacionesCompletas,
        };
      });
    }

    return { success: true, estudiantes: estudiantesMapeados };
  } catch (error) {
    console.error("ERROR_OBTENER_ESTUDIANTES_Y_NOTAS:", error);
    return { success: false, estudiantes: [] };
  }
}

/**
 * 6. Obtener todas las secciones disponibles para los selectores
 */
export async function obtenerSeccionesDisponibles() {
  try {
    const secciones = await prisma.gradoSeccion.findMany({
      orderBy: [{ grado: "asc" }, { seccion: "asc" }],
    });
    return { success: true, secciones };
  } catch (error) {
    console.error("ERROR_OBTENER_SECCIONES:", error);
    return { success: false, secciones: [] };
  }
}