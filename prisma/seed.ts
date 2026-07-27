// prisma/seed.ts
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

// Extraemos el cliente de forma segura para evitar fallos de compilación en Prisma 7
const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Iniciando siembra de datos limpia para el Sistema Escolar...");

  // 1. Limpieza total de tablas previas en orden estricto de restricciones de integridad
  console.log("🔄 Vaciando base de datos por completo...");
  await prisma.movimientoNomina.deleteMany();
  await prisma.evaluacionCualitativa.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.alumno.deleteMany();
  await prisma.representante.deleteMany();
  await prisma.gradoSeccion.deleteMany();
  await prisma.personal.deleteMany();
  await prisma.usuario.deleteMany();

  // 2. Estructuración de Usuarios Genéricos de Prueba
  const usuariosData = [
    { username: "test_admin", password: "admin123", rol: "Admin", estado: true },
    { username: "test_secretaria", password: "secre123", rol: "Secretaria", estado: true },
    { username: "test_docente", password: "docente123", rol: "Docente", estado: true },
    { username: "test_nomina", password: "user123", rol: "Nomina", estado: true }
  ];

  console.log("👥 Insertando nuevos usuarios...");
  const usuariosCreados: Record<string, number> = {};
  for (const u of usuariosData) {
    const user = await prisma.usuario.create({ data: u });
    usuariosCreados[u.username] = user.idUsuario;
    console.log(`  ✅ Usuario: ${user.username}`);
  }

  // 3. Estructuración de Personal Administrativo y Docente
  const personalData = [
    {
      idPersonal: "V-00000001",
      nombre: "Test",
      apellido: "Administrador",
      cargo: "Directivo",
      sueldoBase: 600.00,
      fechaIngreso: new Date("2020-01-01"),
      idUsuario: usuariosCreados["test_admin"]
    },
    {
      idPersonal: "V-00000002",
      nombre: "Test",
      apellido: "Docente",
      cargo: "Docente",
      sueldoBase: 450.00,
      fechaIngreso: new Date("2021-09-15"),
      idUsuario: usuariosCreados["test_docente"]
    }
  ];

  console.log("💼 Insertando registros de personal...");
  for (const p of personalData) {
    const staff = await prisma.personal.create({ data: p });
    console.log(`  ✅ Personal: ${staff.nombre} ${staff.apellido}`);
  }

  // 4. Estructuración de Grado y Sección Muestra
  console.log("🏫 Asignando Grado y Sección...");
  const seccionMuestra = await prisma.gradoSeccion.create({
    data: {
      grado: "1er Grado",
      seccion: "A",
      idDocenteGuia: "V-00000002"
    }
  });
  console.log(`  ✅ Estructura: ${seccionMuestra.grado} Sección ${seccionMuestra.seccion}`);

  // 5. Estructuración de Representante y Alumno
  console.log("👨‍👦 Registrando Matrícula de prueba inicial...");
  const rep = await prisma.representante.create({
    data: {
      idRepresentante: "V-99999999",
      nombre: "Test",
      apellido: "Representante",
      telefono: "0412-0000000",
      direccion: "Caracas, Distrito Capital"
    }
  });

  const alumno = await prisma.alumno.create({
    data: {
      idAlumno: "E-TEST2026",
      nombre: "Test",
      apellido: "Alumno",
      fechaNacimiento: new Date("2020-06-15"),
      idRepresentante: rep.idRepresentante,
      expedienteCompleto: true
    }
  });
  console.log(`  ✅ Alumno listo: ${alumno.nombre} ${alumno.apellido}`);

  console.log("✨ ¡Base de datos reestructurada y sembrada al 100%!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Error ejecutando el proceso de seed:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });