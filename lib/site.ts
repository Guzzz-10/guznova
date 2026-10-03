export const SITE = {
  nombre: "GuzNova",
  descriptor: "Automotora",
  ciudad: "Rosario, Santa Fe",
  direccion: "Bv. Oroño 1450, Rosario",
  telefono: "+54 341 555-0123",
  email: "hola@guznova.com.ar",
  instagram: "@guznova.autos",
  horarios: ["Lunes a viernes · 9 a 19 h", "Sábados · 9 a 13 h"],
  // Número de ejemplo: reemplazar por el real del cliente (formato internacional, sin + ni espacios)
  whatsapp: "5493415550123",
};

export const waLink = (mensaje: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(mensaje)}`;
