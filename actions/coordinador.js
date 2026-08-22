// app/actions/coordinador.js
'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 1. Cargar datos necesarios para los combos/selects
export async function getDatosAsignacion() {
  try {
    const docentes = await prisma.personal.findMany({
      select: {
        idPersonal: true,
        nombre: true,
        apellido: true,
      },
    });

    const grados = await prisma.gradoSeccion.findMany({
      select: {
        idGradoSeccion: true,
        grado: true,
        seccion: true,
      },
    });

    const materias = await prisma.materia.findMany({
      select: {
        idMateria: true,
        nombre: true,
      },
    });

    return {
      success: true,
      docentes,
      grados,
      materias,
    };
  } catch (error) {
    console.error("❌ Error en getDatosAsignacion:", error);
    return { success: false, error: "Error al cargar listas de asignación." };
  }
}

// 2. Procesar y guardar la nueva asignación
export async function guardarAsignacionDocente(data) {
  try {
    const { idDocente, idGradoSeccion, idMateria } = data;

    const existe = await prisma.asignacionDocente.findFirst({
      where: {
        idDocente: idDocente,
        idGradoSeccion: Number(idGradoSeccion),
        idMateria: Number(idMateria),
      },
    });

    if (existe) {
      return {
        success: false,
        error: "Esta materia ya está asignada a este docente en esta sección.",
      };
    }

    await prisma.asignacionDocente.create({
      data: {
        idDocente: idDocente,
        idGradoSeccion: Number(idGradoSeccion),
        idMateria: Number(idMateria),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error en guardarAsignacionDocente:", error);
    return { success: false, error: "No se pudo guardar la asignación." };
  }
}