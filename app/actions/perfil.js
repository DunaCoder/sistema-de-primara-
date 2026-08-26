// app/actions/perfil.js
"use server";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function obtenerPerfilAction(idUsuario) {
  console.log("📥 ID recibido:", idUsuario, "Tipo:", typeof idUsuario);

  try {
    // Validación simple
    if (!idUsuario) {
      console.error("❌ ID vacío");
      return { success: false, error: "ID de usuario requerido." };
    }

    const id = parseInt(idUsuario);
    if (isNaN(id)) {
      console.error("❌ ID no es número:", idUsuario);
      return { success: false, error: "ID inválido." };
    }

    console.log("🔍 Buscando usuario con ID:", id);

    // 🔥 CONSULTA SIMPLE: sin relaciones, solo usuario
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: id },
    });

    console.log("📦 Resultado de findUnique:", usuario);

    if (!usuario) {
      console.error("❌ Usuario no encontrado para ID:", id);
      return { success: false, error: `Usuario con ID ${id} no encontrado.` };
    }

    // ✅ Éxito: devolvemos solo lo que existe
    return {
      success: true,
      data: {
        idUsuario: usuario.idUsuario,
        username: usuario.username,
        rol: usuario.rol,
        estado: usuario.estado,
        // Sin nombre/apellido/email porque no están en Usuario
      },
    };
  } catch (error) {
    console.error("❌ ERROR DETALLADO:", error);
    console.error("Stack trace:", error.stack);
    return {
      success: false,
      error: `Error en servidor: ${error.message}`,
    };
  }
}
