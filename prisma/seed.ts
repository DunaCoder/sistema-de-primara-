import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Configuración del adaptador PostgreSQL para Prisma v7
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seeder)...');

  // ==========================================
  // 1. ROLES DEL SISTEMA
  // ==========================================
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: { nombre: 'Administrador' },
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

  const rolSecretaria = await prisma.rol.upsert({
    where: { nombre: 'Secretaria' },
    update: {},
    create: { nombre: 'Secretaria' },
  });

  console.log('✓ Roles del sistema verificados.');

  // ==========================================
  // 2. USUARIOS Y PERSONAL INICIAL
  // ==========================================

  // --- ADMINISTRADOR ---
  const userAdmin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'password123',
      estado: true,
      idRol: rolAdmin.idRol,
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-10000000' },
    update: { idUsuario: userAdmin.idUsuario },
    create: {
      idPersonal: 'V-10000000',
      nombre: 'Administrador',
      apellido: 'Sistema',
      fechaIngreso: new Date('2020-01-01'),
      idUsuario: userAdmin.idUsuario,
    },
  });

  // --- SECRETARIA ---
  const userSecretaria = await prisma.usuario.upsert({
    where: { username: 'secretaria' },
    update: {},
    create: {
      username: 'secretaria',
      password: 'password123',
      estado: true,
      idRol: rolSecretaria.idRol,
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-20111222' },
    update: { idUsuario: userSecretaria.idUsuario },
    create: {
      idPersonal: 'V-20111222',
      nombre: 'María',
      apellido: 'González',
      fechaIngreso: new Date('2022-03-10'),
      idUsuario: userSecretaria.idUsuario,
    },
  });

  // --- COORDINADOR ACADÉMICO ---
  const userCoordinador = await prisma.usuario.upsert({
    where: { username: 'coordinador' },
    update: {},
    create: {
      username: 'coordinador',
      password: 'password123',
      estado: true,
      idRol: rolCoordinador.idRol,
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-15123456' },
    update: { idUsuario: userCoordinador.idUsuario },
    create: {
      idPersonal: 'V-15123456',
      nombre: 'Elena',
      apellido: 'Blanco',
      fechaIngreso: new Date('2019-09-15'),
      idUsuario: userCoordinador.idUsuario,
    },
  });

  // --- DOCENTE GUÍA ---
  const userDocente = await prisma.usuario.upsert({
    where: { username: 'docente' },
    update: {},
    create: {
      username: 'docente',
      password: 'password123',
      estado: true,
      idRol: rolDocente.idRol,
    },
  });

  const personalDocente = await prisma.personal.upsert({
    where: { idPersonal: 'V-18987654' },
    update: { idUsuario: userDocente.idUsuario },
    create: {
      idPersonal: 'V-18987654',
      nombre: 'Carlos',
      apellido: 'Pérez',
      fechaIngreso: new Date('2021-09-01'),
      idUsuario: userDocente.idUsuario,
    },
  });

  console.log('✓ Personal y Usuarios iniciales cargados.');

  // ==========================================
  // 3. ESTRUCTURA ACADÉMICA Y MALLA CURRICULAR
  // ==========================================
  
  // Grado y Sección
  let gradoSeccion = await prisma.gradoSeccion.findFirst({
    where: { grado: '1er Grado', seccion: 'A' },
  });

  if (!gradoSeccion) {
    gradoSeccion = await prisma.gradoSeccion.create({
      data: {
        grado: '1er Grado',
        seccion: 'A',
        idDocenteGuia: personalDocente.idPersonal,
      },
    });
  }

  // Materias (Verificación mediante findFirst + create)
  let materiaMatematica = await prisma.materia.findFirst({
    where: { nombre: 'Matemáticas' },
  });
  if (!materiaMatematica) {
    materiaMatematica = await prisma.materia.create({
      data: {
        nombre: 'Matemáticas',
        descripcion: 'Nociones básicas de cálculo y operaciones',
      },
    });
  }

  let materiaLengua = await prisma.materia.findFirst({
    where: { nombre: 'Lengua y Comunicación' },
  });
  if (!materiaLengua) {
    materiaLengua = await prisma.materia.create({
      data: {
        nombre: 'Lengua y Comunicación',
        descripcion: 'Lectura, escritura y expresión oral',
      },
    });
  }

  // Asignaciones Docentes
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

  console.log('✓ Estructura académica y asignaciones docentes procesadas.');

  // ==========================================
  // 4. REPRESENTANTE, ESTUDIANTE E INSCRIPCIÓN
  // ==========================================
  
  const representante = await prisma.representante.upsert({
    where: { idRepresentante: 'V-12345678' },
    update: {},
    create: {
      idRepresentante: 'V-12345678',
      nombre: 'Ana',
      apellido: 'Mendoza',
      telefono: '04141234567',
      direccion: 'Av. Principal Bicentenario, Casa #4',
    },
  });

  const estudiante = await prisma.estudiante.upsert({
    where: { idEstudiante: 'V-31000111' },
    update: {},
    create: {
      idEstudiante: 'V-31000111',
      nacionalidad: 'V',
      cedulaEscolar: '124310001110',
      nombre: 'Luis',
      apellido: 'Mendoza',
      fechaNacimiento: new Date('2017-05-10'),
      idRepresentante: representante.idRepresentante,
    },
  });

  // Inscripción del estudiante
  const existeInscripcion = await prisma.inscripcion.findFirst({
    where: {
      idEstudiante: estudiante.idEstudiante,
      idGradoSeccion: gradoSeccion.idGradoSeccion,
      añoEscolar: '2025-2026',
    },
  });

  if (!existeInscripcion) {
    await prisma.inscripcion.create({
      data: {
        idEstudiante: estudiante.idEstudiante,
        idGradoSeccion: gradoSeccion.idGradoSeccion,
        añoEscolar: '2025-2026',
      },
    });
  }

  console.log('✨ Seeder ejecutado con éxito: Todos los módulos están sincronizados.');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });