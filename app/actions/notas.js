// app/actions/notas.js
'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 1. Obtener todos los alumnos inscritos en un Grado/Sección específico
export async function obtenerAlumnosPorSeccion(idGradoSeccion) {
  try {
    const inscritos = await prisma.inscripcion.findMany({
      where: {
        idGradoSeccion: parseInt(idGradoSeccion),
        anoEscolar: "2025-2026" // Año escolar activo de la institución
      },
      include: {
        alumno: true // Traemos la relación con los datos personales del alumno
      },
      orderBy: {
        alumno: {
          apellido: 'asc' // Ordenados alfabéticamente por apellido
        }
      }
    });

    // Mapeamos la data para que sea idéntica a la estructura que espera la interfaz
    return inscritos.map(i => ({
      idInscripcion: i.idInscripcion,
      idAlumno: i.alumno.idAlumno,
      nombre: i.alumno.nombre,
      apellido: i.alumno.apellido,
      // Intentamos buscar si ya tiene una evaluación guardada para este lapso (ej: Momento 1)
      // Nota: Si no existe aún en tu DB, retornamos valores vacíos
      literal: '', 
      apreciacion: ''
    }));

  } catch (error) {
    console.error("❌ Error al obtener alumnos:", error);
    return [];
  }
}

// 2. Guardar o actualizar la lista de calificaciones cualitativas
export async function guardarCalificacionesAction(idGradoSeccion, evaluaciones) {
  try {
    // Usamos una transacción para asegurarnos de que se guarden todas las notas o ninguna
    await prisma.$transaction(async (tx) => {
      for (const evalData of evaluaciones) {
        // Buscamos si ya existe una evaluación cualitativa para esta inscripción en el lapso actual
        const evaluacionExistente = await tx.evaluacionCualitativa.findFirst({
          where: {
            idInscripcion: evalData.idInscripcion,
            // Aquí puedes añadir un campo adicional si manejas lapsos/momentos (ej: momento: 1)
          }
        });

        if (evaluacionExistente) {
          // Si ya existe la nota del chamo, la actualizamos
          await tx.evaluacionCualitativa.update({
            where: { idEvaluacionCualitativa: evaluacionExistente.idEvaluacionCualitativa },
            data: {
              literal: evalData.literal,
              apreciacion: evalData.apreciacion
            }
          });
        } else {
          // Si es primera vez que se evalúa, creamos el registro limpio
          await tx.evaluacionCualitativa.create({
            data: {
              idInscripcion: evalData.idInscripcion,
              literal: evalData.literal,
              apreciacion: evalData.apreciacion,
              // fechaRegistro: new Date() (Opcional si tu modelo lo incluye automáticamente)
            }
          });
        }
      }
    });

    return { success: true, message: "Todas las calificaciones han sido guardadas con éxito en PostgreSQL." };

  } catch (error) {
    console.error("❌ Error al guardar calificaciones:", error);
    return { success: false, error: "No se pudieron almacenar las notas. Revisa los campos de tu esquema." };
  }
}