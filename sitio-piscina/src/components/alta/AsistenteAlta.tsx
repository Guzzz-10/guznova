"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, Eye, EyeOff, LoaderCircle, Lock, RefreshCw } from "lucide-react";
import type { Plan } from "@/lib/contenido/tipos";
import { precioUYU } from "@/lib/formato";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { demo } from "@/lib/demo/almacen";
import { esquemaClave, esquemaDatosSocio, erroresPorCampo, type DatosSocio } from "@/lib/socio/validacion";
import { useSesionSocio } from "@/lib/socio/useSesion";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";
import { PasoFoto } from "./PasoFoto";
import { dataUrlABlob } from "./recorte";

const pasos = [
  { titulo: "Plan", emoji: "💳" },
  { titulo: "Tus datos", emoji: "📝" },
  { titulo: "Foto", emoji: "🤳" },
  { titulo: "Términos", emoji: "✅" },
  { titulo: "Pago", emoji: "🎉" },
];

type Estado = {
  paso: number;
  planId: string;
  datos: DatosSocio;
  foto: string | null;
  terminos: boolean;
  privacidad: boolean;
  modo: "suscripcion" | "unico";
  cuentaCreada: boolean;
};

const CLAVE = "alta:borrador";
const vacio = (planId: string): Estado => ({
  paso: 0,
  planId,
  datos: { nombre: "", cedula: "", fechaNacimiento: "", telefono: "", email: "" },
  foto: null,
  terminos: false,
  privacidad: false,
  modo: "suscripcion",
  cuentaCreada: false,
});

function BarraProgreso({ paso }: { paso: number }) {
  return (
    <nav aria-label="Progreso del alta" className="mb-8">
      <p className="mb-3 text-center text-sm font-semibold text-mar-600">
        Paso {paso + 1} de {pasos.length}: <span className="text-mar-900">{pasos[paso].titulo}</span>
      </p>
      <div className="relative">
        <div className="absolute top-5 right-5 left-5 h-1.5 rounded-full bg-mar-100" aria-hidden="true">
          <div className="h-full rounded-full bg-gradient-to-r from-agua-400 to-coral-500 transition-all duration-700" style={{ width: `${(paso / (pasos.length - 1)) * 100}%` }} />
        </div>
        <ol className="relative flex justify-between">
          {pasos.map((p, i) => (
            <li key={p.titulo} className="flex flex-col items-center gap-1.5" aria-current={i === paso ? "step" : undefined}>
              <span
                className={`grid size-11 place-items-center rounded-full text-lg font-bold transition-all duration-500 ${
                  i < paso ? "bg-agua-600 text-white" : i === paso ? "scale-110 bg-coral-500 text-white shadow-coral" : "bg-white text-mar-400 ring-2 ring-mar-100"
                }`}
              >
                {i < paso ? <Check className="size-5" aria-hidden="true" /> : <span aria-hidden="true">{p.emoji}</span>}
                <span className="sr-only">{i < paso ? "completado" : ""}</span>
              </span>
              <span className={`hidden text-xs font-semibold sm:block ${i <= paso ? "text-mar-800" : "text-mar-400"}`}>{p.titulo}</span>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

export function AsistenteAlta({ planes, planInicial, nombreNegocio }: { planes: Plan[]; planInicial: string | null; nombreNegocio: string }) {
  const router = useRouter();
  const { sesion } = useSesionSocio();
  const inicial = planes.find((p) => p.id === planInicial)?.id ?? planes.find((p) => p.destacado)?.id ?? planes[0]?.id ?? "";
  const [e, setE] = useState<Estado>(() => vacio(inicial));
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [restaurado, setRestaurado] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);

  // Recupera el borrador si recargás la página (la contraseña nunca se guarda)
  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem(CLAVE);
      if (guardado) {
        const b = JSON.parse(guardado) as Estado;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restaurar el borrador guardado en el navegador
        setE({ ...b, planId: planInicial && planes.some((p) => p.id === planInicial) ? planInicial : b.planId });
      }
    } catch {
      /* sin almacenamiento */
    }
    setRestaurado(true);
  }, [planInicial, planes]);

  useEffect(() => {
    if (!restaurado) return;
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(e));
    } catch {
      /* foto muy pesada o almacenamiento bloqueado */
    }
  }, [e, restaurado]);

  const plan = planes.find((p) => p.id === e.planId);
  const set = (cambios: Partial<Estado>) => setE((x) => ({ ...x, ...cambios }));
  const setDato = (k: keyof DatosSocio, v: string) => {
    setE((x) => ({ ...x, datos: { ...x.datos, [k]: v } }));
    if (errores[k]) setErrores((er) => ({ ...er, [k]: "" }));
  };

  const irA = (paso: number) => {
    set({ paso });
    requestAnimationFrame(() => {
      titulo.current?.focus({ preventScroll: true });
      titulo.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const falla = (mensaje: string) => {
    setErrorGeneral(mensaje);
    return false;
  };

  const validarPaso = (paso: number) => {
    if (paso === 0 && !plan) return falla("Elegí un plan para seguir.");
    if (paso === 1) {
      const r = esquemaDatosSocio.safeParse(e.datos);
      const errs = r.success ? {} : erroresPorCampo(r.error);
      if (!e.cuentaCreada) {
        const c = esquemaClave.safeParse(clave);
        if (!c.success) errs.clave = c.error.issues[0].message;
      }
      setErrores(errs);
      if (Object.keys(errs).length) return falla(e.cuentaCreada || !errs.clave || Object.keys(errs).length > 1 ? "Revisá los campos marcados." : "Escribí tu contraseña.");
    }
    if (paso === 2 && !e.foto) return falla("Subí tu foto tipo carnet para seguir.");
    if (paso === 3 && !(e.terminos && e.privacidad)) return falla("Tenés que aceptar los términos y la política de privacidad.");
    return true;
  };

  const siguiente = () => {
    setErrorGeneral("");
    if (validarPaso(e.paso)) irA(e.paso + 1);
  };

  async function pagar() {
    const invalido = [0, 1, 2, 3].find((p) => !validarPaso(p));
    if (invalido !== undefined) return irA(invalido);
    if (!plan) return;
    setEnviando(true);
    setErrorGeneral("");
    try {
      const datos = esquemaDatosSocio.parse(e.datos);

      if (modoDemo) {
        if (!demo.existeCuenta() || !e.cuentaCreada) {
          demo.crearSocio(
            {
              nombre_completo: datos.nombre,
              cedula: datos.cedula,
              fecha_nacimiento: datos.fechaNacimiento,
              telefono: datos.telefono,
              email: datos.email,
              plan_id: plan.id,
              acepto_terminos_el: new Date().toISOString(),
            },
            e.foto!,
          );
        }
        demo.pagar(plan.id, plan.precio, e.modo === "suscripcion");
        sessionStorage.removeItem(CLAVE);
        router.push("/hacete-socio/listo?demo=1");
        return;
      }

      const supabase = supabaseNavegador();
      if (!e.cuentaCreada) {
        const form = new FormData();
        form.set("datos", JSON.stringify(e.datos));
        form.set("clave", clave);
        form.set("plan", plan.id);
        form.set("acepta", "true");
        form.set("foto", await dataUrlABlob(e.foto!), "foto.jpg");
        const r = await fetch("/api/alta", { method: "POST", body: form });
        const cuerpo = await r.json();
        if (!r.ok) {
          setErrores(cuerpo.campos ?? {});
          setErrorGeneral(cuerpo.error ?? "No pudimos crear tu cuenta.");
          if (cuerpo.campos && Object.keys(cuerpo.campos).some((k) => k !== "foto")) irA(1);
          return;
        }
        set({ cuentaCreada: true });
      }

      const { data: sesionActual } = await supabase.auth.getSession();
      if (!sesionActual.session) {
        const { error } = await supabase.auth.signInWithPassword({ email: datos.email, password: clave });
        if (error) {
          setErrorGeneral("Tu cuenta ya está creada. Ingresá a Mi Carnet con tu email y contraseña para completar el pago.");
          return;
        }
      }

      const r = await fetch("/api/pagos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, modo: e.modo }),
      });
      const cuerpo = await r.json();
      if (!r.ok || !cuerpo.url) {
        setErrorGeneral(cuerpo.error ?? "No pudimos iniciar el pago.");
        return;
      }
      sessionStorage.removeItem(CLAVE);
      window.location.assign(cuerpo.url);
    } catch {
      setErrorGeneral("Algo salió mal. Revisá tu conexión y probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (sesion.estado === "socio" && sesion.socio.numero_socio) {
    return (
      <div className="tarjeta mx-auto max-w-lg p-8 text-center">
        <p className="text-5xl" aria-hidden="true">
          🎉
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-mar-900">¡Ya sos socio, {sesion.socio.nombre_completo.split(" ")[0]}!</h2>
        <p className="mt-2 text-mar-700">Para renovar o cambiar de plan entrá a tu área de socio.</p>
        <Link href="/mi-carnet" className="btn btn-coral mt-6">
          Ir a Mi Carnet
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <BarraProgreso paso={e.paso} />

      <div className="tarjeta p-5 sm:p-8">
        <h2 ref={titulo} tabIndex={-1} className="font-display text-2xl font-bold text-mar-900 outline-none sm:text-3xl">
          {
            [
              "¿Qué plan querés?",
              "Contanos quién sos",
              "Tu foto para el carnet",
              "Términos y privacidad",
              "¡Último paso: el pago!",
            ][e.paso]
          }
        </h2>

        <div key={e.paso} className="mt-6 animate-[entrar_0.45s_both]">
          {e.paso === 0 && (
            <fieldset>
              <legend className="sr-only">Planes</legend>
              <div className="grid gap-3">
                {planes.map((p) => (
                  <label
                    key={p.id}
                    className={`relative flex cursor-pointer items-start gap-4 rounded-3xl p-4 ring-2 transition sm:p-5 ${
                      e.planId === p.id ? "bg-agua-50 ring-agua-500" : "bg-white ring-mar-100 hover:ring-agua-300"
                    }`}
                  >
                    <input type="radio" name="plan" value={p.id} checked={e.planId === p.id} onChange={() => set({ planId: p.id })} className="mt-1 size-5 accent-agua-600" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-xl font-bold text-mar-900">{p.nombre}</span>
                        {p.etiqueta && <span className="chip bg-sol-200 text-xs text-mar-950">⭐ {p.etiqueta}</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-mar-600">{p.bajada}</span>
                      <span className="mt-2 block text-sm text-mar-700">{p.incluye.slice(0, 3).join(" · ")}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-2xl font-bold text-mar-900">{precioUYU(p.precio)}</span>
                      <span className="text-xs font-semibold text-mar-500">por mes</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {e.paso === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                className="sm:col-span-2"
                etiqueta="Nombre completo"
                autoComplete="name"
                value={e.datos.nombre}
                onChange={(ev) => setDato("nombre", ev.target.value)}
                error={errores.nombre}
                placeholder="Ej: Lucía Fernández"
              />
              <Campo
                etiqueta="Cédula de identidad"
                inputMode="numeric"
                value={e.datos.cedula}
                onChange={(ev) => setDato("cedula", ev.target.value)}
                error={errores.cedula}
                placeholder="1.234.567-2"
                ayuda="Con el dígito verificador."
              />
              <Campo
                etiqueta="Fecha de nacimiento"
                type="date"
                autoComplete="bday"
                max={new Date().toISOString().slice(0, 10)}
                value={e.datos.fechaNacimiento}
                onChange={(ev) => setDato("fechaNacimiento", ev.target.value)}
                error={errores.fechaNacimiento}
              />
              <Campo
                etiqueta="Celular"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={e.datos.telefono}
                onChange={(ev) => setDato("telefono", ev.target.value)}
                error={errores.telefono}
                placeholder="099 123 456"
              />
              <Campo
                etiqueta="Email"
                type="email"
                autoComplete="email"
                value={e.datos.email}
                onChange={(ev) => setDato("email", ev.target.value)}
                error={errores.email}
                placeholder="vos@email.com"
                disabled={e.cuentaCreada}
              />
              {!e.cuentaCreada && (
                <Campo
                  className="sm:col-span-2"
                  etiqueta="Creá una contraseña para Mi Carnet"
                  type={verClave ? "text" : "password"}
                  autoComplete="new-password"
                  value={clave}
                  onChange={(ev) => {
                    setClave(ev.target.value);
                    if (errores.clave) setErrores((er) => ({ ...er, clave: "" }));
                  }}
                  error={errores.clave}
                  ayuda="Mínimo 8 caracteres. También vas a poder entrar con un código por email."
                  extra={
                    <button
                      type="button"
                      onClick={() => setVerClave((v) => !v)}
                      aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute inset-y-0 right-2 my-auto grid size-10 place-items-center rounded-xl text-mar-500 hover:bg-mar-50"
                    >
                      {verClave ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  }
                />
              )}
            </div>
          )}

          {e.paso === 2 && <PasoFoto foto={e.foto} onFoto={(foto) => set({ foto })} />}

          {e.paso === 3 && (
            <div className="grid gap-4">
              <div className="max-h-64 overflow-y-auto rounded-2xl bg-mar-50 p-4 text-sm text-mar-800 ring-1 ring-mar-100" tabIndex={0} aria-label="Resumen de términos y privacidad">
                <p className="font-semibold text-mar-900">Resumen de lo más importante:</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  <li>La suscripción es mensual y personal. El carnet y su QR no se pueden prestar.</li>
                  <li>Con débito automático, Mercado Pago te cobra cada mes el precio del plan. Podés cancelarlo cuando quieras desde Mi Carnet.</li>
                  <li>Si el pago no se acredita, el carnet pasa a “vencido” hasta que renueves.</li>
                  <li>Respetá las normas de higiene y seguridad del complejo y las indicaciones de los guardavidas.</li>
                  <li>
                    Tus datos (nombre, cédula, foto, contacto) se usan solo para gestionar tu membresía y validar tu ingreso. Se guardan de forma segura, solo los ven vos y la
                    administración y nunca se venden ni se comparten (Ley N.º 18.331 de Protección de Datos Personales).
                  </li>
                  <li>Podés pedir acceder, corregir o borrar tus datos cuando quieras escribiéndonos.</li>
                </ul>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-1 ring-mar-100 hover:bg-agua-50">
                <input type="checkbox" checked={e.terminos} onChange={(ev) => set({ terminos: ev.target.checked })} className="mt-0.5 size-5 accent-agua-600" />
                <span className="text-mar-800">
                  Leí y acepto los{" "}
                  <Link href="/terminos" target="_blank" className="font-semibold text-agua-700 underline underline-offset-2">
                    términos y condiciones
                  </Link>
                  .
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-1 ring-mar-100 hover:bg-agua-50">
                <input type="checkbox" checked={e.privacidad} onChange={(ev) => set({ privacidad: ev.target.checked })} className="mt-0.5 size-5 accent-agua-600" />
                <span className="text-mar-800">
                  Acepto la{" "}
                  <Link href="/privacidad" target="_blank" className="font-semibold text-agua-700 underline underline-offset-2">
                    política de privacidad
                  </Link>{" "}
                  y el tratamiento de mis datos personales para gestionar mi membresía.
                </span>
              </label>
            </div>
          )}

          {e.paso === 4 && plan && (
            <div className="grid gap-5">
              <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-agua-50 to-mar-50 p-4 ring-1 ring-agua-100">
                {e.foto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.foto} alt="" className="aspect-[3/4] w-16 rounded-2xl object-cover ring-2 ring-white" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-bold text-mar-900">{e.datos.nombre}</p>
                  <p className="text-sm text-mar-600">{plan.nombre}</p>
                </div>
                <p className="text-right">
                  <span className="block font-display text-2xl font-bold text-mar-900">{precioUYU(plan.precio)}</span>
                  <span className="text-xs font-semibold text-mar-500">por mes</span>
                </p>
              </div>

              <fieldset className="grid gap-3">
                <legend className="etiqueta">¿Cómo querés pagar?</legend>
                {[
                  { id: "suscripcion" as const, titulo: "Débito automático mensual", texto: "Se renueva solo cada mes con tu tarjeta. Lo cancelás cuando quieras.", Icono: RefreshCw, tag: "Recomendado" },
                  { id: "unico" as const, titulo: "Pagar solo este mes", texto: "Tarjeta, débito, saldo de Mercado Pago o efectivo en redes de cobranza.", Icono: CreditCard },
                ].map(({ id, titulo, texto, Icono, tag }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-start gap-3 rounded-3xl p-4 ring-2 transition ${e.modo === id ? "bg-agua-50 ring-agua-500" : "ring-mar-100 hover:ring-agua-300"}`}
                  >
                    <input type="radio" name="modo" checked={e.modo === id} onChange={() => set({ modo: id })} className="mt-1 size-5 accent-agua-600" />
                    <Icono className="mt-0.5 size-5 shrink-0 text-agua-700" aria-hidden="true" />
                    <span>
                      <span className="flex items-center gap-2 font-semibold text-mar-900">
                        {titulo} {tag && <span className="chip bg-sol-200 px-2 py-0.5 text-xs text-mar-950">{tag}</span>}
                      </span>
                      <span className="text-sm text-mar-600">{texto}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              {modoDemo && (
                <Aviso tipo="alerta">
                  <strong>Modo demo:</strong> el pago se simula y tu carnet queda guardado solo en este navegador. Configurá Supabase y Mercado Pago para cobrar de verdad.
                </Aviso>
              )}

              <button type="button" onClick={pagar} disabled={enviando} className="btn btn-coral w-full text-xl">
                {enviando ? <LoaderCircle className="size-6 animate-spin" aria-hidden="true" /> : <Lock className="size-5" aria-hidden="true" />}
                {modoDemo ? "Simular pago" : `Pagar ${precioUYU(plan.precio)} con Mercado Pago`}
              </button>
              <p className="text-center text-xs text-mar-500">
                Pagás en el sitio seguro de Mercado Pago. Nosotros nunca vemos los datos de tu tarjeta. Al confirmarse el pago se genera tu carnet digital.
              </p>
            </div>
          )}
        </div>

        {errorGeneral && (
          <Aviso tipo="error" className="mt-6">
            {errorGeneral}
          </Aviso>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-mar-100 pt-6">
          {e.paso > 0 ? (
            <button
              type="button"
              onClick={() => {
                setErrorGeneral("");
                irA(e.paso - 1);
              }}
              className="btn btn-claro btn-chico"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Atrás
            </button>
          ) : (
            <span />
          )}
          {e.paso < pasos.length - 1 && (
            <button type="button" onClick={siguiente} className="btn btn-agua btn-chico">
              Siguiente <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-mar-600">
        ¿Ya sos socio?{" "}
        <Link href="/mi-carnet" className="font-semibold text-agua-700 underline underline-offset-4">
          Entrá a Mi Carnet
        </Link>{" "}
        · {nombreNegocio}
      </p>
    </div>
  );
}
