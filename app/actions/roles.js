// app/actions/roles.js
'use server'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function obtenerRoles() {
  try {
    return await prisma.rol.findMany({
      orderBy: { nombre: 'asc' }
    });
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    return [];
  }
}