import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seeder)...');

  // 1. ROLES DEL SISTEMA
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: { nombre: 'Administrador' },
  });

  const rolSecretaria = await prisma.rol.upsert({
    where: { nombre: 'Secretaría' },
    update: {},
    create: { nombre: 'Secretaría' },
  });

  const rolCoordinador = await prisma.rol.upsert({
    where: { nombre: 'Coordinador' },
    update: {},
    create: { nombre: 'Coordinador' },
  });

  const rolDocente = await prisma.rol.upsert({
    where: { nombre: 'Docente' },
    update: {},
    create: { nombre: 'Docente' },
  });

  // 2. USUARIOS Y PERSONAL
  // Admin
  const userAdmin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'adminpassword',
      idRol: rolAdmin.idRol,
      estado: true,
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-10000000' },
    update: { idUsuario: userAdmin.idUsuario },
    create: {
      idPersonal: 'V-10000000',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      fechaIngreso: new Date('2020-01-15T00:00:00Z'),
      idUsuario: userAdmin.idUsuario,
    },
  });

  // Secretaría
  const userSecretaria = await prisma.usuario.upsert({
    where: { username: 'secretaria' },
    update: {},
    create: {
      username: 'secretaria',
      password: 'secretariapassword',
      idRol: rolSecretaria.idRol,
      estado: true,
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-20111222' },
    update: { idUsuario: userSecretaria.idUsuario },
    create: {
      idPersonal: 'V-20111222',
      nombre: 'María',
      apellido: 'Rojas',
      fechaIngreso: new Date('2021-03-10T00:00:00Z'),
      idUsuario: userSecretaria.idUsuario,
    },
  });

  // Coordinador
  const userCoordinador = await prisma.usuario.upsert({
    where: { username: 'coordinador' },
    update: {},
    create: {
      username: 'coordinador',
      password: 'coordinadorpassword',
      idRol: rolCoordinador.idRol,
      estado: true,
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-15123456' },
    update: { idUsuario: userCoordinador.idUsuario },
    create: {
      idPersonal: 'V-15123456',
      nombre: 'Luis',
      apellido: 'Gómez',
      fechaIngreso: new Date('2019-09-01T00:00:00Z'),
      idUsuario: userCoordinador.idUsuario,
    },
  });

  // Docente (Ana Fernández)
  const userDocente = await prisma.usuario.upsert({
    where: { username: 'docente' },
    update: {},
    create: {
      username: 'docente',
      password: 'docentepassword',
      idRol: rolDocente.idRol,
      estado: true,
    },
  });

  const personalDocente = await prisma.personal.upsert({
    where: { idPersonal: 'V-18987654' },
    update: { idUsuario: userDocente.idUsuario },
    create: {
      idPersonal: 'V-18987654',
      nombre: 'Ana',
      apellido: 'Fernández',
      fechaIngreso: new Date('2022-01-10T00:00:00Z'),
      idUsuario: userDocente.idUsuario,
    },
  });

  // 3. MATERIAS Y GRADO SECCIÓN
  const materiaMatematica = await prisma.materia.upsert({
    where: { idMateria: 1 },
    update: {},
    create: {
      nombre: 'Matemáticas',
      descripcion: 'Matemática básica elemental',
    },
  });

  const materiaLengua = await prisma.materia.upsert({
    where: { idMateria: 2 },
    update: {},
    create: {
      nombre: 'Lengua y Literatura',
      descripcion: 'Comprensión lectora y gramática',
    },
  });

  // AJUSTE CLAVE: Se actualiza "1ro" a "1er Grado" para coincidir con la lista desplegable del formulario
  const gradoSeccion = await prisma.gradoSeccion.upsert({
    where: { idGradoSeccion: 1 },
    update: { grado: '1er Grado' },
    create: {
      grado: '1er Grado',
      seccion: 'Sección A',
      idDocenteGuia: personalDocente.idPersonal,
    },
  });

  // 4. ASIGNACIONES DE LA DOCENTE (Ana Fernández impartirá Matemáticas y Lengua en 1er Grado, Sección A)
  const materiasAAsignar = [materiaMatematica.idMateria, materiaLengua.idMateria];

  for (const idMateria of materiasAAsignar) {
    const existeAsignacion = await prisma.asignacionDocente.findFirst({
      where: {
        idDocente: personalDocente.idPersonal,
        idGradoSeccion: gradoSeccion.idGradoSeccion,
        idMateria: idMateria,
      },
    });

    if (!existeAsignacion) {
      await prisma.asignacionDocente.create({
        data: {
          idDocente: personalDocente.idPersonal,
          idGradoSeccion: gradoSeccion.idGradoSeccion,
          idMateria: idMateria,
        },
      });
    }
  }

  // 5. REPRESENTANTE Y ESTUDIANTE DE PRUEBA (Incluyendo email)
  const representante = await prisma.representante.upsert({
    where: { idRepresentante: 'V-12345678' },
    update: { email: 'jose.perez@email.com' },
    create: {
      idRepresentante: 'V-12345678',
      nombre: 'José',
      apellido: 'Pérez',
      telefono: '04121234567',
      email: 'jose.perez@email.com',
      direccion: 'Caracas, Venezuela',
    },
  });

  const estudiante = await prisma.estudiante.upsert({
    where: { idEstudiante: 'V-31000111' },
    update: {},
    create: {
      idEstudiante: 'V-31000111',
      nombre: 'Pedro',
      apellido: 'Pérez',
      nacionalidad: 'V',
      fechaNacimiento: new Date('2015-05-20T00:00:00Z'),
      idRepresentante: representante.idRepresentante,
    },
  });

  const existeInscripcion = await prisma.inscripcion.findFirst({
    where: {
      idEstudiante: estudiante.idEstudiante,
      idGradoSeccion: gradoSeccion.idGradoSeccion,
    },
  });

  if (!existeInscripcion) {
    await prisma.inscripcion.create({
      data: {
        idEstudiante: estudiante.idEstudiante,
        idGradoSeccion: gradoSeccion.idGradoSeccion,
        fechaInscripcion: new Date(),
        anioEscolar: '2025-2026',
      },
    });
  }

  console.log('✅ Seeder ejecutado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });