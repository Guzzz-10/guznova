import { z } from "zod";
import { limpiarCedula, validarCedula } from "@/lib/cedula";

/** Normaliza un teléfono uruguayo: "099 123 456" → "099123456". */
export function limpiarTelefono(t: string) {
  return t.replace(/[\s().-]/g, "");
}

export function telefonoValido(t: string) {
  const v = limpiarTelefono(t).replace(/^\+?598/, "");
  return /^0?9\d{7}$/.test(v) || /^[24]\d{7}$/.test(v) || /^\+\d{8,15}$/.test(limpiarTelefono(t));
}

function edad(fecha: string) {
  const n = new Date(`${fecha}T12:00:00`);
  const hoy = new Date();
  let e = hoy.getFullYear() - n.getFullYear();
  if (hoy.getMonth() < n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() < n.getDate())) e--;
  return e;
}

export const esquemaDatosSocio = z.object({
  nombre: z
    .string()
    .trim()
    .min(5, "Escribí tu nombre y apellido.")
    .max(80, "Es demasiado largo.")
    .refine((v) => v.split(/\s+/).length >= 2, "Escribí nombre y apellido."),
  cedula: z.string().trim().refine(validarCedula, "La cédula no es válida. Revisá el número y el dígito verificador.").transform(limpiarCedula),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Elegí tu fecha de nacimiento.")
    .refine((f) => edad(f) >= 0 && edad(f) <= 110, "Revisá la fecha de nacimiento."),
  telefono: z.string().trim().refine(telefonoValido, "Escribí un celular válido, por ejemplo 099 123 456.").transform(limpiarTelefono),
  email: z.string().trim().toLowerCase().pipe(z.email("Escribí un email válido.")),
});

export const esquemaClave = z.string().min(8, "La contraseña tiene que tener al menos 8 caracteres.").max(72);

export type DatosSocio = z.input<typeof esquemaDatosSocio>;

/** Errores de zod → { campo: mensaje } */
export function erroresPorCampo(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const k = String(i.path[0] ?? "general");
    out[k] ??= i.message;
  }
  return out;
}
