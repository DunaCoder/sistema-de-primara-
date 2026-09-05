// app/actions/alumnos.js
'use server';

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function obtenerMatriculaGeneral() {
  try {
    // Obtener todas las inscripciones del año escolar actual (sin tilde)
    const inscripciones = await prisma.inscripcion.findMany({
      where: {
        anioEscolar: "2025-2026" // ✅ Ahora sin tilde: anioEscolar
      },
      include: {
        alumno: {
          include: {
            representante: {
              include: {
                telefonos: true // ✅ Incluir la nueva tabla de teléfonos
              }
            }
          }
        },
        gradoSeccion: true
      },
      orderBy: {
        fechaInscripcion: 'desc'
      }
    });

    // Mapear los datos al formato que espera el frontend
    return inscripciones.map(i => {
      const alumno = i.alumno;
      const rep = alumno.representante;
      // Obtener el teléfono principal o el primero
      const telefonoPrincipal = rep.telefonos?.find(t => t.esPrincipal)?.numero
        || rep.telefonos?.[0]?.numero
        || 'Sin teléfono';

      return {
        idAlumno: alumno.idAlumno, // ✅ Campo esperado por la página
        nombreAlumno: `${alumno.apellido}, ${alumno.nombre}`,
        gradoSeccion: `${i.gradoSeccion.grado}° Grado - Sección "${i.gradoSeccion.seccion}"`,
        representante: `${rep.apellido}, ${rep.nombre}`,
        cedulaRep: rep.idRepresentante,
        telefonoRep: telefonoPrincipal,
        discapacidad: alumno.discapacidad || '',
        alergias: alumno.alergias || '',
        telefonos: rep.telefonos, // Opcional, por si se quiere mostrar todos
      };
    });

  } catch (error) {
    console.error("❌ Error al consultar la matrícula general:", error);
    return []; // Devuelve un array vacío para que la página no explote
  }
}