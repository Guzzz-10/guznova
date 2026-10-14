import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Si en el futuro se usa un storage en la nube (S3, Cloudinary, etc.),
    // agregar aquí su dominio en remotePatterns.
    remotePatterns: [],
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // Si la foto no existe como archivo estático (subida después del build), la sirve la API.
      fallback: [{ source: "/uploads/:path*", destination: "/api/uploads/:path*" }],
    };
  },
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;
