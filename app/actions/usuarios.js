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
  console.log("📥 [ACTION] Ejecutando obtenerUsuarios...");
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: true // Trae la relación con la tabla roles
      },
      orderBy: {
        idUsuario: 'asc'
      }
    });

    console.log(`🔍 [ACTION] Total de usuarios encontrados en DB: ${usuarios.length}`);
    if (usuarios.length > 0) {
      console.log("🔍 [ACTION] Ejemplo de objeto crudo devuelto por Prisma:", usuarios[0]);
    }

    // Transformamos los datos asegurando capturar el ID sin importar cómo lo devuelva Prisma
    const dataFormateada = usuarios.map(u => ({
      id: u.idUsuario ?? u.id_usuario ?? u.id, // 👈 Captura segura del ID
      username: u.username,
      activo: u.estado,
      rol: u.rol?.nombre || ''
    }));

    console.log("✅ [ACTION] Datos formateados para el Frontend:", dataFormateada);
    return { success: true, data: dataFormateada };
  } catch (error) {
    console.error("❌ Error en obtenerUsuarios:", error);
    return { success: false, error: error.message };
  }
}

// ========== ACTUALIZAR USUARIO ==========
export async function actualizarUsuario(id, data) {
  console.log("📥 [ACTION] actualizarUsuario llamado con ID:", id);
  console.log("📥 [ACTION] Datos de actualización recibidos:", data);

  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      console.error("❌ [ACTION] El ID proporcionado no es un número válido:", id);
      return { success: false, error: "ID de usuario inválido." };
    }

    const { username, password, idRol, estado } = data;

    const existe = await prisma.usuario.findUnique({
      where: { id_usuario: parsedId }
    });
    
    if (!existe) {
      console.warn("⚠️ [ACTION] Usuario no encontrado con ID:", parsedId);
      return { success: false, error: "El usuario no existe." };
    }

    if (username && username !== existe.username) {
      const duplicado = await prisma.usuario.findUnique({
        where: { username }
      });
      if (duplicado) {
        console.warn("⚠️ [ACTION] El nuevo username ya está ocupado:", username);
        return { success: false, error: "El nuevo nombre de usuario ya está en uso." };
      }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (password !== undefined) updateData.password = password;
    if (idRol !== undefined) updateData.idRol = parseInt(idRol);
    if (estado !== undefined) updateData.estado = estado;

    console.log("🛠️ [ACTION] Objeto final preparado para Prisma update:", updateData);

    const actualizado = await prisma.usuario.update({
      where: { id_usuario: parsedId },
      data: updateData
    });

    console.log("✅ [ACTION] Usuario actualizado correctamente en DB:", actualizado.username);
    return { success: true, message: `Usuario ${actualizado.username} actualizado correctamente.` };
  } catch (error) {
    console.error("❌ Error en actualizarUsuario:", error);
    let mensaje = "Error interno al actualizar el usuario.";
    if (error.code === 'P2002') mensaje = "El nombre de usuario ya existe.";
    else if (error.code === 'P2003') mensaje = "El rol seleccionado no existe.";
    else if (error.code === 'P2025') mensaje = "El usuario no existe.";
    return { success: false, error: mensaje };
  }
}

// ========== CAMBIAR ESTADO ==========
export async function cambiarEstadoUsuario(id, estado) {
  console.log(`📥 [ACTION] cambiarEstadoUsuario -> ID: ${id}, Nuevo estado: ${estado}`);
  try {
    const parsedId = parseInt(id);
    const usuario = await prisma.usuario.update({
      where: { id_usuario: parsedId },
      data: { estado }
    });
    console.log(`✅ [ACTION] Estado cambiado con éxito para: ${usuario.username}`);
    return { success: true, message: `Estado de ${usuario.username} actualizado.` };
  } catch (error) {
    console.error("❌ Error en cambiarEstadoUsuario:", error);
    return { success: false, error: "Error al cambiar el estado." };
  }
}