import type { ContenidoContacto, ContenidoHero, ContenidoWhatsApp, DatosNegocio } from "@/lib/contenido/tipos";

/** Valores de ejemplo. Se reemplazan desde /admin → Configuración y Contenido. */
export const negocioPorDefecto: DatosNegocio = {
  nombre: "Aquazul",
  nombreCompleto: "Aquazul Club de Piscinas",
  eslogan: "Complejo de piscinas",
  descripcion:
    "Complejo de piscinas climatizadas con clases de natación para bebés, niños y adultos, aquagym y nado libre. Hacete socio con suscripción mensual y llevá tu carnet en el celular.",
  ciudad: "Montevideo",
  departamento: "Montevideo",
  pais: "Uruguay",
  direccion: "Av. del Agua 1234",
  codigoPostal: "11300",
  telefono: "+598 2 000 0000",
  email: "hola@aquazul.com.uy",
  anioFundacion: 2011,
  logoUrl: null,
  redes: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/",
  },
  mapa: {
    embed: "https://www.google.com/maps?q=Montevideo,+Uruguay&z=14&output=embed",
    enlace: "https://www.google.com/maps/search/?api=1&query=Montevideo,+Uruguay",
  },
  horarios: [
    { dias: "Lunes a viernes", horas: "07:00 a 22:00" },
    { dias: "Sábados", horas: "08:00 a 20:00" },
    { dias: "Domingos y feriados", horas: "09:00 a 13:00" },
  ],
};

export const heroPorDefecto: ContenidoHero = {
  chip: "☀️ Agua climatizada todo el año",
  titulo: "¡Sumergite en la",
  destacado: "diversión!",
  subtitulo:
    "Tres piscinas climatizadas, clases para bebés, chicos y grandes, y un carnet digital que llevás en el celular. Vení a nadar, jugar y pasarla bien.",
  imagenUrl: "/imagenes/hero.jpg",
  videoUrl: "",
  puntos: ["🌡️ Agua entre 27 y 31 °C", "🏊 3 piscinas", "👶 Clases desde los 6 meses"],
};

export const contactoPorDefecto: ContenidoContacto = {
  titulo: "¿Tenés dudas?",
  destacado: "¡Escribinos!",
  subtitulo: "Te respondemos por WhatsApp sobre horarios, clases, planes o lo que necesites. Sin vueltas y con buena onda.",
};

export const whatsappPorDefecto: ContenidoWhatsApp = {
  // Solo números, con código de país (598...). Reemplazalo por el real.
  numero: process.env.NEXT_PUBLIC_WHATSAPP || "59800000000",
  mensajeGeneral: "¡Hola! Quería hacerles una consulta 😊",
  temas: [
    { label: "Horarios", emoji: "🕒", mensaje: "¡Hola! Quería consultar los horarios de apertura de las piscinas." },
    { label: "Clases", emoji: "🏊", mensaje: "¡Hola! Me interesan las clases. ¿Me pasan info de horarios y cupos?" },
    { label: "Planes", emoji: "💳", mensaje: "¡Hola! Quiero hacerme socio. ¿Me cuentan cómo son los planes?" },
    { label: "Cumpleaños", emoji: "🎉", mensaje: "¡Hola! Quería consultar por cumpleaños o eventos en la piscina." },
    { label: "Mi suscripción", emoji: "🪪", mensaje: "¡Hola! Soy socio y tengo una consulta sobre mi suscripción." },
  ],
};
