import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getStorefrontData } from "@/lib/storefront";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/shop", priority: 0.95 },
  { path: "/about", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/upload", priority: 0.65 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));

  try {
    const data = await getStorefrontData();
    const productEntries = data.products.map((product) => ({
      url: `${siteUrl}/shop/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: product.isFeatured ? 0.9 : 0.75,
    }));

    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
