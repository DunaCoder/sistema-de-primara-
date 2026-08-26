"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * MÓDULO DE CONTROL DE USUARIOS
 */
export async function loginAction(formData) {
  const username = formData.get("username");
  const password = formData.get("password");

  const usuario = await prisma.usuario.findUnique({
    where: { username },
  });

  if (!usuario || usuario.password !== password) {
    return { success: false, error: "Credenciales inválidas" };
  }

  return {
    success: true,
    user: { nombre: usuario.nombre, rol: usuario.rol },
  };
}

/**
 * MÓDULO DE CONTROL ESCOLAR Y GESTIÓN ADMINISTRATIVA
 * Inscribe al estudiante y almacena los datos filiatorios del representante en formato JSONB
 */
export async function registrarEstudiante(formData) {
  const cedulaEscolar = formData.get("cedulaEscolar");
  const nombres = formData.get("nombres");
  const apellidos = formData.get("apellidos");
  const grado = formData.get("grado");
  const seccion = formData.get("seccion");
  const nivelEducativo = formData.get("nivelEducativo");

  const datosRepresentante = {
    nombre: formData.get("nombreRepresentante"),
    cedula: formData.get("cedulaRepresentante"),
    telefono: formData.get("telefonoRepresentante"),
  };

  try {
    await prisma.estudiante.create({
      data: {
        cedulaEscolar,
        nombres,
        apellidos,
        grado,
        seccion,
        nivelEducativo,
        representante: datosRepresentante,
      },
    });

    revalidatePath("/dashboard/control-escolar");
    return { success: true };
  } catch (error) {
    console.error("Error al registrar estudiante:", error);
    return {
      success: false,
      error: "La cédula escolar ya se encuentra registrada.",
    };
  }
}

/**
 * MÓDULO DE GESTIÓN ACADÉMICA
 * Carga notas respetando el régimen pedagógico: cualitativo (Inicial) o cuantitativo 1-20 (Básica)
 */
export async function guardarCalificacion(datos) {
  const { estudianteId, asignatura, lapso, notaNum, notaLit } = datos;

  const scoreNum = notaNum ? parseInt(notaNum, 10) : null;
  const promedioCalculado = scoreNum ? parseFloat(scoreNum) : null;

  try {
    await prisma.calificacion.upsert({
      where: {
        estudianteId_asignatura_lapso: {
          estudianteId,
          asignatura,
          lapso: parseInt(lapso, 10),
        },
      },
      update: {
        notaNum: scoreNum,
        notaLit: notaLit || null,
        promedio: promedioCalculado,
      },
      create: {
        estudianteId,
        asignatura,
        lapso: parseInt(lapso, 10),
        notaNum: scoreNum,
        notaLit: notaLit || null,
        promedio: promedioCalculado,
      },
    });

    revalidatePath("/dashboard/gestion-academica");
    return { success: true };
  } catch (error) {
    console.error("Error al guardar calificación:", error);
    return { success: false, error: "No se pudo procesar la calificación." };
  }
}
