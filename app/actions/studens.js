'use server';

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function buscarRepresentanteAction(idRepresentante) {
  try {
    if (!idRepresentante) return { success: false, data: null };

    const representante = await prisma.representante.findUnique({
      where: { idRepresentante },
      include: {
        telefonos: true, // 👈 Incluimos la lista de teléfonos
      },
    });

    if (representante) {
      // Extraemos el teléfono principal o el primero
      const telefonoPrincipal = representante.telefonos.find(t => t.esPrincipal)?.numero
        || representante.telefonos[0]?.numero
        || '';

      return {
        success: true,
        data: {
          ...representante,
          telefono: telefonoPrincipal, // Para compatibilidad con el frontend
        },
      };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error("❌ Error en buscarRepresentanteAction:", error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Registra/actualiza al representante y crea a todos los alumnos recibidos (hermanos).
 * Ahora maneja teléfonos en tabla separada y nuevos campos de alumno.
 */
export async function registrarInscripcionAction(data) {
  try {
    const {
      idRepresentante,
      nombreRep,
      apellidoRep,
      telefono,           // Ahora es el número principal
      tipoTelefono = 'Móvil', // Opcional, por defecto
      direccionRep,
      alumnos, // Arreglo de alumnos: [{ idAlumno, nombreAlu, apellidoAlu, fechaNacimiento, idGradoSeccion, discapacidad?, alergias? }]
    } = data;

    if (!alumnos || alumnos.length === 0) {
      return { success: false, error: "Debe incluir al menos un alumno para inscribir." };
    }

    console.log("📦 Datos recibidos en la acción:", JSON.stringify(data, null, 2));

    // Transacción atómica
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear o actualizar Representante (sin teléfono directo)
      const representante = await tx.representante.upsert({
        where: { idRepresentante },
        update: {
          nombre: nombreRep,
          apellido: apellidoRep,
          direccion: direccionRep || '',
        },
        create: {
          idRepresentante,
          nombre: nombreRep,
          apellido: apellidoRep,
          direccion: direccionRep || '',
        },
      });

      // 2. Manejar el teléfono del representante
      await tx.telefonoRepresentante.deleteMany({
        where: { idRepresentante: representante.idRepresentante },
      });

      if (telefono && telefono.trim() !== '') {
        await tx.telefonoRepresentante.create({
          data: {
            idRepresentante: representante.idRepresentante,
            numero: telefono.trim(),
            tipo: tipoTelefono,
            esPrincipal: true,
          },
        });
      }

      const alumnosCreados = [];

      // 3. Recorrer e inscribir cada alumno
      for (const alu of alumnos) {
        // Verificar si el alumno ya existe
        const alumnoExiste = await tx.alumno.findUnique({
          where: { idAlumno: alu.idAlumno },
        });

        if (alumnoExiste) {
          throw new Error(`El alumno con ID/Cédula ${alu.idAlumno} ya se encuentra registrado.`);
        }

        // Crear alumno con nuevos campos (discapacidad, alergias)
        const nuevoAlumno = await tx.alumno.create({
          data: {
            idAlumno: alu.idAlumno,
            nombre: alu.nombreAlu,
            apellido: alu.apellidoAlu,
            fechaNacimiento: new Date(alu.fechaNacimiento),
            idRepresentante: representante.idRepresentante,
            discapacidad: alu.discapacidad || null,
            alergias: alu.alergias || null,
          },
        });

        // Crear la inscripción con el nuevo campo anioEscolar
        await tx.inscripcion.create({
          data: {
            idAlumno: nuevoAlumno.idAlumno,
            idGradoSeccion: parseInt(alu.idGradoSeccion, 10),
            anioEscolar: "2025-2026", 
            fechaInscripcion: new Date(),
          },
        });

        alumnosCreados.push(nuevoAlumno);
      }

      return { representante, alumnosCreados };
    });

    const cantidad = resultado.alumnosCreados.length;
    const mensaje =
      cantidad === 1
        ? `Alumno ${resultado.alumnosCreados[0].nombre} inscrito con éxito.`
        : `Se inscribieron ${cantidad} alumnos (hermanos) con éxito.`;

    return { success: true, message: mensaje };
  } catch (error) {
    console.error("❌ Error en registrarInscripcionAction:", error);
    return {
      success: false,
      error: error.message || "Error interno al procesar la matrícula.",
    };
  }
}
