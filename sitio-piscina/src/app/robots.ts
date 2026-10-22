import type { MetadataRoute } from "next";
import { urlSitio } from "@/config/sitio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/mi-carnet", "/v/", "/auth/"] },
    sitemap: `${urlSitio}/sitemap.xml`,
  };
}
