/** Conversión entre las filas de Supabase (snake_case) y los tipos del sitio. */
import { diaDesdeIso, isoDesdeDia } from "@/lib/dias";
import type { Clase, FotoGaleria, Hito, Horario, Piscina, Plan } from "./tipos";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Fila = Record<string, any>;

export const filaAPlan = (f: Fila): Plan => ({
  id: f.id,
  nombre: f.nombre,
  precio: Number(f.precio),
  bajada: f.bajada ?? "",
  etiqueta: f.etiqueta || null,
  destacado: Boolean(f.destacado),
  incluye: f.incluye ?? [],
  color: f.color ?? "agua",
  activo: f.activo !== false,
  orden: f.orden ?? 0,
});

export const filaAPiscina = (f: Fila): Piscina => ({
  id: f.id,
  nombre: f.nombre,
  tipo: f.tipo ?? "",
  descripcion: f.descripcion ?? "",
  imagen: f.imagen_url || "/imagenes/piscina-grande.jpg",
  medidas: f.medidas ?? "",
  profundidad: f.profundidad ?? "",
  temperatura: f.temperatura ?? "",
  idealPara: f.ideal_para ?? [],
  color: f.color ?? "agua",
  orden: f.orden ?? 0,
});

export const filaAFoto = (f: Fila): FotoGaleria => ({
  id: f.id,
  src: f.url,
  alt: f.alt ?? "",
  ancho: f.ancho || 1200,
  alto: f.alto || 900,
  orden: f.orden ?? 0,
});

export const filaAHito = (f: Fila): Hito => ({
  id: f.id,
  anio: f.anio,
  titulo: f.titulo,
  texto: f.texto ?? "",
  imagen: f.imagen_url || null,
  imagenAlt: f.imagen_alt ?? "",
  antigua: Boolean(f.antigua),
  orden: f.orden ?? 0,
});

export const filaAHorario = (f: Fila): Horario => ({
  id: f.id,
  claseId: f.clase_id,
  dia: diaDesdeIso(f.dia),
  hora: String(f.hora).slice(0, 5),
  cupo: f.cupo,
  activo: f.activo !== false,
});

export const filaAClase = (f: Fila): Clase => ({
  id: f.id,
  nombre: f.nombre,
  tipo: f.tipo,
  descripcion: f.descripcion ?? "",
  profesor: f.profesor ?? "",
  nivel: f.nivel ?? "",
  edad: f.edad ?? "",
  grupos: f.grupos ?? [],
  duracion: f.duracion ?? "",
  precio: Number(f.precio ?? 0),
  frecuencia: f.frecuencia ?? "",
  incluidaEn: f.incluida_en ?? "",
  piscina: f.piscina ?? "",
  color: f.color ?? "agua",
  icono: f.icono ?? "nadador",
  foto: f.foto_url || null,
  activa: f.activa !== false,
  orden: f.orden ?? 0,
  horarios: ((f.horarios ?? []) as Fila[]).map(filaAHorario).sort((a, b) => isoDesdeDia(a.dia) - isoDesdeDia(b.dia) || a.hora.localeCompare(b.hora)),
});
