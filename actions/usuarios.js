"use server";

import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "./auditoria";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/**
 * Consulta los usuarios uniendo su relación de Rol y Personal
 */
export async function obtenerUsuarios() {
  try {
    const usuarios = await prisma.usuarios.findMany({
      include: {
        roles: true,
        personal: true,
      },
      orderBy: { id_usuario: "asc" },
    });

    const dataFormatted = usuarios.map((u) => ({
      id: u.id_usuario,
      username: u.username,
      nombre: u.personal
        ? `${u.personal.nombre} ${u.personal.apellido}`
        : "Sin Personal",
      cedula: u.personal?.id_personal || "N/A",
      rol: u.roles?.nombre || "SIN ROL",
      idRol: u.id_rol,
      activo: u.estado,
    }));

    return { success: true, data: dataFormatted };
  } catch (error) {
    console.error("Error al consultar usuarios:", error);
    return {
      success: false,
      error: "Error al consultar los usuarios en PostgreSQL.",
    };
  }
}

/**
 * Consulta la lista de roles
 */
export async function obtenerRoles() {
  try {
    const roles = await prisma.roles.findMany({
      orderBy: { id_rol: "asc" },
    });
    return { success: true, data: roles };
  } catch (error) {
    console.error("Error al consultar roles:", error);
    return {
      success: false,
      error: "No se pudieron obtener los roles registrados.",
    };
  }
}

/**
 * Alta de usuario y su registro de Personal con trazabilidad en Bitácora
 */
export async function crearUsuarioAction({
  username,
  password,
  idRol,
  cedula,
  nombre,
  apellido,
  motivoResguardo,
  adminId = null,
  adminNombre = "ADMINISTRADOR",
}) {
  try {
    if (!username || !password || !idRol) {
      return {
        success: false,
        error: "Faltan campos obligatorios para el registro.",
      };
    }

    const existe = await prisma.usuarios.findUnique({
      where: { username: username.trim() },
    });

    if (existe) {
      return {
        success: false,
        error: `El nombre de usuario '${username}' ya existe.`,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const resultado = await prisma.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuarios.create({
        data: {
          username: username.trim(),
          password: hashedPassword,
          id_rol: Number(idRol),
          estado: true,
        },
        include: { roles: true },
      });

      if (cedula && nombre && apellido) {
        await tx.personal.create({
          data: {
            id_personal: String(cedula).trim(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            fecha_ingreso: new Date(),
            id_usuario: nuevoUsuario.id_usuario,
          },
        });
      }

      return nuevoUsuario;
    });

    // Auditoría aislada para no romper la respuesta al usuario si falla la bitácora
    try {
      await registrarAuditoria({
        usuarioId: adminId,
        usuarioNombre: adminNombre,
        rol: "ADMINISTRADOR",
        accion: "CREAR_USUARIO",
        modulo: "USUARIOS",
        detalles: `Se creó el usuario '@${username}' (Rol: ${resultado.roles?.nombre || "N/A"}). Resguardo: ${motivoResguardo || "N/A"}`,
      });
    } catch (auditErr) {
      console.warn("⚠️ No se pudo registrar auditoría de creación:", auditErr);
    }

    revalidatePath("/dashboard/usuarios");

    return {
      success: true,
      message: `Usuario @${username} registrado con éxito.`,
    };
  } catch (error) {
    console.error("Error en crearUsuarioAction:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        error: "La cédula o nombre de usuario ingresado ya existe.",
      };
    }

    return {
      success: false,
      error: "No se pudo registrar el usuario en el sistema.",
    };
  }
}

/**
 * Cambia el estado (activo/inactivo)
 */
export async function cambiarEstadoUsuario(
  idUsuario,
  nuevoEstado,
  adminId = null,
  adminNombre = "ADMINISTRADOR",
) {
  try {
    const usuario = await prisma.usuarios.update({
      where: { id_usuario: Number(idUsuario) },
      data: { estado: Boolean(nuevoEstado) },
    });

    const estatusTexto = nuevoEstado ? "ACTIVADO" : "DESACTIVADO";

    try {
      await registrarAuditoria({
        usuarioId: adminId,
        usuarioNombre: adminNombre,
        rol: "ADMINISTRADOR",
        accion: "CAMBIO_ESTADO_USUARIO",
        modulo: "USUARIOS",
        detalles: `El usuario '@${usuario.username}' cambió su estado a: ${estatusTexto}`,
      });
    } catch (auditErr) {
      console.warn(
        "⚠️ No se pudo registrar auditoría de cambio de estado:",
        auditErr,
      );
    }

    revalidatePath("/dashboard/usuarios");

    return {
      success: true,
      message: `El usuario @${usuario.username} fue ${estatusTexto.toLowerCase()} exitosamente.`,
    };
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return {
      success: false,
      error: "Error al actualizar el estado en la base de datos.",
    };
  }
}

/**
 * Actualiza la contraseña
 */
export async function actualizarUsuario(
  idUsuario,
  { password, adminId = null, adminNombre = "ADMINISTRADOR" },
) {
  try {
    if (!password || password.length < 6) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 6 caracteres.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuarios.update({
      where: { id_usuario: Number(idUsuario) },
      data: { password: hashedPassword },
    });

    try {
      await registrarAuditoria({
        usuarioId: adminId,
        usuarioNombre: adminNombre,
        rol: "ADMINISTRADOR",
        accion: "RESTABLECER_CLAVE",
        modulo: "USUARIOS",
        detalles: `Se restableció la contraseña de acceso del usuario '@${usuario.username}'`,
      });
    } catch (auditErr) {
      console.warn(
        "⚠️ No se pudo registrar auditoría de restablecimiento de clave:",
        auditErr,
      );
    }

    revalidatePath("/dashboard/usuarios");

    return {
      success: true,
      message: `Contraseña de @${usuario.username} actualizada correctamente.`,
    };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return { success: false, error: "No se pudo restablecer la contraseña." };
  }
}
