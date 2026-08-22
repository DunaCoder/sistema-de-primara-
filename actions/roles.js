// app/actions/roles.js
'use server';

export async function obtenerRoles() {
  return [
    { id: 1, nombre: 'Docente' },
    { id: 2, nombre: 'Secretaria' },
    { id: 3, nombre: 'Coordinador' },
    { id: 4, nombre: 'Administrador' },
  ];
}
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