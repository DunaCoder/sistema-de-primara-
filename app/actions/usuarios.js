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

// ========== FUNCIÓN EXISTENTE ==========
export async function crearUsuarioAction(data) {
  try {
    const { username, password, idRol } = data;

    const existe = await prisma.usuario.findUnique({
      where: { username }
    });
    if (existe) {
      return { success: false, error: "El nombre de usuario ya está en uso." };
    }

    const nuevo = await prisma.usuario.create({
      data: {
        username,
        password, // En producción, hashear con bcrypt
        idRol: parseInt(idRol),
        estado: true
      }
    });

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

// ========== NUEVAS FUNCIONES ==========

// Obtener todos los usuarios con su rol
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
        id: 'asc'
      }
    });
    return { success: true, data: usuarios };
  } catch (error) {
    console.error("❌ Error en obtenerUsuarios:", error);
    return { success: false, error: "Error al obtener los usuarios." };
  }
}

// Actualizar un usuario existente
export async function actualizarUsuario(id, data) {
  try {
    const { username, password, idRol, estado } = data;

    // Verificar que el usuario existe
    const existe = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existe) {
      return { success: false, error: "El usuario no existe." };
    }

    // Si se cambia el username, verificar que no esté en uso por otro usuario
    if (username && username !== existe.username) {
      const usernameDuplicado = await prisma.usuario.findUnique({
        where: { username }
      });
      if (usernameDuplicado) {
        return { success: false, error: "El nuevo nombre de usuario ya está en uso." };
      }
    }

    // Construir objeto de actualización solo con los campos que vienen
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (password !== undefined) updateData.password = password; // Hashear en producción
    if (idRol !== undefined) updateData.idRol = parseInt(idRol);
    if (estado !== undefined) updateData.estado = estado;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return { success: true, message: `Usuario ${usuarioActualizado.username} actualizado correctamente.` };
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

// (Opcional) Cambiar solo el estado (activo/inactivo)
export async function cambiarEstadoUsuario(id, estado) {
  try {
    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { estado }
    });
    return { success: true, message: `Estado de ${usuario.username} actualizado.` };
  } catch (error) {
    console.error("❌ Error en cambiarEstadoUsuario:", error);
    return { success: false, error: "Error al cambiar el estado." };
  }
}