import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { explainerSlugs, templateSlugs } from "@/lib/kb-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().origin;
  const staticPaths: Array<{
    path: string;
    priority: number;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/translate", priority: 0.9, changeFrequency: "monthly" },
    { path: "/lookup", priority: 0.9, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
    { path: "/disclaimer", priority: 0.5, changeFrequency: "yearly" },
  ];

  // KB slugs come from the build-time content registry (lib/kb-content.ts);
  // no runtime filesystem access (Cloudflare Workers compatible).
  const entries: MetadataRoute.Sitemap = staticPaths.map(({ path: p, priority, changeFrequency }) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  for (const slug of explainerSlugs) {
    entries.push({
      url: `${base}/kb/explainers/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  for (const slug of templateSlugs) {
    entries.push({
      url: `${base}/kb/templates/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  return entries;
}
