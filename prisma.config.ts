// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts", // <-- Forzamos el uso de tsx para leer el archivo .ts
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});