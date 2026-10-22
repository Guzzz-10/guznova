import type { MetadataRoute } from "next";
import { urlSitio } from "@/config/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return [
    { url: `${urlSitio}/`, lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: `${urlSitio}/hacete-socio`, lastModified: ahora, changeFrequency: "monthly", priority: 0.8 },
    { url: `${urlSitio}/terminos`, lastModified: ahora, changeFrequency: "yearly", priority: 0.2 },
    { url: `${urlSitio}/privacidad`, lastModified: ahora, changeFrequency: "yearly", priority: 0.2 },
  ];
}
