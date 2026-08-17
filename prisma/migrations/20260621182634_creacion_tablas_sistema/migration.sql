-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiantes" (
    "id" TEXT NOT NULL,
    "cedula_escolar" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "nivel_educativo" TEXT NOT NULL,
    "datos_representante" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calificaciones" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "asignatura" TEXT NOT NULL,
    "lapso" INTEGER NOT NULL,
    "nota_num" INTEGER,
    "nota_lit" TEXT,
    "promedio" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_cedula_escolar_key" ON "estudiantes"("cedula_escolar");

-- CreateIndex
CREATE UNIQUE INDEX "calificaciones_estudiante_id_asignatura_lapso_key" ON "calificaciones"("estudiante_id", "asignatura", "lapso");

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
