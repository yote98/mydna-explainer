import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { getSiteUrl } from "@/lib/site";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const SITE_DESCRIPTION =
  "Understand your genetic reports with plain-language translations, risk literacy explanations, and next-steps guidance. Educational only — not medical advice.";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "MyDNA Explainer — Genetic literacy & report translator",
    template: "%s | MyDNA Explainer",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "genetics",
    "DNA",
    "genetic testing",
    "VUS",
    "ClinVar",
    "genetic counseling",
    "education",
    "variant lookup",
    "genetic report",
  ],
  authors: [{ name: "MyDNA Explainer" }],
  creator: "MyDNA Explainer",
  publisher: "MyDNA Explainer",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MyDNA Explainer",
    title: "MyDNA Explainer — Genetic literacy & report translator",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "MyDNA Explainer — Genetic literacy & report translator",
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyDNA Explainer",
  },
  applicationName: "MyDNA Explainer",
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${jetbrains.variable} scroll-smooth`}>
      <body className="antialiased min-h-screen flex flex-col font-sans bg-background text-foreground selection:bg-primary/20">
        <ServiceWorkerRegister />
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
