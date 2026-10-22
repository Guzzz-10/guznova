import type { ContenidoHistoria, Hito } from "@/lib/contenido/tipos";

/** Historia de ejemplo. Se edita desde /admin → Contenido → Historia. */
export const hitosPorDefecto: Hito[] = [
  {
    id: "h2011",
    anio: 2011,
    titulo: "Todo empezó con una piscina y un sueño",
    texto: "Una familia del barrio compró un viejo galpón y lo transformó en una piscina para que los gurises aprendieran a nadar cerca de casa.",
    imagen: "/imagenes/historia-antes.jpg",
    imagenAlt: "Foto antigua de la primera piscina",
    antigua: true,
    orden: 1,
  },
  { id: "h2013", anio: 2013, titulo: "Nace la escuela de natación", texto: "Llegaron los primeros profes y las clases para chicos. ¡Se llenaron en una semana!", imagen: null, imagenAlt: "", antigua: false, orden: 2 },
  { id: "h2016", anio: 2016, titulo: "La Grande: 25 metros de pura alegría", texto: "Inauguramos la piscina semiolímpica climatizada con seis andariveles para nadar todo el año.", imagen: null, imagenAlt: "", antigua: false, orden: 3 },
  { id: "h2019", anio: 2019, titulo: "Llegaron los peques (y el aquagym)", texto: "Sumamos la piscina infantil, la matronatación y las primeras clases de aquagym con música.", imagen: null, imagenAlt: "", antigua: false, orden: 4 },
  {
    id: "h2023",
    anio: 2023,
    titulo: "Renovación total",
    texto: "Vestuarios nuevos, climatización con paneles solares y más espacio verde para el verano.",
    imagen: "/imagenes/historia-hoy.jpg",
    imagenAlt: "La piscina semiolímpica hoy",
    antigua: false,
    orden: 5,
  },
  { id: "h2026", anio: 2026, titulo: "Socios digitales", texto: "Tu carnet ahora vive en el celular: te hacés socio online y entrás mostrando tu QR.", imagen: null, imagenAlt: "", antigua: false, orden: 6 },
];

export const historiaPorDefecto: ContenidoHistoria = {
  bajada: "Empezamos con una piscina y muchas ganas. Hoy somos el lugar donde miles de familias aprendieron a disfrutar del agua.",
  frase: {
    texto: "Queríamos un lugar donde el barrio aprendiera a nadar y se sintiera como en casa. Cada chico que pierde el miedo al agua nos confirma que valió la pena.",
    autor: "Marta y Jorge",
    rol: "Fundadores",
  },
  contadores: [
    { valor: 500, prefijo: "+", label: "socios felices" },
    { valor: "anios", prefijo: "", label: "años de historia" },
    { valor: 3, prefijo: "", label: "piscinas climatizadas" },
    { valor: 2000, prefijo: "+", label: "chicos aprendieron a nadar" },
  ],
};
