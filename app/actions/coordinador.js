"use server";

import { prisma } from "@/lib/prisma";

// Lista de respaldo para asegurar que las materias de primaria siempre estén disponibles
const MATERIAS_PREDETERMINADAS = [
  { nombre: "Lengua y Literatura" },
  { nombre: "Matemática" },
  { nombre: "Ciencias Naturales" },
  { nombre: "Ciencias Sociales" },
  { nombre: "Educación Física y Deportes" },
  { nombre: "Educación Musical" },
  { nombre: "Computación e Informática" },
  { nombre: "Inglés" },
];

export async function getDatosAsignacion() {
  try {
    // 1. Obtener personal/docentes
    let personalDocentes = await prisma.personal.findMany({
      where: {
        usuario: {
          rol: {
            nombre: {
              contains: "docente",
              mode: "insensitive",
            },
          },
        },
      },
    });

    if (personalDocentes.length === 0) {
      personalDocentes = await prisma.personal.findMany();
    }

    const docentes = personalDocentes.map((p) => ({
      idPersonal: p.idPersonal,
      nombre: p.nombre,
      apellido: p.apellido,
      cedula: p.idPersonal,
    }));

    // 2. Traer materias de la BD. Si está vacía, la poblamos automáticamente.
    let materiasBD = await prisma.materia.findMany({
      orderBy: { idMateria: "asc" },
    });

    if (materiasBD.length === 0) {
      await prisma.materia.createMany({
        data: MATERIAS_PREDETERMINADAS,
      });
      materiasBD = await prisma.materia.findMany({
        orderBy: { idMateria: "asc" },
      });
    }

    // 3. Traer asignaciones con sus relaciones (Nombres reales de docente, materia y sección)
    const asignacionesBD = await prisma.asignacionDocente.findMany({
      include: {
        docente: true,
        gradoSeccion: true,
        materia: true,
      },
      orderBy: { idAsignacion: "desc" },
    });

    return {
      success: true,
      docentes,
      materias: materiasBD,
      asignaciones: asignacionesBD,
    };
  } catch (error) {
    console.error("❌ Error en getDatosAsignacion:", error);
    return { success: false, error: "Error al consultar datos iniciales." };
  }
}

export async function guardarAsignacionDocente(data) {
  try {
    const { idDocente, grado, seccion, idMateria } = data;

    const gradoNum = String(grado).trim();
    const seccionTxt = String(seccion).trim().toUpperCase();

    // Buscar o crear la combinación de Grado y Sección
    let gradoSeccion = await prisma.gradoSeccion.findFirst({
      where: {
        AND: [
          {
            OR: [
              { grado: { contains: gradoNum, mode: "insensitive" } },
              { grado: { equals: `${gradoNum}° Grado` } },
            ],
          },
          { seccion: { equals: seccionTxt, mode: "insensitive" } },
        ],
      },
    });

    if (!gradoSeccion) {
      gradoSeccion = await prisma.gradoSeccion.create({
        data: {
          grado: `${gradoNum}° Grado`,
          seccion: seccionTxt,
        },
      });
    }

    // Crear asignación en la base de datos
    await prisma.asignacionDocente.create({
      data: {
        idDocente: String(idDocente),
        idGradoSeccion: Number(gradoSeccion.idGradoSeccion),
        idMateria: Number(idMateria),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error exacto en guardarAsignacionDocente:", error);
    return {
      success: false,
      error:
        error.code === "P2002"
          ? "Este docente ya tiene asignada esa materia en este grado y sección."
          : "No se pudo guardar la asignación en la base de datos.",
    };
  }
}
