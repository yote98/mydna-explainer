import HeroSection from "@/components/hero-section"
import WorkflowSection from "@/components/workflow-section"
import FeaturesSection from "@/components/features-section"
import PricingSection from "@/components/pricing-section"
import TestimonialsSection from "@/components/testimonials-section"
import CTASection from "@/components/cta-section"
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <WorkflowSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}
