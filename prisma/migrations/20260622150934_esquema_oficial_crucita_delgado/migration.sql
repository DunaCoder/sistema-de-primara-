/*
  Warnings:

  - The primary key for the `usuarios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `calificaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `estudiantes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "calificaciones" DROP CONSTRAINT "calificaciones_estudiante_id_fkey";

-- AlterTable
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "nombre",
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "id_usuario" SERIAL NOT NULL,
ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario");

-- DropTable
DROP TABLE "calificaciones";

-- DropTable
DROP TABLE "estudiantes";

-- CreateTable
CREATE TABLE "representantes" (
    "id_representante" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "representantes_pkey" PRIMARY KEY ("id_representante")
);

-- CreateTable
CREATE TABLE "alumnos" (
    "id_alumno" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_noticia" DATE NOT NULL,
    "id_representante" TEXT NOT NULL,
    "expediente_completo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id_alumno")
);

-- CreateTable
CREATE TABLE "personal" (
    "id_personal" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "sueldo_base" DOUBLE PRECISION NOT NULL,
    "fecha_ingreso" DATE NOT NULL,
    "id_usuario" INTEGER,

    CONSTRAINT "personal_pkey" PRIMARY KEY ("id_personal")
);

-- CreateTable
CREATE TABLE "grados_secciones" (
    "id_grado_seccion" SERIAL NOT NULL,
    "grado" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "id_docente_guia" TEXT NOT NULL,

    CONSTRAINT "grados_secciones_pkey" PRIMARY KEY ("id_grado_seccion")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id_inscripcion" SERIAL NOT NULL,
    "id_alumno" TEXT NOT NULL,
    "id_grado_seccion" INTEGER NOT NULL,
    "ano_escolar" TEXT NOT NULL,
    "fecha_inscripcion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id_inscripcion")
);

-- CreateTable
CREATE TABLE "evaluaciones_cualitativas" (
    "id_evaluacion" SERIAL NOT NULL,
    "id_inscripcion" INTEGER NOT NULL,
    "lapso" INTEGER NOT NULL,
    "apreciacion_descriptiva" TEXT NOT NULL,
    "literal_calificacion" TEXT NOT NULL,

    CONSTRAINT "evaluaciones_cualitativas_pkey" PRIMARY KEY ("id_evaluacion")
);

-- CreateTable
CREATE TABLE "movimientos_nomina" (
    "id_movimiento" SERIAL NOT NULL,
    "id_personal" TEXT NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "monto_total" DOUBLE PRECISION NOT NULL,
    "concepto" TEXT NOT NULL,

    CONSTRAINT "movimientos_nomina_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_id_usuario_key" ON "personal"("id_usuario");

-- AddForeignKey
ALTER TABLE "alumnos" ADD CONSTRAINT "alumnos_id_representante_fkey" FOREIGN KEY ("id_representante") REFERENCES "representantes"("id_representante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal" ADD CONSTRAINT "personal_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grados_secciones" ADD CONSTRAINT "grados_secciones_id_docente_guia_fkey" FOREIGN KEY ("id_docente_guia") REFERENCES "personal"("id_personal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_id_alumno_fkey" FOREIGN KEY ("id_alumno") REFERENCES "alumnos"("id_alumno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_id_grado_seccion_fkey" FOREIGN KEY ("id_grado_seccion") REFERENCES "grados_secciones"("id_grado_seccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_cualitativas" ADD CONSTRAINT "evaluaciones_cualitativas_id_inscripcion_fkey" FOREIGN KEY ("id_inscripcion") REFERENCES "inscripciones"("id_inscripcion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_nomina" ADD CONSTRAINT "movimientos_nomina_id_personal_fkey" FOREIGN KEY ("id_personal") REFERENCES "personal"("id_personal") ON DELETE CASCADE ON UPDATE CASCADE;
