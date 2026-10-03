export const SITE = {
  nombre: "Automotoro GuzNova",
  ciudad: "Rosario, Santa Fe",
  direccion: "Av. Pellegrini 1850, Rosario",
  telefono: "+54 9 341 555-0123",
  email: "hola@guznova.com.ar",
  horario: "Lun a Vie 9–19 hs · Sáb 9–13 hs",
  // Número de ejemplo: reemplazar por el real del cliente
  whatsapp: "5493415550123",
};

export const waLink = (texto: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
