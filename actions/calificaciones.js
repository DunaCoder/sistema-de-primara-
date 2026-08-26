"use server";

// 1. Acción para consultar la nómina oficial (cargada por Secretaría)
export async function obtenerEstudiantesPorSeccion({
  gradoSeccion,
  materia,
  lapso,
}) {
  try {
    // AQUÍ REALIZAS LA CONSULTA A TU BASE DE DATOS (ej. Prisma, Drizzle, SQL)
    // Ejemplo de consulta conceptual:
    // const estudiantesBD = await db.estudiantes.findMany({ where: { gradoSeccion } });

    // Datos simulados estructurados tal como los espera tu interfaz:
    const dataMock = [
      {
        idInscripcion: 1,
        nombre: "Aular Pérez, María Alejandra",
        literal: "A",
        apreciacion: "Demuestra alto compromiso y participación activa.",
      },
      {
        idInscripcion: 2,
        nombre: "Blanco Gómez, Juan José",
        literal: "B",
        apreciacion: "Consolida progresivamente las competencias de lectura.",
      },
      {
        idInscripcion: 3,
        nombre: "Colmenares Silva, Sofía",
        literal: "",
        apreciacion: "",
      },
    ];

    return { ok: true, data: dataMock };
  } catch (error) {
    console.error("Error al obtener nómina:", error);
    return {
      ok: false,
      error: "No se pudo cargar la lista de estudiantes.",
      data: [],
    };
  }
}

// 2. Acción para guardar/actualizar todas las notas de la plantilla de una sola vez
export async function guardarCalificacionesSeccion(payload) {
  try {
    const { gradoSeccion, materiaId, lapso, calificaciones } = payload;

    // AQUÍ GUARDAS O ACTUALIZAS CADA REGISTRO EN LA BASE DE DATOS
    /*
    for (const item of calificaciones) {
      await db.calificaciones.upsert({
        where: { idInscripcion_materiaId_lapso: { idInscripcion: item.idInscripcion, materiaId, lapso } },
        update: { literal: item.literal, apreciacion: item.apreciacion },
        create: { idInscripcion: item.idInscripcion, materiaId, lapso, literal: item.literal, apreciacion: item.apreciacion }
      });
    }
    */

    console.log(
      `[EXITO] Calificaciones de la sección ${gradoSeccion} procesadas correctamente.`,
    );

    return { ok: true, message: "Calificaciones guardadas exitosamente." };
  } catch (error) {
    console.error("Error al guardar calificaciones:", error);
    return {
      ok: false,
      error: "Ocurrió un error en el servidor al guardar la plantilla.",
    };
  }
}
