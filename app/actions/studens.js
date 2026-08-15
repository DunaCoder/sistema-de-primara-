'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Busca si un representante ya existe en la BD por su ID/Cédula.
 */
export async function buscarRepresentanteAction(idRepresentante) {
  try {
    if (!idRepresentante) return { success: false, data: null };

    const representante = await prisma.representante.findUnique({
      where: { idRepresentante }
    });

    if (representante) {
      return { success: true, data: representante };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error("❌ Error en buscarRepresentanteAction:", error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Registra/actualiza al representante y crea a todos los alumnos recibidos (hermanos).
 */
export async function registrarInscripcionAction(data) {
  try {
    const {
      idRepresentante,
      nombreRep,
      apellidoRep,
      telefono,
      direccionRep,
      alumnos // <-- Arreglo de alumnos [{ idAlumno, nombreAlu, apellidoAlu, fechaNacimiento, idGradoSeccion }]
    } = data;

    if (!alumnos || alumnos.length === 0) {
      return { success: false, error: "Debe incluir al menos un alumno para inscribir." };
    }

    console.log("📦 Datos recibidos en la acción:", JSON.stringify(data, null, 2));

    // Ejecutamos todo en una sola transacción atómica
    const resultado = await prisma.$transaction(async (tx) => {
      
      // 1. Crear o actualizar al Representante (Upsert)
      const representante = await tx.representante.upsert({
        where: { idRepresentante: idRepresentante },
        update: {
          nombre: nombreRep,
          apellido: apellidoRep,
          telefono: telefono || '',
          direccion: direccionRep || ''
        },
        create: {
          idRepresentante: idRepresentante,
          nombre: nombreRep,
          apellido: apellidoRep,
          telefono: telefono || '',
          direccion: direccionRep || ''
        }
      });

      const alumnosCreados = [];

      // 2. Recorrer e inscribir cada alumno en la lista vinculados al idRepresentante
      for (const alu of alumnos) {
        // Verificar si el alumno ya existe
        const alumnoExiste = await tx.alumno.findUnique({
          where: { idAlumno: alu.idAlumno }
        });

        if (alumnoExiste) {
          throw new Error(`El alumno con ID/Cédula ${alu.idAlumno} ya se encuentra registrado.`);
        }

        // Crear alumno relacionado al representante
        const nuevoAlumno = await tx.alumno.create({
          data: {
            idAlumno: alu.idAlumno,
            nombre: alu.nombreAlu,
            apellido: alu.apellidoAlu,
            fechaNacimiento: alu.fechaNacimiento ? new Date(alu.fechaNacimiento) : null,
            idRepresentante: representante.idRepresentante
          }
        });

        // Crear la inscripción
        await tx.inscripcion.create({
          data: {
            idAlumno: nuevoAlumno.idAlumno,
            idGradoSeccion: parseInt(alu.idGradoSeccion, 10),
            añoEscolar: "2025-2026",
            fechaInscripcion: new Date()
          }
        });

        alumnosCreados.push(nuevoAlumno);
      }

      return { representante, alumnosCreados };
    });

    const cantidad = resultado.alumnosCreados.length;
    const mensaje = cantidad === 1 
      ? `Alumno ${resultado.alumnosCreados[0].nombre} inscrito con éxito.`
      : `Se inscribieron ${cantidad} alumnos (hermanos) con éxito.`;

    return { success: true, message: mensaje };

  } catch (error) {
    console.error("❌ Error en registrarInscripcionAction:", error);
    return { 
      success: false, 
      error: error.message || "Error interno al procesar la matrícula." 
    };
  }
}