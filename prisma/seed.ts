/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { renderCarSvg, type BodyKind, type Variant } from "./demo-images";
import { SETTINGS_DEFAULTS } from "../src/lib/settings-defaults";

const prisma = new PrismaClient();

type SeedCar = {
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number;
  km: number;
  fuel: "NAFTA" | "DIESEL" | "HIBRIDO" | "ELECTRICO";
  transmission: "MANUAL" | "AUTOMATICA";
  bodyType: string;
  kind: BodyKind;
  color: string;
  hex: string;
  engine: string;
  doors: number;
  status?: "DISPONIBLE" | "RESERVADO" | "VENDIDO";
  featured?: boolean;
  description: string;
  equipment: string[];
};

const cars: SeedCar[] = [
  {
    brand: "Toyota",
    model: "Hilux",
    version: "SRV 2.8 4x4 AT",
    year: 2022,
    price: 48900,
    km: 52000,
    fuel: "DIESEL",
    transmission: "AUTOMATICA",
    bodyType: "Pickup",
    kind: "pickup",
    color: "Plata metálico",
    hex: "#A3A8AE",
    engine: "2.8 turbodiésel 204 HP",
    doors: 4,
    featured: true,
    description:
      "Hilux SRV doble cabina en excelente estado, único dueño y con todos los services realizados en el concesionario oficial. Ideal para trabajo y para viajar en familia. Cubiertas nuevas y protector de caja.",
    equipment: [
      "Tracción 4x4 con reductora",
      "Control de estabilidad y tracción",
      "7 airbags",
      "Pantalla táctil con Apple CarPlay y Android Auto",
      "Cámara de retroceso",
      "Climatizador automático",
      "Llantas de aleación 18\"",
      "Control crucero",
    ],
  },
  {
    brand: "Chevrolet",
    model: "Onix",
    version: "1.0 Turbo LT",
    year: 2021,
    price: 18900,
    km: 45000,
    fuel: "NAFTA",
    transmission: "MANUAL",
    bodyType: "Hatchback",
    kind: "hatch",
    color: "Rojo carmín",
    hex: "#A51C24",
    engine: "1.0 turbo 116 HP",
    doors: 5,
    featured: true,
    description:
      "Onix turbo de bajo consumo, muy cuidado y con service al día. Perfecto para la ciudad y la ruta. Se entrega con revisión mecánica completa y garantía de 3 meses.",
    equipment: [
      "6 airbags",
      "Control de estabilidad",
      "Pantalla MyLink 8\" con conectividad",
      "Wi-Fi a bordo",
      "Aire acondicionado",
      "Sensor de estacionamiento trasero",
      "Vidrios y espejos eléctricos",
    ],
  },
  {
    brand: "Peugeot",
    model: "208",
    version: "Allure 1.6 AT",
    year: 2022,
    price: 22500,
    km: 30000,
    fuel: "NAFTA",
    transmission: "AUTOMATICA",
    bodyType: "Hatchback",
    kind: "hatch",
    color: "Azul vertigo",
    hex: "#1E4C9A",
    engine: "1.6 16v 115 HP",
    doors: 5,
    featured: true,
    description:
      "Nuevo 208 con caja automática de 6 marchas y el i-Cockpit 3D. Diseño moderno, excelente confort de marcha y un equipamiento muy completo para su segmento.",
    equipment: [
      "Caja automática de 6 velocidades",
      "i-Cockpit con tablero digital",
      "Pantalla táctil 7\" con Mirror Screen",
      "Climatizador",
      "Faros LED",
      "Sensor de estacionamiento",
      "Llantas de aleación 16\"",
    ],
  },
  {
    brand: "Toyota",
    model: "Corolla",
    version: "XEI Hybrid",
    year: 2023,
    price: 34900,
    km: 25000,
    fuel: "HIBRIDO",
    transmission: "AUTOMATICA",
    bodyType: "Sedán",
    kind: "sedan",
    color: "Blanco perla",
    hex: "#E9E7E1",
    engine: "1.8 híbrido 122 HP combinados",
    doors: 4,
    featured: true,
    description:
      "Corolla híbrido con consumo urbano excepcional y la confiabilidad de siempre. Garantía de fábrica vigente en la batería híbrida. Impecable por dentro y por fuera.",
    equipment: [
      "Sistema híbrido autorrecargable",
      "Toyota Safety Sense (frenado autónomo, alerta de carril)",
      "Control crucero adaptativo",
      "Climatizador bizona",
      "Tapizado de cuero ecológico",
      "Cargador inalámbrico",
      "Cámara de retroceso",
    ],
  },
  {
    brand: "Fiat",
    model: "Cronos",
    version: "Drive 1.3",
    year: 2024,
    price: 21900,
    km: 9000,
    fuel: "NAFTA",
    transmission: "MANUAL",
    bodyType: "Sedán",
    kind: "sedan",
    color: "Gris scandium",
    hex: "#5D6167",
    engine: "1.3 Firefly 99 HP",
    doors: 4,
    description:
      "Cronos prácticamente nuevo, con muy pocos kilómetros. Baúl de 525 litros, ideal para la familia. Aún con garantía de fábrica.",
    equipment: [
      "Pantalla táctil 7\" con Apple CarPlay y Android Auto",
      "Aire acondicionado",
      "Control de estabilidad",
      "Dirección eléctrica",
      "Sensor de estacionamiento",
      "Volante multifunción",
    ],
  },
  {
    brand: "Suzuki",
    model: "Swift",
    version: "1.2 GL",
    year: 2019,
    price: 13900,
    km: 62000,
    fuel: "NAFTA",
    transmission: "MANUAL",
    bodyType: "Hatchback",
    kind: "hatch",
    color: "Gris plata",
    hex: "#7A7E84",
    engine: "1.2 DualJet 83 HP",
    doors: 5,
    description:
      "Swift ágil, económico y muy confiable. Excelente opción como primer auto. Service recién realizado y cubiertas en muy buen estado.",
    equipment: [
      "Aire acondicionado",
      "Doble airbag frontal",
      "Frenos ABS",
      "Radio con Bluetooth y USB",
      "Vidrios eléctricos delanteros",
      "Cierre centralizado",
    ],
  },
  {
    brand: "Hyundai",
    model: "HB20",
    version: "1.6 Comfort Plus",
    year: 2020,
    price: 15500,
    km: 55000,
    fuel: "NAFTA",
    transmission: "MANUAL",
    bodyType: "Hatchback",
    kind: "hatch",
    color: "Bordó",
    hex: "#5E1A2A",
    engine: "1.6 16v 128 HP",
    doors: 5,
    description:
      "HB20 con motor 1.6, espacioso y de muy buen andar. Mantenimiento al día y documentación en regla, listo para transferir.",
    equipment: [
      "Aire acondicionado",
      "Pantalla multimedia con Bluetooth",
      "Doble airbag",
      "Frenos ABS",
      "Computadora de a bordo",
      "Alarma",
    ],
  },
  {
    brand: "Renault",
    model: "Kwid",
    version: "Zen 1.0",
    year: 2023,
    price: 12900,
    km: 12000,
    fuel: "NAFTA",
    transmission: "MANUAL",
    bodyType: "Hatchback",
    kind: "hatch",
    color: "Naranja",
    hex: "#D9661F",
    engine: "1.0 SCe 66 HP",
    doors: 5,
    description:
      "Kwid casi nuevo, muy económico de mantener y con un consumo bajísimo. Ideal para moverse por la ciudad sin gastar de más.",
    equipment: [
      "4 airbags",
      "Aire acondicionado",
      "Dirección asistida",
      "Radio con Bluetooth",
      "Despeje elevado",
    ],
  },
  {
    brand: "Ford",
    model: "Ranger",
    version: "XLT 3.2 4x4 AT",
    year: 2019,
    price: 39900,
    km: 98000,
    fuel: "DIESEL",
    transmission: "AUTOMATICA",
    bodyType: "Pickup",
    kind: "pickup",
    color: "Negro ébano",
    hex: "#1B1D21",
    engine: "3.2 turbodiésel 200 HP",
    doors: 4,
    status: "RESERVADO",
    description:
      "Ranger XLT con el potente motor 3.2 y caja automática. Muy robusta, con service oficial y lista para cualquier terreno. Incluye cobertor de caja y enganche.",
    equipment: [
      "Tracción 4x4 con reductora",
      "SYNC 3 con pantalla 8\"",
      "Climatizador bizona",
      "Control de descenso",
      "Sensores de estacionamiento",
      "Enganche para trailer",
      "Cobertor de caja",
    ],
  },
  {
    brand: "Volkswagen",
    model: "Gol",
    version: "Trendline 1.6",
    year: 2016,
    price: 9900,
    km: 112000,
    fuel: "NAFTA",
    transmission: "MANUAL",
    bodyType: "Hatchback",
    kind: "hatch",
    color: "Blanco cristal",
    hex: "#ECECEA",
    engine: "1.6 MSI 101 HP",
    doors: 5,
    status: "VENDIDO",
    description:
      "Gol Trendline, un clásico confiable y económico. Repuestos baratos y fáciles de conseguir en todo el país.",
    equipment: [
      "Aire acondicionado",
      "Dirección hidráulica",
      "Doble airbag",
      "Frenos ABS",
      "Radio con USB",
    ],
  },
];

const reviews = [
  {
    name: "Martín R.",
    rating: 5,
    comment:
      "Compré mi Onix en AutoNova y la atención fue de primera. Me explicaron todo con paciencia y el auto estaba impecable. ¡Muy recomendables!",
    status: "APROBADA",
  },
  {
    name: "Lucía F.",
    rating: 5,
    comment:
      "Dejé mi auto usado como parte de pago y me hicieron una tasación justa. Todo el trámite fue rápido y transparente.",
    status: "APROBADA",
  },
  {
    name: "Diego S.",
    rating: 4,
    comment:
      "Buena variedad de autos y precios razonables. Me ayudaron con la financiación y en una semana ya tenía la camioneta.",
    status: "APROBADA",
  },
  {
    name: "Florencia P.",
    rating: 5,
    comment:
      "Gente seria y de confianza. El auto vino con la revisión hecha y todos los papeles en orden. Volvería a comprar sin dudarlo.",
    status: "APROBADA",
  },
  {
    name: "Gonzalo M.",
    rating: 4,
    comment: "Muy buena atención por WhatsApp, respondieron enseguida todas mis dudas.",
    status: "PENDIENTE",
  },
];

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Cargando datos de demo de AutoNova…");

  await prisma.carImage.deleteMany();
  await prisma.car.deleteMany();
  await prisma.review.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.adminUser.deleteMany();

  const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads"));
  const demoDir = path.join(uploadsDir, "demo");
  await fs.rm(demoDir, { recursive: true, force: true });
  await fs.mkdir(demoDir, { recursive: true });

  const variants: Variant[] = ["studio", "dusk", "detail"];
  const variantAlt: Record<Variant, string> = {
    studio: "vista lateral",
    dusk: "vista lateral exterior",
    detail: "detalle frontal",
  };

  for (const [i, c] of cars.entries()) {
    const slug = slugify(`${c.brand} ${c.model} ${c.version} ${c.year}`);
    const images: { url: string; alt: string; position: number }[] = [];
    for (const [pos, variant] of variants.entries()) {
      const svg = renderCarSvg({ kind: c.kind, color: c.hex, variant, seed: i * 13 + 5 });
      const file = `${slug}-${pos + 1}.jpg`;
      await sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(demoDir, file));
      images.push({
        url: `/uploads/demo/${file}`,
        alt: `${c.brand} ${c.model} ${c.year} — ${variantAlt[variant]}`,
        position: pos,
      });
    }

    const createdAt = new Date(Date.now() - (cars.length - i) * 86_400_000 * 3);
    await prisma.car.create({
      data: {
        slug,
        brand: c.brand,
        model: c.model,
        version: c.version,
        year: c.year,
        price: c.price,
        km: c.km,
        fuel: c.fuel,
        transmission: c.transmission,
        bodyType: c.bodyType,
        color: c.color,
        engine: c.engine,
        doors: c.doors,
        description: c.description,
        equipment: c.equipment.join("\n"),
        status: c.status ?? "DISPONIBLE",
        featured: c.featured ?? false,
        soldAt: c.status === "VENDIDO" ? new Date() : null,
        createdAt,
        images: { create: images },
      },
    });
    console.log(`  🚗 ${c.brand} ${c.model} ${c.year}`);
  }

  for (const [i, r] of reviews.entries()) {
    await prisma.review.create({
      data: { ...r, createdAt: new Date(Date.now() - (reviews.length - i) * 86_400_000 * 9) },
    });
  }
  console.log(`  ⭐ ${reviews.length} reseñas`);

  await prisma.setting.createMany({
    data: Object.entries(SETTINGS_DEFAULTS).map(([key, value]) => ({ key, value })),
  });
  console.log("  ⚙️  Configuración del negocio");

  const username = process.env.SEED_ADMIN_USER || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "autonova2024";
  await prisma.adminUser.create({
    data: { username, name: "Administrador", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`  🔐 Usuario admin: ${username} / ${password}`);

  console.log("✅ Listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
