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

// ===== OBTENER ASIGNACIONES DEL DOCENTE (secciones y materias) =====
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

    const materias = await prisma.materia.findMany({
      select: {
        idMateria: true,
        nombre: true,
      },
      orderBy: { nombre: 'asc' },
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
      materias: materias.map((m) => ({
        id: String(m.idMateria),
        nombre: m.nombre,
      })),
    };
  } catch (error) {
    console.error('DETALLE_ERROR_ASIGNACIONES:', error);
    return { success: false, secciones: [], materias: [], anoEscolar: '' };
  }
}

// ===== OBTENER ESTUDIANTES Y SUS NOTAS =====
export async function obtenerEstudiantesYNotas(idGradoSeccion, materiaId, lapso) {
  try {
    if (!idGradoSeccion || !materiaId) return { success: true, data: [] };

    const numGradoSeccion = Number(idGradoSeccion);
    const numMateria = Number(materiaId);
    const numLapso = Number(lapso);

    if (isNaN(numGradoSeccion) || isNaN(numMateria)) {
      return { success: true, data: [] };
    }

    const inscripciones = await prisma.inscripcion.findMany({
      where: { idGradoSeccion: numGradoSeccion },
      include: {
        alumno: {
          include: {
            representante: true,
          },
        },
        evaluaciones: true,
      },
      orderBy: { idInscripcion: 'desc' },
    });

    const data = inscripciones.map((ins) => {
      const cal = (ins.evaluaciones || []).find(
        (c) => Number(c.lapso) === numLapso && Number(c.idMateria) === numMateria
      ) || {};

      const est = ins.alumno || {};
      const rep = est.representante || {};
      const nombreRepresentante = rep.nombre && rep.apellido
        ? `${rep.nombre} ${rep.apellido}`
        : 'Sin representante';

      const rawCedula = est.cedulaEscolar || est.idAlumno || 'S/C';
      const cedulaFormateada = rawCedula;

      return {
        idInscripcion: ins.idInscripcion,
        cedula: cedulaFormateada,
        nombre: [est.apellido, est.nombre].filter(Boolean).join(', ') || 'Estudiante sin nombre',
        representante: nombreRepresentante,
        literal: cal.literalCalificacion || '',
        apreciacion: cal.apreciacionDescriptiva || '',
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error('DETALLE_ERROR_ESTUDIANTES_Y_NOTAS:', error);
    return { success: false, data: [], mensaje: error.message };
  }
}

// ===== GUARDAR EVALUACIÓN INDIVIDUAL =====
export async function guardarEvaluacionIndividual({ idInscripcion, idMateria, lapso, literal, apreciacion }) {
  try {
    const numInscripcion = Number(idInscripcion);
    const numMateria = Number(idMateria);
    const numLapso = Number(lapso);
    if (isNaN(numInscripcion) || isNaN(numMateria) || isNaN(numLapso)) {
      return { success: false, error: 'Datos inválidos' };
    }

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
          literalCalificacion: literal,
          apreciacionDescriptiva: apreciacion,
        },
      });
    } else {
      await prisma.evaluacionCualitativa.create({
        data: {
          idInscripcion: numInscripcion,
          idMateria: numMateria,
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