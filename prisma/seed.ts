// prisma/seed.ts
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Iniciando siembra de datos para el Sistema Escolar...");

  // 1. Limpieza total en orden de dependencias (de más a menos dependiente)
  console.log("🔄 Vaciando base de datos por completo...");
  await prisma.evaluacionCualitativa.deleteMany();
  await prisma.asignacionDocente.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.gradoMateria.deleteMany();
  await prisma.alumno.deleteMany();
  await prisma.representante.deleteMany();
  await prisma.gradoSeccion.deleteMany();
  await prisma.personal.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany(); // 👈 Limpiar roles también

  // 2. Crear Roles
  console.log("🔑 Creando roles...");
  const rolesData = [
    { nombre: "Admin" },
    { nombre: "Secretaria" },
    { nombre: "Docente" },
  ];
  const rolesCreados: Record<string, number> = {};
  for (const r of rolesData) {
    const rol = await prisma.rol.create({ data: r });
    rolesCreados[r.nombre] = rol.idRol;
    console.log(`  ✅ Rol: ${rol.nombre}`);
  }

  // 3. Crear Usuarios con idRol
  console.log("👥 Insertando usuarios...");
  const usuariosData = [
    { username: "admin", password: "admin123", idRol: rolesCreados["Admin"], estado: true },
    { username: "secretaria", password: "secre123", idRol: rolesCreados["Secretaria"], estado: true },
    { username: "docente", password: "docente123", idRol: rolesCreados["Docente"], estado: true },
  ];

  const usuariosCreados: Record<string, number> = {};
  for (const u of usuariosData) {
    const user = await prisma.usuario.create({ data: u });
    usuariosCreados[u.username] = user.idUsuario;
    console.log(`  ✅ Usuario: ${user.username}`);
  }

  // 4. Crear Personal (sin cargo, sin sueldoBase)
  console.log("💼 Insertando personal...");
  const personalData = [
    {
      idPersonal: "V-00000001",
      nombre: "Admin",
      apellido: "Sistema",
      fechaIngreso: new Date("2020-01-01"),
      idUsuario: usuariosCreados["admin"],
    },
    {
      idPersonal: "V-00000002",
      nombre: "María",
      apellido: "Docente",
      fechaIngreso: new Date("2021-09-15"),
      idUsuario: usuariosCreados["docente1"],
    },
  ];

  for (const p of personalData) {
    await prisma.personal.create({ data: p });
    console.log(`  ✅ Personal: ${p.nombre} ${p.apellido}`);
  }

  // 5. Crear Materias
  console.log("📚 Insertando materias...");
  const materias = [
    { nombre: "Matemáticas", descripcion: "Aritmética y geometría" },
    { nombre: "Lengua", descripcion: "Lectura y escritura" },
    { nombre: "Ciencias", descripcion: "Ciencias naturales" },
  ];
  const materiasCreadas = [];
  for (const m of materias) {
    const materia = await prisma.materia.create({ data: m });
    materiasCreadas.push(materia);
    console.log(`  ✅ Materia: ${materia.nombre}`);
  }

  // 6. Crear GradoSeccion
  console.log("🏫 Creando grado y sección...");
  const gradoSeccion = await prisma.gradoSeccion.create({
    data: {
      grado: "1er Grado",
      seccion: "A",
      idDocenteGuia: "V-00000002", // Docente guía
    },
  });
  console.log(`  ✅ GradoSeccion: ${gradoSeccion.grado} ${gradoSeccion.seccion}`);

  // 7. Malla curricular (GradoMateria)
  console.log("📋 Asignando materias al grado...");
  for (const materia of materiasCreadas) {
    await prisma.gradoMateria.create({
      data: {
        grado: gradoSeccion.grado,
        idMateria: materia.idMateria,
      },
    });
    console.log(`  ✅ Materia ${materia.nombre} asignada al grado`);
  }

  // 8. Asignar docente a materia (AsignacionDocente)
  console.log("👨‍🏫 Asignando docente a materias...");
  for (const materia of materiasCreadas) {
    await prisma.asignacionDocente.create({
      data: {
        idDocente: "V-00000002",
        idGradoSeccion: gradoSeccion.idGradoSeccion,
        idMateria: materia.idMateria,
      },
    });
    console.log(`  ✅ Docente asignado a ${materia.nombre}`);
  }

  // 9. Crear Representante y Alumno
  console.log("👨‍👦 Registrando representante y alumno...");
  const representante = await prisma.representante.create({
    data: {
      idRepresentante: "V-99999999",
      nombre: "Test",
      apellido: "Representante",
      telefono: "0412-0000000",
      direccion: "Caracas, Distrito Capital",
    },
  });

  const alumno = await prisma.alumno.create({
    data: {
      idAlumno: "E-TEST2026",
      nombre: "Test",
      apellido: "Alumno",
      fechaNacimiento: new Date("2020-06-15"),
      idRepresentante: representante.idRepresentante,
    },
  });
  console.log(`  ✅ Alumno: ${alumno.nombre} ${alumno.apellido}`);

  // 10. Inscribir alumno
  console.log("📝 Inscribiendo alumno...");
  const inscripcion = await prisma.inscripcion.create({
    data: {
      idAlumno: alumno.idAlumno,
      idGradoSeccion: gradoSeccion.idGradoSeccion,
      añoEscolar: "2025-2026",
      fechaInscripcion: new Date(),
    },
  });
  console.log(`  ✅ Inscripción creada`);

  // 11. Evaluaciones cualitativas (ejemplo)
  console.log("📊 Creando evaluaciones de prueba...");
  for (const materia of materiasCreadas) {
    for (let lapso = 1; lapso <= 3; lapso++) {
      await prisma.evaluacionCualitativa.create({
        data: {
          idInscripcion: inscripcion.idInscripcion,
          idMateria: materia.idMateria,
          lapso: lapso,
          literalCalificacion: ["A", "B", "A"][lapso - 1],
          apreciacionDescriptiva: `Desempeño ${["Excelente", "Bueno", "Excelente"][lapso - 1]}`,
        },
      });
    }
    console.log(`  ✅ Evaluaciones para ${materia.nombre}`);
  }

  console.log("✅ ¡Siembra completada con éxito!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Error en seed:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });