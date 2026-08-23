import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Crear Roles Maestros
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMINISTRADOR' },
    update: {},
    create: { nombre: 'ADMINISTRADOR' },
  });

  const rolCoordinador = await prisma.rol.upsert({
    where: { nombre: 'COORDINADOR' },
    update: {},
    create: { nombre: 'COORDINADOR' },
  });

  const rolDocente = await prisma.rol.upsert({
    where: { nombre: 'DOCENTE' },
    update: {},
    create: { nombre: 'DOCENTE' },
  });

  const rolSecretaria = await prisma.rol.upsert({
    where: { nombre: 'SECRETARIA' },
    update: {},
    create: { nombre: 'SECRETARIA' },
  });

  // 2. Hash para contraseña inicial provisional ("123456")
  const defaultPassword = await bcrypt.hash('123456', 10);

  // 3. Crear o Actualizar Usuarios de Prueba para cada Rol
  const usuariosPrueba = [
    { username: 'admin', idRol: rolAdmin.idRol },
    { username: 'coordinador', idRol: rolCoordinador.idRol },
    { username: 'docente', idRol: rolDocente.idRol },
    { username: 'secretaria', idRol: rolSecretaria.idRol },
  ];

  for (const user of usuariosPrueba) {
    await prisma.usuario.upsert({
      where: { username: user.username },
      update: {
        password: defaultPassword,
        debeCambiarPassword: true,
        estado: true,
        idRol: user.idRol,
      },
      create: {
        username: user.username,
        password: defaultPassword,
        debeCambiarPassword: true,
        estado: true,
        idRol: user.idRol,
      },
    });
  }

  console.log('✅ Base de datos sembrada con éxito. Todos los usuarios de prueba fueron actualizados con la clave: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });