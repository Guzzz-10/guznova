"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, Clock, LayoutGrid, LoaderCircle, MapPin, RotateCcw, UserRound, X } from "lucide-react";
import { grupos, tipos } from "@/content/clases";
import type { Clase, Dia, Disponibilidad, GrupoEdad, Horario, TipoClase } from "@/lib/contenido/tipos";
import { dias, fechaCortaDia, nombreDia, proximaFecha } from "@/lib/dias";
import { precioUYU } from "@/lib/formato";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { demo } from "@/lib/demo/almacen";
import { mensajeError } from "@/lib/socio/tipos";
import { useSesionSocio, type SesionSocio } from "@/lib/socio/useSesion";
import { IconoWhatsApp } from "@/components/ui/IconosMarca";

type Seleccion = { claseId: string; horarioId: string };
type Turno = { clase: Clase; horario: Horario; fecha: string; libres: number };
type Resultado = { tipo: "ok" | "error"; texto: string; horarioId: string } | null;

const emojiClase: Record<Clase["icono"], string> = {
  bebe: "👶",
  pato: "🐥",
  nadador: "🏊",
  olas: "🌊",
  pesa: "💪",
  musica: "🎶",
  corazon: "💚",
  reloj: "⏱️",
};

const colorClase: Record<Clase["color"], { banda: string; pill: string; borde: string }> = {
  agua: { banda: "from-agua-400 to-agua-600", pill: "bg-agua-100 text-agua-900 ring-agua-300", borde: "border-agua-400" },
  coral: { banda: "from-coral-400 to-coral-600", pill: "bg-coral-100 text-coral-900 ring-coral-300", borde: "border-coral-400" },
  sol: { banda: "from-sol-300 to-sol-500", pill: "bg-sol-100 text-sol-900 ring-sol-300", borde: "border-sol-400" },
  mar: { banda: "from-mar-500 to-mar-700", pill: "bg-mar-100 text-mar-900 ring-mar-300", borde: "border-mar-500" },
  lima: { banda: "from-lime-400 to-emerald-500", pill: "bg-lime-100 text-lime-900 ring-lime-300", borde: "border-lime-500" },
  uva: { banda: "from-violet-400 to-fuchsia-500", pill: "bg-violet-100 text-violet-900 ring-violet-300", borde: "border-violet-400" },
};

function textoLibres(n: number) {
  if (n <= 0) return "Sin cupo";
  if (n <= 2) return n === 1 ? "¡Último lugar!" : `¡Últimos ${n}!`;
  return `${n} lugares`;
}

function mensajeWhatsApp(t: Turno) {
  const cuando = `el *${nombreDia(t.horario.dia).toLowerCase()} ${fechaCortaDia(t.fecha)} a las ${t.horario.hora}*`;
  return t.libres > 0
    ? `¡Hola! Quiero consultar por *${t.clase.nombre}* ${cuando} (${t.clase.piscina}). ¿Hay lugar?\n\nMi nombre es: `
    : `¡Hola! Vi que *${t.clase.nombre}* ${cuando} no tiene cupo. ¿Me anotan en la lista de espera?\n\nMi nombre es: `;
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ring-1 transition duration-200 active:scale-95 ${
        activo ? "bg-mar-900 text-white shadow-suave ring-mar-900" : "bg-white text-mar-800 ring-mar-100 hover:bg-agua-50 hover:ring-agua-300"
      }`}
    >
      {children}
    </button>
  );
}

function FilaFiltro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={titulo} className="flex min-w-0 items-center gap-3">
      <span className="w-12 shrink-0 text-xs font-bold tracking-wider text-mar-500 uppercase">{titulo}</span>
      <div className="sin-barra -mr-4 flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 pr-4 sm:mr-0 sm:flex-wrap sm:overflow-visible sm:pr-0">{children}</div>
    </div>
  );
}

function BotonHorario({ t, elegido, reservado, onElegir }: { t: Turno; elegido: boolean; reservado: boolean; onElegir: () => void }) {
  const lleno = t.libres <= 0;
  return (
    <button
      type="button"
      onClick={onElegir}
      aria-pressed={elegido}
      aria-label={`${t.clase.nombre}, ${nombreDia(t.horario.dia)} ${fechaCortaDia(t.fecha)} a las ${t.horario.hora}: ${reservado ? "ya reservado" : textoLibres(t.libres)}`}
      className={`flex min-w-[5.75rem] flex-col items-start rounded-2xl px-3 py-2 text-left ring-1 transition duration-200 active:scale-95 ${
        elegido
          ? lleno
            ? "bg-coral-600 text-white shadow-suave ring-coral-600"
            : "bg-agua-700 text-white shadow-suave ring-agua-700"
          : lleno
            ? "bg-coral-50 text-coral-800 ring-coral-200 hover:ring-coral-400"
            : "bg-white text-mar-900 ring-mar-100 hover:-translate-y-0.5 hover:ring-agua-400"
      }`}
    >
      <span className="flex items-center gap-1 font-display text-lg leading-none font-semibold">
        {(elegido || reservado) && <Check className="size-4" aria-hidden="true" />}
        {t.horario.hora}
      </span>
      <span className={`mt-1 text-xs font-semibold ${elegido ? "text-white/85" : lleno ? "text-coral-700" : t.libres <= 2 ? "text-coral-600" : "text-mar-500"}`}>
        {reservado ? "Ya reservaste" : textoLibres(t.libres)}
      </span>
    </button>
  );
}

/** Botones para reservar o consultar el turno elegido. */
function AccionesReserva({
  t,
  sesion,
  reservado,
  cargando,
  resultado,
  whatsapp,
  onReservar,
  compacto = false,
}: {
  t: Turno;
  sesion: SesionSocio;
  reservado: boolean;
  cargando: boolean;
  resultado: Resultado;
  whatsapp: string;
  onReservar: () => void;
  compacto?: boolean;
}) {
  const lleno = t.libres <= 0;
  const ancho = compacto ? "" : "w-full";
  const linkWA = (
    <a
      href={enlaceWhatsApp(whatsapp, mensajeWhatsApp(t))}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-whatsapp btn-chico ${ancho}`}
      aria-label={lleno ? "Pedir lista de espera por WhatsApp" : "Consultar por WhatsApp"}
    >
      <IconoWhatsApp className="size-5" /> <span className={compacto ? "hidden sm:inline" : ""}>{lleno ? "Lista de espera" : "Consultar"}</span>
    </a>
  );

  let principal: React.ReactNode = null;
  if (reservado) {
    principal = (
      <Link href="/mi-carnet#reservas" className={`btn btn-claro btn-chico ${ancho}`}>
        <Check className="size-5 text-agua-600" aria-hidden="true" /> Ver reserva
      </Link>
    );
  } else if (!lleno && sesion.estado === "socio" && sesion.estadoSocio === "activo") {
    principal = (
      <button type="button" onClick={onReservar} disabled={cargando} className={`btn btn-coral btn-chico ${ancho}`}>
        {cargando ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <CalendarDays className="size-5" aria-hidden="true" />}
        Reservar
      </button>
    );
  } else if (!lleno && sesion.estado === "socio") {
    principal = (
      <Link href="/mi-carnet" className={`btn btn-sol btn-chico ${ancho}`}>
        Renová para reservar
      </Link>
    );
  } else if (!lleno && sesion.estado !== "cargando") {
    principal = (
      <Link href={`/mi-carnet?siguiente=${encodeURIComponent("/#clases")}`} className={`btn btn-coral btn-chico ${ancho}`}>
        <UserRound className="size-5" aria-hidden="true" /> Ingresá y reservá
      </Link>
    );
  }

  const mensaje = resultado && resultado.horarioId === t.horario.id ? resultado : null;

  if (compacto) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        {principal}
        {linkWA}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {lleno && !reservado && (
        <p className="rounded-2xl bg-coral-50 px-4 py-2.5 text-center text-sm font-semibold text-coral-800 ring-1 ring-coral-200">
          😕 Sin cupo para el {fechaCortaDia(t.fecha)}. Pedí lista de espera o elegí otro horario.
        </p>
      )}
      {mensaje && (
        <p
          role="status"
          className={`rounded-2xl px-4 py-2.5 text-center text-sm font-semibold ring-1 ${mensaje.tipo === "ok" ? "bg-agua-50 text-agua-800 ring-agua-200" : "bg-coral-50 text-coral-800 ring-coral-200"}`}
        >
          {mensaje.texto}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 [&>*:only-child]:col-span-2">
        {principal}
        {linkWA}
      </div>
    </div>
  );
}

function TarjetaClase({
  clase,
  turnos,
  seleccion,
  reservas,
  onElegir,
  acciones,
  retraso,
}: {
  clase: Clase;
  turnos: Turno[];
  seleccion: Seleccion | null;
  reservas: Set<string>;
  onElegir: (s: Seleccion) => void;
  acciones: (t: Turno) => React.ReactNode;
  retraso: number;
}) {
  const col = colorClase[clase.color];
  const porDia = dias.map((d) => ({ dia: d, items: turnos.filter((t) => t.horario.dia === d.id) })).filter((g) => g.items.length);
  const elegido = seleccion?.claseId === clase.id ? turnos.find((t) => t.horario.id === seleccion.horarioId) : undefined;

  return (
    <article
      data-reveal
      style={{ "--retraso": `${retraso}ms` } as React.CSSProperties}
      className={`tarjeta flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-flotante ${elegido ? "ring-2 ring-agua-500" : ""}`}
    >
      <header className={`relative overflow-hidden bg-gradient-to-br ${col.banda} px-5 pt-5 pb-6 text-white`}>
        {clase.foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clase.foto} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-30 mix-blend-luminosity" />
        )}
        <span aria-hidden="true" className="absolute -top-6 -right-4 text-[5.5rem] leading-none opacity-25 select-none">
          {emojiClase[clase.icono]}
        </span>
        <div className="relative flex items-start gap-3">
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/25 text-2xl ring-1 ring-white/40">
            {emojiClase[clase.icono]}
          </span>
          <div>
            <h3 className="font-display text-xl leading-tight font-bold drop-shadow-sm">{clase.nombre}</h3>
            <p className="mt-0.5 text-sm font-medium text-white/90">{clase.edad}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className={`chip ring-1 ${col.pill}`}>Nivel: {clase.nivel}</span>
          {clase.incluidaEn && <span className="chip bg-sol-100 text-sol-900 ring-1 ring-sol-300">⭐ Incluida en {clase.incluidaEn}</span>}
        </div>
        <p className="mt-3 text-mar-700">{clase.descripcion}</p>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-mar-600">
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-agua-600" aria-hidden="true" />
            <dt className="sr-only">Duración</dt>
            <dd>{clase.duracion}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-agua-600" aria-hidden="true" />
            <dt className="sr-only">Piscina</dt>
            <dd>{clase.piscina}</dd>
          </div>
          {clase.profesor && (
            <div className="col-span-2 flex items-center gap-1.5">
              <UserRound className="size-4 text-agua-600" aria-hidden="true" />
              <dt className="sr-only">Profesor</dt>
              <dd>{clase.profesor}</dd>
            </div>
          )}
          <div className="col-span-2 flex items-center gap-1.5">
            <CalendarDays className="size-4 text-agua-600" aria-hidden="true" />
            <dt className="sr-only">Frecuencia</dt>
            <dd>{clase.frecuencia}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-dashed border-mar-100 pt-4">
          {clase.precio > 0 ? (
            <p>
              <span className="font-display text-3xl font-bold text-mar-900">{precioUYU(clase.precio)}</span>
              <span className="text-sm font-semibold text-mar-500"> /mes</span>
            </p>
          ) : (
            <p className="font-display text-2xl font-bold text-agua-700">Gratis para socios</p>
          )}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-bold tracking-wider text-mar-500 uppercase">Elegí día y horario</p>
          {porDia.length === 0 ? (
            <p className="text-sm text-mar-500">No hay horarios ese día.</p>
          ) : (
            <div className="grid gap-2.5">
              {porDia.map(({ dia, items }) => (
                <div key={dia.id} className="flex items-start gap-3">
                  <span className="mt-1.5 w-10 shrink-0 text-sm leading-tight font-bold text-mar-700">
                    {dia.corto}
                    <span className="block text-[0.7rem] font-semibold text-mar-400">{fechaCortaDia(items[0].fecha)}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {items.map((t) => (
                      <BotonHorario
                        key={t.horario.id}
                        t={t}
                        elegido={seleccion?.horarioId === t.horario.id}
                        reservado={reservas.has(`${t.horario.id}|${t.fecha}`)}
                        onElegir={() => onElegir({ claseId: clase.id, horarioId: t.horario.id })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-5">
          {elegido ? (
            acciones(elegido)
          ) : (
            <p className="rounded-2xl bg-agua-50 px-4 py-3 text-center text-sm font-semibold text-agua-800">👆 Tocá un horario para reservar</p>
          )}
        </div>
      </div>
    </article>
  );
}

function PillTurno({ t, elegido, reservado, onElegir }: { t: Turno; elegido: boolean; reservado: boolean; onElegir: () => void }) {
  const lleno = t.libres <= 0;
  return (
    <button
      type="button"
      onClick={onElegir}
      aria-pressed={elegido}
      className={`w-full rounded-xl border-l-4 px-2.5 py-1.5 text-left text-xs ring-1 transition active:scale-95 ${colorClase[t.clase.color].borde} ${
        elegido
          ? lleno
            ? "bg-coral-600 text-white ring-coral-600"
            : "bg-agua-700 text-white ring-agua-700"
          : lleno
            ? "bg-coral-50 text-coral-900 ring-coral-200"
            : "bg-white text-mar-900 ring-mar-100 hover:ring-agua-400"
      }`}
    >
      <span className="block leading-tight font-semibold">
        {emojiClase[t.clase.icono]} {t.clase.nombre}
      </span>
      <span className={`mt-0.5 block ${elegido ? "text-white/85" : lleno ? "font-semibold text-coral-700" : t.libres <= 2 ? "font-semibold text-coral-600" : "text-mar-500"}`}>
        {reservado ? "✓ Ya reservaste" : textoLibres(t.libres)}
      </span>
    </button>
  );
}

function VistaSemanal({
  turnos,
  diaFiltro,
  seleccion,
  reservas,
  onElegir,
}: {
  turnos: Turno[];
  diaFiltro: Dia | "todos";
  seleccion: Seleccion | null;
  reservas: Set<string>;
  onElegir: (s: Seleccion) => void;
}) {
  const diasVisibles = dias.filter((d) => (diaFiltro === "todos" ? turnos.some((t) => t.horario.dia === d.id) : d.id === diaFiltro));
  const [diaMovil, setDiaMovil] = useState<Dia>(diasVisibles[0]?.id ?? "lun");
  const diaMovilEfectivo = diasVisibles.some((d) => d.id === diaMovil) ? diaMovil : (diasVisibles[0]?.id ?? "lun");
  const horas = [...new Set(turnos.filter((t) => diasVisibles.some((d) => d.id === t.horario.dia)).map((t) => t.horario.hora))].sort();
  const pill = (t: Turno) => (
    <PillTurno
      key={t.horario.id}
      t={t}
      elegido={seleccion?.horarioId === t.horario.id}
      reservado={reservas.has(`${t.horario.id}|${t.fecha}`)}
      onElegir={() => onElegir({ claseId: t.clase.id, horarioId: t.horario.id })}
    />
  );

  return (
    <div data-reveal>
      {/* Celular: un día a la vez */}
      <div className="md:hidden">
        <div role="tablist" aria-label="Día" className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
          {diasVisibles.map((d) => (
            <button
              key={d.id}
              role="tab"
              type="button"
              aria-selected={diaMovilEfectivo === d.id}
              onClick={() => setDiaMovil(d.id)}
              className={`shrink-0 rounded-2xl px-4 py-2.5 font-display font-semibold transition ${diaMovilEfectivo === d.id ? "bg-agua-700 text-white shadow-suave" : "bg-white text-mar-800 ring-1 ring-mar-100"}`}
            >
              {d.largo}
            </button>
          ))}
        </div>
        <ol className="grid gap-3">
          {[...new Set(turnos.filter((t) => t.horario.dia === diaMovilEfectivo).map((t) => t.horario.hora))].sort().map((hora) => (
            <li key={hora} className="flex gap-3">
              <span className="w-14 shrink-0 pt-1.5 font-display text-lg font-bold text-mar-800 tabular-nums">{hora}</span>
              <div className="grid flex-1 gap-2">{turnos.filter((t) => t.horario.dia === diaMovilEfectivo && t.horario.hora === hora).map(pill)}</div>
            </li>
          ))}
        </ol>
      </div>

      {/* Desktop: grilla semanal */}
      <div className="hidden overflow-x-auto rounded-4xl bg-white p-3 shadow-suave ring-1 ring-mar-100 md:block">
        <table className="w-full table-fixed border-separate border-spacing-1.5">
          <caption className="sr-only">Grilla semanal de clases</caption>
          <thead>
            <tr>
              <th scope="col" className="w-16" />
              {diasVisibles.map((d) => (
                <th key={d.id} scope="col" className="rounded-2xl bg-agua-50 py-2.5 font-display text-base font-semibold text-agua-800">
                  {d.largo}
                  <span className="block text-xs font-medium text-agua-600">{fechaCortaDia(turnos.find((t) => t.horario.dia === d.id)?.fecha ?? "--")}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horas.map((hora) => (
              <tr key={hora}>
                <th scope="row" className="pt-2 align-top font-display text-sm font-bold text-mar-700 tabular-nums">
                  {hora}
                </th>
                {diasVisibles.map((d) => (
                  <td key={d.id} className="align-top">
                    <div className="grid gap-1.5">{turnos.filter((t) => t.horario.dia === d.id && t.horario.hora === hora).map(pill)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Clases({ clases, whatsapp, disponibilidadInicial }: { clases: Clase[]; whatsapp: string; disponibilidadInicial: Disponibilidad }) {
  const [dia, setDia] = useState<Dia | "todos">("todos");
  const [tipo, setTipo] = useState<TipoClase | "todos">("todos");
  const [edad, setEdad] = useState<GrupoEdad | "todos">("todos");
  const [vista, setVista] = useState<"tarjetas" | "semana">("tarjetas");
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const [disp, setDisp] = useState<Disponibilidad>(disponibilidadInicial);
  const [reservas, setReservas] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<Resultado>(null);
  const [seccionVisible, setSeccionVisible] = useState(false);
  const seccion = useRef<HTMLDivElement>(null);
  const { sesion } = useSesionSocio();

  // Cupos actualizados (la página puede venir de caché)
  useEffect(() => {
    if (modoDemo) return;
    supabaseNavegador()
      .rpc("disponibilidad")
      .then(({ data }) => {
        if (!data) return;
        const nueva: Disponibilidad = {};
        for (const f of data as { horario_id: string; fecha: string; ocupados: number }[]) nueva[f.horario_id] = { fecha: f.fecha, ocupados: f.ocupados };
        setDisp(nueva);
      });
  }, []);

  // Reservas propias (para marcar "Ya reservaste")
  const idSocio = sesion.estado === "socio" ? sesion.socio.id : null;
  useEffect(() => {
    if (!idSocio) return;
    const marcar = (lista: { horario_id: string; fecha: string }[]) => setReservas(new Set(lista.map((r) => `${r.horario_id}|${r.fecha}`)));
    if (modoDemo) {
      marcar(demo.reservas().filter((r) => r.estado === "confirmada"));
      return;
    }
    supabaseNavegador()
      .from("reservas")
      .select("horario_id, fecha")
      .eq("estado", "confirmada")
      .then(({ data }) => data && marcar(data));
  }, [idSocio]);

  const lista = useMemo(
    () =>
      clases.filter(
        (c) =>
          c.activa &&
          (tipo === "todos" || c.tipo === tipo) &&
          (edad === "todos" || c.grupos.includes(edad)) &&
          (dia === "todos" || c.horarios.some((h) => h.activo && h.dia === dia)),
      ),
    [clases, dia, tipo, edad],
  );

  const turnosPorClase = useMemo(() => {
    const mapa = new Map<string, Turno[]>();
    for (const c of lista) {
      mapa.set(
        c.id,
        c.horarios
          .filter((h) => h.activo && (dia === "todos" || h.dia === dia))
          .map((h) => {
            const d = disp[h.id];
            return { clase: c, horario: h, fecha: d?.fecha ?? proximaFecha(h.dia, h.hora), libres: h.cupo - (d?.ocupados ?? 0) };
          }),
      );
    }
    return mapa;
  }, [lista, dia, disp]);

  const todosLosTurnos = [...turnosPorClase.values()].flat();
  const turnoElegido = seleccion ? todosLosTurnos.find((t) => t.horario.id === seleccion.horarioId) : undefined;
  const hayFiltros = dia !== "todos" || tipo !== "todos" || edad !== "todos";
  const mostrarBarra = Boolean(turnoElegido && seccionVisible && vista === "semana");
  const diasConClases = dias.filter((d) => clases.some((c) => c.activa && c.horarios.some((h) => h.activo && h.dia === d.id)));

  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeccionVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Corre el botón de WhatsApp para que no tape la barra de reserva
  useEffect(() => {
    const html = document.documentElement;
    if (mostrarBarra) html.dataset.barraInferior = "";
    else delete html.dataset.barraInferior;
    return () => {
      delete html.dataset.barraInferior;
    };
  }, [mostrarBarra]);

  const elegir = (s: Seleccion) => {
    setResultado(null);
    setSeleccion((prev) => (prev?.horarioId === s.horarioId ? null : s));
  };

  const limpiar = () => {
    setDia("todos");
    setTipo("todos");
    setEdad("todos");
  };

  async function reservar(t: Turno) {
    setCargando(true);
    setResultado(null);
    try {
      let fecha = t.fecha;
      let ocupados = t.horario.cupo - t.libres + 1;
      if (modoDemo) {
        demo.reservar(t.horario.id, t.fecha);
      } else {
        const { data, error } = await supabaseNavegador().rpc("reservar_clase", { p_horario: t.horario.id });
        if (error) throw error;
        fecha = data.fecha;
        ocupados = data.ocupados;
      }
      setDisp((d) => ({ ...d, [t.horario.id]: { fecha, ocupados } }));
      setReservas((r) => new Set(r).add(`${t.horario.id}|${fecha}`));
      setResultado({
        tipo: "ok",
        horarioId: t.horario.id,
        texto: `✅ ¡Listo! Reservaste para el ${nombreDia(t.horario.dia).toLowerCase()} ${fechaCortaDia(fecha)} a las ${t.horario.hora}. Lo ves en Mi Carnet.`,
      });
    } catch (e) {
      setResultado({ tipo: "error", horarioId: t.horario.id, texto: mensajeError(e) });
    } finally {
      setCargando(false);
    }
  }

  const acciones = (t: Turno, compacto = false) => (
    <AccionesReserva
      t={t}
      sesion={sesion}
      reservado={reservas.has(`${t.horario.id}|${t.fecha}`)}
      cargando={cargando}
      resultado={resultado}
      whatsapp={whatsapp}
      onReservar={() => reservar(t)}
      compacto={compacto}
    />
  );

  return (
    <div ref={seccion}>
      <div className="tarjeta grid gap-3 p-4 sm:p-5" data-reveal>
        <FilaFiltro titulo="Día">
          <Chip activo={dia === "todos"} onClick={() => setDia("todos")}>
            Todos
          </Chip>
          {diasConClases.map((d) => (
            <Chip key={d.id} activo={dia === d.id} onClick={() => setDia(d.id)}>
              {d.largo}
            </Chip>
          ))}
        </FilaFiltro>
        <FilaFiltro titulo="Tipo">
          <Chip activo={tipo === "todos"} onClick={() => setTipo("todos")}>
            Todas
          </Chip>
          {tipos.map((t) => (
            <Chip key={t.id} activo={tipo === t.id} onClick={() => setTipo(t.id)}>
              <span aria-hidden="true">{t.emoji}</span> {t.label}
            </Chip>
          ))}
        </FilaFiltro>
        <FilaFiltro titulo="Edad">
          <Chip activo={edad === "todos"} onClick={() => setEdad("todos")}>
            Todas
          </Chip>
          {grupos.map((g) => (
            <Chip key={g.id} activo={edad === g.id} onClick={() => setEdad(g.id)}>
              {g.label}
            </Chip>
          ))}
        </FilaFiltro>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-mar-700" aria-live="polite">
          <strong className="text-mar-900">{lista.length}</strong> {lista.length === 1 ? "clase encontrada" : "clases encontradas"}
          {hayFiltros && (
            <button type="button" onClick={limpiar} className="ml-3 inline-flex items-center gap-1 text-sm font-semibold text-agua-700 underline-offset-4 hover:underline">
              <RotateCcw className="size-3.5" aria-hidden="true" /> Limpiar filtros
            </button>
          )}
        </p>
        <div role="group" aria-label="Vista" className="inline-flex rounded-full bg-white p-1 shadow-suave ring-1 ring-mar-100">
          {[
            { id: "tarjetas" as const, label: "Tarjetas", Icono: LayoutGrid },
            { id: "semana" as const, label: "Semana", Icono: CalendarDays },
          ].map(({ id, label, Icono }) => (
            <button
              key={id}
              type="button"
              aria-pressed={vista === id}
              onClick={() => setVista(id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${vista === id ? "bg-agua-700 text-white" : "text-mar-700 hover:text-agua-700"}`}
            >
              <Icono className="size-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-mar-600">
        Los lugares disponibles son para la próxima fecha de cada horario. Para reservar tenés que ser socio activo; si no, consultanos por WhatsApp.
      </p>

      <div className="mt-6">
        {lista.length === 0 ? (
          <div className="tarjeta grid place-items-center gap-3 p-10 text-center">
            <p className="text-5xl" aria-hidden="true">
              🐠
            </p>
            <p className="font-display text-xl font-semibold text-mar-900">No encontramos clases con esos filtros</p>
            <button type="button" onClick={limpiar} className="btn btn-agua btn-chico">
              Ver todas las clases
            </button>
          </div>
        ) : vista === "tarjetas" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((c, i) => (
              <TarjetaClase
                key={c.id}
                clase={c}
                turnos={turnosPorClase.get(c.id) ?? []}
                seleccion={seleccion}
                reservas={reservas}
                onElegir={elegir}
                acciones={(t) => acciones(t)}
                retraso={(i % 3) * 90}
              />
            ))}
          </div>
        ) : (
          <VistaSemanal turnos={todosLosTurnos} diaFiltro={dia} seleccion={seleccion} reservas={reservas} onElegir={elegir} />
        )}
      </div>

      {/* Barra de reserva (vista semanal) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 p-3 transition-all duration-500 sm:p-4 ${mostrarBarra ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}
      >
        {turnoElegido && (
          <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-3xl bg-mar-950/95 p-3 pl-5 text-white shadow-flotante ring-1 ring-white/10 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-wide text-agua-200 uppercase">Tu elección · {textoLibres(turnoElegido.libres)}</p>
                <p className="truncate font-display text-lg font-semibold">
                  {turnoElegido.clase.nombre} · {nombreDia(turnoElegido.horario.dia)} {fechaCortaDia(turnoElegido.fecha)} {turnoElegido.horario.hora}
                </p>
              </div>
              {acciones(turnoElegido, true)}
              <button type="button" onClick={() => setSeleccion(null)} aria-label="Quitar selección" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="size-5" />
              </button>
            </div>
            {resultado && resultado.horarioId === turnoElegido.horario.id && (
              <p role="status" className={`rounded-2xl px-3 py-2 text-sm font-semibold ${resultado.tipo === "ok" ? "bg-agua-500/20 text-agua-100" : "bg-coral-500/25 text-coral-100"}`}>
                {resultado.texto}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
