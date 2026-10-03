export type Auto = {
  id: string;
  slug: string;
  marca: string;
  modelo: string;
  version: string;
  anio: number;
  km: number;
  precio: number; // USD
  combustible: "Nafta" | "Diésel" | "Eléctrico" | "Híbrido";
  transmision: "Automática" | "Manual";
  motor: string;
  color: string;
  destacado?: boolean;
  descripcion: string;
  equipamiento: string[];
  fotos: string[];
};

// Fotos de referencia de Unsplash (dominio configurado en next.config.ts).
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;

export const autos: Auto[] = [
  {
    id: "1",
    slug: "porsche-911-carrera-s-2021",
    marca: "Porsche",
    modelo: "911",
    version: "Carrera S",
    anio: 2021,
    km: 18500,
    precio: 168000,
    combustible: "Nafta",
    transmision: "Automática",
    motor: "3.0 biturbo · 450 CV",
    color: "Gris Plata GT",
    destacado: true,
    descripcion:
      "Un 911 con la medida justa de todo: potencia, tacto y uso diario. Service oficial al día, único dueño y un estado que se nota apenas lo ves.",
    equipamiento: ["Paquete Sport Chrono", "Techo corredizo", "Asientos deportivos Plus", "Escape deportivo", "Apple CarPlay", "Cámara 360°"],
    fotos: ["1503376780353-7e6692767b70", "1580273916550-e323be2ae537", "1552519507-da3b142c6e3d"].map(u),
  },
  {
    id: "2",
    slug: "bmw-m3-competition-2022",
    marca: "BMW",
    modelo: "M3",
    version: "Competition",
    anio: 2022,
    km: 12300,
    precio: 112000,
    combustible: "Nafta",
    transmision: "Automática",
    motor: "3.0 biturbo · 510 CV",
    color: "Negro Zafiro",
    destacado: true,
    descripcion:
      "Sedán de cuatro puertas con alma de pista. Bajo kilometraje, mantenimiento oficial y todo el equipamiento que le pedirías.",
    equipamiento: ["M Carbon Pack", "Head-up display", "Harman Kardon", "Asientos M Carbon", "Frenos cerámicos", "Control adaptativo"],
    fotos: ["1555215695-3004980ad54e", "1544636331-e26879cd4d9b", "1617814076367-b759c7d7e738"].map(u),
  },
  {
    id: "3",
    slug: "audi-rs5-sportback-2021",
    marca: "Audi",
    modelo: "RS5",
    version: "Sportback",
    anio: 2021,
    km: 24000,
    precio: 89500,
    combustible: "Nafta",
    transmision: "Automática",
    motor: "2.9 V6 biturbo · 450 CV",
    color: "Azul Nogaro",
    destacado: true,
    descripcion:
      "Quattro, 450 caballos y una línea que no pasa de moda. Se siente tan bien a 60 como a 200.",
    equipamiento: ["Quattro", "Virtual Cockpit Plus", "Bang & Olufsen", "Llantas 20\"", "Techo panorámico", "Suspensión deportiva"],
    fotos: ["1606664515524-ed2f786a0bd6", "1549399542-7e3f8b79c341", "1492144534655-ae79c964c9d7"].map(u),
  },
  {
    id: "4",
    slug: "mercedes-benz-c300-2022",
    marca: "Mercedes-Benz",
    modelo: "C 300",
    version: "AMG Line",
    anio: 2022,
    km: 16800,
    precio: 58900,
    combustible: "Nafta",
    transmision: "Automática",
    motor: "2.0 turbo · 258 CV",
    color: "Blanco Polar",
    descripcion:
      "Elegancia sin vueltas. Interior impecable, tecnología MBUX y un andar silencioso que se disfruta todos los días.",
    equipamiento: ["MBUX con pantalla 12.3\"", "Iluminación ambiental", "Asientos de cuero", "Cámara de estacionamiento", "Paquete AMG Line"],
    fotos: ["1618843479313-40f8afb4b4d8", "1525609004556-c46c7d6cf023", "1553440569-bcc63803a83d"].map(u),
  },
  {
    id: "5",
    slug: "volkswagen-amarok-v6-extreme-2023",
    marca: "Volkswagen",
    modelo: "Amarok",
    version: "V6 Extreme 4x4",
    anio: 2023,
    km: 22000,
    precio: 54900,
    combustible: "Diésel",
    transmision: "Automática",
    motor: "3.0 V6 TDI · 258 CV",
    color: "Gris Indium",
    destacado: true,
    descripcion:
      "La pick-up que hace de todo: trabajo, ruta y escapada de fin de semana. Una sola mano y service en concesionario.",
    equipamiento: ["Tracción 4Motion", "Cuero Nappa", "Barra deportiva", "Faros Matrix LED", "Control de crucero adaptativo"],
    fotos: ["1559416523-140ddc3d238c", "1533473359331-0135ef1b58bf", "1551830820-330a71b99659"].map(u),
  },
  {
    id: "6",
    slug: "toyota-hilux-gr-sport-2023",
    marca: "Toyota",
    modelo: "Hilux",
    version: "GR-Sport 4x4",
    anio: 2023,
    km: 15000,
    precio: 61000,
    combustible: "Diésel",
    transmision: "Automática",
    motor: "2.8 TDI · 204 CV",
    color: "Negro Perlado",
    descripcion:
      "Confiabilidad Toyota con actitud deportiva. Muy poco uso, service oficial y lista para lo que se venga.",
    equipamiento: ["Suspensión GR-Sport", "Pantalla 8\"", "Toyota Safety Sense", "Tapizado cuero", "Llantas 18\""],
    fotos: ["1594502184342-2e12f877aa73", "1612544448445-b8232cff3b6c", "1583267746897-2cf415887172"].map(u),
  },
  {
    id: "7",
    slug: "tesla-model-3-long-range-2022",
    marca: "Tesla",
    modelo: "Model 3",
    version: "Long Range",
    anio: 2022,
    km: 20500,
    precio: 49800,
    combustible: "Eléctrico",
    transmision: "Automática",
    motor: "Doble motor · 498 km de autonomía",
    color: "Blanco Perla",
    destacado: true,
    descripcion:
      "Silencioso, rapidísimo y con el costo por kilómetro más bajo que vas a encontrar. Incluye cargador domiciliario.",
    equipamiento: ["Autopilot", "Techo de vidrio", "Pantalla 15\"", "Cargador Wall Connector", "Sonido premium"],
    fotos: ["1560958089-b8a1929cea89", "1536700503339-1e4b06520771", "1617788138017-80ad40651399"].map(u),
  },
  {
    id: "8",
    slug: "range-rover-evoque-r-dynamic-2021",
    marca: "Land Rover",
    modelo: "Range Rover Evoque",
    version: "R-Dynamic SE",
    anio: 2021,
    km: 31000,
    precio: 47500,
    combustible: "Híbrido",
    transmision: "Automática",
    motor: "2.0 P250 MHEV · 249 CV",
    color: "Verde Eiger",
    destacado: true,
    descripcion:
      "El SUV compacto con más personalidad. Diseño inconfundible, interior de primera y mantenimiento al día.",
    equipamiento: ["Techo panorámico", "Meridian Sound", "ClearSight", "Cámara 3D", "Llantas 20\""],
    fotos: ["1606016159991-dfe4f2746ad5", "1519641471654-76ce0107ad1b", "1503736334956-4c8f8e92946d"].map(u),
  },
  {
    id: "9",
    slug: "mini-cooper-s-2020",
    marca: "MINI",
    modelo: "Cooper S",
    version: "Hatch 3 puertas",
    anio: 2020,
    km: 28000,
    precio: 29900,
    combustible: "Nafta",
    transmision: "Automática",
    motor: "2.0 turbo · 192 CV",
    color: "Rojo Chili",
    descripcion:
      "Ágil, divertido y con carácter. Ideal para la ciudad y para ponerle onda a cualquier salida.",
    equipamiento: ["Techo flotante", "Head-up display", "Pantalla 8.8\"", "Asientos deportivos", "Modo Sport"],
    fotos: ["1541899481282-d53bffe3c35d", "1568605117036-5fe5e7bab0b7", "1502877338535-766e1452684a"].map(u),
  },
];

export const getAuto = (slug: string) => autos.find((a) => a.slug === slug);
export const marcas = Array.from(new Set(autos.map((a) => a.marca))).sort();
