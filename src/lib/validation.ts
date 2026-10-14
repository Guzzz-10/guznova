import { z } from "zod";
import { CAR_STATUS, FUELS, TRANSMISSIONS } from "./constants";

// Esquemas compartidos entre el cliente y el servidor.

export const REVIEW_LIMITS = { name: [2, 60], comment: [10, 800] } as const;

export const reviewSchema = z.object({
  name: z
    .string()
    .trim()
    .min(REVIEW_LIMITS.name[0], "Ingresá tu nombre (mínimo 2 letras).")
    .max(REVIEW_LIMITS.name[1], "El nombre es demasiado largo."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Elegí una calificación de 1 a 5 estrellas.")
    .max(5, "Elegí una calificación de 1 a 5 estrellas."),
  comment: z
    .string()
    .trim()
    .min(REVIEW_LIMITS.comment[0], "Contanos un poco más (mínimo 10 caracteres).")
    .max(REVIEW_LIMITS.comment[1], "El comentario no puede superar los 800 caracteres.")
    .refine((v) => !/(https?:\/\/|www\.)/i.test(v), "Por seguridad, no se permiten links en el comentario."),
  privacy: z.literal("on", { error: "Tenés que aceptar la política de privacidad." }),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

const currentYear = new Date().getFullYear();

export const carSchema = z.object({
  brand: z.string().trim().min(1, "Ingresá la marca.").max(40),
  model: z.string().trim().min(1, "Ingresá el modelo.").max(40),
  version: z.string().trim().max(80).default(""),
  year: z.coerce
    .number({ error: "Ingresá el año." })
    .int("El año debe ser un número entero.")
    .min(1980, "El año no parece correcto.")
    .max(currentYear + 1, "El año no parece correcto."),
  price: z.coerce
    .number({ error: "Ingresá el precio." })
    .int("El precio debe ser un número sin decimales.")
    .min(100, "El precio no parece correcto.")
    .max(5_000_000, "El precio no parece correcto."),
  km: z.coerce
    .number({ error: "Ingresá los kilómetros." })
    .int()
    .min(0, "Los kilómetros no pueden ser negativos.")
    .max(2_000_000, "Los kilómetros no parecen correctos."),
  fuel: z.enum(FUELS, { error: "Elegí el combustible." }),
  transmission: z.enum(TRANSMISSIONS, { error: "Elegí la transmisión." }),
  bodyType: z.string().trim().max(30).default(""),
  color: z.string().trim().min(1, "Ingresá el color.").max(40),
  engine: z.string().trim().min(1, "Ingresá el motor (ej. 1.6 nafta).").max(60),
  doors: z.coerce.number().int().min(2).max(5).default(5),
  description: z.string().trim().max(4000, "La descripción es demasiado larga.").default(""),
  equipment: z.string().trim().max(4000, "El equipamiento es demasiado largo.").default(""),
  status: z.enum(CAR_STATUS),
  featured: z.boolean().default(false),
});
export type CarInput = z.infer<typeof carSchema>;

const optionalUrl = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Ingresá un link completo que empiece con https://");

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1, "Ingresá el nombre comercial.").max(60),
  legalName: z.string().trim().max(120),
  rut: z.string().trim().max(30),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(
      z
        .string()
        .min(10, "Ingresá el número completo con código de país (ej. 59899123456).")
        .max(15, "El número es demasiado largo."),
    ),
  phone: z.string().trim().max(40),
  email: z.union([z.literal(""), z.email("Ingresá un email válido.")]),
  address: z.string().trim().max(120),
  city: z.string().trim().max(60),
  hours: z.string().trim().max(400),
  instagram: optionalUrl,
  facebook: optionalUrl,
  tiktok: optionalUrl,
  mapQuery: z.string().trim().max(200),
  whatsappCarMessage: z
    .string()
    .trim()
    .min(5, "Escribí el mensaje para los autos.")
    .max(500)
    .refine((v) => v.includes("{auto}") || v.includes("{marca}"), "Incluí {auto} para que se sepa qué auto le interesa."),
  whatsappGenericMessage: z.string().trim().min(2, "Escribí el mensaje general.").max(500),
  statsCarsSold: z.string().trim().regex(/^\d{0,6}$/, "Solo números."),
  statsYears: z.string().trim().regex(/^\d{0,3}$/, "Solo números."),
  statsClients: z.string().trim().regex(/^\d{0,3}$/, "Solo números (porcentaje)."),
});

/** Convierte los errores de zod en { campo: "mensaje" } para mostrar en formularios. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
