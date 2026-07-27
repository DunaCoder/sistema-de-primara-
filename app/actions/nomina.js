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
        // Si quieres mostrar datos del Personal, usa "include" en lugar de "select"
        // include: { personal: { select: { nombre: true, apellido: true, email: true } } }
      },
      orderBy: {
        idUsuario: 'desc',
      },
    });

    return { success: true, data: usuarios };
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    return { 
      success: false, 
      error: "Error de servidor al consultar la lista de usuarios." 
    };
  }
}