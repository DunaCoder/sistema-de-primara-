// app/actions/alumnos.js
'use server'

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
    const inscripciones = await prisma.inscripcion.findMany({
      where: {
        añoEscolar: "2025-2026" // ✅ con tilde
      },
      include: {
        alumno: {
          include: {
            representante: true
          }
        },
        gradoSeccion: true
      },
      orderBy: {
        fechaInscripcion: 'desc'
      }
    });

    return inscripciones.map(i => ({
      idInscripcion: i.idInscripcion,
      cedulaEscolar: i.alumno.idAlumno,
      nombreAlumno: `${i.alumno.apellido}, ${i.alumno.nombre}`,
      gradoSeccion: `${i.gradoSeccion.grado} - ${i.gradoSeccion.seccion}`, // ✅ corregido
      representante: `${i.alumno.representante.apellido}, ${i.alumno.representante.nombre}`,
      cedulaRep: i.alumno.representante.idRepresentante,
      telefonoRep: i.alumno.representante.telefono || 'Sin teléfono',
      // ✅ Eliminado expediente (ya no existe)
    }));

  } catch (error) {
    console.error("❌ Error al consultar la matrícula general:", error);
    return [];
  }
}