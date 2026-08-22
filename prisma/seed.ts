<<<<<<< HEAD
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
=======
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Configuración del adaptador PostgreSQL para Prisma v7
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seeder)...');

<<<<<<< HEAD
  // 1. ROLES DEL SISTEMA
=======
  // ==========================================
  // 1. ROLES DEL SISTEMA
  // ==========================================
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: { nombre: 'Administrador' },
  });

<<<<<<< HEAD
  const rolSecretaria = await prisma.rol.upsert({
    where: { nombre: 'Secretaría' },
    update: {},
    create: { nombre: 'Secretaría' },
  });

=======
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
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

<<<<<<< HEAD
  // 2. USUARIOS Y PERSONAL
  // Admin
=======
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
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
  const userAdmin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
<<<<<<< HEAD
      password: 'adminpassword',
      idRol: rolAdmin.idRol,
      estado: true,
=======
      password: 'password123',
      estado: true,
      idRol: rolAdmin.idRol,
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-10000000' },
    update: { idUsuario: userAdmin.idUsuario },
    create: {
      idPersonal: 'V-10000000',
<<<<<<< HEAD
      nombre: 'Carlos',
      apellido: 'Mendoza',
      fechaIngreso: new Date('2020-01-15T00:00:00Z'),
=======
      nombre: 'Administrador',
      apellido: 'Sistema',
      fechaIngreso: new Date('2020-01-01'),
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      idUsuario: userAdmin.idUsuario,
    },
  });

<<<<<<< HEAD
  // Secretaría
=======
  // --- SECRETARIA ---
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
  const userSecretaria = await prisma.usuario.upsert({
    where: { username: 'secretaria' },
    update: {},
    create: {
      username: 'secretaria',
<<<<<<< HEAD
      password: 'secretariapassword',
      idRol: rolSecretaria.idRol,
      estado: true,
=======
      password: 'password123',
      estado: true,
      idRol: rolSecretaria.idRol,
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-20111222' },
    update: { idUsuario: userSecretaria.idUsuario },
    create: {
      idPersonal: 'V-20111222',
      nombre: 'María',
<<<<<<< HEAD
      apellido: 'Rojas',
      fechaIngreso: new Date('2021-03-10T00:00:00Z'),
=======
      apellido: 'González',
      fechaIngreso: new Date('2022-03-10'),
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      idUsuario: userSecretaria.idUsuario,
    },
  });

<<<<<<< HEAD
  // Coordinador
=======
  // --- COORDINADOR ACADÉMICO ---
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
  const userCoordinador = await prisma.usuario.upsert({
    where: { username: 'coordinador' },
    update: {},
    create: {
      username: 'coordinador',
<<<<<<< HEAD
      password: 'coordinadorpassword',
      idRol: rolCoordinador.idRol,
      estado: true,
=======
      password: 'password123',
      estado: true,
      idRol: rolCoordinador.idRol,
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
    },
  });

  await prisma.personal.upsert({
    where: { idPersonal: 'V-15123456' },
    update: { idUsuario: userCoordinador.idUsuario },
    create: {
      idPersonal: 'V-15123456',
<<<<<<< HEAD
      nombre: 'Luis',
      apellido: 'Gómez',
      fechaIngreso: new Date('2019-09-01T00:00:00Z'),
=======
      nombre: 'Elena',
      apellido: 'Blanco',
      fechaIngreso: new Date('2019-09-15'),
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      idUsuario: userCoordinador.idUsuario,
    },
  });

<<<<<<< HEAD
  // Docente (Ana Fernández)
=======
  // --- DOCENTE GUÍA ---
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
  const userDocente = await prisma.usuario.upsert({
    where: { username: 'docente' },
    update: {},
    create: {
      username: 'docente',
<<<<<<< HEAD
      password: 'docentepassword',
      idRol: rolDocente.idRol,
      estado: true,
=======
      password: 'password123',
      estado: true,
      idRol: rolDocente.idRol,
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
    },
  });

  const personalDocente = await prisma.personal.upsert({
    where: { idPersonal: 'V-18987654' },
    update: { idUsuario: userDocente.idUsuario },
    create: {
      idPersonal: 'V-18987654',
<<<<<<< HEAD
      nombre: 'Ana',
      apellido: 'Fernández',
      fechaIngreso: new Date('2022-01-10T00:00:00Z'),
=======
      nombre: 'Carlos',
      apellido: 'Pérez',
      fechaIngreso: new Date('2021-09-01'),
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      idUsuario: userDocente.idUsuario,
    },
  });

<<<<<<< HEAD
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

=======
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
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
    },
  });

  const estudiante = await prisma.estudiante.upsert({
    where: { idEstudiante: 'V-31000111' },
    update: {},
    create: {
      idEstudiante: 'V-31000111',
<<<<<<< HEAD
      nombre: 'Pedro',
      apellido: 'Pérez',
      nacionalidad: 'V',
      fechaNacimiento: new Date('2015-05-20T00:00:00Z'),
=======
      nacionalidad: 'V',
      cedulaEscolar: '124310001110',
      nombre: 'Luis',
      apellido: 'Mendoza',
      fechaNacimiento: new Date('2017-05-10'),
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      idRepresentante: representante.idRepresentante,
    },
  });

<<<<<<< HEAD
=======
  // Inscripción del estudiante
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
  const existeInscripcion = await prisma.inscripcion.findFirst({
    where: {
      idEstudiante: estudiante.idEstudiante,
      idGradoSeccion: gradoSeccion.idGradoSeccion,
<<<<<<< HEAD
=======
      añoEscolar: '2025-2026',
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
    },
  });

  if (!existeInscripcion) {
    await prisma.inscripcion.create({
      data: {
        idEstudiante: estudiante.idEstudiante,
        idGradoSeccion: gradoSeccion.idGradoSeccion,
<<<<<<< HEAD
        fechaInscripcion: new Date(),
        anioEscolar: '2025-2026',
=======
        añoEscolar: '2025-2026',
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
      },
    });
  }

<<<<<<< HEAD
  console.log('✅ Seeder ejecutado con éxito.');
=======
  console.log('✨ Seeder ejecutado con éxito: Todos los módulos están sincronizados.');
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
<<<<<<< HEAD
=======
    await pool.end();
>>>>>>> 6054ec0a436990851085ee50f6fe9cc47a2fac99
  });