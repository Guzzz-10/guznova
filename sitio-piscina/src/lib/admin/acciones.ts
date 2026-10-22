"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminParaAccion, emailAdmin } from "@/lib/admin/auth";
import { supabaseServicio } from "@/lib/supabase/servidor";
import { supabaseUrl } from "@/lib/entorno";
import { esquemaDatosSocio, erroresPorCampo } from "@/lib/socio/validacion";
import { mensajeError } from "@/lib/socio/tipos";
import { isoDesdeDia, ahoraMontevideo } from "@/lib/dias";
import { precioUYU } from "@/lib/formato";
import { contenidoPorDefecto } from "@/lib/contenido/obtener";
import { credencialesMP, probarConexion } from "@/lib/pagos/mercadopago";
import type { Resultado } from "./tipos";

type Ctx = { supabase: SupabaseClient; email: string };

/* ───────── utilidades ───────── */

function traducir(e: unknown) {
  const err = e as { code?: string; message?: string };
  if (err?.code === "23505") return "Ya existe un registro con ese dato (por ejemplo, una cédula o email repetido).";
  if (err?.code === "42501" || /row-level security|NO_PERMITIDO/i.test(err?.message ?? "")) return "Acceso no autorizado.";
  return mensajeError(e);
}

async function conAdmin(fn: (ctx: Ctx) => Promise<Resultado>): Promise<Resultado> {
  const ctx = await adminParaAccion();
  if ("error" in ctx) return { ok: false, mensaje: ctx.error ?? "Acceso no autorizado." };
  try {
    return await fn(ctx);
  } catch (e) {
    console.error("Acción del panel:", e);
    return { ok: false, mensaje: traducir(e) };
  }
}

async function registrar({ supabase, email }: Ctx, accion: string, detalle: string) {
  await supabase.from("actividad").insert({ email, accion, detalle: detalle.slice(0, 500) });
}

/** Refresca el sitio público y el panel después de un cambio. */
function refrescar() {
  revalidatePath("/", "layout");
}

const texto = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const json = <T>(fd: FormData, k: string, porDefecto: T): T => {
  try {
    return JSON.parse(String(fd.get(k) ?? "")) as T;
  } catch {
    return porDefecto;
  }
};

/** Solo imágenes subidas al sitio (Supabase Storage) o las de ejemplo en /imagenes. */
const urlImagen = z
  .string()
  .trim()
  .refine((u) => u === "" || u.startsWith("/imagenes/") || (supabaseUrl !== "" && u.startsWith(`${supabaseUrl}/storage/v1/object/public/`)), "Subí la imagen desde el panel.");
const urlWeb = z
  .string()
  .trim()
  .refine((u) => u === "" || /^https:\/\//.test(u), "Tiene que empezar con https://");

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "plan";

/* ═════════════════ SOCIOS ═════════════════ */

export async function guardarSocio(_: Resultado, fd: FormData): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const id = texto(fd, "id");
    const datos = esquemaDatosSocio.safeParse({
      nombre: texto(fd, "nombre"),
      cedula: texto(fd, "cedula"),
      fechaNacimiento: texto(fd, "fechaNacimiento"),
      telefono: texto(fd, "telefono"),
      email: texto(fd, "email"),
    });
    if (!datos.success) return { ok: false, mensaje: Object.values(erroresPorCampo(datos.error)).join(" ") };
    const d = datos.data;
    if (d.email === emailAdmin()) return { ok: false, mensaje: "Ese email está reservado para el administrador." };
    const plan = texto(fd, "plan");
    const fila = {
      nombre_completo: d.nombre,
      cedula: d.cedula,
      fecha_nacimiento: d.fechaNacimiento,
      telefono: d.telefono,
      email: d.email,
      plan_id: plan,
      notas: texto(fd, "notas") || null,
    };

    if (id) {
      const { data: antes } = await ctx.supabase.from("socios").select("email").eq("id", id).single();
      if (antes && antes.email !== d.email) {
        const { error } = await supabaseServicio().auth.admin.updateUserById(id, { email: d.email, email_confirm: true });
        if (error) return { ok: false, mensaje: "No se pudo cambiar el email (¿ya lo usa otra cuenta?)." };
      }
      const { error } = await ctx.supabase.from("socios").update(fila).eq("id", id);
      if (error) throw error;
      await registrar(ctx, "Editó un socio", d.nombre);
      refrescar();
      return { ok: true, mensaje: "¡Datos guardados!", id };
    }

    // Alta manual: la cuenta se crea sin contraseña (el socio entra con un código por email).
    const servicio = supabaseServicio();
    const { data: creado, error: errU } = await servicio.auth.admin.createUser({ email: d.email, email_confirm: true, user_metadata: { nombre: d.nombre } });
    if (errU || !creado.user) return { ok: false, mensaje: /already|exists|registered/i.test(errU?.message ?? "") ? "Ya existe una cuenta con ese email." : "No se pudo crear la cuenta." };
    const { error } = await ctx.supabase.from("socios").insert({ id: creado.user.id, ...fila, acepto_terminos_el: new Date().toISOString() });
    if (error) {
      await servicio.auth.admin.deleteUser(creado.user.id);
      throw error;
    }

    let detalle = d.nombre;
    if (fd.get("pagoInicial") === "on") {
      const meses = Math.min(12, Math.max(1, Number(fd.get("meses") || 1)));
      const monto = Number(fd.get("monto") || 0);
      const { error: errP } = await ctx.supabase.rpc("registrar_pago", {
        p_socio: creado.user.id,
        p_plan: plan,
        p_monto: monto,
        p_metodo: texto(fd, "metodo") === "transferencia" ? "transferencia" : "efectivo",
        p_estado: "aprobado",
        p_detalle: `Alta en recepción (${meses} ${meses === 1 ? "mes" : "meses"})`,
        p_meses: meses,
      });
      if (errP) throw errP;
      detalle += ` · pago inicial ${precioUYU(monto)}`;
    }
    await registrar(ctx, "Creó un socio", detalle);
    refrescar();
    return { ok: true, mensaje: "¡Socio creado! Ahora podés subir su foto.", id: creado.user.id };
  });
}

export async function asignarFotoSocio(id: string, ruta: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    if (!ruta.startsWith(`${id}/`)) return { ok: false, mensaje: "Ruta de foto inválida." };
    const { data: antes } = await ctx.supabase.from("socios").select("foto_path, nombre_completo").eq("id", id).single();
    const { error } = await ctx.supabase.from("socios").update({ foto_path: ruta }).eq("id", id);
    if (error) throw error;
    if (antes?.foto_path && antes.foto_path !== ruta) await ctx.supabase.storage.from("fotos-socios").remove([antes.foto_path]);
    await registrar(ctx, "Cambió la foto de un socio", antes?.nombre_completo ?? id);
    return { ok: true, mensaje: "Foto actualizada." };
  });
}

export async function cambiarSuspension(id: string, suspendido: boolean): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const { data, error } = await ctx.supabase.from("socios").update({ suspendido }).eq("id", id).select("nombre_completo, numero_socio").single();
    if (error) throw error;
    await registrar(ctx, suspendido ? "Suspendió a un socio" : "Reactivó a un socio", `${data.nombre_completo} (N.º ${data.numero_socio ?? "—"})`);
    refrescar();
    return { ok: true, mensaje: suspendido ? "Socio suspendido: no va a poder entrar." : "Socio reactivado." };
  });
}

export async function eliminarSocio(id: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const { data: s } = await ctx.supabase.from("socios").select("nombre_completo, numero_socio").eq("id", id).single();
    if (!s) return { ok: false, mensaje: "No existe ese socio." };
    const servicio = supabaseServicio();
    const { data: archivos } = await servicio.storage.from("fotos-socios").list(id);
    if (archivos?.length) await servicio.storage.from("fotos-socios").remove(archivos.map((a) => `${id}/${a.name}`));
    const { error } = await servicio.auth.admin.deleteUser(id);
    if (error) throw error;
    await registrar(ctx, "Eliminó a un socio", `${s.nombre_completo} (N.º ${s.numero_socio ?? "—"}). Sus pagos quedan en el historial.`);
    refrescar();
    return { ok: true, mensaje: "Socio eliminado." };
  });
}

export async function renovarSocio(_: Resultado, fd: FormData): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const socio = texto(fd, "socio");
    const plan = texto(fd, "plan");
    const meses = Math.min(12, Math.max(1, Number(fd.get("meses") || 1)));
    const monto = Number(fd.get("monto"));
    const metodo = texto(fd, "metodo") === "transferencia" ? "transferencia" : "efectivo";
    if (!socio || !plan) return { ok: false, mensaje: "Elegí el socio y el plan." };
    if (!Number.isFinite(monto) || monto < 0) return { ok: false, mensaje: "Revisá el monto." };
    const { data, error } = await ctx.supabase.rpc("registrar_pago", {
      p_socio: socio,
      p_plan: plan,
      p_monto: monto,
      p_metodo: metodo,
      p_estado: "aprobado",
      p_detalle: texto(fd, "detalle") || `Pago en recepción (${meses} ${meses === 1 ? "mes" : "meses"})`,
      p_meses: meses,
    });
    if (error) throw error;
    await registrar(ctx, "Registró un pago", `${data.socio_nombre} · ${plan} · ${metodo} · ${precioUYU(monto)} · ${meses} mes(es)`);
    refrescar();
    return { ok: true, mensaje: `¡Pago registrado! Vence el ${new Date(data.periodo_hasta).toLocaleDateString("es-UY")}.` };
  });
}

export async function regenerarQRSocio(id: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const { error } = await ctx.supabase.rpc("regenerar_qr", { p_socio: id });
    if (error) throw error;
    await registrar(ctx, "Generó un QR nuevo", id);
    return { ok: true, mensaje: "QR nuevo generado. El anterior ya no funciona." };
  });
}

/* ═════════════════ RESERVAS ═════════════════ */

export async function cancelarReservaAdmin(id: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const { error } = await ctx.supabase.rpc("cancelar_reserva", { p_reserva: id });
    if (error) throw error;
    await registrar(ctx, "Canceló una reserva", id);
    refrescar();
    return { ok: true, mensaje: "Reserva cancelada." };
  });
}

export async function moverReservaAdmin(id: string, horarioId: string, fecha: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const { error } = await ctx.supabase.rpc("mover_reserva", { p_reserva: id, p_horario: horarioId, p_fecha: fecha });
    if (error) throw error;
    await registrar(ctx, "Movió una reserva", `${id} → ${fecha}`);
    refrescar();
    return { ok: true, mensaje: "Reserva movida." };
  });
}

/* ═════════════════ PLANES ═════════════════ */

const esquemaPlan = z.object({
  nombre: z.string().trim().min(2, "Poné un nombre.").max(60),
  precio: z.coerce.number().int("El precio va sin centésimos.").positive("El precio tiene que ser mayor a 0."),
  bajada: z.string().trim().max(120),
  etiqueta: z.string().trim().max(30),
  incluye: z.array(z.string().trim().min(1).max(120)).max(12),
  color: z.enum(["agua", "coral", "sol"]),
});

export async function guardarPlan(_: Resultado, fd: FormData): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const p = esquemaPlan.safeParse({
      nombre: texto(fd, "nombre"),
      precio: texto(fd, "precio"),
      bajada: texto(fd, "bajada"),
      etiqueta: texto(fd, "etiqueta"),
      incluye: json<string[]>(fd, "incluye", []).filter(Boolean),
      color: texto(fd, "color") || "agua",
    });
    if (!p.success) return { ok: false, mensaje: p.error.issues[0].message };
    const destacado = fd.get("destacado") === "on";
    const activo = fd.get("activo") === "on";
    let id = texto(fd, "id");
    const { data: existentes } = await ctx.supabase.from("planes").select("id, precio, orden");
    const anterior = existentes?.find((x) => x.id === id);
    if (!anterior) {
      const base = slug(p.data.nombre);
      id = base;
      for (let n = 2; existentes?.some((x) => x.id === id); n++) id = `${base}-${n}`;
    }
    const { error } = await ctx.supabase.from("planes").upsert({
      id,
      ...p.data,
      etiqueta: p.data.etiqueta || null,
      destacado,
      activo,
      orden: anterior?.orden ?? (existentes?.length ?? 0) + 1,
    });
    if (error) throw error;
    if (destacado) await ctx.supabase.from("planes").update({ destacado: false }).neq("id", id);
    await registrar(
      ctx,
      anterior ? "Editó un plan" : "Creó un plan",
      `${p.data.nombre}${anterior && anterior.precio !== p.data.precio ? `: precio ${precioUYU(anterior.precio)} → ${precioUYU(p.data.precio)}` : ` · ${precioUYU(p.data.precio)}`}`,
    );
    refrescar();
    return { ok: true, mensaje: "¡Plan guardado! Ya se ve en el sitio.", id };
  });
}

export async function eliminarPlan(id: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const { count } = await ctx.supabase.from("socios").select("id", { count: "exact", head: true }).eq("plan_id", id);
    if (count) return { ok: false, mensaje: `Hay ${count} socio(s) con este plan. Desactivalo en lugar de borrarlo.` };
    const { error } = await ctx.supabase.from("planes").delete().eq("id", id);
    if (error) throw error;
    await registrar(ctx, "Eliminó un plan", id);
    refrescar();
    return { ok: true, mensaje: "Plan eliminado." };
  });
}

export async function alternarActivo(tabla: "planes" | "clases", id: string, activo: boolean): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const campo = tabla === "planes" ? "activo" : "activa";
    const { data, error } = await ctx.supabase.from(tabla).update({ [campo]: activo }).eq("id", id).select("nombre").single();
    if (error) throw error;
    await registrar(ctx, activo ? "Activó" : "Desactivó", `${tabla === "planes" ? "Plan" : "Clase"} ${data.nombre}`);
    refrescar();
    return { ok: true, mensaje: activo ? "Activado: ya se ve en el sitio." : "Desactivado: ya no se muestra en el sitio." };
  });
}

const TABLAS_ORDENABLES = ["planes", "piscinas", "galeria", "hitos", "clases"] as const;

/** Sube o baja un elemento en el orden de su lista. */
export async function moverOrden(tabla: (typeof TABLAS_ORDENABLES)[number], id: string, direccion: -1 | 1): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    if (!TABLAS_ORDENABLES.includes(tabla)) return { ok: false, mensaje: "Lista inválida." };
    const { data } = await ctx.supabase.from(tabla).select("id, orden").order("orden");
    const lista = (data ?? []).map((x, i) => ({ ...x, orden: i + 1 }));
    const i = lista.findIndex((x) => x.id === id);
    const j = i + direccion;
    if (i < 0 || j < 0 || j >= lista.length) return { ok: true, mensaje: "" };
    [lista[i].orden, lista[j].orden] = [lista[j].orden, lista[i].orden];
    for (const x of [lista[i], lista[j]]) await ctx.supabase.from(tabla).update({ orden: x.orden }).eq("id", x.id);
    refrescar();
    return { ok: true, mensaje: "Orden actualizado." };
  });
}

/* ═════════════════ CLASES Y HORARIOS ═════════════════ */

const esquemaClase = z.object({
  nombre: z.string().trim().min(2, "Poné un nombre.").max(80),
  tipo: z.enum(["natacion", "aquafitness", "bebes", "nado-libre"]),
  descripcion: z.string().trim().max(400),
  profesor: z.string().trim().max(80),
  nivel: z.string().trim().max(60),
  edad: z.string().trim().max(60),
  grupos: z.array(z.enum(["bebes", "ninos", "adolescentes", "adultos", "mayores"])),
  duracion: z.string().trim().max(30),
  precio: z.coerce.number().int().min(0, "El precio no puede ser negativo."),
  frecuencia: z.string().trim().max(60),
  incluida_en: z.string().trim().max(60),
  piscina: z.string().trim().max(60),
  color: z.enum(["agua", "coral", "sol", "mar", "lima", "uva"]),
  icono: z.enum(["bebe", "pato", "nadador", "olas", "pesa", "musica", "corazon", "reloj"]),
  foto_url: urlImagen,
  activa: z.boolean(),
});

const esquemaHorarios = z.array(
  z.object({
    id: z.string().optional(),
    dia: z.enum(["lun", "mar", "mie", "jue", "vie", "sab", "dom"]),
    hora: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
    cupo: z.coerce.number().int().min(0).max(500),
    activo: z.boolean(),
  }),
);

export async function guardarClase(_: Resultado, fd: FormData): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const c = esquemaClase.safeParse({
      nombre: texto(fd, "nombre"),
      tipo: texto(fd, "tipo"),
      descripcion: texto(fd, "descripcion"),
      profesor: texto(fd, "profesor"),
      nivel: texto(fd, "nivel"),
      edad: texto(fd, "edad"),
      grupos: fd.getAll("grupos").map(String),
      duracion: texto(fd, "duracion"),
      precio: texto(fd, "precio") || 0,
      frecuencia: texto(fd, "frecuencia"),
      incluida_en: texto(fd, "incluida_en"),
      piscina: texto(fd, "piscina"),
      color: texto(fd, "color") || "agua",
      icono: texto(fd, "icono") || "nadador",
      foto_url: texto(fd, "foto_url"),
      activa: fd.get("activa") === "on",
    });
    if (!c.success) return { ok: false, mensaje: c.error.issues[0].message };
    const h = esquemaHorarios.safeParse(json(fd, "horarios", []));
    if (!h.success) return { ok: false, mensaje: "Revisá los horarios: " + h.error.issues[0].message };
    const repetidos = new Set<string>();
    for (const x of h.data) {
      const k = `${x.dia}-${x.hora}`;
      if (repetidos.has(k)) return { ok: false, mensaje: `El horario ${x.dia} ${x.hora} está repetido.` };
      repetidos.add(k);
    }

    let id = texto(fd, "id");
    const fila = { ...c.data, foto_url: c.data.foto_url || null };
    if (id) {
      const { error } = await ctx.supabase.from("clases").update(fila).eq("id", id);
      if (error) throw error;
    } else {
      const { count } = await ctx.supabase.from("clases").select("id", { count: "exact", head: true });
      const { data, error } = await ctx.supabase
        .from("clases")
        .insert({ ...fila, orden: (count ?? 0) + 1 })
        .select("id")
        .single();
      if (error) throw error;
      id = data.id;
    }

    // Sincroniza los horarios. Los que tienen reservas futuras se desactivan en vez de borrarse.
    const { data: actuales } = await ctx.supabase.from("horarios").select("id").eq("clase_id", id);
    const quedan = new Set(h.data.map((x) => x.id).filter(Boolean));
    for (const viejo of actuales ?? []) {
      if (quedan.has(viejo.id)) continue;
      const { count } = await ctx.supabase
        .from("reservas")
        .select("id", { count: "exact", head: true })
        .eq("horario_id", viejo.id)
        .eq("estado", "confirmada")
        .gte("fecha", ahoraMontevideo().fecha);
      if (count) await ctx.supabase.from("horarios").update({ activo: false }).eq("id", viejo.id);
      else await ctx.supabase.from("horarios").delete().eq("id", viejo.id);
    }
    for (const x of h.data) {
      const valores = { clase_id: id, dia: isoDesdeDia(x.dia), hora: x.hora, cupo: x.cupo, activo: x.activo };
      const r = x.id && (actuales ?? []).some((a) => a.id === x.id) ? await ctx.supabase.from("horarios").update(valores).eq("id", x.id) : await ctx.supabase.from("horarios").insert(valores);
      if (r.error) throw r.error;
    }

    await registrar(ctx, texto(fd, "id") ? "Editó una clase" : "Creó una clase", `${c.data.nombre} · ${h.data.length} horario(s)`);
    refrescar();
    return { ok: true, mensaje: "¡Clase guardada! Ya se ve en el sitio.", id };
  });
}

export async function eliminarClase(id: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const { data, error } = await ctx.supabase.from("clases").delete().eq("id", id).select("nombre").single();
    if (error) throw error;
    await registrar(ctx, "Eliminó una clase", data.nombre);
    refrescar();
    return { ok: true, mensaje: "Clase eliminada." };
  });
}

/* ═════════════════ CONTENIDO DEL SITIO ═════════════════ */

const esquemasBloque = {
  negocio: z.object({
    nombre: z.string().trim().min(1).max(60),
    nombreCompleto: z.string().trim().max(100),
    eslogan: z.string().trim().max(60),
    descripcion: z.string().trim().max(300),
    ciudad: z.string().trim().max(60),
    departamento: z.string().trim().max(60),
    pais: z.string().trim().max(60),
    direccion: z.string().trim().max(120),
    codigoPostal: z.string().trim().max(10),
    telefono: z.string().trim().max(30),
    email: z.union([z.literal(""), z.email("Email inválido")]),
    anioFundacion: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
    logoUrl: urlImagen.nullable().transform((v) => v || null),
    redes: z.object({ instagram: urlWeb, facebook: urlWeb, tiktok: urlWeb }),
    mapa: z.object({
      embed: z
        .string()
        .trim()
        .refine((u) => u === "" || /^https:\/\/(www\.)?google\.[a-z.]+\/maps/.test(u), "Pegá el enlace de “Insertar mapa” de Google Maps."),
      enlace: urlWeb,
    }),
    horarios: z.array(z.object({ dias: z.string().trim().min(1).max(40), horas: z.string().trim().min(1).max(40) })).max(10),
  }),
  hero: z.object({
    chip: z.string().trim().max(60),
    titulo: z.string().trim().min(1).max(60),
    destacado: z.string().trim().max(40),
    subtitulo: z.string().trim().max(300),
    imagenUrl: urlImagen.refine((u) => u !== "", "Elegí una imagen de fondo."),
    videoUrl: urlImagen,
    puntos: z.array(z.string().trim().min(1).max(50)).max(6),
  }),
  historia: z.object({
    bajada: z.string().trim().max(300),
    frase: z.object({ texto: z.string().trim().max(400), autor: z.string().trim().max(60), rol: z.string().trim().max(60) }),
    contadores: z
      .array(z.object({ valor: z.union([z.literal("anios"), z.coerce.number().int().min(0)]), prefijo: z.string().max(3), label: z.string().trim().min(1).max(40) }))
      .max(6),
  }),
  contacto: z.object({ titulo: z.string().trim().min(1).max(60), destacado: z.string().trim().max(60), subtitulo: z.string().trim().max(300) }),
  whatsapp: z.object({
    numero: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => v.length >= 8 && v.length <= 15, "El número va con código de país, ej: 59899123456."),
    mensajeGeneral: z.string().trim().max(300),
    temas: z.array(z.object({ label: z.string().trim().min(1).max(30), emoji: z.string().max(8), mensaje: z.string().trim().min(1).max(400) })).max(8),
  }),
};

export type ClaveBloque = keyof typeof esquemasBloque;

const nombreBloque: Record<ClaveBloque, string> = {
  negocio: "Datos del negocio",
  hero: "Textos del inicio",
  historia: "Historia",
  contacto: "Contacto",
  whatsapp: "WhatsApp y mensajes",
};

export async function guardarBloque(clave: ClaveBloque, valor: unknown): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const esquema = esquemasBloque[clave];
    if (!esquema) return { ok: false, mensaje: "Bloque inválido." };
    const r = esquema.safeParse(valor);
    if (!r.success) return { ok: false, mensaje: `${r.error.issues[0].path.join(" › ")}: ${r.error.issues[0].message}` };
    const { error } = await ctx.supabase.from("contenido").upsert({ clave, valor: r.data, actualizado_el: new Date().toISOString() });
    if (error) throw error;
    await registrar(ctx, "Editó el contenido", nombreBloque[clave]);
    refrescar();
    return { ok: true, mensaje: "¡Guardado! Los cambios ya se ven en el sitio." };
  });
}

const esquemaPiscina = z.object({
  id: z.string().optional(),
  nombre: z.string().trim().min(1, "Poné un nombre.").max(60),
  tipo: z.string().trim().max(60),
  descripcion: z.string().trim().max(300),
  imagen: urlImagen,
  medidas: z.string().trim().max(60),
  profundidad: z.string().trim().max(60),
  temperatura: z.string().trim().max(20),
  idealPara: z.array(z.string().trim().min(1).max(60)).max(6),
  color: z.enum(["agua", "coral", "sol"]),
});

export async function guardarPiscina(datos: z.input<typeof esquemaPiscina>): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const p = esquemaPiscina.safeParse(datos);
    if (!p.success) return { ok: false, mensaje: p.error.issues[0].message };
    const { id, imagen, idealPara, ...resto } = p.data;
    const fila = { ...resto, imagen_url: imagen || null, ideal_para: idealPara };
    if (id) {
      const { error } = await ctx.supabase.from("piscinas").update(fila).eq("id", id);
      if (error) throw error;
    } else {
      const { count } = await ctx.supabase.from("piscinas").select("id", { count: "exact", head: true });
      const { error } = await ctx.supabase.from("piscinas").insert({ ...fila, orden: (count ?? 0) + 1 });
      if (error) throw error;
    }
    await registrar(ctx, id ? "Editó una piscina" : "Agregó una piscina", p.data.nombre);
    refrescar();
    return { ok: true, mensaje: "¡Piscina guardada!" };
  });
}

const esquemaHito = z.object({
  id: z.string().optional(),
  anio: z.coerce.number().int().min(1900).max(2100),
  titulo: z.string().trim().min(1, "Poné un título.").max(100),
  texto: z.string().trim().max(400),
  imagen: urlImagen.nullable(),
  imagenAlt: z.string().trim().max(120),
  antigua: z.boolean(),
});

export async function guardarHito(datos: z.input<typeof esquemaHito>): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const h = esquemaHito.safeParse(datos);
    if (!h.success) return { ok: false, mensaje: h.error.issues[0].message };
    const { id, imagen, imagenAlt, ...resto } = h.data;
    const fila = { ...resto, imagen_url: imagen || null, imagen_alt: imagenAlt };
    if (id) {
      const { error } = await ctx.supabase.from("hitos").update(fila).eq("id", id);
      if (error) throw error;
    } else {
      const { count } = await ctx.supabase.from("hitos").select("id", { count: "exact", head: true });
      const { error } = await ctx.supabase.from("hitos").insert({ ...fila, orden: (count ?? 0) + 1 });
      if (error) throw error;
    }
    await registrar(ctx, id ? "Editó un hito de la historia" : "Agregó un hito a la historia", `${h.data.anio} · ${h.data.titulo}`);
    refrescar();
    return { ok: true, mensaje: "¡Hito guardado!" };
  });
}

export async function eliminarElemento(tabla: "piscinas" | "hitos" | "galeria", id: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    if (!["piscinas", "hitos", "galeria"].includes(tabla)) return { ok: false, mensaje: "Lista inválida." };
    const { data, error } = await ctx.supabase.from(tabla).delete().eq("id", id).select("*").single();
    if (error) throw error;
    if (tabla === "galeria" && data.storage_path) await ctx.supabase.storage.from("sitio").remove([data.storage_path]);
    await registrar(ctx, "Eliminó contenido", `${tabla}: ${data.nombre ?? data.titulo ?? data.alt ?? id}`);
    refrescar();
    return { ok: true, mensaje: "Eliminado." };
  });
}

export async function agregarFotosGaleria(fotos: { url: string; path: string; alt: string; ancho: number; alto: number }[]): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const validas = fotos.filter((f) => urlImagen.safeParse(f.url).success && f.url);
    if (!validas.length) return { ok: false, mensaje: "No hay fotos válidas para agregar." };
    const { count } = await ctx.supabase.from("galeria").select("id", { count: "exact", head: true });
    const { error } = await ctx.supabase.from("galeria").insert(
      validas.map((f, i) => ({ url: f.url, storage_path: f.path, alt: f.alt.slice(0, 160), ancho: Math.round(f.ancho), alto: Math.round(f.alto), orden: (count ?? 0) + i + 1 })),
    );
    if (error) throw error;
    await registrar(ctx, "Subió fotos a la galería", `${validas.length} foto(s)`);
    refrescar();
    return { ok: true, mensaje: `¡${validas.length === 1 ? "Foto agregada" : `${validas.length} fotos agregadas`}!` };
  });
}

export async function editarAltFoto(id: string, alt: string): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const { error } = await ctx.supabase.from("galeria").update({ alt: alt.trim().slice(0, 160) }).eq("id", id);
    if (error) throw error;
    refrescar();
    return { ok: true, mensaje: "Descripción guardada." };
  });
}

/** Copia el contenido de ejemplo a la base para poder editarlo desde el panel. */
export async function importarContenidoEjemplo(): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const c = contenidoPorDefecto;
    const db = ctx.supabase;
    const vacia = async (t: string) => ((await db.from(t).select("*", { count: "exact", head: true })).count ?? 0) === 0;
    const hechas: string[] = [];

    const { data: bloques } = await db.from("contenido").select("clave");
    const faltan = (["negocio", "hero", "historia", "contacto", "whatsapp"] as const).filter((k) => !bloques?.some((b) => b.clave === k));
    if (faltan.length) {
      const { error } = await db.from("contenido").insert(faltan.map((clave) => ({ clave, valor: c[clave] })));
      if (error) throw error;
      hechas.push("textos");
    }
    if (await vacia("planes")) {
      const { error } = await db.from("planes").insert(c.planes.map(({ id, nombre, precio, bajada, etiqueta, destacado, incluye, color, activo, orden }) => ({ id, nombre, precio, bajada, etiqueta, destacado, incluye, color, activo, orden })));
      if (error) throw error;
      hechas.push("planes");
    }
    if (await vacia("piscinas")) {
      const { error } = await db.from("piscinas").insert(
        c.piscinas.map((p) => ({ nombre: p.nombre, tipo: p.tipo, descripcion: p.descripcion, imagen_url: p.imagen, medidas: p.medidas, profundidad: p.profundidad, temperatura: p.temperatura, ideal_para: p.idealPara, color: p.color, orden: p.orden })),
      );
      if (error) throw error;
      hechas.push("piscinas");
    }
    if (await vacia("galeria")) {
      const { error } = await db.from("galeria").insert(c.galeria.map((g) => ({ url: g.src, alt: g.alt, ancho: g.ancho, alto: g.alto, orden: g.orden })));
      if (error) throw error;
      hechas.push("galería");
    }
    if (await vacia("hitos")) {
      const { error } = await db.from("hitos").insert(c.hitos.map((h) => ({ anio: h.anio, titulo: h.titulo, texto: h.texto, imagen_url: h.imagen, imagen_alt: h.imagenAlt, antigua: h.antigua, orden: h.orden })));
      if (error) throw error;
      hechas.push("historia");
    }
    if (await vacia("clases")) {
      for (const cl of c.clases) {
        const { data, error } = await db
          .from("clases")
          .insert({
            nombre: cl.nombre,
            tipo: cl.tipo,
            descripcion: cl.descripcion,
            profesor: cl.profesor,
            nivel: cl.nivel,
            edad: cl.edad,
            grupos: cl.grupos,
            duracion: cl.duracion,
            precio: cl.precio,
            frecuencia: cl.frecuencia,
            incluida_en: cl.incluidaEn,
            piscina: cl.piscina,
            color: cl.color,
            icono: cl.icono,
            activa: cl.activa,
            orden: cl.orden,
          })
          .select("id")
          .single();
        if (error) throw error;
        const { error: eh } = await db.from("horarios").insert(cl.horarios.map((h) => ({ clase_id: data.id, dia: isoDesdeDia(h.dia), hora: h.hora, cupo: h.cupo, activo: h.activo })));
        if (eh) throw eh;
      }
      hechas.push("clases");
    }
    if (!hechas.length) return { ok: true, mensaje: "Ya tenías todo el contenido cargado." };
    await registrar(ctx, "Importó el contenido de ejemplo", hechas.join(", "));
    refrescar();
    return { ok: true, mensaje: `¡Listo! Se cargó: ${hechas.join(", ")}. Ahora podés editar todo.` };
  });
}

/* ═════════════════ CONFIGURACIÓN ═════════════════ */

export async function guardarCredencialesMP(_: Resultado, fd: FormData): Promise<Resultado> {
  return conAdmin(async (ctx) => {
    const token = texto(fd, "token");
    const secreto = texto(fd, "secreto");
    if (token && !/^(APP_USR|TEST)-/.test(token)) return { ok: false, mensaje: "El Access Token empieza con APP_USR- (producción) o TEST- (prueba)." };
    if (token) {
      try {
        await probarConexion(token);
      } catch {
        return { ok: false, mensaje: "Mercado Pago rechazó ese Access Token. Revisalo." };
      }
    }
    const servicio = supabaseServicio();
    const filas = [token && { clave: "mp_access_token", valor: token }, secreto && { clave: "mp_webhook_secret", valor: secreto }].filter(Boolean) as { clave: string; valor: string }[];
    if (!filas.length) return { ok: false, mensaje: "No cargaste nada para guardar." };
    const { error } = await servicio.from("secretos").upsert(filas.map((f) => ({ ...f, actualizado_el: new Date().toISOString() })));
    if (error) throw error;
    await registrar(ctx, "Actualizó la conexión con Mercado Pago", filas.map((f) => f.clave).join(", "));
    return { ok: true, mensaje: "¡Credenciales guardadas!" };
  });
}

export async function probarMercadoPago(): Promise<Resultado> {
  return conAdmin(async () => {
    const { accessToken, origen } = await credencialesMP();
    if (!accessToken) return { ok: false, mensaje: "Todavía no hay un Access Token cargado." };
    try {
      const yo = await probarConexion(accessToken);
      return { ok: true, mensaje: `Conectado a la cuenta ${yo.nickname} (${yo.site_id}) · token ${accessToken.startsWith("TEST-") ? "de prueba" : "de producción"} cargado desde ${origen === "entorno" ? "las variables de entorno" : "el panel"}.` };
    } catch {
      return { ok: false, mensaje: "Mercado Pago rechazó el token guardado." };
    }
  });
}
