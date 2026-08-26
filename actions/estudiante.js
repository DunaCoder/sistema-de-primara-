"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registrarEstudianteCompleto(datos) {
  try {
    // ----------------------------------------------------------------------
    // 1. EXTRAER Y CORREGIR TAMAÑO DE NACIONALIDAD (Máx 1 carácter)
    // ----------------------------------------------------------------------
    const rawNacEst = datos.nacionalidadEstudiante || datos.nacionalidad || "V";
    // Se extrae únicamente la primera letra en mayúscula ('V' o 'E')
    const estNacionalidad =
      rawNacEst.toString().trim().charAt(0).toUpperCase() || "V";

    const estCedulaNum = (
      datos.cedulaEstudiante ||
      datos.cedulaEscolar ||
      datos.cedula ||
      datos.documentoEstudiante ||
      ""
    )
      .toString()
      .trim();

    // ID del estudiante
    const estId = estCedulaNum
      ? `${estNacionalidad}-${estCedulaNum}`
      : `S/C-${Date.now()}`;

    const estNombre = (datos.nombreEstudiante || datos.nombre || "").trim();
    const estApellido = (
      datos.apellidoEstudiante ||
      datos.apellido ||
      ""
    ).trim();
    const estFechaNac = datos.fechaNacimiento
      ? new Date(datos.fechaNacimiento)
      : new Date();

    // ----------------------------------------------------------------------
    // 2. EXTRAER DATOS DEL REPRESENTANTE
    // ----------------------------------------------------------------------
    const rawNacRep =
      datos.nacionalidadRepresentante || datos.repNacionalidad || "V";
    const repNacionalidad =
      rawNacRep.toString().trim().charAt(0).toUpperCase() || "V";

    const repCedulaNum = (
      datos.cedulaRepresentante ||
      datos.repCedula ||
      datos.cedulaRep ||
      ""
    )
      .toString()
      .trim();

    const repId = repCedulaNum
      ? `${repNacionalidad}-${repCedulaNum}`
      : `REP-S/C-${Date.now()}`;

    const repNombre = (
      datos.nombreRepresentante ||
      datos.repNombre ||
      ""
    ).trim();
    const repApellido = (
      datos.apellidoRepresentante ||
      datos.repApellido ||
      ""
    ).trim();
    const repTelefono = (
      datos.telefonoRepresentante ||
      datos.repTelefono ||
      ""
    ).trim();
    const repCorreo = (
      datos.emailRepresentante ||
      datos.repCorreo ||
      datos.email ||
      ""
    ).trim();
    const repDireccion = (
      datos.direccionRepresentante ||
      datos.repDireccion ||
      ""
    ).trim();

    // ----------------------------------------------------------------------
    // 3. VERIFICAR EXISTENCIA DEL ESTUDIANTE
    // ----------------------------------------------------------------------
    if (!estId.startsWith("S/C-")) {
      const estudianteExistente = await prisma.estudiante.findUnique({
        where: { idEstudiante: estId },
      });

      if (estudianteExistente) {
        return {
          success: false,
          mensaje: `El estudiante con el documento ${estId} ya se encuentra registrado.`,
        };
      }
    }

    // ----------------------------------------------------------------------
    // 4. BUSCAR O CREAR REPRESENTANTE
    // ----------------------------------------------------------------------
    let representante = await prisma.representante.findUnique({
      where: { idRepresentante: repId },
    });

    if (!representante) {
      representante = await prisma.representante.create({
        data: {
          idRepresentante: repId,
          nombre: repNombre || "S/N",
          apellido: repApellido || "S/A",
          telefono: repTelefono || "S/T",
          email: repCorreo || null,
          direccion: repDireccion || "Sin dirección",
        },
      });
    }

    // ----------------------------------------------------------------------
    // 5. CREAR ESTUDIANTE (Garantizando nacionalidad de 1 carácter)
    // ----------------------------------------------------------------------
    const estudiante = await prisma.estudiante.create({
      data: {
        idEstudiante: estId,
        nacionalidad: estNacionalidad, // Guarda únicamente "V" o "E"
        cedulaEscolar: estCedulaNum.substring(0, 12) || null, // Recorta al máximo de VarChar(12)
        nombre: estNombre || "Sin Nombre",
        apellido: estApellido || "Sin Apellido",
        fechaNacimiento: estFechaNac,
        idRepresentante: representante.idRepresentante,
      },
    });

    // ----------------------------------------------------------------------
    // 6. ASIGNACIÓN DE GRADO / SECCIÓN
    // ----------------------------------------------------------------------
    let gradoSeccionObj = null;
    const idGSFormulario = Number(datos.idGradoSeccion || datos.gradoSeccionId);

    if (idGSFormulario) {
      gradoSeccionObj = await prisma.gradoSeccion.findUnique({
        where: { idGradoSeccion: idGSFormulario },
      });
    }

    if (!gradoSeccionObj) {
      gradoSeccionObj = await prisma.gradoSeccion.findFirst();
    }

    if (!gradoSeccionObj) {
      let docenteDefecto = await prisma.personal.findFirst();
      if (!docenteDefecto) {
        docenteDefecto = await prisma.personal.create({
          data: {
            idPersonal: "V-00000000",
            nombre: "Docente",
            apellido: "Guía",
            fechaIngreso: new Date(),
          },
        });
      }

      gradoSeccionObj = await prisma.gradoSeccion.create({
        data: {
          grado: "1er Grado",
          seccion: "A",
          idDocenteGuia: docenteDefecto.idPersonal,
        },
      });
    }

    // ----------------------------------------------------------------------
    // 7. CREAR INSCRIPCIÓN
    // ----------------------------------------------------------------------
    await prisma.inscripcion.create({
      data: {
        idEstudiante: estudiante.idEstudiante,
        idGradoSeccion: gradoSeccionObj.idGradoSeccion,
        anioEscolar: "2025-2026",
      },
    });

    // ----------------------------------------------------------------------
    // 8. REVALIDAR VISTAS
    // ----------------------------------------------------------------------
    revalidatePath("/dashboard/matricula");
    revalidatePath("/dashboard/gestion");
    revalidatePath("/dashboard/inscripciones");

    return {
      success: true,
      mensaje: "Estudiante e inscripción registrados exitosamente.",
    };
  } catch (error) {
    console.error("ERROR_REGISTRO_ESTUDIANTE:", error);
    return {
      success: false,
      mensaje: `Error en la base de datos: ${error.message}`,
    };
  }
}
