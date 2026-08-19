-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "personal" (
    "id_personal" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_ingreso" DATE NOT NULL,
    "id_usuario" INTEGER,

    CONSTRAINT "personal_pkey" PRIMARY KEY ("id_personal")
);

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
CREATE TABLE "estudiantes" (
    "id_estudiante" TEXT NOT NULL,
    "nacionalidad" VARCHAR(1) NOT NULL DEFAULT 'V',
    "cedula_escolar" VARCHAR(12),
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "id_representante" TEXT NOT NULL,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id_estudiante")
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
CREATE TABLE "materias" (
    "idMateria" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("idMateria")
);

-- CreateTable
CREATE TABLE "grados_materias" (
    "idGradoMateria" SERIAL NOT NULL,
    "grado" TEXT NOT NULL,
    "idMateria" INTEGER NOT NULL,

    CONSTRAINT "grados_materias_pkey" PRIMARY KEY ("idGradoMateria")
);

-- CreateTable
CREATE TABLE "roles" (
    "idRol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("idRol")
);

-- CreateTable
CREATE TABLE "asignaciones_docentes" (
    "idAsignacion" SERIAL NOT NULL,
    "idDocente" TEXT NOT NULL,
    "idGradoSeccion" INTEGER NOT NULL,
    "idMateria" INTEGER NOT NULL,

    CONSTRAINT "asignaciones_docentes_pkey" PRIMARY KEY ("idAsignacion")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id_inscripcion" SERIAL NOT NULL,
    "id_estudiante" TEXT NOT NULL,
    "id_grado_seccion" INTEGER NOT NULL,
    "año_escolar" TEXT NOT NULL,
    "fecha_inscripcion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id_inscripcion")
);

-- CreateTable
CREATE TABLE "evaluaciones_cualitativas" (
    "id_evaluacion" SERIAL NOT NULL,
    "id_inscripcion" INTEGER NOT NULL,
    "id_materia" INTEGER NOT NULL,
    "lapso" INTEGER NOT NULL,
    "literal_calificacion" TEXT NOT NULL,
    "apreciacion_descriptiva" TEXT,

    CONSTRAINT "evaluaciones_cualitativas_pkey" PRIMARY KEY ("id_evaluacion")
);

-- CreateTable
CREATE TABLE "bitacora" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT,
    "usuario_nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "detalles" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "personal_id_usuario_key" ON "personal"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "grados_materias_grado_idMateria_key" ON "grados_materias"("grado", "idMateria");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_docentes_idDocente_idGradoSeccion_idMateria_key" ON "asignaciones_docentes"("idDocente", "idGradoSeccion", "idMateria");

-- CreateIndex
CREATE UNIQUE INDEX "evaluaciones_cualitativas_id_inscripcion_lapso_id_materia_key" ON "evaluaciones_cualitativas"("id_inscripcion", "lapso", "id_materia");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("idRol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal" ADD CONSTRAINT "personal_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_id_representante_fkey" FOREIGN KEY ("id_representante") REFERENCES "representantes"("id_representante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grados_secciones" ADD CONSTRAINT "grados_secciones_id_docente_guia_fkey" FOREIGN KEY ("id_docente_guia") REFERENCES "personal"("id_personal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grados_materias" ADD CONSTRAINT "grados_materias_idMateria_fkey" FOREIGN KEY ("idMateria") REFERENCES "materias"("idMateria") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_idDocente_fkey" FOREIGN KEY ("idDocente") REFERENCES "personal"("id_personal") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_idGradoSeccion_fkey" FOREIGN KEY ("idGradoSeccion") REFERENCES "grados_secciones"("id_grado_seccion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_idMateria_fkey" FOREIGN KEY ("idMateria") REFERENCES "materias"("idMateria") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiantes"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_id_grado_seccion_fkey" FOREIGN KEY ("id_grado_seccion") REFERENCES "grados_secciones"("id_grado_seccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_cualitativas" ADD CONSTRAINT "evaluaciones_cualitativas_id_inscripcion_fkey" FOREIGN KEY ("id_inscripcion") REFERENCES "inscripciones"("id_inscripcion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_cualitativas" ADD CONSTRAINT "evaluaciones_cualitativas_id_materia_fkey" FOREIGN KEY ("id_materia") REFERENCES "materias"("idMateria") ON DELETE CASCADE ON UPDATE CASCADE;
