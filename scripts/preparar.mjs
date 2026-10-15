// Se ejecuta solo antes de `npm run dev` (script "predev").
// Deja el proyecto listo para usar sin pasos manuales:
//   1. Verifica que la versión de Node.js sea compatible.
//   2. Crea el archivo .env a partir de .env.example si todavía no existe.
//   3. Si la base de datos SQLite no existe, la crea y carga los datos de demo.
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error(
    `\n✖ AutoNova necesita Node.js 20 o superior (tenés la ${process.versions.node}).` +
      "\n  Descargá la versión LTS desde https://nodejs.org, instalala y reiniciá la computadora.\n",
  );
  process.exit(1);
}

const envPath = path.join(root, ".env");
if (!existsSync(envPath)) {
  copyFileSync(path.join(root, ".env.example"), envPath);
  console.log("✔ Se creó el archivo .env con la configuración por defecto.");
}

const envFile = readFileSync(envPath, "utf8");
const match = envFile.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
const dbUrl = (process.env.DATABASE_URL || match?.[1] || "").trim();

// Solo aplica a SQLite (con PostgreSQL la base se prepara aparte, ver README).
if (dbUrl.startsWith("file:")) {
  const file = dbUrl.slice("file:".length);
  // Prisma resuelve las rutas relativas de SQLite desde la carpeta prisma/.
  const dbPath = path.isAbsolute(file) ? file : path.join(root, "prisma", file);
  if (!existsSync(dbPath)) {
    console.log("• Primera vez: creando la base de datos y cargando los autos de demo…\n");
    for (const cmd of ["npx prisma db push", "npx tsx prisma/seed.ts"]) {
      const result = spawnSync(cmd, { stdio: "inherit", shell: true, cwd: root });
      if (result.status !== 0) {
        console.error("\n✖ No se pudo preparar la base de datos. Copiá el mensaje de arriba para revisarlo.\n");
        process.exit(1);
      }
    }
    console.log("");
  }
}
