// app/actions/busquedas.js
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
        anoEscolar: "2025-2026"
      },
      include: {
        alumno: {
          include: {
            representante: true // Nos traemos también al papá/mamá
          }
        },
        gradoSeccion: true // Para saber si es 1er grado, 2do grado, etc.
      },
      orderBy: {
        fechaInscripcion: 'desc' // Los últimos inscritos salen primero
      }
    });

    // Modelamos la data limpia para la tabla de la interfaz
    return inscripciones.map(i => ({
      idInscripcion: i.idInscripcion,
      cedulaEscolar: i.alumno.idAlumno,
      nombreAlumno: `${i.alumno.apellido}, ${i.alumno.nombre}`,
      gradoSeccion: i.gradoSeccion.nombre || `Grado ID: ${i.idGradoSeccion}`,
      representante: `${i.alumno.representante.apellido}, ${i.alumno.representante.nombre}`,
      cedulaRep: i.alumno.representante.idRepresentante,
      telefonoRep: i.alumno.representante.telefono || 'Sin teléfono',
      expediente: i.alumno.expedienteCompleto ? 'Completo' : 'Incompleto'
    }));

  } catch (error) {
    console.error("❌ Error al consultar la matrícula general:", error);
    return [];
  }
}