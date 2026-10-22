/**
 * Datos ficticios para mostrar el panel de administración en MODO DEMO
 * (cuando Supabase todavía no está configurado). Son deterministas para que no cambien al recargar.
 */
import { digitoVerificador } from "@/lib/cedula";
import { ahoraMontevideo, proximaFecha } from "@/lib/dias";
import type { Clase, Plan } from "@/lib/contenido/tipos";
import type { Acceso, Pago, ReservaDetallada, Socio } from "@/lib/socio/tipos";
import { estadoSocio } from "@/lib/socio/tipos";
import type { Actividad, Estadisticas, Inscripto, SocioFila } from "@/lib/admin/tipos";

function generador(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const nombres = ["Lucía", "Mateo", "Sofía", "Santiago", "Valentina", "Joaquín", "Martina", "Benjamín", "Camila", "Thiago", "Florencia", "Agustín", "Emilia", "Facundo", "Victoria", "Bruno", "Julieta", "Nicolás", "Paula", "Diego", "Rocío", "Gonzalo", "Carolina", "Federico", "Natalia", "Matías", "Andrea", "Pablo", "Mariana", "Rodrigo", "Ana", "Sebastián"];
const apellidos = ["Rodríguez", "González", "Fernández", "Silva", "Pereira", "Martínez", "García", "Sosa", "López", "Suárez", "Pérez", "Díaz", "Méndez", "Núñez", "Castro", "Romero", "Álvarez", "Acosta", "Ramírez", "Cabrera"];

const DIA = 86_400_000;
const ahora = () => new Date();

function cedula(r: () => number) {
  const cuerpo = String(1_500_000 + Math.floor(r() * 4_500_000));
  return cuerpo + digitoVerificador(cuerpo);
}

let cacheSocios: SocioFila[] | null = null;

export function demoSocios(): SocioFila[] {
  if (cacheSocios) return cacheSocios;
  const r = generador(2026);
  const planes = ["basico", "full", "full", "familiar", "basico", "full"];
  const lista: SocioFila[] = nombres.map((n, i) => {
    const nombre = `${n} ${apellidos[Math.floor(r() * apellidos.length)]} ${apellidos[Math.floor(r() * apellidos.length)]}`;
    let vence: Date | null;
    if (i < 3) vence = new Date(Date.now() + (1 + i * 2) * DIA); // vencen en los próximos días
    else if (i < 22) vence = new Date(Date.now() + (8 + Math.floor(r() * 22)) * DIA);
    else if (i < 28) vence = new Date(Date.now() - (2 + Math.floor(r() * 40)) * DIA);
    else if (i < 30) vence = null;
    else vence = new Date(Date.now() + 10 * DIA);
    const creado = new Date(Date.now() - Math.floor(r() * 360 + 5) * DIA);
    const s: Socio = {
      id: `demo-${String(i + 1).padStart(3, "0")}`,
      numero_socio: vence ? 1001 + i : null,
      nombre_completo: nombre,
      cedula: cedula(r),
      fecha_nacimiento: `${1960 + Math.floor(r() * 50)}-0${1 + Math.floor(r() * 9)}-1${Math.floor(r() * 9)}`,
      telefono: `09${Math.floor(1_000_000 + r() * 8_999_999)}`,
      email: `${n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${i + 1}@ejemplo.com`,
      foto_path: null,
      plan_id: planes[i % planes.length],
      suspendido: i === 31,
      vence_el: vence?.toISOString() ?? null,
      qr_token: vence ? `demo${String(i).padStart(4, "0")}${"a".repeat(24)}` : null,
      mp_preapproval_id: i % 3 === 0 ? `pre-demo-${i}` : null,
      renovacion_automatica: i % 3 === 0 && i < 22,
      acepto_terminos_el: creado.toISOString(),
      notas: i === 31 ? "Suspendido por uso indebido del carnet (lo prestó)." : null,
      creado_el: creado.toISOString(),
    };
    return { ...s, estado_socio: estadoSocio(s) };
  });
  cacheSocios = lista;
  return lista;
}

export function demoPagos(planes: Plan[]): Pago[] {
  const r = generador(77);
  const precio = (id: string) => planes.find((p) => p.id === id)?.precio ?? 1490;
  const pagos: Pago[] = [];
  for (const s of demoSocios()) {
    if (!s.vence_el) continue;
    const fin = new Date(s.vence_el).getTime();
    let inicio = Math.max(new Date(s.creado_el).getTime(), fin - 330 * DIA);
    let n = 0;
    while (inicio < fin - 20 * DIA && inicio < Date.now()) {
      const metodo = s.renovacion_automatica || r() > 0.3 ? "mercadopago" : r() > 0.5 ? "efectivo" : "transferencia";
      pagos.push({
        id: `pago-${s.id}-${n++}`,
        socio_id: s.id,
        socio_nombre: s.nombre_completo,
        plan_id: s.plan_id,
        monto: precio(s.plan_id),
        moneda: "UYU",
        metodo,
        estado: "aprobado",
        mp_payment_id: metodo === "mercadopago" ? String(130000000 + Math.floor(r() * 9e6)) : null,
        periodo_desde: new Date(inicio).toISOString(),
        periodo_hasta: new Date(inicio + 30 * DIA).toISOString(),
        detalle: metodo === "mercadopago" ? (s.renovacion_automatica ? "Débito automático mensual" : "Pago único con Mercado Pago") : "Pago en recepción",
        registrado_por: metodo === "mercadopago" ? "sistema" : "demo@panel",
        creado_el: new Date(inicio).toISOString(),
      });
      inicio += 30 * DIA;
    }
  }
  pagos.push({
    id: "pago-rechazado",
    socio_id: "demo-023",
    socio_nombre: demoSocios()[22].nombre_completo,
    plan_id: "full",
    monto: precio("full"),
    moneda: "UYU",
    metodo: "mercadopago",
    estado: "rechazado",
    mp_payment_id: "139999999",
    periodo_desde: null,
    periodo_hasta: null,
    detalle: "Tarjeta rechazada",
    registrado_por: "sistema",
    creado_el: new Date(Date.now() - 2 * DIA).toISOString(),
  });
  return pagos.sort((a, b) => b.creado_el.localeCompare(a.creado_el));
}

export function demoAccesos(): Acceso[] {
  const r = generador(5);
  const socios = demoSocios();
  const lista: Acceso[] = [];
  let id = 1;
  for (let d = 0; d < 7; d++) {
    const cantidad = d === 0 ? 18 : 25 + Math.floor(r() * 20);
    for (let k = 0; k < cantidad; k++) {
      const s = socios[Math.floor(r() * socios.length)];
      const hora = new Date(Date.now() - d * DIA - Math.floor(r() * 10 * 3600_000));
      const res = s.estado_socio === "activo" ? "permitido" : (s.estado_socio as Acceso["resultado"]);
      lista.push({ id: id++, socio_id: s.id, nombre: s.nombre_completo, codigo: s.qr_token, resultado: res, creado_el: hora.toISOString() });
    }
  }
  lista.push({ id: id++, socio_id: null, nombre: null, codigo: "codigo-invalido", resultado: "desconocido", creado_el: new Date(Date.now() - 40 * 60_000).toISOString() });
  return lista.sort((a, b) => b.creado_el.localeCompare(a.creado_el));
}

export function demoReservas(clases: Clase[]): (ReservaDetallada & { nombre: string; numero: number | null; telefono: string })[] {
  const r = generador(11);
  const activos = demoSocios().filter((s) => s.estado_socio === "activo");
  const out: (ReservaDetallada & { nombre: string; numero: number | null; telefono: string })[] = [];
  for (const c of clases)
    for (const h of c.horarios) {
      const n = Math.min(h.cupo, Math.floor(r() * h.cupo * 0.8));
      const fecha = proximaFecha(h.dia, h.hora);
      for (let k = 0; k < n; k++) {
        const s = activos[(k * 7 + h.hora.length + c.nombre.length) % activos.length];
        out.push({
          id: `res-${h.id}-${k}`,
          horario_id: h.id,
          socio_id: s.id,
          fecha,
          estado: "confirmada",
          creado_el: new Date(Date.now() - k * 3600_000).toISOString(),
          clase: c.nombre,
          hora: h.hora,
          piscina: c.piscina,
          nombre: s.nombre_completo,
          numero: s.numero_socio,
          telefono: s.telefono,
        });
      }
    }
  return out;
}

export function demoInscriptos(clases: Clase[], horarioId: string): Inscripto[] {
  return demoReservas(clases)
    .filter((x) => x.horario_id === horarioId)
    .map((x) => ({ id: x.id, socio_id: x.socio_id, nombre: x.nombre, numero: x.numero, telefono: x.telefono, fecha: x.fecha }));
}

export function demoEstadisticas(planes: Plan[], clases: Clase[]): Estadisticas {
  const socios = demoSocios();
  const pagos = demoPagos(planes).filter((p) => p.estado === "aprobado");
  const hoy = ahoraMontevideo().fecha;
  const mesActual = hoy.slice(0, 7);
  const meses: string[] = [];
  const base = new Date(`${mesActual}-15T12:00:00Z`);
  for (let i = 11; i >= 0; i--) {
    const d = new Date(base);
    d.setUTCMonth(d.getUTCMonth() - i);
    meses.push(d.toISOString().slice(0, 7));
  }
  const reservas = demoReservas(clases);
  const porClase = new Map<string, number>();
  for (const x of reservas) porClase.set(x.clase, (porClase.get(x.clase) ?? 0) + 1);
  const accesos = demoAccesos();
  return {
    activos: socios.filter((s) => s.estado_socio === "activo").length,
    vencidos: socios.filter((s) => s.estado_socio === "vencido").length,
    pendientes: socios.filter((s) => s.estado_socio === "pendiente").length,
    suspendidos: socios.filter((s) => s.suspendido).length,
    ingresos_mes: pagos.filter((p) => p.creado_el.slice(0, 7) === mesActual).reduce((a, p) => a + p.monto, 0),
    reservas_hoy: reservas.filter((x) => x.fecha === hoy).length,
    accesos_hoy: accesos.filter((a) => a.creado_el.slice(0, 10) === new Date().toISOString().slice(0, 10) && a.resultado === "permitido").length,
    serie_ingresos: meses.map((m) => ({ mes: m, total: pagos.filter((p) => p.creado_el.slice(0, 7) === m).reduce((a, p) => a + p.monto, 0) })),
    serie_altas: meses.map((m) => ({ mes: m, total: socios.filter((s) => s.numero_socio && s.creado_el.slice(0, 7) === m).length })),
    top_clases: [...porClase.entries()]
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6),
    vencen_pronto: socios
      .filter((s) => !s.suspendido && s.vence_el && new Date(s.vence_el) > ahora() && new Date(s.vence_el).getTime() < Date.now() + 7 * DIA)
      .map((s) => ({ id: s.id, nombre: s.nombre_completo, numero: s.numero_socio, plan: s.plan_id, vence_el: s.vence_el!, telefono: s.telefono, renovacion_automatica: s.renovacion_automatica })),
  };
}

export function demoActividad(): Actividad[] {
  const acciones = [
    ["Inicio de sesión", "Ingresó al panel con Google"],
    ["Editó un plan", "Plan Full con clases: precio $ 2.590 → $ 2.690"],
    ["Registró un pago", "Mateo Silva · Plan Básico · efectivo · $ 1.490"],
    ["Subió una foto a la galería", "Corcheras de colores sobre el agua"],
    ["Editó una clase", "Aquagym: agregó horario viernes 19:00"],
    ["Suspendió a un socio", "Sebastián Romero (N.º 1032)"],
    ["Editó el contenido", "Textos del inicio (hero)"],
  ];
  return acciones.map(([accion, detalle], i) => ({ id: i + 1, email: "demo@panel", accion, detalle, creado_el: new Date(Date.now() - i * 5 * 3600_000).toISOString() }));
}
