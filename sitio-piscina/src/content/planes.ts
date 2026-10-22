import type { Plan } from "@/lib/contenido/tipos";

/** Planes de ejemplo (precios en pesos uruguayos). Se editan desde /admin → Planes. */
export const planesPorDefecto: Plan[] = [
  {
    id: "basico",
    nombre: "Plan Básico",
    precio: 1490,
    bajada: "Para nadar a tu ritmo, cuando quieras.",
    etiqueta: null,
    destacado: false,
    incluye: ["Acceso libre a las 3 piscinas", "Nado libre en todos los horarios", "Vestuarios con duchas calientes y lockers", "Carnet digital en tu celular"],
    color: "agua",
    activo: true,
    orden: 1,
  },
  {
    id: "full",
    nombre: "Plan Full con clases",
    precio: 2690,
    bajada: "Nadá libre y sumá clases con profe.",
    etiqueta: "El más elegido",
    destacado: true,
    incluye: ["Todo lo del Plan Básico", "2 clases por semana a elección", "Evaluación inicial con profe", "1 invitado gratis por mes", "10% off en cumpleaños y eventos"],
    color: "coral",
    activo: true,
    orden: 2,
  },
  {
    id: "familiar",
    nombre: "Plan Familiar",
    precio: 3490,
    bajada: "Titular + hasta 3 familiares.",
    etiqueta: null,
    destacado: false,
    incluye: ["Acceso libre a las 3 piscinas para 4 personas", "1 clase semanal para cada menor", "Piscina de los peques con guardavidas", "Carnet digital del titular", "Descuento en colonia de vacaciones"],
    color: "sol",
    activo: true,
    orden: 3,
  },
];
