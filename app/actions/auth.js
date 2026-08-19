// app/actions/auth.js
'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mapeo de rutas iniciales por rol
const RUTAS_INICIALES = {
  'Coordinador': '/dashboard/asignaciones',
  'Administrador': '/dashboard',
  'Admin': '/dashboard',
  'Docente': '/dashboard/gestion',
  'Secretaria': '/dashboard/inscripciones',
};

export async function loginAction(username, password) {
  try {
    // 1. Buscar al usuario incluyendo su rol relacionado
    const usuario = await prisma.usuario.findUnique({
      where: { username: username },
      include: {
        rol: true,
      },
    });

    // 2. Validaciones básicas
    if (!usuario) {
      return { success: false, error: "El usuario no existe." };
    }

    if (!usuario.estado) {
      return { success: false, error: "Este usuario se encuentra inactivo." };
    }

    // 3. Verificar contraseña
    if (usuario.password !== password) {
      return { success: false, error: "Contraseña incorrecta." };
    }

    // 4. Buscar datos personales (opcional)
    const datosPersonales = await prisma.personal.findUnique({
      where: { idUsuario: usuario.idUsuario },
    });

    const nombreRol = usuario.rol?.nombre || '';
    const redirectUrl = RUTAS_INICIALES[nombreRol] || '/dashboard';

    // 5. Retornar datos con rol y ruta de redirección automática
    return {
      success: true,
      redirectUrl,
      user: {
        idUsuario: usuario.idUsuario,
        username: usuario.username,
        rol: nombreRol,
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