import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/footer";
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
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
