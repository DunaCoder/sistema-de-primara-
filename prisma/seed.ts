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
  await prisma.alumno.deleteMany();
  await prisma.telefonoRepresentante.deleteMany(); // nueva
  await prisma.representante.deleteMany();
  await prisma.gradoSeccion.deleteMany();
  await prisma.personal.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();

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

  // 3. Crear Usuarios
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

  // 4. Crear Personal (ahora con teléfono y correo)
  console.log("💼 Insertando personal...");
  const personalData = [
    {
      idPersonal: "V-00000001",
      nombre: "Admin",
      apellido: "Sistema",
      fechaIngreso: new Date("2020-01-01"),
      idUsuario: usuariosCreados["admin"],
      telefono: "0412-1111111",
      correo: "admin@sistema.com",
    },
    {
      idPersonal: "V-00000002",
      nombre: "María",
      apellido: "Docente",
      fechaIngreso: new Date("2021-09-15"),
      idUsuario: usuariosCreados["docente"],
      telefono: "0412-2222222",
      correo: "maria.docente@colegio.com",
    },
  ];

  for (const p of personalData) {
    await prisma.personal.create({ data: p });
    console.log(`  ✅ Personal: ${p.nombre} ${p.apellido}`);
  }

  // 5. Crear GradoSeccion
  console.log("🏫 Creando grado y sección...");
  const gradoSeccion = await prisma.gradoSeccion.create({
    data: {
      grado: "1er Grado",
      seccion: "A",
      idDocenteGuia: "V-00000002",
    },
  });
  console.log(`  ✅ GradoSeccion: ${gradoSeccion.grado} ${gradoSeccion.seccion}`);

  // 6. Asignar docente a la sección
  console.log("👨‍🏫 Asignando docente a la sección...");
  await prisma.asignacionDocente.create({
    data: {
      idDocente: "V-00000002",
      idGradoSeccion: gradoSeccion.idGradoSeccion,
    },
  });
  console.log(`  ✅ Docente asignado a la sección`);

  // 7. Crear Representante (sin teléfono aquí, lo añadimos aparte)
  console.log("👨‍👦 Registrando representante...");
  const representante = await prisma.representante.create({
    data: {
      idRepresentante: "V-99999999",
      nombre: "Test",
      apellido: "Representante",
      direccion: "Caracas, Distrito Capital",
    },
  });
  console.log(`  ✅ Representante: ${representante.nombre} ${representante.apellido}`);

  // 8. Agregar teléfonos al representante
  console.log("📱 Agregando teléfonos al representante...");
  const telefonos = [
    { numero: "0412-3333333", tipo: "Móvil", esPrincipal: true },
    { numero: "0212-4444444", tipo: "Casa", esPrincipal: false },
    { numero: "0416-5555555", tipo: "Emergencia", esPrincipal: false },
  ];
  for (const t of telefonos) {
    await prisma.telefonoRepresentante.create({
      data: {
        idRepresentante: representante.idRepresentante,
        numero: t.numero,
        tipo: t.tipo,
        esPrincipal: t.esPrincipal,
      },
    });
    console.log(`  ✅ Teléfono ${t.numero} (${t.tipo})`);
  }

  // 9. Crear Alumno (con discapacidad y alergias)
  console.log("👦 Registrando alumno...");
  const alumno = await prisma.alumno.create({
    data: {
      idAlumno: "E-TEST2026",
      nombre: "Test",
      apellido: "Alumno",
      fechaNacimiento: new Date("2020-06-15"),
      idRepresentante: representante.idRepresentante,
      discapacidad: "Ninguna",
      alergias: "Polen, Penicilina",
    },
  });
  console.log(`  ✅ Alumno: ${alumno.nombre} ${alumno.apellido}`);

  // 10. Inscribir alumno (usando anioEscolar)
  console.log("📝 Inscribiendo alumno...");
  const inscripcion = await prisma.inscripcion.create({
    data: {
      idAlumno: alumno.idAlumno,
      idGradoSeccion: gradoSeccion.idGradoSeccion,
      anioEscolar: "2025-2026", // antes era añoEscolar
      fechaInscripcion: new Date(),
    },
  });
  console.log(`  ✅ Inscripción creada`);

  // 11. Evaluaciones cualitativas (sin materias)
  console.log("📊 Creando evaluaciones de prueba...");
  const literales = ["A", "B", "A"];
  const apreciaciones = ["Excelente", "Bueno", "Excelente"];
  for (let lapso = 1; lapso <= 3; lapso++) {
    await prisma.evaluacionCualitativa.create({
      data: {
        idInscripcion: inscripcion.idInscripcion,
        lapso: lapso,
        literalCalificacion: literales[lapso - 1],
        apreciacionDescriptiva: `Desempeño ${apreciaciones[lapso - 1]}`,
      },
    });
    console.log(`  ✅ Evaluación lapso ${lapso}`);
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