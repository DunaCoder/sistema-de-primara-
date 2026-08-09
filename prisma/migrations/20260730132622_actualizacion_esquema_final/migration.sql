/*
  Warnings:

  - Se eliminará la columna `expediente_completo` en la tabla `alumnos`.
  - Se renombrará la columna `fecha_noticia` a `fecha_nacimiento` en la tabla `alumnos`.
  - Se renombrará la columna `ano_escolar` a `año_escolar` en la tabla `inscripciones`.
  - Se eliminará la columna `cargo` en la tabla `personal`.
  - Se eliminará la columna `sueldo_base` en la tabla `personal`.
  - Se eliminará la tabla `movimientos_nomina`.
  - Se agregará la columna `id_materia` a la tabla `evaluaciones_cualitativas` (con manejo de NULL).
  - Se agregarán restricciones UNIQUE y FOREIGN KEY.
*/

-- ==========================================
-- 1. ELIMINAR TABLA Y COLUMNAS NO NECESARIAS
-- ==========================================

-- Eliminar tabla movimientos_nomina (y su FK)
DROP TABLE IF EXISTS "movimientos_nomina" CASCADE;

-- Eliminar columnas obsoletas
ALTER TABLE "alumnos" DROP COLUMN IF EXISTS "expediente_completo";
ALTER TABLE "personal" DROP COLUMN IF EXISTS "cargo";
ALTER TABLE "personal" DROP COLUMN IF EXISTS "sueldo_base";

-- ==========================================
-- 2. RENOMBRAR COLUMNAS (sin perder datos)
-- ==========================================

-- Renombrar fecha_noticia -> fecha_nacimiento
ALTER TABLE "alumnos" RENAME COLUMN "fecha_noticia" TO "fecha_nacimiento";

-- Si existen valores NULL en fecha_nacimiento, actualizarlos (ej. fecha por defecto)
UPDATE "alumnos" SET "fecha_nacimiento" = '2000-01-01' WHERE "fecha_nacimiento" IS NULL;

-- Agregar restricción NOT NULL
ALTER TABLE "alumnos" ALTER COLUMN "fecha_nacimiento" SET NOT NULL;

-- Renombrar ano_escolar -> año_escolar
ALTER TABLE "inscripciones" RENAME COLUMN "ano_escolar" TO "año_escolar";

-- Si existen valores NULL en año_escolar, actualizarlos (ej. año por defecto)
UPDATE "inscripciones" SET "año_escolar" = '2025-2026' WHERE "año_escolar" IS NULL;

-- Agregar restricción NOT NULL
ALTER TABLE "inscripciones" ALTER COLUMN "año_escolar" SET NOT NULL;

-- ==========================================
-- 3. CREAR NUEVAS TABLAS (materias, grados_materias, asignaciones_docentes)
-- ==========================================

-- Crear tabla materias
CREATE TABLE "materias" (
    "idMateria" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    CONSTRAINT "materias_pkey" PRIMARY KEY ("idMateria")
);

-- Crear tabla grados_materias (malla curricular)
CREATE TABLE "grados_materias" (
    "idGradoMateria" SERIAL NOT NULL,
    "grado" TEXT NOT NULL,
    "idMateria" INTEGER NOT NULL,
    CONSTRAINT "grados_materias_pkey" PRIMARY KEY ("idGradoMateria")
);

-- Crear tabla asignaciones_docentes
CREATE TABLE "asignaciones_docentes" (
    "idAsignacion" SERIAL NOT NULL,
    "idDocente" TEXT NOT NULL,
    "idGradoSeccion" INTEGER NOT NULL,
    "idMateria" INTEGER NOT NULL,
    CONSTRAINT "asignaciones_docentes_pkey" PRIMARY KEY ("idAsignacion")
);

-- ==========================================
-- 4. AGREGAR COLUMNA id_materia A evaluaciones_cualitativas (con manejo seguro)
-- ==========================================

-- Agregar columna permitiendo NULL temporalmente
ALTER TABLE "evaluaciones_cualitativas" ADD COLUMN "id_materia" INTEGER;

-- Si existen registros, asignar un valor por defecto (crear una materia 'General' si no existe)
DO $$
BEGIN
    -- Insertar una materia por defecto si no existe
    INSERT INTO "materias" ("nombre", "descripcion")
    SELECT 'General', 'Materia por defecto para datos existentes'
    WHERE NOT EXISTS (SELECT 1 FROM "materias" WHERE "nombre" = 'General');

    -- Actualizar registros existentes con el id de la materia 'General'
    UPDATE "evaluaciones_cualitativas" 
    SET "id_materia" = (SELECT "idMateria" FROM "materias" WHERE "nombre" = 'General')
    WHERE "id_materia" IS NULL;
END $$;

-- Ahora agregar NOT NULL
ALTER TABLE "evaluaciones_cualitativas" ALTER COLUMN "id_materia" SET NOT NULL;

-- Modificar columna apreciacion_descriptiva para permitir NULL
ALTER TABLE "evaluaciones_cualitativas" ALTER COLUMN "apreciacion_descriptiva" DROP NOT NULL;

-- ==========================================
-- 5. AGREGAR RESTRICCIONES UNIQUE
-- ==========================================

-- Índice único en grados_materias (grado + idMateria)
CREATE UNIQUE INDEX "grados_materias_grado_idMateria_key" ON "grados_materias"("grado", "idMateria");

-- Índice único en asignaciones_docentes (docente + grado_seccion + materia)
CREATE UNIQUE INDEX "asignaciones_docentes_idDocente_idGradoSeccion_idMateria_key" 
ON "asignaciones_docentes"("idDocente", "idGradoSeccion", "idMateria");

-- Índice único en evaluaciones_cualitativas (inscripcion + lapso + materia)
CREATE UNIQUE INDEX "evaluaciones_cualitativas_id_inscripcion_lapso_id_materia_key" 
ON "evaluaciones_cualitativas"("id_inscripcion", "lapso", "id_materia");

-- ==========================================
-- 6. AGREGAR LLAVES FORÁNEAS (FOREIGN KEYS)
-- ==========================================

ALTER TABLE "grados_materias" 
ADD CONSTRAINT "grados_materias_idMateria_fkey" 
FOREIGN KEY ("idMateria") REFERENCES "materias"("idMateria") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "asignaciones_docentes" 
ADD CONSTRAINT "asignaciones_docentes_idDocente_fkey" 
FOREIGN KEY ("idDocente") REFERENCES "personal"("id_personal") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "asignaciones_docentes" 
ADD CONSTRAINT "asignaciones_docentes_idGradoSeccion_fkey" 
FOREIGN KEY ("idGradoSeccion") REFERENCES "grados_secciones"("id_grado_seccion") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "asignaciones_docentes" 
ADD CONSTRAINT "asignaciones_docentes_idMateria_fkey" 
FOREIGN KEY ("idMateria") REFERENCES "materias"("idMateria") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evaluaciones_cualitativas" 
ADD CONSTRAINT "evaluaciones_cualitativas_id_materia_fkey" 
FOREIGN KEY ("id_materia") REFERENCES "materias"("idMateria") ON DELETE CASCADE ON UPDATE CASCADE;