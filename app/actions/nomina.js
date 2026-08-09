// app/actions/usuarios.js
'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function obtenerUsuarios() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        idUsuario: true,
        username: true,
        rol: true,
        estado: true,
        // Descomenta si tu relación en el esquema de Prisma se llama "personal"
        /*
        personal: {
          select: {
            cedula: true,
            nombre: true,
            apellido: true,
          }
        }
        */
      },
      orderBy: {
        idUsuario: 'desc',
      },
    });

    // Mapeamos para mantener compatibilidad si el frontend usa 'id' o 'activo'
    const dataFormateada = usuarios.map((u) => ({
      ...u,
      id: u.idUsuario,
      activo: u.estado === 'ACTIVO' || u.estado === true,
    }));

    return { success: true, data: dataFormateada };
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    return { 
      success: false, 
      error: "Error de servidor al consultar la lista de usuarios." 
    };
  }
}

export async function actualizarUsuario({ id, username, activo }) {
  try {
    if (!id) {
      return { success: false, error: "El ID del usuario es requerido." };
    }

    // Armamos el objeto con los campos opcionales recibidos
    const dataToUpdate = {};

    if (username !== undefined) {
      const usernameLimpio = username.toLowerCase().replace(/\s+/g, '');
      
      // Validar si el username ya está en uso por otro usuario
      const existe = await prisma.usuario.findFirst({
        where: {
          username: usernameLimpio,
          NOT: { idUsuario: Number(id) }
        }
      });

      if (existe) {
        return { success: false, error: "El nombre de usuario ya se encuentra registrado." };
      }

      dataToUpdate.username = usernameLimpio;
    }

    if (activo !== undefined) {
      // Si tu esquema de DB usa Boolean para estado usa: activo (Boolean)
      // Si usa un String de Enum o VARCHAR usa: activo ? 'ACTIVO' : 'INACTIVO'
      dataToUpdate.estado = typeof activo === 'boolean' 
        ? (activo ? 'ACTIVO' : 'INACTIVO') 
        : activo;
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: {
        idUsuario: Number(id),
      },
      data: dataToUpdate,
    });

    return {
      success: true,
      message: "Usuario actualizado correctamente.",
      data: usuarioActualizado,
    };
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    return {
      success: false,
      error: "No se pudo actualizar la información del usuario en la base de datos.",
    };
  }
}