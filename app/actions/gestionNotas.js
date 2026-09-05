// app/actions/gestionNotas.js
'use server';

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { revalidatePath } from 'next/cache';
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ===== OBTENER ASIGNACIONES DEL DOCENTE (SOLO SECCIONES) =====
export async function obtenerAsignacionesDocente() {
  try {
    const secciones = await prisma.gradoSeccion.findMany({
      select: {
        idGradoSeccion: true,
        grado: true,
        seccion: true,
      },
      orderBy: [{ grado: 'asc' }, { seccion: 'asc' }],
    });

    const fechaActual = new Date();
    const anoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;
    const anoInicio = mesActual >= 9 ? anoActual : anoActual - 1;
    const anoEscolarCalculado = `${anoInicio}-${anoInicio + 1}`;

    return {
      success: true,
      anoEscolar: anoEscolarCalculado,
      secciones: secciones.map((s) => ({
        id: String(s.idGradoSeccion),
        nombre: `${s.grado}° Grado - Sección "${s.seccion}"`,
      })),
      materias: [], // <-- Vacío, porque ya no hay materias
    };
  } catch (error) {
    console.error('DETALLE_ERROR_ASIGNACIONES:', error);
    return { success: false, secciones: [], materias: [], anoEscolar: '' };
  }
}

// ===== OBTENER ESTUDIANTES Y SUS NOTAS (SIN MATERIAS) =====
export async function obtenerEstudiantesYNotas(idGradoSeccion, materiaId = null, lapso) {
  try {
    if (!idGradoSeccion) return { success: true, data: [] };

    const numGradoSeccion = Number(idGradoSeccion);
    const numLapso = Number(lapso);

    if (isNaN(numGradoSeccion)) {
      return { success: true, data: [] };
    }

    // Ignoramos materiaId porque ya no existe (pero lo aceptamos por compatibilidad)

    const inscripciones = await prisma.inscripcion.findMany({
      where: { idGradoSeccion: numGradoSeccion },
      include: {
        alumno: {
          include: {
            representante: {
              include: {
                telefonos: true,
              },
            },
          },
        },
        evaluaciones: true,
      },
      orderBy: { idInscripcion: 'desc' },
    });

    const data = inscripciones.map((ins) => {
      const est = ins.alumno || {};
      const rep = est.representante || {};

      const telefonoPrincipal = rep.telefonos?.find(t => t.esPrincipal)?.numero
        || rep.telefonos?.[0]?.numero
        || '';

      const nombreRepresentante = rep.nombre && rep.apellido
        ? `${rep.nombre} ${rep.apellido} (${telefonoPrincipal})`
        : 'Sin representante';

      const cedulaFormateada = est.idAlumno || 'S/C';

      const evaluacionesFiltradas = (ins.evaluaciones || [])
        .filter((c) => Number(c.lapso) === numLapso);

      const cal = evaluacionesFiltradas.length > 0 ? evaluacionesFiltradas[0] : {};

      return {
        idInscripcion: ins.idInscripcion,
        cedula: cedulaFormateada,
        nombre: [est.apellido, est.nombre].filter(Boolean).join(', ') || 'Estudiante sin nombre',
        representante: nombreRepresentante,
        literal: cal.literalCalificacion || '',
        apreciacion: cal.apreciacionDescriptiva || '',
        discapacidad: est.discapacidad || '',
        alergias: est.alergias || '',
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error('DETALLE_ERROR_ESTUDIANTES_Y_NOTAS:', error);
    return { success: false, data: [], mensaje: error.message };
  }
}

// ===== GUARDAR EVALUACIÓN INDIVIDUAL (SIN MATERIA) =====
export async function guardarEvaluacionIndividual({ idInscripcion, lapso, literal, apreciacion, idMateria = null }) {
  try {
    const numInscripcion = Number(idInscripcion);
    const numLapso = Number(lapso);
    if (isNaN(numInscripcion) || isNaN(numLapso)) {
      return { success: false, error: 'Datos inválidos' };
    }

    const existente = await prisma.evaluacionCualitativa.findFirst({
      where: {
        idInscripcion: numInscripcion,
        lapso: numLapso,
      },
    });

    if (existente) {
      await prisma.evaluacionCualitativa.update({
        where: { idEvaluacion: existente.idEvaluacion },
        data: {
          literalCalificacion: literal,
          apreciacionDescriptiva: apreciacion,
        },
      });
    } else {
      await prisma.evaluacionCualitativa.create({
        data: {
          idInscripcion: numInscripcion,
          lapso: numLapso,
          literalCalificacion: literal,
          apreciacionDescriptiva: apreciacion,
        },
      });
    }

    revalidatePath('/dashboard/gestion');
    return { success: true };
  } catch (error) {
    console.error('ERROR_GUARDAR_EVALUACION_INDIVIDUAL:', error);
    return { success: false, error: error.message };
  }
}

// ===== OBTENER SECCIONES =====
export async function obtenerSeccionesDisponibles() {
  try {
    const secciones = await prisma.gradoSeccion.findMany({
      select: {
        idGradoSeccion: true,
        grado: true,
        seccion: true,
      },
      orderBy: [{ grado: 'asc' }, { seccion: 'asc' }],
    });
    return { success: true, secciones };
  } catch (error) {
    console.error('Error al obtener secciones:', error);
    return { success: false, secciones: [] };
  }
}