import { readdir } from "fs/promises";
import path from "path";
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

async function listMdSlugs(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

async function listJsonSlugs(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

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

  const explainerDir = path.join(process.cwd(), "kb", "explainers");
  const templateDir = path.join(process.cwd(), "kb", "templates");
  const [explainerSlugs, templateSlugs] = await Promise.all([
    listMdSlugs(explainerDir),
    listJsonSlugs(templateDir),
  ]);

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
