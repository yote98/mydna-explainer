import HeroSection from "@/components/hero-section"
import WorkflowSection from "@/components/workflow-section"
import FeaturesSection from "@/components/features-section"
import PricingSection from "@/components/pricing-section"
import TestimonialsSection from "@/components/testimonials-section"
import CTASection from "@/components/cta-section"
import { getSiteUrl } from "@/lib/site"

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MyDNA Explainer",
  description:
    "Educational tool for genetic literacy: plain-language report help, ClinVar lookup, and next-steps resources. Not medical advice.",
  url: getSiteUrl().origin,
} as const

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
      />
    <main className="min-h-screen bg-background">
      <HeroSection />
      <WorkflowSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </main>
    </>
  )
}
