import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: "MyDNA Explainer - Genetic Literacy & Report Translator",
  description: "Understand your genetic reports with plain-language translations, risk literacy explanations, and next-steps guidance. Educational only - not medical advice.",
  keywords: ["genetics", "DNA", "genetic testing", "VUS", "ClinVar", "genetic counseling", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${jetbrains.variable} scroll-smooth`}>
      <body className="antialiased min-h-screen flex flex-col font-sans bg-background text-foreground selection:bg-primary/20">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
