import { Check, Shield, Globe } from "lucide-react"

export default function PricingSection() {
  const features = [
    "Unlimited Report Translations",
    "ClinVar Variant Lookups",
    "Medical Term Glossary",
    "Doctor Question Generator",
    "Privacy-First Processing",
  ]

  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-muted-foreground tracking-wider">◆ ACCESSIBILITY</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 mb-4">
            Democratizing genetic
            <br />
            literacy for everyone.
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-amber-50 px-3 py-1 rounded shadow-sm rotate-[-2deg] border border-amber-100">
              <span className="text-xs font-mono">ALWAYS_FREE</span>
            </div>
            <p className="text-muted-foreground text-sm">No credit card. No sign-up required.</p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
            <div
              className="bg-card border border-primary/20 rounded-2xl p-8 relative shadow-xl"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-mono px-4 py-1.5 rounded-full shadow-md flex items-center gap-2">
                <Globe className="w-3 h-3" />
                OPEN ACCESS MISSION
              </div>

              <div className="mb-8 text-center">
                <span className="text-xs font-mono text-muted-foreground">PATIENT ACCESS TIER</span>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-5xl font-serif">$0</span>
                  <span className="text-muted-foreground text-sm">/forever</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  We believe understanding your own DNA is a fundamental right, not a luxury product.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-secondary/50 rounded-xl p-4 flex items-start gap-3 border border-border/50">
                 <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-xs font-bold text-primary mb-1">PRIVACY GUARANTEE</h4>
                    <p className="text-xs text-muted-foreground">
                        Your data is processed in your browser session and is never stored on our servers.
                    </p>
                 </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  )
}
