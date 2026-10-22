"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type QrScannerTipo from "qr-scanner";
import { Camera, CameraOff, Keyboard, LoaderCircle, SwitchCamera } from "lucide-react";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { tokenDesdeQR, mensajeError } from "@/lib/socio/tipos";
import { formatoCedula, formatoNumeroSocio, fecha } from "@/lib/formato";
import { demoSocios } from "@/lib/demo/panel";

export type ResultadoIngreso = {
  resultado: "permitido" | "vencido" | "suspendido" | "pendiente" | "desconocido";
  socio?: { id: string; nombre: string; cedula: string; numero: number | null; plan: string; vence_el: string | null; foto_path: string | null };
  accesos_hoy?: number;
};

const pantalla = {
  permitido: { fondo: "bg-emerald-500", titulo: "ACCESO PERMITIDO", emoji: "✅", texto: "Socio activo. ¡Que disfrute!" },
  vencido: { fondo: "bg-red-600", titulo: "VENCIDO", emoji: "❌", texto: "La suscripción venció. Que renueve en recepción o desde Mi Carnet." },
  suspendido: { fondo: "bg-mar-700", titulo: "SUSPENDIDO", emoji: "⛔", texto: "El socio está suspendido. No puede ingresar." },
  pendiente: { fondo: "bg-sol-500", titulo: "PAGO PENDIENTE", emoji: "⏳", texto: "Todavía no se confirmó su primer pago." },
  desconocido: { fondo: "bg-mar-800", titulo: "NO ENCONTRADO", emoji: "❓", texto: "Ese código no corresponde a ningún socio." },
};

function sonar(ok: boolean) {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = ok ? 880 : 220;
    o.type = ok ? "sine" : "square";
    g.gain.value = 0.08;
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + (ok ? 0.15 : 0.4));
    navigator.vibrate?.(ok ? 80 : [120, 80, 120]);
  } catch {
    /* sin audio */
  }
}

function validarDemo(codigo: string): ResultadoIngreso {
  const digitos = codigo.replace(/\D/g, "");
  const s = demoSocios().find((x) => x.qr_token === codigo || (codigo.length <= 12 && digitos && (String(x.numero_socio) === digitos.replace(/^0+/, "") || x.cedula === digitos)));
  if (!s) return { resultado: "desconocido" };
  return {
    resultado: s.estado_socio === "activo" ? "permitido" : (s.estado_socio as ResultadoIngreso["resultado"]),
    socio: { id: s.id, nombre: s.nombre_completo, cedula: s.cedula, numero: s.numero_socio, plan: s.plan_id, vence_el: s.vence_el, foto_path: null },
    accesos_hoy: 1,
  };
}

/** Pantalla grande con el resultado (para comparar la foto con la persona). */
export function TarjetaResultado({ r, foto, plan, onSiguiente }: { r: ResultadoIngreso; foto: string | null; plan: string; onSiguiente?: () => void }) {
  const p = pantalla[r.resultado];
  return (
    <div className={`overflow-hidden rounded-4xl text-white shadow-flotante ${p.fondo}`} role="status" aria-live="assertive">
      <div className="p-5 text-center sm:p-6">
        <p className="text-5xl" aria-hidden="true">
          {p.emoji}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-wide sm:text-4xl">{p.titulo}</p>
        <p className="mt-1 text-white/90">{p.texto}</p>
      </div>
      {r.socio && (
        <div className="flex flex-col items-center gap-4 bg-white p-5 text-mar-950 sm:flex-row sm:items-start sm:p-6">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt={`Foto de ${r.socio.nombre}`} className="aspect-[3/4] w-44 rounded-3xl object-cover shadow-suave sm:w-48" />
          ) : (
            <div className="grid aspect-[3/4] w-44 place-items-center rounded-3xl bg-mar-100 text-center text-sm text-mar-500">Sin foto cargada</div>
          )}
          <dl className="grid flex-1 gap-2 text-center text-lg sm:text-left">
            <div>
              <dt className="sr-only">Nombre</dt>
              <dd className="text-2xl font-bold sm:text-3xl">{r.socio.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm text-mar-500">Cédula</dt>
              <dd className="text-2xl font-bold tabular-nums">{formatoCedula(r.socio.cedula)}</dd>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 sm:justify-start">
              <div>
                <dt className="text-sm text-mar-500">N.º de socio</dt>
                <dd className="font-semibold tabular-nums">{formatoNumeroSocio(r.socio.numero)}</dd>
              </div>
              <div>
                <dt className="text-sm text-mar-500">Plan</dt>
                <dd className="font-semibold">{plan}</dd>
              </div>
              <div>
                <dt className="text-sm text-mar-500">Vence</dt>
                <dd className="font-semibold tabular-nums">{fecha(r.socio.vence_el)}</dd>
              </div>
            </div>
            {(r.accesos_hoy ?? 0) > 1 && r.resultado === "permitido" && (
              <dd className="mt-1 rounded-2xl bg-sol-100 px-3 py-2 text-base font-semibold text-sol-900">⚠️ Ya ingresó {r.accesos_hoy} veces hoy. Verificá que sea la misma persona.</dd>
            )}
          </dl>
        </div>
      )}
      {onSiguiente && (
        <div className="bg-white px-5 pb-5 sm:px-6 sm:pb-6">
          <button type="button" onClick={onSiguiente} className="btn btn-mar w-full text-xl">
            Escanear el siguiente
          </button>
        </div>
      )}
    </div>
  );
}

/** Escáner de QR con la cámara del celular/tablet + búsqueda manual. */
export function Escaner({ planes }: { planes: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const escaner = useRef<QrScannerTipo | null>(null);
  const ocupado = useRef(false);
  const [camara, setCamara] = useState<"apagada" | "iniciando" | "activa" | "error">("apagada");
  const [trasera, setTrasera] = useState(true);
  const [resultado, setResultado] = useState<ResultadoIngreso | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [codigoManual, setCodigoManual] = useState("");
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState("");
  const nombrePlan = (id: string) => planes.find((p) => p.id === id)?.nombre ?? id;

  const validar = useCallback(
    async (texto: string) => {
      if (ocupado.current) return;
      ocupado.current = true;
      setValidando(true);
      setError("");
      escaner.current?.pause();
      try {
        const codigo = tokenDesdeQR(texto);
        let r: ResultadoIngreso;
        if (modoDemo) r = validarDemo(codigo);
        else {
          const supabase = supabaseNavegador();
          const { data, error } = await supabase.rpc("validar_ingreso", { p_codigo: codigo });
          if (error) throw error;
          r = data as ResultadoIngreso;
          if (r.socio?.foto_path) {
            const { data: f } = await supabase.storage.from("fotos-socios").createSignedUrl(r.socio.foto_path, 600);
            setFoto(f?.signedUrl ?? null);
          } else setFoto(null);
        }
        sonar(r.resultado === "permitido");
        setResultado(r);
        router.refresh();
      } catch (e) {
        setError(mensajeError(e));
        ocupado.current = false;
        escaner.current?.start();
      } finally {
        setValidando(false);
      }
    },
    [router],
  );

  const encender = useCallback(async () => {
    if (!video.current) return;
    setCamara("iniciando");
    setError("");
    try {
      const QrScanner = (await import("qr-scanner")).default;
      escaner.current?.destroy();
      escaner.current = new QrScanner(video.current, (r) => validar(r.data), {
        returnDetailedScanResult: true,
        preferredCamera: trasera ? "environment" : "user",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 6,
      });
      await escaner.current.start();
      setCamara("activa");
    } catch {
      setCamara("error");
      setError("No pudimos usar la cámara. Revisá que el navegador tenga permiso o usá la búsqueda manual.");
    }
  }, [trasera, validar]);

  useEffect(() => () => escaner.current?.destroy(), []);

  const apagar = () => {
    escaner.current?.destroy();
    escaner.current = null;
    setCamara("apagada");
  };

  const siguiente = () => {
    setResultado(null);
    setFoto(null);
    setCodigoManual("");
    ocupado.current = false;
    if (camara === "activa") escaner.current?.start();
  };

  const cambiarCamara = async () => {
    const nueva = !trasera;
    setTrasera(nueva);
    await escaner.current?.setCamera(nueva ? "environment" : "user").catch(() => {});
  };

  return (
    <div className="grid gap-4">
      {resultado ? (
        <TarjetaResultado r={resultado} foto={foto} plan={resultado.socio ? nombrePlan(resultado.socio.plan) : ""} onSiguiente={siguiente} />
      ) : (
        <div className="overflow-hidden rounded-4xl bg-mar-950 shadow-flotante">
          <div className="relative aspect-square max-h-[70vh] w-full sm:aspect-video">
            <video ref={video} className="size-full object-cover" muted playsInline />
            {camara !== "activa" && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
                <div>
                  <Camera className="mx-auto size-12 text-agua-300" aria-hidden="true" />
                  <p className="mt-3 text-lg font-semibold">Escaneá el QR del carnet del socio</p>
                  <p className="text-sm text-mar-300">Funciona con la cámara del celular o la tablet de la entrada.</p>
                  <button type="button" onClick={encender} disabled={camara === "iniciando"} className="btn btn-coral mt-5">
                    {camara === "iniciando" ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Camera className="size-5" aria-hidden="true" />} Encender cámara
                  </button>
                </div>
              </div>
            )}
            {validando && (
              <div className="absolute inset-0 grid place-items-center bg-mar-950/70">
                <LoaderCircle className="size-12 animate-spin text-white" aria-hidden="true" />
              </div>
            )}
          </div>
          {camara === "activa" && (
            <div className="flex justify-center gap-2 p-3">
              <button type="button" onClick={cambiarCamara} className="btn btn-vidrio btn-chico">
                <SwitchCamera className="size-4" aria-hidden="true" /> Cambiar cámara
              </button>
              <button type="button" onClick={apagar} className="btn btn-vidrio btn-chico">
                <CameraOff className="size-4" aria-hidden="true" /> Apagar
              </button>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (codigoManual.trim()) validar(codigoManual.trim());
        }}
        className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-suave ring-1 ring-mar-100 sm:flex-row sm:items-end"
      >
        <label className="grid flex-1 gap-1.5">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-mar-800">
            <Keyboard className="size-4" aria-hidden="true" /> ¿No anda el QR? Buscá por N.º de socio o cédula
          </span>
          <input value={codigoManual} onChange={(e) => setCodigoManual(e.target.value)} inputMode="numeric" placeholder="Ej: 1024 o 1.234.567-2" className="campo" />
        </label>
        <button type="submit" disabled={validando} className="btn btn-agua btn-chico">
          Validar
        </button>
      </form>
      {error && <p className="rounded-2xl bg-coral-50 p-3 text-sm font-semibold text-coral-800 ring-1 ring-coral-200">{error}</p>}
    </div>
  );
}
