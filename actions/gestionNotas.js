"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 1. Obtener asignaciones e información del Año Escolar
 */
export async function obtenerAsignacionesDocente() {
  try {
    const secciones = await prisma.gradoSeccion.findMany({
      select: {
        idGradoSeccion: true,
        grado: true,
        seccion: true,
      },
      orderBy: [{ grado: "asc" }, { seccion: "asc" }],
    });

    const materias = await prisma.materia.findMany({
      select: {
        idMateria: true,
        nombre: true,
      },
      orderBy: { nombre: "asc" },
    });

    const fechaActual = new Date();
    const anoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;
    const anoInicio = mesActual >= 9 ? anoActual : anoActual - 1;
    const anoEscolarCalculado = `${anoInicio} - ${anoInicio + 1}`;

    return {
      success: true,
      anoEscolar: anoEscolarCalculado,
      secciones: secciones.map((s) => ({
        id: String(s.idGradoSeccion),
        nombre: `${String(s.grado)
          .replace(/grados?|°/gi, "")
          .trim()}° Grado - Sección "${s.seccion}"`,
      })),
      materias: materias.map((m) => ({
        id: String(m.idMateria),
        nombre: m.nombre,
      })),
    };
  } catch (error) {
    console.error("DETALLE_ERROR_ASIGNACIONES:", error);
    return { success: false, secciones: [], materias: [], anoEscolar: "" };
  }
}

/**
 * Auxiliar para limpiar prefijos duplicados (V-, C.E., etc.)
 */
function formatearCedula(valor) {
  if (!valor || valor === "S/C") return "S/C";

  const esEscolar = /C\.?E\.?/i.test(valor);
  const numeros = String(valor).replace(/\D/g, "");

  if (!numeros) return valor;

  return esEscolar ? `C.E.-${numeros}` : `V-${numeros}`;
}

/**
 * 2. Obtener nómina e inscritos con sus notas
 */
export async function obtenerEstudiantesYNotas(
  idGradoSeccion,
  materiaId,
  lapso,
) {
  try {
    if (!idGradoSeccion || !materiaId) return { success: true, data: [] };

    const numGradoSeccion = Number(idGradoSeccion);
    const numMateria = Number(materiaId);
    const numLapso = Number(lapso);

    if (isNaN(numGradoSeccion) || isNaN(numMateria))
      return { success: true, data: [] };

    const inscripciones = await prisma.inscripcion.findMany({
      where: { idGradoSeccion: numGradoSeccion },
      include: {
        estudiante: true,
        evaluacionesCualitativas: true,
      },
      orderBy: { idInscripcion: "desc" },
    });

    const data = inscripciones.map((ins) => {
      const cal =
        (ins.evaluacionesCualitativas || []).find(
          (c) =>
            Number(c.lapso) === numLapso && Number(c.idMateria) === numMateria,
        ) || {};

      const est = ins.estudiante || {};
      const apellido = est.apellido || "";
      const nombre = est.nombre || "";

      const rawCedula = est.cedulaEscolar || est.idEstudiante || "S/C";
      const cedulaFormateada = formatearCedula(rawCedula);

      return {
        idInscripcion: ins.idInscripcion,
        cedula: cedulaFormateada,
        nombre:
          [apellido, nombre].filter(Boolean).join(", ") ||
          "Estudiante sin nombre",
        literal: cal.literalCalificacion || "",
        apreciacion: cal.apreciacionDescriptiva || "",
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("DETALLE_ERROR_ESTUDIANTES_Y_NOTAS:", error);
    return { success: false, data: [], mensaje: error.message };
  }
}

/**
 * 3. Guardar Calificaciones masivas de una Sección
 */
export async function guardarCalificacionesSeccion(datos) {
  const { materiaId, lapso, calificaciones } = datos;

  try {
    const numMateria = Number(materiaId);
    const numLapso = Number(lapso);

    if (
      isNaN(numMateria) ||
      isNaN(numLapso) ||
      !calificaciones ||
      !Array.isArray(calificaciones)
    ) {
      return { success: false, error: "Datos inválidos para guardar." };
    }

    for (const cal of calificaciones) {
      const numInscripcion = Number(cal.idInscripcion);
      if (isNaN(numInscripcion)) continue;

      const existente = await prisma.evaluacionCualitativa.findFirst({
        where: {
          idInscripcion: numInscripcion,
          idMateria: numMateria,
          lapso: numLapso,
        },
      });

      if (existente) {
        await prisma.evaluacionCualitativa.update({
          where: { idEvaluacion: existente.idEvaluacion },
          data: {
            literalCalificacion: cal.literal || "",
            apreciacionDescriptiva: cal.apreciacion || "",
          },
        });
      } else {
        await prisma.evaluacionCualitativa.create({
          data: {
            idInscripcion: numInscripcion,
            idMateria: numMateria,
            lapso: numLapso,
            literalCalificacion: cal.literal || "",
            apreciacionDescriptiva: cal.apreciacion || "",
          },
        });
      }
    }

    revalidatePath("/dashboard/gestion");
    return { success: true };
  } catch (error) {
    console.error("ERROR_GUARDAR_NOTAS:", error);
    return { success: false, error: error.message };
  }
}
