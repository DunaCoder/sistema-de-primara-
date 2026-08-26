"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma"; // Ajusta la ruta a tu cliente Prisma

export async function registrarEstudianteCompleto(payload) {
  try {
    const {
      cedulaEstudiante,
      nombreEstudiante,
      apellidoEstudiante,
      fechaNacimiento,
      cedulaRepresentante,
      nombreRepresentante,
      apellidoRepresentante,
      telefonoRepresentante,
      emailRepresentante,
      direccionRepresentante,
      idGradoSeccion,
    } = payload;

    if (
      !cedulaEstudiante ||
      !cedulaRepresentante ||
      !nombreEstudiante ||
      !nombreRepresentante
    ) {
      return { success: false, mensaje: "Faltan campos obligatorios" };
    }

    // Transacción para garantizar que representante, estudiante e inscripción se creen juntos
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear o actualizar Representante
      const representante = await tx.representante.upsert({
        where: { cedula: cedulaRepresentante },
        update: {
          nombre: nombreRepresentante,
          apellido: apellidoRepresentante,
          telefono: telefonoRepresentante,
          email: emailRepresentante,
          direccion: direccionRepresentante,
        },
        create: {
          cedula: cedulaRepresentante,
          nombre: nombreRepresentante,
          apellido: apellidoRepresentante,
          telefono: telefonoRepresentante,
          email: emailRepresentante,
          direccion: direccionRepresentante,
        },
      });

      // 2. Crear o actualizar Estudiante
      const estudiante = await tx.estudiante.upsert({
        where: { cedulaEscolar: cedulaEstudiante },
        update: {
          nombre: nombreEstudiante,
          apellido: apellidoEstudiante,
          fechaNacimiento: new Date(fechaNacimiento),
          idRepresentante: representante.id,
        },
        create: {
          cedulaEscolar: cedulaEstudiante,
          nombre: nombreEstudiante,
          apellido: apellidoEstudiante,
          fechaNacimiento: new Date(fechaNacimiento),
          idRepresentante: representante.id,
        },
      });

      // 3. Crear Inscripción para el año escolar activo
      const inscripcion = await tx.inscripcion.create({
        data: {
          idEstudiante: estudiante.id,
          idGradoSeccion: Number(idGradoSeccion),
          estatus: "ACTIVO",
        },
      });

      return { representante, estudiante, inscripcion };
    });

    revalidatePath("/dashboard/estudiante");
    return {
      success: true,
      mensaje: "Inscripción procesada correctamente",
      data: resultado,
    };
  } catch (error) {
    console.error("Error al registrar estudiante:", error);
    return {
      success: false,
      mensaje: error.message || "Error interno al guardar en base de datos",
    };
  }
}
