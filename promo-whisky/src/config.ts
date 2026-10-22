/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL VIDEO
 *  Todo lo que se puede editar está en este archivo: textos,
 *  precios, contacto, colores, imágenes, música y ritmo.
 *  Guardá y el preview (npm run dev) se actualiza solo.
 * ─────────────────────────────────────────────────────────────
 */
export const config = {
  fps: 30,

  /** Música (archivo dentro de /public). Los cortes de escena caen en los beats. */
  music: {
    file: "music.mp3",
    bpm: 120,
    /** Si la pista tiene una intro, salteá X segundos para que el primer beat caiga en el segundo 0. */
    startFromSeconds: 0,
    volume: 0.85,
    fadeInSeconds: 0.3,
    fadeOutSeconds: 1.5,
  },

  /**
   * Duración de cada escena en beats (a 120 BPM, 1 beat = 0,5 s).
   * Total por defecto: 42 beats = 21 s. Si cambiás el BPM, ajustá estos
   * valores para que el video siga durando entre 18 y 22 segundos.
   */
  sceneBeats: {
    hook: 4,
    redLabel: 8,
    blackLabel: 8,
    duo: 8,
    prices: 8,
    closing: 6,
  },

  texts: {
    /** Cada elemento es una línea. La última va en dorado cursiva. */
    hook: ["El momento", "merece algo", "especial"],
    redLabel: { title: "Red Label", subtitle: "Intenso y vibrante" },
    blackLabel: { title: "Black Label", subtitle: "12 años de carácter" },
    duo: { lead: "Elegí", highlight: "tu estilo" },
    /** Título sobre las tarjetas de precios. Dejalo vacío ("") para ocultarlo. */
    pricesTitle: "Precios",
    /** Leyenda legal del cierre (cada elemento es una línea en vertical). */
    legal: ["Venta exclusiva a mayores de 18 años.", "Beber con moderación."],
  },

  prices: {
    redLabel: "[PRECIO]",
    blackLabel: "[PRECIO]",
    /** Texto opcional, ej: "Envío gratis en Montevideo". Dejalo vacío ("") para ocultarlo. */
    promo: "[PROMO]",
  },

  contact: {
    name: "Tomás Irigoyen",
    whatsappLabel: "Pedidos por WhatsApp",
    whatsapp: "[NÚMERO]",
    instagramLabel: "Instagram",
    instagram: "[@USUARIO]",
  },

  colors: {
    black: "#0A0A0A",
    gold: "#C9A24D",
    goldLight: "#F1D894",
    amber: "#B5651D",
    red: "#9E1B1B",
    cream: "#F4ECDD",
  },

  /** Fotos de las botellas (PNG con fondo transparente, dentro de /public). */
  assets: {
    redLabel: "assets/red-label.png",
    blackLabel: "assets/black-label.png",
  },
};
