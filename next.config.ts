import type { NextConfig } from "next";

// `npm run build:static` genera la carpeta /out (HTML estático) para hostings sin Node, como Hostinger compartido.
const isStatic = process.env.STATIC_EXPORT === "1";

const config: NextConfig = {
  ...(isStatic && { output: "export", trailingSlash: true }),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    // El export estático no incluye el optimizador de imágenes de Next
    ...(isStatic && { unoptimized: true }),
  },
};
export default config;
