export type Auto = {
  slug: string;
  marca: string;
  modelo: string;
  version: string;
  anio: number;
  km: number;
  precio: number;
  combustible: "Nafta" | "Diésel" | "Híbrido" | "Eléctrico";
  transmision: string;
  potencia: string;
  color: string;
  destacado: boolean;
  descripcion: string;
  fotos: string[];
};

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const P = {
  a: "1503376780353-7e6692767b70",
  b: "1580273916550-e323be2ae537",
  c: "1555215695-3004980ad54e",
  d: "1544636331-e26879cd4d9b",
  e: "1618843479313-40f8afb4b4d8",
  f: "1492144534655-ae79c964c9d7",
  g: "1494976388531-d1058494cdd8",
  h: "1549399542-7e3f8b79c341",
  i: "1552519507-da3b142c6e3d",
  j: "1542362567-b07e54358753",
  k: "1502877338535-766e1452684a",
  l: "1511919884226-fd3cad34687c",
  m: "1583121274602-3e2820c69888",
  n: "1525609004556-c46c7d6cf023",
};
const f = (...ids: (keyof typeof P)[]) => ids.map((i) => u(P[i]));

export const autos: Auto[] = [
  {
    slug: "porsche-911-carrera-s-2022", marca: "Porsche", modelo: "911", version: "Carrera S", anio: 2022, km: 18400,
    precio: 142000, combustible: "Nafta", transmision: "Automática PDK 8v", potencia: "450 CV", color: "Gris Agata", destacado: true,
    descripcion: "Un 911 con historial completo de servicio oficial y un solo dueño. Equipado con Sport Chrono, techo corredizo y escape deportivo. Se maneja como el primer día.",
    fotos: f("b", "a", "i", "l"),
  },
  {
    slug: "bmw-m4-competition-2021", marca: "BMW", modelo: "M4", version: "Competition", anio: 2021, km: 24000,
    precio: 98500, combustible: "Nafta", transmision: "Automática 8v", potencia: "510 CV", color: "Verde Isle of Man", destacado: true,
    descripcion: "Seis cilindros en línea biturbo, asientos M Carbon y frenos cerámicos. Service al día en la red oficial, con peritaje completo disponible.",
    fotos: f("c", "d", "j", "k"),
  },
  {
    slug: "mercedes-benz-c300-amg-line-2022", marca: "Mercedes-Benz", modelo: "C 300", version: "AMG Line", anio: 2022, km: 21000,
    precio: 61900, combustible: "Nafta", transmision: "Automática 9G-Tronic", potencia: "258 CV", color: "Negro Obsidiana", destacado: true,
    descripcion: "El equilibrio justo entre lujo y deportividad. Pantalla MBUX, techo panorámico y paquete de asistencias completo. Impecable por dentro y por fuera.",
    fotos: f("e", "f", "n", "j"),
  },
  {
    slug: "audi-rs3-sedan-2023", marca: "Audi", modelo: "RS 3", version: "Sedán", anio: 2023, km: 9800,
    precio: 74200, combustible: "Nafta", transmision: "Automática S tronic 7v", potencia: "400 CV", color: "Gris Nardo", destacado: true,
    descripcion: "Cinco cilindros, tracción quattro y una entrega de potencia que no se olvida. Con Launch Control y escape RS en modo sport.",
    fotos: f("h", "k", "l", "f"),
  },
  {
    slug: "volkswagen-amarok-v6-extreme-2023", marca: "Volkswagen", modelo: "Amarok", version: "V6 Extreme", anio: 2023, km: 28000,
    precio: 52000, combustible: "Diésel", transmision: "Automática 10v", potencia: "258 CV", color: "Blanco Candy", destacado: false,
    descripcion: "La pickup que sirve para el campo y para la ciudad. Tracción 4Motion, cámara 360° y llantas de 20''. Lista para transferir.",
    fotos: f("g", "n", "i", "a"),
  },
  {
    slug: "toyota-hilux-gr-sport-2024", marca: "Toyota", modelo: "Hilux", version: "GR-Sport", anio: 2024, km: 12000,
    precio: 56800, combustible: "Diésel", transmision: "Automática 6v", potencia: "224 CV", color: "Rojo Metalizado", destacado: false,
    descripcion: "Suspensión tuneada por Gazoo Racing, diseño exclusivo y la confiabilidad de siempre. Con garantía de fábrica vigente.",
    fotos: f("n", "g", "l", "d"),
  },
  {
    slug: "tesla-model-3-long-range-2022", marca: "Tesla", modelo: "Model 3", version: "Long Range", anio: 2022, km: 32000,
    precio: 39900, combustible: "Eléctrico", transmision: "Automática (1 vel.)", potencia: "498 CV", color: "Blanco Perlado", destacado: false,
    descripcion: "Más de 500 km de autonomía, piloto asistido y cero mantenimiento tradicional. Incluye cargador doméstico y cable Tipo 2.",
    fotos: f("j", "f", "k", "h"),
  },
  {
    slug: "land-rover-defender-110-2022", marca: "Land Rover", modelo: "Defender", version: "110 D250 SE", anio: 2022, km: 27500,
    precio: 89000, combustible: "Diésel", transmision: "Automática 8v", potencia: "249 CV", color: "Verde Pangea", destacado: false,
    descripcion: "Capacidad off-road de verdad con interior de primer nivel. Suspensión neumática, barras de techo y tercera fila opcional.",
    fotos: f("i", "a", "g", "c"),
  },
  {
    slug: "ford-mustang-gt-2020", marca: "Ford", modelo: "Mustang", version: "GT 5.0 V8", anio: 2020, km: 35000,
    precio: 58400, combustible: "Nafta", transmision: "Automática 10v", potencia: "450 CV", color: "Azul Velocity", destacado: false,
    descripcion: "El V8 aspirado que todavía suena como tiene que sonar. Escape activo, modos de manejo y asientos de cuero Recaro.",
    fotos: f("g", "k", "d", "l"),
  },
  {
    slug: "volvo-xc60-recharge-2023", marca: "Volvo", modelo: "XC60", version: "Recharge T8", anio: 2023, km: 15000,
    precio: 64500, combustible: "Híbrido", transmision: "Automática 8v", potencia: "455 CV", color: "Gris Thunder", destacado: false,
    descripcion: "Híbrido enchufable con tracción integral y hasta 70 km en modo eléctrico. Seguridad Volvo en su máxima expresión.",
    fotos: f("f", "e", "h", "n"),
  },
];

export const marcas = Array.from(new Set(autos.map((a) => a.marca))).sort();
export const getAuto = (slug: string) => autos.find((a) => a.slug === slug);
export const nombre = (a: Auto) => `${a.marca} ${a.modelo}`;
