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
    // Permitir que materiaId sea null (para reportes con todas las materias)
    if (!idGradoSeccion) return { success: true, data: [] };

    const numGradoSeccion = Number(idGradoSeccion);
    const numLapso = Number(lapso);

    if (isNaN(numGradoSeccion)) {
      return { success: true, data: [] };
    }

    // Si materiaId no es null, convertirlo a número; si es null, dejarlo como null
    const numMateria = materiaId ? Number(materiaId) : null;

    // Construir el include de evaluaciones con materia
    const inscripciones = await prisma.inscripcion.findMany({
      where: { idGradoSeccion: numGradoSeccion },
      include: {
        alumno: {
          include: {
            representante: true,
          },
        },
        evaluaciones: {
          include: {
            materia: true,  // Obtener el nombre de la materia
          },
        },
      },
      orderBy: { idInscripcion: 'desc' },
    });

    const data = inscripciones.map((ins) => {
      const est = ins.alumno || {};
      const rep = est.representante || {};
      const nombreRepresentante = rep.nombre && rep.apellido
        ? `${rep.nombre} ${rep.apellido}`
        : 'Sin representante';

      const rawCedula = est.cedulaEscolar || est.idAlumno || 'S/C';
      const cedulaFormateada = rawCedula;

      // Obtener todas las evaluaciones del lapso (y filtrar por materia si se especificó)
      let evaluacionesFiltradas = (ins.evaluaciones || [])
        .filter((c) => Number(c.lapso) === numLapso);

      // Si se especificó una materia, filtrar solo esa
      if (numMateria !== null) {
        evaluacionesFiltradas = evaluacionesFiltradas.filter(
          (c) => Number(c.idMateria) === numMateria
        );
      }

      // Mapear a un formato más claro para el frontend
      const evaluacionesList = evaluacionesFiltradas.map((c) => ({
        materia: c.materia?.nombre || 'Sin materia',
        literalCalificacion: c.literalCalificacion || '',
        apreciacionDescriptiva: c.apreciacionDescriptiva || '',
      }));

      // Para compatibilidad con la versión anterior (cuando hay materiaId)
      // Buscar la primera evaluación (si existe) para los campos 'literal' y 'apreciacion'
      const cal = evaluacionesFiltradas.length > 0 ? evaluacionesFiltradas[0] : {};

      return {
        idInscripcion: ins.idInscripcion,
        cedula: cedulaFormateada,
        nombre: [est.apellido, est.nombre].filter(Boolean).join(', ') || 'Estudiante sin nombre',
        representante: nombreRepresentante,
        // Campos para compatibilidad (cuando se usa con una materia específica)
        literal: cal.literalCalificacion || '',
        apreciacion: cal.apreciacionDescriptiva || '',
        // Nuevo campo con todas las evaluaciones del lapso (y materia si aplica)
        evaluaciones: evaluacionesList,
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

// ===== OBTENER SECIUONES =====
// app/actions/gestionNotas.js
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
