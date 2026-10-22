/** Tipos del contenido editable del sitio (se guarda en Supabase y se edita desde /admin). */

export type Color = "agua" | "coral" | "sol";
export type ColorClase = Color | "mar" | "lima" | "uva";

export type DatosNegocio = {
  nombre: string;
  nombreCompleto: string;
  eslogan: string;
  descripcion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  direccion: string;
  codigoPostal: string;
  telefono: string;
  email: string;
  anioFundacion: number;
  logoUrl: string | null;
  redes: { instagram: string; facebook: string; tiktok: string };
  mapa: { embed: string; enlace: string };
  horarios: { dias: string; horas: string }[];
};

export type ContenidoHero = {
  chip: string;
  titulo: string;
  destacado: string;
  subtitulo: string;
  imagenUrl: string;
  videoUrl: string;
  puntos: string[];
};

export type Contador = { valor: number | "anios"; prefijo: string; label: string };

export type ContenidoHistoria = {
  bajada: string;
  frase: { texto: string; autor: string; rol: string };
  contadores: Contador[];
};

export type ContenidoContacto = { titulo: string; destacado: string; subtitulo: string };

export type TemaWhatsApp = { label: string; emoji: string; mensaje: string };
export type ContenidoWhatsApp = { numero: string; mensajeGeneral: string; temas: TemaWhatsApp[] };

export type Plan = {
  id: string;
  nombre: string;
  precio: number;
  bajada: string;
  etiqueta: string | null;
  destacado: boolean;
  incluye: string[];
  color: Color;
  activo: boolean;
  orden: number;
};

export type Piscina = {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  imagen: string;
  medidas: string;
  profundidad: string;
  temperatura: string;
  idealPara: string[];
  color: Color;
  orden: number;
};

export type FotoGaleria = { id: string; src: string; alt: string; ancho: number; alto: number; orden: number };

export type Hito = {
  id: string;
  anio: number;
  titulo: string;
  texto: string;
  imagen: string | null;
  imagenAlt: string;
  antigua: boolean;
  orden: number;
};

export type Dia = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";
export type TipoClase = "natacion" | "aquafitness" | "bebes" | "nado-libre";
export type GrupoEdad = "bebes" | "ninos" | "adolescentes" | "adultos" | "mayores";
export type IconoClase = "bebe" | "pato" | "nadador" | "olas" | "pesa" | "musica" | "corazon" | "reloj";

export type Horario = { id: string; claseId: string; dia: Dia; hora: string; cupo: number; activo: boolean };

export type Clase = {
  id: string;
  nombre: string;
  tipo: TipoClase;
  descripcion: string;
  profesor: string;
  nivel: string;
  edad: string;
  grupos: GrupoEdad[];
  duracion: string;
  /** Precio mensual en pesos para no socios (0 = sin costo para socios). */
  precio: number;
  frecuencia: string;
  incluidaEn: string;
  piscina: string;
  color: ColorClase;
  icono: IconoClase;
  foto: string | null;
  activa: boolean;
  orden: number;
  horarios: Horario[];
};

/** Ocupación de cada horario para su próxima fecha. */
export type Disponibilidad = Record<string, { fecha: string; ocupados: number }>;

export type Contenido = {
  negocio: DatosNegocio;
  hero: ContenidoHero;
  historia: ContenidoHistoria;
  contacto: ContenidoContacto;
  whatsapp: ContenidoWhatsApp;
  planes: Plan[];
  piscinas: Piscina[];
  galeria: FotoGaleria[];
  hitos: Hito[];
  clases: Clase[];
  /** true si algún bloque todavía usa los valores de ejemplo. */
  usaEjemplo: boolean;
  /** De dónde salió cada lista: la base de datos o los valores de ejemplo. */
  origen: Record<"planes" | "piscinas" | "galeria" | "hitos" | "clases", "db" | "ejemplo">;
};
