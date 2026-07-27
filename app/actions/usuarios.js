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

export async function crearUsuarioAction(datos) {
  try {
    // Verificar si el username ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { username: datos.username }
    });

    if (usuarioExistente) {
      return { success: false, error: "El nombre de usuario ya está registrado." };
    }

    // Crear usuario con los campos que existen en el modelo
    await prisma.usuario.create({
      data: {
        username: datos.username,
        password: datos.password, // ⚠️ En producción usa bcrypt
        rol: datos.rol,
        estado: true, // siempre activo al crearlo
      }
    });

    return { success: true, message: `Usuario con rol [${datos.rol}] creado exitosamente.` };

  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    return { success: false, error: "Error en el servidor. Verifica los campos del formulario." };
  }
}