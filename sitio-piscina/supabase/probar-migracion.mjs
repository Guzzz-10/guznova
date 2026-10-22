// Prueba la migración en un Postgres en memoria (PGlite) con stubs de los esquemas auth y storage de Supabase.
// Uso: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "node:fs";

const db = new PGlite({ extensions: { pgcrypto } });
const q = async (sql, params) => (await db.query(sql, params)).rows;
const exec = (sql) => db.exec(sql);
let ok = 0, mal = 0;
const espero = (nombre, cond, extra = "") => { if (cond) { ok++; console.log("  ✓", nombre); } else { mal++; console.log("  ✗", nombre, extra); } };
const claims = (c) => exec(`select set_config('request.jwt.claims', '${JSON.stringify(c)}', false)`);
const falla = async (sql, params) => { try { await q(sql, params); return null; } catch (e) { return e.message; } };

// Stubs mínimos de Supabase
await exec(`
create schema auth; create schema storage; create schema extensions;
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub', '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select auth.jwt()->>'role' $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
`);
const migracion = fs.readFileSync(process.argv[2] ?? new URL("./migrations/0001_esquema_inicial.sql", import.meta.url), "utf8");
await exec(migracion);
await exec(`grant usage on schema public, auth, storage to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;`);
console.log("Migración aplicada OK (y se puede volver a correr):");
await exec(migracion);
console.log("  ✓ idempotente");

const [u1] = await q(`insert into auth.users (email) values ('ana@x.com') returning id`);
const [u2] = await q(`insert into auth.users (email) values ('beto@x.com') returning id`);
await q(`insert into socios (id, nombre_completo, cedula, fecha_nacimiento, telefono, email, plan_id) values ($1,'Ana Pérez','12345672','1990-01-01','099123456','ana@x.com','full')`, [u1.id]);
await q(`insert into socios (id, nombre_completo, cedula, fecha_nacimiento, telefono, email, plan_id) values ($1,'Beto Díaz','23456783','1985-01-01','099654321','beto@x.com','basico')`, [u2.id]);

console.log("Pagos:");
claims({ role: "authenticated", sub: u1.id, email: "ana@x.com", amr: [{ method: "password" }] });
espero("un socio NO puede registrar pagos", (await falla(`select registrar_pago($1,'full',2690,'mercadopago','aprobado','mp-1')`, [u1.id]))?.includes("NO_PERMITIDO"));
claims({ role: "service_role" });
await q(`select registrar_pago($1,'full',2690,'mercadopago','aprobado','mp-1')`, [u1.id]);
let [s] = await q(`select *, estado_socio(socios) as est from socios where id=$1`, [u1.id]);
espero("pago aprobado activa al socio", s.est === "activo");
espero("asigna número de socio 1001", s.numero_socio === 1001);
espero("genera QR de 32 caracteres", s.qr_token?.length === 32);
const vence1 = new Date(s.vence_el).getTime();
await q(`select registrar_pago($1,'full',2690,'mercadopago','aprobado','mp-1')`, [u1.id]);
[s] = await q(`select * from socios where id=$1`, [u1.id]);
espero("la misma notificación dos veces no extiende dos veces", new Date(s.vence_el).getTime() === vence1);
espero("un solo pago registrado", (await q(`select count(*)::int n from pagos where mp_payment_id='mp-1'`))[0].n === 1);
await q(`select registrar_pago($1,'basico',1490,'mercadopago','pendiente','mp-2')`, [u2.id]);
[s] = await q(`select estado_socio(socios) est from socios where id=$1`, [u2.id]);
espero("pago pendiente no activa", s.est === "pendiente");
await q(`select registrar_pago($1,'basico',1490,'mercadopago','aprobado','mp-2')`, [u2.id]);
[s] = await q(`select estado_socio(socios) est, numero_socio from socios where id=$1`, [u2.id]);
espero("pendiente → aprobado activa", s.est === "activo" && s.numero_socio === 1002);
await q(`select registrar_pago($1,'full',2690,'mercadopago','aprobado','mp-3')`, [u1.id]);
[s] = await q(`select vence_el from socios where id=$1`, [u1.id]);
const dias = (new Date(s.vence_el).getTime() - vence1) / 86400000;
espero("un segundo mes se suma al vencimiento", dias >= 28 && dias <= 31, dias);

console.log("Admin (es_admin):");
await q(`insert into admin_autorizado (email) values ('duenio@gmail.com')`);
claims({ role: "authenticated", sub: u1.id, email: "duenio@gmail.com", amr: [{ method: "password" }] });
espero("email correcto pero con contraseña → NO es admin", (await q(`select es_admin() v`))[0].v === false);
claims({ role: "authenticated", email: "otro@gmail.com", amr: [{ method: "oauth" }] });
espero("otra cuenta de Google → NO es admin", (await q(`select es_admin() v`))[0].v === false);
const admin = { role: "authenticated", sub: "00000000-0000-0000-0000-000000000001", email: "duenio@gmail.com", amr: [{ method: "oauth", timestamp: 1 }] };
claims(admin);
espero("email autorizado + Google → es admin", (await q(`select es_admin() v`))[0].v === true);

console.log("Control de ingreso:");
const [tok] = await q(`select qr_token from socios where id=$1`, [u1.id]);
let [r] = await q(`select validar_ingreso($1) v`, [tok.qr_token]);
espero("QR válido → permitido", r.v.resultado === "permitido" && r.v.socio.nombre === "Ana Pérez");
[r] = await q(`select validar_ingreso('1002') v`);
espero("por N.º de socio", r.v.resultado === "permitido" && r.v.socio.nombre === "Beto Díaz");
[r] = await q(`select validar_ingreso('2.345.678-3') v`);
espero("por cédula", r.v.socio?.nombre === "Beto Díaz");
[r] = await q(`select validar_ingreso('cualquiera') v`);
espero("código desconocido", r.v.resultado === "desconocido");
await q(`update socios set vence_el = now() - interval '1 day' where id=$1`, [u2.id]);
[r] = await q(`select validar_ingreso('1002') v`);
espero("vencido → vencido", r.v.resultado === "vencido");
espero("se registran los accesos", (await q(`select count(*)::int n from accesos`))[0].n === 5);
claims({ role: "authenticated", sub: u1.id, email: "ana@x.com", amr: [{ method: "password" }] });
espero("un socio no puede validar ingresos", (await falla(`select validar_ingreso('1001')`))?.includes("NO_PERMITIDO"));

console.log("Reservas:");
claims(admin);
const [c] = await q(`insert into clases (nombre, tipo) values ('Aquagym','aquafitness') returning id`);
const [h] = await q(`insert into horarios (clase_id, dia, hora, cupo) values ($1, 3, '18:00', 1) returning id`, [c.id]);
claims({ role: "authenticated", sub: u1.id, email: "ana@x.com", amr: [{ method: "password" }] });
[r] = await q(`select reservar_clase($1) v`, [h.id]);
espero("socio activo reserva", r.v.ocupados === 1);
espero("no puede reservar dos veces", (await falla(`select reservar_clase($1)`, [h.id]))?.includes("YA_RESERVADO"));
claims({ role: "authenticated", sub: u2.id, email: "beto@x.com", amr: [{ method: "password" }] });
espero("socio vencido no puede reservar", (await falla(`select reservar_clase($1)`, [h.id]))?.includes("SOCIO_NO_ACTIVO"));
claims({ role: "service_role" });
await q(`select registrar_pago($1,'basico',1490,'efectivo','aprobado')`, [u2.id]);
claims({ role: "authenticated", sub: u2.id, email: "beto@x.com", amr: [{ method: "password" }] });
espero("sin cupo → SIN_CUPO", (await falla(`select reservar_clase($1)`, [h.id]))?.includes("SIN_CUPO"));
const disp = await q(`select * from disponibilidad()`);
espero("disponibilidad pública", disp.length === 1 && disp[0].ocupados === 1, JSON.stringify(disp));
const [p] = await q(`select proxima_fecha(3::smallint, '18:00') f, extract(isodow from proxima_fecha(3::smallint, '18:00'))::int d`);
espero("la próxima fecha cae en miércoles", p.d === 3);

console.log("RLS:");
await exec(`set role authenticated`);
claims({ role: "authenticated", sub: u1.id, email: "ana@x.com", amr: [{ method: "password" }] });
let filas = await q(`select id from socios`);
espero("un socio ve solo su ficha", filas.length === 1 && filas[0].id === u1.id);
filas = await q(`select id from pagos`);
espero("un socio ve solo sus pagos", filas.every(() => true) && (await q(`select count(*)::int n from pagos where socio_id <> $1`, [u1.id]))[0].n === 0);
espero("un socio no puede cambiar su vencimiento", (await q(`update socios set vence_el = now() + interval '5 years' where id=$1 returning id`, [u1.id])).length === 0);
espero("un socio no ve los accesos", (await q(`select count(*)::int n from accesos`))[0].n === 0);
espero("un socio no puede editar planes", !!(await falla(`insert into planes (id, nombre, precio) values ('x','X',1)`)));
espero("nadie lee los secretos", (await q(`select count(*)::int n from secretos`))[0].n === 0);
claims(admin);
espero("el admin ve todos los socios", (await q(`select count(*)::int n from socios`))[0].n === 2);
await q(`insert into planes (id, nombre, precio) values ('x','X',100)`);
espero("el admin edita planes", (await q(`select count(*)::int n from planes`))[0].n === 1);
const est = (await q(`select estadisticas_admin() e`))[0].e;
espero("estadísticas del dashboard", est.activos === 2 && est.serie_ingresos.length === 12 && est.reservas_hoy >= 0, JSON.stringify(est).slice(0, 200));
await exec(`set role anon`);
claims({ role: "anon" });
espero("anónimo lee planes", (await q(`select count(*)::int n from planes`))[0].n === 1);
espero("anónimo NO lee socios", (await q(`select count(*)::int n from socios`))[0].n === 0);
espero("anónimo NO ejecuta registrar_pago", !!(await falla(`select registrar_pago($1,'full',1,'efectivo','aprobado')`, [u1.id])));
await exec(`reset role`);

console.log(`\n${ok} ok, ${mal} fallas`);
process.exit(mal ? 1 : 0);
