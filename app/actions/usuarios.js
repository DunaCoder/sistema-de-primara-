'use server';

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * Función de Auditoría interna integrada (sin dependencias externas)
 */
async function registrarAuditoria({ usuarioId, usuarioNombre, rol, accion, modulo, detalles }) {
  try {
    console.log(`[BITÁCORA LOG] ${accion} | @${usuarioNombre} (${rol}) | ${detalles}`);
  } catch (err) {
    console.warn("No se pudo registrar la traza en la Bitácora:", err);
  }
}

/**
 * Consulta los usuarios uniendo su relación de Rol y Personal
 */
export async function obtenerUsuarios() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: true,
        personal: true,
      },
      orderBy: { idUsuario: 'asc' },
    });

    const dataFormatted = usuarios.map((u) => ({
      id: u.idUsuario,
      username: u.username,
      nombre: u.personal ? `${u.personal.nombre} ${u.personal.apellido}` : 'Sin Personal',
      cedula: u.personal?.idPersonal ? String(u.personal.idPersonal) : 'N/A',
      rol: u.rol?.nombre || 'SIN ROL',
      idRol: u.idRol,
      activo: u.estado,
    }));

    return { success: true, data: dataFormatted };
  } catch (error) {
    console.error("Error al consultar usuarios en PostgreSQL:", error);
    return { 
      success: false, 
      error: `Error al consultar los usuarios en PostgreSQL: ${error.message}` 
    };
  }
}

/**
 * Consulta la lista de roles
 */
export async function obtenerRoles() {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: { idRol: 'asc' },
    });
    return { success: true, data: roles };
  } catch (error) {
    console.error("Error al consultar roles:", error);
    return { success: false, error: "No se pudieron obtener los roles registrados." };
  }
}

/**
 * Alta de un usuario Y su registro de Personal
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
  adminNombre = 'ADMINISTRADOR'
}) {
  try {
    if (!username || !password || !idRol) {
      return { success: false, error: "Faltan campos obligatorios para el registro." };
    }

    const cleanUsername = username.trim();
    const cleanCedula = cedula ? String(cedula).trim() : null;

    const existe = await prisma.usuario.findUnique({
      where: { username: cleanUsername },
    });

    if (existe) {
      return { success: false, error: `El nombre de usuario '${cleanUsername}' ya existe.` };
    }

    if (cleanCedula) {
      const personalExiste = await prisma.personal.findUnique({
        where: { idPersonal: cleanCedula },
      });
      if (personalExiste) {
        return { success: false, error: `La cédula '${cleanCedula}' ya pertenece a otro registro de Personal.` };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const resultado = await prisma.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuario.create({
        data: {
          username: cleanUsername,
          password: hashedPassword,
          idRol: Number(idRol),
          estado: true,
          debeCambiarPassword: true,
        },
        include: { rol: true },
      });

      if (cleanCedula && nombre && apellido) {
        await tx.personal.create({
          data: {
            idPersonal: cleanCedula,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            fechaIngreso: new Date(),
            idUsuario: nuevoUsuario.idUsuario,
          },
        });
      }

      return nuevoUsuario;
    });

    await registrarAuditoria({
      usuarioId: adminId,
      usuarioNombre: adminNombre,
      rol: 'ADMINISTRADOR',
      accion: 'CREAR_USUARIO',
      modulo: 'USUARIOS',
      detalles: `Se creó el usuario '@${cleanUsername}' (Rol: ${resultado.rol.nombre}). Resguardo: ${motivoResguardo || 'N/A'}`,
    });

    return { success: true, message: `Usuario @${cleanUsername} registrado con éxito.` };
  } catch (error) {
    console.error("Error en crearUsuarioAction:", error);

    if (error.code === 'P2002') {
      return { success: false, error: "Conflicto de duplicidad: La cédula o el usuario ya están en uso." };
    }

    return { success: false, error: `Error en base de datos: ${error.message}` };
  }
}

/**
 * Action para Desincorporar Usuario
 */
export async function desincorporarUsuarioAction({ 
  idUsuario, 
  motivoDesincorporacion, 
  adminId = null, 
  adminNombre = 'ADMINISTRADOR' 
}) {
  try {
    if (!idUsuario || !motivoDesincorporacion || motivoDesincorporacion.trim().length < 10) {
      return { 
        success: false, 
        error: "Debe proporcionar una justificación detallada de al menos 10 caracteres para efectuar la baja." 
      };
    }

    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: Number(idUsuario) },
      include: { personal: true, rol: true },
    });

    if (!usuario) {
      return { success: false, error: "El usuario a desincorporar no existe en la base de datos." };
    }

    await prisma.usuario.update({
      where: { idUsuario: Number(idUsuario) },
      data: { estado: false },
    });

    const detalleAuditoria = `DESINCORPORACIÓN DE USUARIO: @${usuario.username} (${usuario.rol?.nombre || 'SIN ROL'}). ` +
      `Personal: ${usuario.personal ? `${usuario.personal.nombre} ${usuario.personal.apellido}` : 'Sin datos de personal'}. ` +
      `Cédula: ${usuario.personal?.idPersonal || 'N/A'}. ` +
      `JUSTIFICACIÓN/MOTIVO DE BAJA: ${motivoDesincorporacion.trim()}`;

    await registrarAuditoria({
      usuarioId: adminId,
      usuarioNombre: adminNombre,
      rol: 'ADMINISTRADOR',
      accion: 'DESINCORPORAR_USUARIO',
      modulo: 'USUARIOS',
      detalles: detalleAuditoria,
    });

    return { 
      success: true, 
      message: `El usuario @${usuario.username} fue desincorporado exitosamente y la evidencia se registró en la Bitácora.` 
    };
  } catch (error) {
    console.error("Error al desincorporar usuario:", error);
    return { success: false, error: `Error en base de datos: ${error.message}` };
  }
}