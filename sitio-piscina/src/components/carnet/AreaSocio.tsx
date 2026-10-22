"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  CalendarDays,
  CircleCheck,
  CreditCard,
  Download,
  History,
  KeyRound,
  LoaderCircle,
  LogOut,
  Maximize2,
  QrCode,
  RefreshCw,
  Smartphone,
  SquarePlus,
  WifiOff,
  X,
} from "lucide-react";
import type { Clase, Plan } from "@/lib/contenido/tipos";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { demo, EVENTO_DEMO } from "@/lib/demo/almacen";
import { contenidoQR, estadoSocio, mensajeError, type EstadoSocio, type Pago, type Socio } from "@/lib/socio/tipos";
import { useSesionSocio } from "@/lib/socio/useSesion";
import { diaDesdeIso, fechaCortaDia, nombreDia, ahoraMontevideo } from "@/lib/dias";
import { fecha, fechaTexto, precioUYU } from "@/lib/formato";
import { Aviso } from "@/components/ui/Aviso";
import { Campo } from "@/components/ui/Campo";
import { Carnet, estiloEstado, type DatosCarnet } from "./Carnet";
import { PaseEntrada } from "./PaseEntrada";
import { Ingreso } from "./Ingreso";
import { useInstalar } from "./useInstalar";

type Props = {
  negocio: { nombre: string; logoUrl: string | null };
  planes: Plan[];
  clases: Clase[];
  urlSitio: string;
};

type ReservaVista = { id: string; fecha: string; hora: string; clase: string; piscina: string; estado: "confirmada" | "cancelada" };
type Cache = { socio: Socio; foto: string | null; guardado: string };

const CACHE = "carnet:cache";

async function aDataUrl(url: string) {
  const blob = await (await fetch(url)).blob();
  return new Promise<string>((ok) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.readAsDataURL(blob);
  });
}

function Seccion({ id, titulo, Icono, children, accion }: { id?: string; titulo: string; Icono: typeof History; children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <section id={id} className="tarjeta scroll-mt-24 p-5 sm:p-6" aria-labelledby={id ? `t-${id}` : undefined}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={id ? `t-${id}` : undefined} className="flex items-center gap-2 font-display text-xl font-bold text-mar-900">
          <Icono className="size-5 text-agua-600" aria-hidden="true" /> {titulo}
        </h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

const etiquetaPago = { aprobado: "Aprobado", pendiente: "Pendiente", rechazado: "Rechazado", reembolsado: "Reembolsado" };
const colorPago = {
  aprobado: "bg-emerald-100 text-emerald-800",
  pendiente: "bg-sol-100 text-sol-900",
  rechazado: "bg-coral-100 text-coral-800",
  reembolsado: "bg-mar-100 text-mar-800",
};
const etiquetaMetodo = { mercadopago: "Mercado Pago", efectivo: "Efectivo", transferencia: "Transferencia" };

function Renovacion({ socio, estado, planes, onCambio }: { socio: Socio; estado: EstadoSocio; planes: Plan[]; onCambio: () => void }) {
  const [planId, setPlanId] = useState(planes.some((p) => p.id === socio.plan_id) ? socio.plan_id : (planes[0]?.id ?? ""));
  const [modo, setModo] = useState<"suscripcion" | "unico">("suscripcion");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false);
  const plan = planes.find((p) => p.id === planId);

  const pagar = async () => {
    if (!plan) return;
    setCargando(true);
    setError("");
    try {
      if (modoDemo) {
        demo.pagar(plan.id, plan.precio, modo === "suscripcion");
        onCambio();
        return;
      }
      const r = await fetch("/api/pagos/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, modo }) });
      const c = await r.json();
      if (!r.ok || !c.url) return setError(c.error ?? "No pudimos iniciar el pago.");
      window.location.assign(c.url);
    } catch {
      setError("Revisá tu conexión y probá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const cancelar = async () => {
    setCargando(true);
    setError("");
    try {
      if (modoDemo) {
        demo.cancelarRenovacion();
      } else {
        const r = await fetch("/api/pagos/cancelar", { method: "POST" });
        const c = await r.json();
        if (!r.ok) return setError(c.error ?? "No se pudo cancelar.");
      }
      setConfirmarCancelacion(false);
      onCambio();
    } finally {
      setCargando(false);
    }
  };

  return (
    <Seccion id="suscripcion" titulo="Tu suscripción" Icono={CreditCard}>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-2xl bg-mar-50 p-3">
          <dt className="text-mar-500">Estado</dt>
          <dd className="mt-1">
            <span className={`chip px-2.5 py-0.5 text-xs ${estiloEstado[estado].pill}`}>{estiloEstado[estado].texto}</span>
          </dd>
        </div>
        <div className="rounded-2xl bg-mar-50 p-3">
          <dt className="text-mar-500">Plan</dt>
          <dd className="mt-1 font-semibold text-mar-900">{planes.find((p) => p.id === socio.plan_id)?.nombre ?? socio.plan_id}</dd>
        </div>
        <div className="rounded-2xl bg-mar-50 p-3">
          <dt className="text-mar-500">{estado === "vencido" ? "Venció" : "Vence"}</dt>
          <dd className="mt-1 font-semibold text-mar-900">{fecha(socio.vence_el)}</dd>
        </div>
        <div className="rounded-2xl bg-mar-50 p-3">
          <dt className="text-mar-500">Renovación</dt>
          <dd className="mt-1 font-semibold text-mar-900">{socio.renovacion_automatica ? "Automática ✅" : "Manual"}</dd>
        </div>
      </dl>

      {estado === "suspendido" ? (
        <Aviso tipo="alerta" className="mt-4">
          Tu cuenta está suspendida. Escribinos por WhatsApp para resolverlo.
        </Aviso>
      ) : socio.renovacion_automatica && estado === "activo" ? (
        <div className="mt-4 grid gap-3">
          <Aviso tipo="ok">
            Tu plan se renueva solo cada mes con Mercado Pago. El próximo cobro es alrededor del <strong>{fechaTexto(socio.vence_el)}</strong>.
          </Aviso>
          {!confirmarCancelacion ? (
            <button type="button" onClick={() => setConfirmarCancelacion(true)} className="justify-self-start text-sm font-semibold text-coral-700 underline-offset-4 hover:underline">
              Cancelar la renovación automática
            </button>
          ) : (
            <div className="rounded-2xl bg-coral-50 p-4 ring-1 ring-coral-200">
              <p className="text-sm text-coral-900">¿Seguro? Vas a seguir siendo socio hasta el {fecha(socio.vence_el)} y después tenés que renovar a mano.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={cancelar} disabled={cargando} className="btn btn-coral btn-chico">
                  Sí, cancelar
                </button>
                <button type="button" onClick={() => setConfirmarCancelacion(false)} className="btn btn-claro btn-chico">
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          <p className="font-semibold text-mar-900">
            {estado === "pendiente" ? "Completá el pago para activar tu carnet:" : estado === "vencido" ? "Renová para volver a entrar:" : "Renová o cambiá de plan:"}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {planes.map((p) => (
              <label key={p.id} className={`cursor-pointer rounded-2xl p-3 ring-2 transition ${planId === p.id ? "bg-agua-50 ring-agua-500" : "ring-mar-100 hover:ring-agua-300"}`}>
                <input type="radio" name="plan-renovar" className="sr-only" checked={planId === p.id} onChange={() => setPlanId(p.id)} />
                <span className="block font-semibold text-mar-900">{p.nombre}</span>
                <span className="font-display text-xl font-bold text-mar-900">{precioUYU(p.precio)}</span>
                <span className="text-xs text-mar-500"> /mes</span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Forma de pago">
            {[
              { id: "suscripcion" as const, label: "🔁 Débito automático mensual" },
              { id: "unico" as const, label: "💵 Solo este mes" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={modo === m.id}
                onClick={() => setModo(m.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${modo === m.id ? "bg-mar-900 text-white ring-mar-900" : "bg-white text-mar-800 ring-mar-100"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={pagar} disabled={cargando || !plan} className="btn btn-coral w-full sm:w-auto sm:justify-self-start">
            {cargando ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-5" aria-hidden="true" />}
            {modoDemo ? "Simular pago" : `Pagar ${plan ? precioUYU(plan.precio) : ""} con Mercado Pago`}
          </button>
        </div>
      )}
      {error && (
        <Aviso tipo="error" className="mt-4">
          {error}
        </Aviso>
      )}
    </Seccion>
  );
}

export function AreaSocio({ negocio, planes, clases, urlSitio }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const { sesion, recargar } = useSesionSocio();
  const [foto, setFoto] = useState<string | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [reservas, setReservas] = useState<ReservaVista[]>([]);
  const [cache, setCache] = useState<Cache | null>(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [verInstrucciones, setVerInstrucciones] = useState(false);
  const [nuevaClave, setNuevaClave] = useState("");
  const frente = useRef<HTMLDivElement>(null);
  const { puedeInstalar, instalar, instalada, esIOS } = useInstalar();

  const socio = sesion.estado === "socio" ? sesion.socio : sesion.estado === "error" ? (cache?.socio ?? null) : null;
  const sinConexion = sesion.estado === "error" && Boolean(cache);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CACHE);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- copia local para ver el carnet sin conexión
      if (c) setCache(JSON.parse(c));
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  const cargarDatos = useCallback(async (s: Socio) => {
    if (modoDemo) {
      setFoto(demo.foto());
      setPagos(demo.pagos());
      const porHorario = new Map(clases.flatMap((c) => c.horarios.map((h) => [h.id, { clase: c.nombre, piscina: c.piscina, hora: h.hora }] as const)));
      setReservas(
        demo
          .reservas()
          .map((r) => ({ id: r.id, fecha: r.fecha, estado: r.estado, ...(porHorario.get(r.horario_id) ?? { clase: "Clase", piscina: "", hora: "" }) }))
          .sort((a, b) => a.fecha.localeCompare(b.fecha)),
      );
      return;
    }
    const supabase = supabaseNavegador();
    const [p, r] = await Promise.all([
      supabase.from("pagos").select("*").eq("socio_id", s.id).order("creado_el", { ascending: false }).limit(24),
      supabase.from("reservas").select("id, fecha, estado, horarios(hora, dia, clases(nombre, piscina))").eq("socio_id", s.id).order("fecha").limit(60),
    ]);
    setPagos((p.data as Pago[]) ?? []);
    type FilaReserva = { id: string; fecha: string; estado: "confirmada" | "cancelada"; horarios: { hora: string; clases: { nombre: string; piscina: string } | null } | null };
    setReservas(
      ((r.data as unknown as FilaReserva[]) ?? []).map((x) => ({
        id: x.id,
        fecha: x.fecha,
        estado: x.estado,
        hora: String(x.horarios?.hora ?? "").slice(0, 5),
        clase: x.horarios?.clases?.nombre ?? "Clase",
        piscina: x.horarios?.clases?.piscina ?? "",
      })),
    );
    let fotoUrl: string | null = null;
    if (s.foto_path) {
      const { data } = await supabase.storage.from("fotos-socios").createSignedUrl(s.foto_path, 3600);
      if (data?.signedUrl) fotoUrl = await aDataUrl(data.signedUrl).catch(() => data.signedUrl);
    }
    setFoto(fotoUrl);
    try {
      localStorage.setItem(CACHE, JSON.stringify({ socio: s, foto: fotoUrl, guardado: new Date().toISOString() } satisfies Cache));
    } catch {
      /* foto muy pesada para guardar */
    }
  }, [clases]);

  const idSocio = sesion.estado === "socio" ? sesion.socio.id : null;
  const versionSocio = sesion.estado === "socio" ? `${sesion.socio.vence_el}|${sesion.socio.qr_token}` : "";
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga datos de una fuente externa (Supabase o el navegador)
    if (sesion.estado === "socio") cargarDatos(sesion.socio);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recargar solo si cambia el socio o su estado
  }, [idSocio, versionSocio, cargarDatos]);

  useEffect(() => {
    if (!modoDemo || sesion.estado !== "socio") return;
    const s = sesion.socio;
    const alCambiar = () => cargarDatos(s);
    window.addEventListener(EVENTO_DEMO, alCambiar);
    return () => window.removeEventListener(EVENTO_DEMO, alCambiar);
  }, [sesion, cargarDatos]);

  // Después de ingresar, volver a donde estaba (ej. reservar una clase)
  const siguiente = params.get("siguiente");
  const alIngresar = () => {
    recargar();
    if (siguiente && siguiente.startsWith("/") && !siguiente.startsWith("//")) router.push(siguiente);
  };

  const avisar = (tipo: "ok" | "error", texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const descargar = async () => {
    if (!frente.current || !socio) return;
    try {
      const url = await toPng(frente.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `carnet-${negocio.nombre.toLowerCase().replace(/\s+/g, "-")}-${socio.numero_socio ?? "socio"}.png`;
      a.click();
    } catch {
      avisar("error", "No pudimos generar la imagen. Probá sacando una captura de pantalla.");
    }
  };

  const agregarAInicio = async () => {
    if (puedeInstalar) {
      const ok = await instalar();
      if (ok) avisar("ok", "¡Listo! Ya tenés el carnet en tu pantalla de inicio.");
    } else setVerInstrucciones(true);
  };

  const cancelarReserva = async (id: string) => {
    try {
      if (modoDemo) demo.cancelarReserva(id);
      else {
        const { error } = await supabaseNavegador().rpc("cancelar_reserva", { p_reserva: id });
        if (error) throw error;
      }
      setReservas((rs) => rs.map((r) => (r.id === id ? { ...r, estado: "cancelada" } : r)));
      avisar("ok", "Reserva cancelada. ¡Liberaste el lugar para otra persona!");
    } catch (e) {
      avisar("error", mensajeError(e));
    }
  };

  const regenerarQR = async () => {
    if (!socio) return;
    try {
      if (modoDemo) demo.regenerarQR();
      else {
        const { error } = await supabaseNavegador().rpc("regenerar_qr", { p_socio: socio.id });
        if (error) throw error;
        await recargar();
      }
      avisar("ok", "Generamos un QR nuevo. El anterior ya no sirve para entrar.");
    } catch (e) {
      avisar("error", mensajeError(e));
    }
  };

  const cambiarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaClave.length < 8) return avisar("error", "La contraseña tiene que tener al menos 8 caracteres.");
    if (modoDemo) return avisar("ok", "Modo demo: contraseña actualizada (de mentira).");
    const { error } = await supabaseNavegador().auth.updateUser({ password: nuevaClave });
    if (error) return avisar("error", "No se pudo cambiar la contraseña. Probá de nuevo.");
    setNuevaClave("");
    avisar("ok", "¡Contraseña actualizada!");
  };

  const salir = async () => {
    if (modoDemo) demo.salir();
    else await supabaseNavegador().auth.signOut();
    try {
      localStorage.removeItem(CACHE);
    } catch {
      /* nada */
    }
    setCache(null);
    recargar();
  };

  if (sesion.estado === "cargando") {
    return (
      <div className="grid place-items-center py-24" aria-live="polite">
        <LoaderCircle className="size-12 animate-spin text-agua-600" aria-hidden="true" />
        <p className="mt-3 font-semibold text-mar-600">Cargando tu carnet…</p>
      </div>
    );
  }

  if (sesion.estado === "anonimo" || (sesion.estado === "error" && !cache)) {
    return <Ingreso onIngreso={alIngresar} errorInicial={params.get("error") === "enlace" ? "El enlace venció o ya se usó. Pedí un código nuevo." : undefined} />;
  }

  if (sesion.estado === "sin-ficha" || !socio) {
    return (
      <div className="tarjeta mx-auto max-w-md p-8 text-center">
        <p className="text-5xl" aria-hidden="true">
          🤔
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold text-mar-900">Tu cuenta no tiene ficha de socio</h1>
        <p className="mt-2 text-mar-700">Ingresaste como {sesion.estado === "sin-ficha" ? sesion.email : "usuario"}, pero no encontramos un socio asociado.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/hacete-socio" className="btn btn-coral">
            Hacete socio
          </Link>
          <button type="button" onClick={salir} className="btn btn-claro btn-chico">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  const estado = estadoSocio(socio);
  const datos: DatosCarnet = {
    socio,
    estado,
    foto: foto ?? cache?.foto ?? null,
    plan: planes.find((p) => p.id === socio.plan_id)?.nombre ?? socio.plan_id,
    qr: socio.qr_token ? contenidoQR(urlSitio, socio.qr_token) : null,
    negocio,
  };
  const hoy = ahoraMontevideo().fecha;
  const proximas = reservas.filter((r) => r.estado === "confirmada" && r.fecha >= hoy);
  const anteriores = reservas.filter((r) => !(r.estado === "confirmada" && r.fecha >= hoy)).reverse();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr] lg:items-start lg:gap-8">
      <div className="lg:sticky lg:top-24">
        <div className="mb-5 text-center lg:text-left">
          <h1 className="font-display text-3xl font-bold text-mar-900">¡Hola, {socio.nombre_completo.split(" ")[0]}! 👋</h1>
          <p className="text-mar-600">Este es tu carnet digital de {negocio.nombre}.</p>
        </div>

        {sinConexion && (
          <Aviso tipo="alerta" className="mb-4">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <WifiOff className="size-4" aria-hidden="true" /> Sin conexión
            </span>{" "}
            — mostramos la copia guardada el {fecha(cache?.guardado)}.
          </Aviso>
        )}

        {estado === "pendiente" && (
          <Aviso tipo="alerta" className="mb-4">
            Tu carnet se activa cuando se confirme el pago.{" "}
            <a href="#suscripcion" className="font-semibold underline">
              Completar el pago
            </a>
          </Aviso>
        )}

        <Carnet {...datos} refFrente={frente} />

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => setPantallaCompleta(true)} disabled={!datos.qr} className="flex flex-col items-center gap-1.5 rounded-3xl bg-mar-900 px-2 py-3.5 text-sm font-semibold text-white shadow-suave transition hover:bg-mar-800 disabled:opacity-50">
            <Maximize2 className="size-6" aria-hidden="true" /> Pantalla completa
          </button>
          <button type="button" onClick={descargar} className="flex flex-col items-center gap-1.5 rounded-3xl bg-white px-2 py-3.5 text-sm font-semibold text-mar-900 shadow-suave ring-1 ring-mar-100 transition hover:bg-agua-50">
            <Download className="size-6 text-agua-600" aria-hidden="true" /> Descargar
          </button>
          <button
            type="button"
            onClick={agregarAInicio}
            disabled={instalada}
            className="flex flex-col items-center gap-1.5 rounded-3xl bg-white px-2 py-3.5 text-sm font-semibold text-mar-900 shadow-suave ring-1 ring-mar-100 transition hover:bg-agua-50 disabled:opacity-60"
          >
            {instalada ? <CircleCheck className="size-6 text-emerald-600" aria-hidden="true" /> : <SquarePlus className="size-6 text-agua-600" aria-hidden="true" />}
            {instalada ? "En tu inicio" : "Agregar a inicio"}
          </button>
        </div>
        {mensaje && (
          <Aviso tipo={mensaje.tipo} className="mt-4">
            {mensaje.texto}
          </Aviso>
        )}
      </div>

      <div className="grid gap-6">
        <Renovacion socio={socio} estado={estado} planes={planes} onCambio={recargar} />

        <Seccion
          id="reservas"
          titulo="Mis reservas"
          Icono={CalendarDays}
          accion={
            <Link href="/#clases" className="btn btn-agua btn-chico">
              Reservar clase
            </Link>
          }
        >
          {proximas.length === 0 ? (
            <p className="rounded-2xl bg-agua-50 p-4 text-center text-agua-900">No tenés reservas próximas. ¡Elegí una clase y reservá tu lugar! 🏊</p>
          ) : (
            <ul className="grid gap-2">
              {proximas.map((r) => {
                const dia = diaDesdeIso(((new Date(`${r.fecha}T12:00:00Z`).getUTCDay() + 6) % 7) + 1);
                return (
                  <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-mar-50 p-3">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-center shadow-sm">
                      <span className="text-xs font-semibold text-mar-500">{nombreDia(dia).slice(0, 3)}</span>
                      <span className="-mt-1 font-display text-lg font-bold text-mar-900">{fechaCortaDia(r.fecha)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-mar-900">{r.clase}</span>
                      <span className="text-sm text-mar-600">
                        {r.hora} · {r.piscina}
                      </span>
                    </span>
                    <button type="button" onClick={() => cancelarReserva(r.id)} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-coral-700 ring-1 ring-coral-200 hover:bg-coral-50">
                      <X className="size-4" aria-hidden="true" /> Cancelar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {anteriores.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-mar-600">Ver anteriores y canceladas ({anteriores.length})</summary>
              <ul className="mt-2 grid gap-1 text-sm text-mar-600">
                {anteriores.slice(0, 20).map((r) => (
                  <li key={r.id} className="flex justify-between gap-2 border-b border-mar-50 py-1.5">
                    <span>
                      {fechaCortaDia(r.fecha)} {r.hora} · {r.clase}
                    </span>
                    <span className={r.estado === "cancelada" ? "text-coral-600" : "text-mar-400"}>{r.estado === "cancelada" ? "Cancelada" : "Realizada"}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Seccion>

        <Seccion id="pagos" titulo="Historial de pagos" Icono={History}>
          {pagos.length === 0 ? (
            <p className="text-mar-600">Todavía no hay pagos registrados.</p>
          ) : (
            <ul className="divide-y divide-mar-100">
              {pagos.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block font-semibold text-mar-900">{planes.find((x) => x.id === p.plan_id)?.nombre ?? p.plan_id}</span>
                    <span className="text-sm text-mar-500">
                      {fecha(p.creado_el)} · {etiquetaMetodo[p.metodo]}
                      {p.periodo_hasta ? ` · hasta ${fecha(p.periodo_hasta)}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-lg font-bold text-mar-900">{precioUYU(Number(p.monto))}</span>
                    <span className={`chip px-2 py-0.5 text-xs ${colorPago[p.estado]}`}>{etiquetaPago[p.estado]}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Tu cuenta" Icono={KeyRound}>
          <div className="grid gap-5">
            {!modoDemo && (
              <form onSubmit={cambiarClave} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Campo className="flex-1" etiqueta="Nueva contraseña" type="password" autoComplete="new-password" value={nuevaClave} onChange={(e) => setNuevaClave(e.target.value)} />
                <button type="submit" className="btn btn-claro btn-chico">
                  Guardar
                </button>
              </form>
            )}
            <div className="flex flex-wrap gap-2">
              {socio.numero_socio && (
                <button type="button" onClick={regenerarQR} className="btn btn-claro btn-chico">
                  <QrCode className="size-4" aria-hidden="true" /> Generar QR nuevo
                </button>
              )}
              <button type="button" onClick={salir} className="btn btn-claro btn-chico">
                <LogOut className="size-4" aria-hidden="true" /> Cerrar sesión
              </button>
            </div>
            <p className="text-sm text-mar-500">
              Si perdiste el celular o alguien vio tu QR, generá uno nuevo: el anterior deja de funcionar. Para cambiar tus datos o tu foto escribinos.
            </p>
            {modoDemo && (
              <button type="button" onClick={() => demo.borrarTodo()} className="justify-self-start text-sm font-semibold text-coral-700 underline">
                Borrar los datos de prueba (modo demo)
              </button>
            )}
          </div>
        </Seccion>
      </div>

      {pantallaCompleta && <PaseEntrada datos={datos} onCerrar={() => setPantallaCompleta(false)} />}

      {verInstrucciones && (
        <div role="dialog" aria-modal="true" aria-label="Agregar a la pantalla de inicio" className="fixed inset-0 z-[80] grid place-items-end bg-mar-950/60 p-4 sm:place-items-center" onClick={() => setVerInstrucciones(false)}>
          <div className="tarjeta w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <p className="flex items-center gap-2 font-display text-xl font-bold text-mar-900">
              <Smartphone className="size-6 text-agua-600" aria-hidden="true" /> Tu carnet en el inicio
            </p>
            {esIOS ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-mar-800">
                <li>
                  Tocá el botón <strong>Compartir</strong> (el cuadrado con la flecha) de Safari.
                </li>
                <li>
                  Elegí <strong>“Agregar a inicio”</strong>.
                </li>
                <li>Listo: abrís el ícono y entrás directo a tu carnet.</li>
              </ol>
            ) : (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-mar-800">
                <li>
                  Abrí el menú del navegador (<strong>⋮</strong>).
                </li>
                <li>
                  Elegí <strong>“Agregar a la pantalla principal”</strong> o <strong>“Instalar app”</strong>.
                </li>
                <li>Listo: abrís el ícono y entrás directo a tu carnet.</li>
              </ol>
            )}
            <button type="button" onClick={() => setVerInstrucciones(false)} className="btn btn-agua btn-chico mt-5 w-full">
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
