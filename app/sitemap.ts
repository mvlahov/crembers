import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${site.domain}`;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/hr`, lastModified: now, priority: 0.8 },
    { url: `${base}/de`, lastModified: now, priority: 0.8 },
  ];
}
