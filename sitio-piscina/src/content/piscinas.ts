import type { FotoGaleria, Piscina } from "@/lib/contenido/tipos";

/** Piscinas y galería de ejemplo. Las fotos están en /public/imagenes y se reemplazan desde /admin → Contenido. */
export const piscinasPorDefecto: Piscina[] = [
  {
    id: "peques",
    nombre: "La de los Peques",
    tipo: "Piscina infantil",
    descripcion: "Poco profunda, calentita y con guardavidas siempre presente. El lugar ideal para el primer chapuzón.",
    imagen: "/imagenes/piscina-chica.jpg",
    medidas: "8 × 5 m",
    profundidad: "0,40 a 0,60 m",
    temperatura: "31 °C",
    idealPara: ["Bebés y chicos de 1 a 6 años", "Matronatación", "Juegos en familia"],
    color: "sol",
    orden: 1,
  },
  {
    id: "mediana",
    nombre: "La Mediana",
    tipo: "Piscina escuela y recreativa",
    descripcion: "Hacés pie en toda la piscina. Perfecta para aprender, ganar confianza y moverte con aquagym.",
    imagen: "/imagenes/piscina-mediana.jpg",
    medidas: "16 × 8 m",
    profundidad: "0,90 a 1,30 m",
    temperatura: "29 °C",
    idealPara: ["Escuela de natación", "Aquagym y Aqua Salud", "Adultos mayores"],
    color: "coral",
    orden: 2,
  },
  {
    id: "grande",
    nombre: "La Grande",
    tipo: "Piscina semiolímpica",
    descripcion: "Seis andariveles de 25 metros para entrenar, mejorar tus tiempos o nadar tranquilo a tu ritmo.",
    imagen: "/imagenes/piscina-grande.jpg",
    medidas: "25 × 12,5 m · 6 andariveles",
    profundidad: "1,20 a 2,00 m",
    temperatura: "27 °C",
    idealPara: ["Nado libre", "Natación adultos y pre-equipo", "Entrenamiento"],
    color: "agua",
    orden: 3,
  },
];

const foto = (id: string, src: string, alt: string, ancho: number, alto: number, orden: number): FotoGaleria => ({ id, src, alt, ancho, alto, orden });

export const galeriaPorDefecto: FotoGaleria[] = [
  foto("g1", "/imagenes/piscina-grande.jpg", "Vista aérea de la piscina semiolímpica con andariveles", 1200, 900, 1),
  foto("g2", "/imagenes/galeria-carril.jpg", "Andarivel de la piscina grande visto desde arriba", 900, 1200, 2),
  foto("g3", "/imagenes/galeria-peques.jpg", "Piscina de los peques con flotadores de colores", 900, 675, 3),
  foto("g4", "/imagenes/galeria-andariveles.jpg", "Corcheras de colores sobre el agua", 1200, 900, 4),
  foto("g5", "/imagenes/galeria-borde.jpg", "Borde de la piscina con escalera y reposeras", 1200, 900, 5),
  foto("g6", "/imagenes/piscina-mediana.jpg", "Piscina mediana rodeada de reposeras y sombrillas", 1200, 900, 6),
  foto("g7", "/imagenes/galeria-atardecer.jpg", "El agua de la piscina al atardecer", 1200, 900, 7),
  foto("g8", "/imagenes/galeria-agua.jpg", "Reflejos de luz en el agua turquesa", 1200, 900, 8),
];
