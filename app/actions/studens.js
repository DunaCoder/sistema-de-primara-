// app/actions/students.js
'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function registrarInscripcionAction(data) {
  try {
    const {
      // Datos del Representante
      idRepresentante, nombreRep, apellidoRep, telefono, direccionRep, // ✅ cambio aquí
      // Datos del Alumno
      idAlumno, nombreAlu, apellidoAlu, fechaNacimiento,
      // Datos de asignación
      idGradoSeccion
    } = data;
console.log("📦 Datos recibidos en la acción:", JSON.stringify(data, null, 2));
    // Ejecutamos todo en una sola transacción atómica
    const resultado = await prisma.$transaction(async (tx) => {
      
      // 1. Crear o actualizar al Representante
      const representante = await tx.representante.upsert({
        where: { idRepresentante: idRepresentante },
        update: {
          nombre: nombreRep,
          apellido: apellidoRep,
          telefono: telefono || '', // ✅ ahora telefono existe
          direccion: direccionRep
        },
        create: {
          idRepresentante: idRepresentante,
          nombre: nombreRep,
          apellido: apellidoRep,
          telefono: telefono || '', // ✅ ahora telefono existe
          direccion: direccionRep
        }
      });

      // 2. Verificar si el alumno ya existe
      const alumnoExiste = await tx.alumno.findUnique({
        where: { idAlumno: idAlumno }
      });

      if (alumnoExiste) {
        throw new Error("La cédula escolar o ID del alumno ya se encuentra registrada.");
      }

      // 3. Crear al Alumno
      const nuevoAlumno = await tx.alumno.create({
        data: {
          idAlumno: idAlumno,
          nombre: nombreAlu,
          apellido: apellidoAlu,
          fechaNacimiento: new Date(fechaNacimiento),
          idRepresentante: representante.idRepresentante
        }
      });

      // 4. Crear la Inscripción
      const inscripcion = await tx.inscripcion.create({
        data: {
          idAlumno: nuevoAlumno.idAlumno,
          idGradoSeccion: parseInt(idGradoSeccion),
          añoEscolar: "2025-2026",
          fechaInscripcion: new Date()
        }
      });

      return { alumno: nuevoAlumno, inscripcion };
    });

    return { success: true, message: `Alumno ${resultado.alumno.nombre} inscrito con éxito.` };

  } catch (error) {
    console.error("❌ Error en registrarInscripcionAction:", error);
    return { success: false, error: error.message || "Error interno al procesar la matrícula." };
  }
}