import { Check, Search, Shield } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between mb-16">
          <div>
            <span className="text-xs font-mono text-primary tracking-wider">◆ CORE_FEATURES</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 max-w-lg leading-tight">
              Everything you need to understand your genetics
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs hidden md:block">
            Built by genetics enthusiasts, designed for everyone.
          </p>
        </div>

        {/* Top row features */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Plain Language Translation */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <span className="text-xs font-mono text-muted-foreground">FEATURE</span>
              <span className="text-xs font-mono text-muted-foreground">AI_TRANSLATION</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-center">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Plain Language Translation</h3>
            <p className="text-sm text-muted-foreground">
              Converts genetic jargon, medical terminology, and variant names into clear explanations anyone can understand.
            </p>
          </div>

          {/* ClinVar Lookup */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <span className="text-xs font-mono text-muted-foreground">FEATURE</span>
              <span className="text-xs font-mono text-muted-foreground">DATABASE_LOOKUP</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-center">
              <div className="text-center space-y-1">
                <div className="text-xs font-mono text-primary/60">ClinVar</div>
                <div className="text-sm font-semibold text-primary">Pathogenic</div>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Variant Lookup</h3>
            <p className="text-sm text-muted-foreground">
              Cross-references your findings with ClinVar data and genetic databases for accurate pathogenicity classifications.
            </p>
          </div>

          {/* Privacy First */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <span className="text-xs font-mono text-muted-foreground">FEATURE</span>
              <span className="text-xs font-mono text-muted-foreground">PRIVACY_GRADE</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              We don&apos;t store your report. Processing happens in-session, and analysis is sent to your selected AI provider.
            </p>
          </div>
        </div>

        {/* Bottom row features */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Doctor-Ready Summaries */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex gap-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex-shrink-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-primary/60 mb-1">Smart</div>
                  <div className="text-2xl font-bold text-primary">Q&A</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">BENEFIT</span>
                </div>
                <h3 className="font-semibold text-2xl mb-1">Doctor-Ready Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-generated questions tailored to your specific genetic findings. Prepared conversations lead to better care.
                </p>
              </div>
            </div>
          </div>

          {/* Support Resources */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">EDUCATION</span>
                </div>
                <h3 className="font-semibold text-2xl mb-1">Learn Genetics Basics</h3>
                <p className="text-sm text-muted-foreground">
                  Integrated glossary of genetic terms, inheritance patterns, and concept explanations to build your genetic literacy.
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex-shrink-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl">📚</div>
                  <div className="text-xs text-primary mt-1">Learn</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
