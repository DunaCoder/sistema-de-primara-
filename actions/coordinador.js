"use server";

import { prisma } from "@/lib/prisma";

// 1. Cargar datos para los selects
export async function getDatosAsignacion() {
  try {
    const docentes = await prisma.personal.findMany({
      select: { idPersonal: true, nombre: true, apellido: true },
    });

    const grados = await prisma.gradoSeccion.findMany({
      select: { idGradoSeccion: true, grado: true, seccion: true },
    });

    const materias = await prisma.materia.findMany({
      select: { idMateria: true, nombre: true, grado: true },
    });

    return { success: true, docentes, grados, materias };
  } catch (error) {
    console.error("❌ Error en getDatosAsignacion:", error);
    return { success: false, error: "Error al cargar listas de asignación." };
  }
}

// 2. Guardar asignación (Soporta individual o integral)
export async function guardarAsignacionDocente(data) {
  try {
    const { idDocente, idGradoSeccion, modoIntegral, idMateria, materiasSeleccionadas } = data;
    const numDocente = Number(idDocente);
    const numGradoSeccion = Number(idGradoSeccion);

    // Si es Integral (asigna todas las materias del grado de un golpe)
    if (modoIntegral) {
      const seccionInfo = await prisma.gradoSeccion.findUnique({
        where: { idGradoSeccion: numGradoSeccion },
      });

      if (!seccionInfo) return { success: false, error: "La sección no existe." };

      const materiasDelGrado = await prisma.materia.findMany({
        where: { grado: seccionInfo.grado },
      });

      for (const mat of materiasDelGrado) {
        const existe = await prisma.asignacionDocente.findFirst({
          where: { idDocente: numDocente, idGradoSeccion: numGradoSeccion, idMateria: mat.idMateria },
        });

        if (!existe) {
          await prisma.asignacionDocente.create({
            data: { idDocente: numDocente, idGradoSeccion: numGradoSeccion, idMateria: mat.idMateria },
          });
        }
      }
      return { success: true, message: "Asignación integral completada." };
    } 
    
    // Si es por Materia Individual
    else {
      const lista = materiasSeleccionadas || [Number(idMateria)];

      for (const matId of lista) {
        const numMateria = Number(matId);
        const existe = await prisma.asignacionDocente.findFirst({
          where: { idDocente: numDocente, idGradoSeccion: numGradoSeccion, idMateria: numMateria },
        });

        if (!existe) {
          await prisma.asignacionDocente.create({
            data: { idDocente: numDocente, idGradoSeccion: numGradoSeccion, idMateria: numMateria },
          });
        }
      }
      return { success: true, message: "Asignación guardada correctamente." };
    }
  } catch (error) {
    console.error("❌ Error en guardarAsignacionDocente:", error);
    return { success: false, error: "No se pudo guardar la asignación." };
  }
}