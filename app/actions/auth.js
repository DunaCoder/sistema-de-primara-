// app/actions/auth.js
'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

// Levantamos el pool con el adapter compatible con tu entorno de Prisma 7
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function loginAction(username, password) {
  try {
    // 1. Buscar al usuario incluyendo su rol relacionado
    const usuario = await prisma.usuario.findUnique({
      where: { username: username },
      include: {
        rol: true, // 👈 Trae los datos de la tabla 'Rol'
      },
    });

    // 2. Validaciones básicas
    if (!usuario) {
      return { success: false, error: "El usuario no existe." };
    }

    if (!usuario.estado) {
      return { success: false, error: "Este usuario se encuentra inactivo." };
    }

    // 3. Verificar contraseña (texto plano por ahora)
    if (usuario.password !== password) {
      return { success: false, error: "Contraseña incorrecta." };
    }

    // 4. Buscar datos personales (opcional)
    const datosPersonales = await prisma.personal.findUnique({
      where: { idUsuario: usuario.idUsuario },
    });

    // 5. Retornar datos con el nombre del rol en texto
    return {
      success: true,
      user: {
        idUsuario: usuario.idUsuario,
        username: usuario.username,
        rol: usuario.rol.nombre, // 👈 Aquí está el cambio clave
        nombreCompleto: datosPersonales
          ? `${datosPersonales.nombre} ${datosPersonales.apellido}`
          : "Usuario del Sistema",
      },
    };
  } catch (error) {
    console.error("❌ Error en loginAction:", error);
    return { success: false, error: "Error interno en el servidor." };
  }
}