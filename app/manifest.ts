import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const DESCRIPTION =
  "Understand genetic reports with plain-language translations, risk literacy, and next-steps guidance. Educational only — not medical advice.";

export default function manifest(): MetadataRoute.Manifest {
  const origin = getSiteUrl().origin;
  return {
    name: "MyDNA Explainer",
    short_name: "MyDNA",
    description: DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: "#4338ca",
    icons: [
      {
        src: `${origin}/icon-1024.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${origin}/icon-1024.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${origin}/icon-1024.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
