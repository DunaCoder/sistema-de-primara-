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
  console.log("📥 [ACTION] crearUsuarioAction recibio datos:", data);
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
        password,
        idRol: parseInt(idRol),
        estado: true
      }
    });

    console.log("✅ [ACTION] Usuario creado con éxito:", nuevo.username);
    return { success: true, message: `Usuario ${nuevo.username} creado exitosamente.` };
  } catch (error) {
    console.error("❌ Error en crearUsuarioAction:", error);
    let mensaje = "Error interno al crear el usuario.";
    if (error.code === 'P2002') mensaje = "El nombre de usuario ya existe.";
    else if (error.code === 'P2003') mensaje = "El rol seleccionado no existe.";
    return { success: false, error: mensaje };
  }
}

// ========== OBTENER TODOS LOS USUARIOS ==========
export async function obtenerUsuarios() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: true 
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
  }
}

// ========== ACTUALIZAR USUARIO ==========
export async function actualizarUsuario(id, data) {
  try {
    const updateData = {};
    
    if (data.username !== undefined) {
      updateData.username = data.username;
    }
    if (data.activo !== undefined) {
      updateData.estado = data.activo;
    }
    if (data.idRol !== undefined) {
      updateData.idRol = Number(data.idRol);
    }

    await prisma.usuario.update({
      where: { idUsuario: Number(id) },
      data: updateData
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    return { success: false, error: error.message };
  }
}