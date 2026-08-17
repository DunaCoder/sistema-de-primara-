// app/actions/usuarios.js
'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ========== CREAR USUARIO ==========
export async function crearUsuarioAction(data) {
  console.log("📥 [ACTION] crearUsuarioAction recibió datos:", data);
  try {
    const { username, password, idRol } = data;

    const existe = await prisma.usuario.findUnique({
      where: { username }
    });
    
    if (existe) {
      console.warn("⚠️ [ACTION] El username ya existe:", username);
      return { success: false, error: "El nombre de usuario ya está en uso." };
    }

    const nuevo = await prisma.usuario.create({
      data: {
        username,
        password, // Nota: En producción, hashear con bcrypt/argon2
        idRol: parseInt(idRol, 10),
        estado: true
      }
    });

    console.log("✅ [ACTION] Usuario creado con éxito:", nuevo.username);
    return { success: true, message: `Usuario ${nuevo.username} creado exitosamente.` };
  } catch (error) {
    console.error("❌ Error en crearUsuarioAction:", error);
    let mensaje = "Error interno al crear el usuario.";
    if (error.code === 'P2002') {
      mensaje = "El nombre de usuario ya existe (violación de unicidad).";
    } else if (error.code === 'P2003') {
      mensaje = "El rol seleccionado no existe en la base de datos.";
    }
    return { success: false, error: mensaje };
  }
}

// ========== OBTENER TODOS LOS USUARIOS ==========
export async function obtenerUsuarios() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        idUsuario: 'asc'
      }
    });

    const dataFormateada = usuarios.map(u => ({
      id: u.idUsuario ?? u.id_usuario ?? u.id,
      username: u.username,
      activo: u.estado,
      idRol: u.idRol ?? u.rolId ?? u.rol?.idRol,
      rol: u.rol?.nombre || ''
    }));

    return { success: true, data: dataFormateada };
  } catch (error) {
    console.error("❌ Error en obtenerUsuarios:", error);
    return { success: false, error: error.message || "Error al obtener los usuarios." };
  }
}

// ========== OBTENER ROLES DISPONIBLES ==========
export async function obtenerRoles() {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: { idRol: 'asc' }
    });
    return { success: true, data: roles };
  } catch (error) {
    console.error("❌ Error en obtenerRoles:", error);
    return { success: false, error: error.message || "Error al obtener roles." };
  }
}

// ========== ACTUALIZAR USUARIO ==========
export async function actualizarUsuario(id, data) {
  try {
    const { username, password, idRol, activo, estado } = data;
    const userId = Number(id);

    // Verificar que el usuario existe
    const existe = await prisma.usuario.findUnique({
      where: { idUsuario: userId }
    });

    if (!existe) {
      return { success: false, error: "El usuario no existe." };
    }

    // Si se cambia el username, verificar disponibilidad
    if (username && username !== existe.username) {
      const usernameDuplicado = await prisma.usuario.findUnique({
        where: { username }
      });
      if (usernameDuplicado) {
        return { success: false, error: "El nuevo nombre de usuario ya está en uso." };
      }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (password !== undefined && password.trim() !== '') updateData.password = password;
    if (idRol !== undefined) updateData.idRol = Number(idRol);
    if (activo !== undefined) updateData.estado = activo;
    else if (estado !== undefined) updateData.estado = estado;

    const usuarioActualizado = await prisma.usuario.update({
      where: { idUsuario: userId },
      data: updateData
    });

    return { 
      success: true, 
      message: `Usuario ${usuarioActualizado.username} actualizado correctamente.` 
    };
  } catch (error) {
    console.error("❌ Error en actualizarUsuario:", error);
    let mensaje = "Error interno al actualizar el usuario.";
    if (error.code === 'P2002') {
      mensaje = "El nombre de usuario ya existe (violación de unicidad).";
    } else if (error.code === 'P2003') {
      mensaje = "El rol seleccionado no existe en la base de datos.";
    } else if (error.code === 'P2025') {
      mensaje = "El usuario que intentas actualizar no existe.";
    }
    return { success: false, error: mensaje };
  }
}

// ========== CAMBIAR ESTADO DE USUARIO ==========
export async function cambiarEstadoUsuario(id, estado) {
  try {
    const usuario = await prisma.usuario.update({
      where: { idUsuario: Number(id) },
      data: { estado }
    });
    return { success: true, message: `Estado de ${usuario.username} actualizado.` };
  } catch (error) {
    console.error("❌ Error en cambiarEstadoUsuario:", error);
    return { success: false, error: "Error al cambiar el estado." };
  }
}