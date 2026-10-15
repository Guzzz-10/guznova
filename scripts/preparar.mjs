// Se ejecuta solo antes de `npm run dev` (script "predev").
// Deja el proyecto listo para usar sin pasos manuales:
//   1. Verifica que la versión de Node.js sea compatible.
//   2. Crea el archivo .env a partir de .env.example si todavía no existe.
//   3. Si la base de datos SQLite no existe, la crea y carga los datos de demo.
//      Se arma con un nombre temporal y solo se renombra a su nombre final cuando
//      terminó bien: si se corta a mitad de camino, la próxima vez se rehace.
import { copyFileSync, existsSync, readFileSync, renameSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  fail(
    `AutoNova necesita Node.js 20 o superior (tenés la ${process.versions.node}).\n` +
      "  Descargá la versión LTS desde https://nodejs.org, instalala y reiniciá la computadora.",
  );
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
  const [file, query] = dbUrl.slice("file:".length).split("?");
  // Prisma resuelve las rutas relativas de SQLite desde la carpeta prisma/.
  const dbPath = path.isAbsolute(file) ? file : path.join(root, "prisma", file);

  if (!existsSync(dbPath)) {
    console.log("• Primera vez: creando la base de datos y cargando los autos de demo…\n");

    // Usamos los programas instalados en node_modules (sin npx, que podría
    // ofrecer descargar otra versión si la instalación quedó incompleta).
    const require = createRequire(path.join(root, "package.json"));
    const cli = (pkg) => {
      try {
        const pkgJsonPath = require.resolve(`${pkg}/package.json`);
        const { bin } = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
        const rel = typeof bin === "string" ? bin : bin[pkg];
        return path.join(path.dirname(pkgJsonPath), rel);
      } catch {
        fail(
          `Falta instalar "${pkg}". La instalación no terminó bien.\n` +
            "  Ejecutá `npm install` en esta carpeta y esperá a que termine.",
        );
      }
    };

    // Base temporal: Prisma toma DATABASE_URL del entorno antes que del archivo .env.
    const tmpPath = `${dbPath}.preparando`;
    const cleanTmp = () => {
      rmSync(tmpPath, { force: true });
      rmSync(`${tmpPath}-journal`, { force: true });
    };
    cleanTmp();
    // Misma ruta que la original (relativa o absoluta) con el sufijo temporal.
    const env = { ...process.env, DATABASE_URL: `file:${file}.preparando${query ? `?${query}` : ""}` };

    const prisma = cli("prisma");
    const steps = [];
    // El cliente de Prisma se genera en `npm install`; si faltara, lo generamos.
    if (!existsSync(path.join(root, "node_modules", ".prisma", "client", "index.js"))) {
      steps.push([prisma, "generate"]);
    }
    steps.push([prisma, "db", "push", "--skip-generate"], [cli("tsx"), "prisma/seed.ts"]);
    for (const args of steps) {
      const result = spawnSync(process.execPath, args, { stdio: "inherit", cwd: root, env });
      if (result.status !== 0) {
        cleanTmp();
        fail("No se pudo preparar la base de datos. Copiá el mensaje de arriba para revisarlo.");
      }
    }
    renameSync(tmpPath, dbPath);
    console.log("");
  }
}
