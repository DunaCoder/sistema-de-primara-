'use server';

import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

// Detectar automáticamente el modelo de Usuario en Prisma
const getModeloUsuario = () => {
  if (prisma.usuario) return prisma.usuario;
  if (prisma.usuarios) return prisma.usuarios;
  if (prisma.Usuario) return prisma.Usuario;
  if (prisma.Usuarios) return prisma.Usuarios;
  throw new Error('No se encontró el modelo de Usuario en el cliente de Prisma.');
};

// Detectar automáticamente el modelo de Bitácora
const getModeloBitacora = () => {
  if (prisma.bitacora) return prisma.bitacora;
  if (prisma.bitacoras) return prisma.bitacoras;
  if (prisma.Bitacora) return prisma.Bitacora;
  return null;
};

export async function loginAction(username, password) {
  try {
    const ModeloUsuario = getModeloUsuario();

    // 1. Buscar usuario
    const usuario = await ModeloUsuario.findFirst({
      where: {
        username: {
          equals: username.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        rol: true,
      },
    });

    if (!usuario) {
      return { success: false, error: 'El usuario ingresado no existe.' };
    }

    // Comprobar estado si existe la columna
    if (usuario.estado === false) {
      return { success: false, error: 'El usuario se encuentra inactivo.' };
    }

    // 2. Validar contraseña (compatible con bcrypt y texto plano)
    const userPass = usuario.password || usuario.clave || '';
    let esValida = false;

    if (userPass.startsWith('$2a$') || userPass.startsWith('$2b$')) {
      esValida = await bcrypt.compare(password, userPass);
    } else {
      esValida = userPass === password;
    }

    if (!esValida) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    // Detectar campos de ID y Banderas según la convención del esquema
    const id = usuario.id_usuario ?? usuario.idUsuario ?? usuario.id;
    const debeCambiar = usuario.debe_cambiar_password ?? usuario.debeCambiarPassword ?? false;
    const nombreRol = usuario.rol?.nombre || 'Usuario';

    return {
      success: true,
      user: {
        id,
        username: usuario.username,
        rol: nombreRol,
        debeCambiarPassword: debeCambiar,
      },
    };
  } catch (error) {
    console.error('❌ Error en loginAction:', error);
    return { 
      success: false, 
      error: error.message || 'Error al conectar con la base de datos.' 
    };
  }
}

export async function cambiarPasswordObligatorioAction(idUsuario, nuevaPassword, username, rolNombre) {
  try {
    const ModeloUsuario = getModeloUsuario();
    const ModeloBitacora = getModeloBitacora();

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // 1. Obtener la clave primaria directamente buscando al usuario por su username
    const usuarioActual = await ModeloUsuario.findFirst({
      where: {
        username: {
          equals: username.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!usuarioActual) {
      return { success: false, error: 'No se encontró el registro del usuario en la base de datos.' };
    }

    // Identificar la propiedad de ID que existe en el objeto devuelto por Prisma
    const campoId = usuarioActual.id_usuario !== undefined ? 'id_usuario' : 
                    usuarioActual.idUsuario !== undefined ? 'idUsuario' : 'id';
    
    const idValor = usuarioActual[campoId];

    // 2. Intentar actualización dinámicamente según el nombre de la columna de la bandera
    let usuarioActualizado = null;

    try {
      usuarioActualizado = await ModeloUsuario.update({
        where: { [campoId]: idValor },
        data: {
          password: hashedPassword,
          debe_cambiar_password: false,
        },
        include: { rol: true },
      });
    } catch {
      usuarioActualizado = await ModeloUsuario.update({
        where: { [campoId]: idValor },
        data: {
          password: hashedPassword,
          debeCambiarPassword: false,
        },
        include: { rol: true },
      });
    }

    // 3. Registrar auditoría en bitácora si está disponible
    if (ModeloBitacora) {
      try {
        await ModeloBitacora.create({
          data: {
            usuario_id: Number(idValor),
            usuario_nombre: username,
            rol: rolNombre || 'Usuario',
            accion: 'CAMBIO_PASSWORD_OBLIGATORIO',
            modulo: 'SEGURIDAD',
            detalles: 'El usuario actualizó su contraseña provisional al iniciar sesión.',
          },
        });
      } catch (eBit) {
        console.warn('⚠️ No se registró auditoría en bitácora:', eBit.message);
      }
    }

    return {
      success: true,
      user: {
        id: idValor,
        username: usuarioActualizado.username,
        rol: usuarioActualizado.rol?.nombre || rolNombre,
        debeCambiarPassword: false,
      },
    };
  } catch (error) {
    console.error('❌ Error exacto al cambiar clave:', error);
    return { 
      success: false, 
      error: `Error de BD: ${error.message || 'Verifique los campos del modelo Prisma.'}` 
    };
  }
}