/*
  Warnings:

  - You are about to drop the column `rol` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `id_rol` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "rol",
ADD COLUMN     "id_rol" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "roles" (
    "idRol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("idRol")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("idRol") ON DELETE RESTRICT ON UPDATE CASCADE;
