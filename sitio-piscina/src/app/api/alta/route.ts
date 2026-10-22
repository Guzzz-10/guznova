import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { modoDemo } from "@/lib/entorno";
import { supabaseServicio } from "@/lib/supabase/servidor";
import { obtenerPlanActivo } from "@/lib/contenido/obtener";
import { esquemaClave, esquemaDatosSocio, erroresPorCampo } from "@/lib/socio/validacion";
import { emailAdmin } from "@/lib/admin/auth";

const TIPOS = ["image/jpeg", "image/png", "image/webp"];

/** Alta de un socio: crea la cuenta, guarda la foto (privada) y la ficha. El pago viene después. */
export async function POST(request: NextRequest) {
  if (modoDemo) return NextResponse.json({ error: "El sitio está en modo demo." }, { status: 400 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  const datos = esquemaDatosSocio.safeParse(JSON.parse(String(form.get("datos") ?? "{}")));
  if (!datos.success) return NextResponse.json({ error: "Revisá tus datos.", campos: erroresPorCampo(datos.error) }, { status: 400 });
  const clave = esquemaClave.safeParse(form.get("clave"));
  if (!clave.success) return NextResponse.json({ error: clave.error.issues[0].message, campos: { clave: clave.error.issues[0].message } }, { status: 400 });
  if (!z.literal("true").safeParse(form.get("acepta")).success)
    return NextResponse.json({ error: "Tenés que aceptar los términos y la política de privacidad." }, { status: 400 });

  const plan = await obtenerPlanActivo(String(form.get("plan") ?? ""));
  if (!plan) return NextResponse.json({ error: "El plan elegido no está disponible." }, { status: 400 });

  const foto = form.get("foto");
  if (!(foto instanceof File) || !TIPOS.includes(foto.type) || foto.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Subí una foto JPG, PNG o WebP de hasta 5 MB.", campos: { foto: "Foto inválida" } }, { status: 400 });

  const d = datos.data;
  if (d.email === emailAdmin()) return NextResponse.json({ error: "Ese email no se puede usar para socios.", campos: { email: "Usá otro email." } }, { status: 400 });

  const db = supabaseServicio();
  const { data: existente } = await db.from("socios").select("id").eq("cedula", d.cedula).maybeSingle();
  if (existente)
    return NextResponse.json({ error: "Ya hay un socio con esa cédula. Si sos vos, ingresá a Mi Carnet.", campos: { cedula: "Cédula ya registrada" } }, { status: 409 });

  const { data: creado, error: errUsuario } = await db.auth.admin.createUser({
    email: d.email,
    password: clave.data,
    email_confirm: true,
    user_metadata: { nombre: d.nombre },
  });
  if (errUsuario || !creado.user) {
    const yaExiste = /already|exists|registered/i.test(errUsuario?.message ?? "");
    return NextResponse.json(
      yaExiste
        ? { error: "Ya existe una cuenta con ese email. Ingresá a Mi Carnet para renovar.", campos: { email: "Email ya registrado" } }
        : { error: "No pudimos crear tu cuenta. Probá de nuevo." },
      { status: yaExiste ? 409 : 500 },
    );
  }

  const uid = creado.user.id;
  const ruta = `${uid}/foto-${Date.now()}.${foto.type === "image/png" ? "png" : foto.type === "image/webp" ? "webp" : "jpg"}`;
  try {
    const subida = await db.storage.from("fotos-socios").upload(ruta, foto, { contentType: foto.type, upsert: true });
    if (subida.error) throw subida.error;
    const { error } = await db.from("socios").insert({
      id: uid,
      nombre_completo: d.nombre,
      cedula: d.cedula,
      fecha_nacimiento: d.fechaNacimiento,
      telefono: d.telefono,
      email: d.email,
      foto_path: ruta,
      plan_id: plan.id,
      acepto_terminos_el: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.error("Error en el alta, se deshace:", e);
    await db.storage.from("fotos-socios").remove([ruta]);
    await db.auth.admin.deleteUser(uid);
    return NextResponse.json({ error: "No pudimos completar el alta. Probá de nuevo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
