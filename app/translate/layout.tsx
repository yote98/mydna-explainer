import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Translate report",
  description:
    "Paste genetic report text for a plain-language, educational explanation. Not medical advice — always confirm with a qualified professional.",
  openGraph: {
    title: "Translate your genetic report | MyDNA Explainer",
    description:
      "Educational plain-language translation of genetic report excerpts. Not a substitute for clinical care.",
    url: "/translate",
  },
};

export default function TranslateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
