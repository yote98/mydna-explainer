import Link from "next/link"
import { ArrowRight, Dna, Shield, Lock } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white">
      {/* Main hero area */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary border border-primary/20 bg-primary/5 rounded-full px-3 py-1 w-fit mx-auto lg:mx-0">
              <Dna className="w-3 h-3" />
              <span>EDUCATIONAL TOOL • 100% PRIVACY-FIRST</span>
            </div>

            <h1 className="gradient-headline font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.2] pb-1 text-balance">
              Understand Your
              <br />
              Genetic Report in Plain Language
            </h1>

            <p className="text-muted-foreground text-base max-w-md mx-auto lg:mx-0">Paste your report → Get clear explanations → Prepare smart questions for your doctor.</p>

            {/* Trust badge */}
            <div className="trust-badge mx-auto lg:mx-0">
              <Shield className="w-4 h-4" />
              <span>Educational only</span>
              <span>•</span>
              <span>No data stored</span>
              <span>•</span>
              <span>Powered by ClinVar</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
              <Link href="/translate" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                Translate My Report
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/lookup" className="inline-flex items-center justify-center gap-2 bg-white text-primary border border-primary/20 px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/5 transition-colors">
                Look Up a Variant
              </Link>
            </div>
          </div>

          {/* Right visual - Tool Interface Preview */}
          <div className="relative hidden lg:block">
            {/* Main interface container */}
            <div className="relative bg-white rounded-3xl border border-primary/15 shadow-2xl overflow-hidden mt-8 lg:mt-0">
              {/* Header bar */}
              <div className="bg-gradient-to-r from-primary/10 to-indigo-600/10 border-b border-primary/15 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">In-session only • Your data stays private</span>
                </div>
              </div>

              {/* Two-column interface */}
              <div className="grid grid-cols-2 divide-x divide-primary/10 min-h-96">
                {/* Left: Input column */}
                <div className="p-5 flex flex-col bg-white">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Paste Report</p>
                  <textarea
                    className="flex-1 bg-secondary/40 border border-primary/20 rounded-xl p-3 text-xs font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="BRCA1 c.68_69delAG (p.Glu23fs*17)&#10;rs80357906, Pathogenic..."
                    readOnly
                    defaultValue={`BRCA1 c.68_69delAG
(p.Glu23fs*17)

rs80357906
Pathogenic`}
                  />
                </div>

                {/* Right: Output column with annotations */}
                <div className="p-5 flex flex-col bg-primary/2">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Translation</p>
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    {/* Explanation annotation */}
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full w-fit">
                        Plain Explanation
                      </div>
                      <p className="text-xs leading-relaxed text-foreground">
                        You have one copy of a <span className="bg-primary/20 text-primary font-semibold px-1 rounded">BRCA1 variant</span>. This is a <span className="bg-red-100 text-red-700 font-semibold px-1 rounded">pathogenic</span> change linked to increased cancer risk.
                      </p>
                    </div>

                    {/* Misunderstanding callout */}
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full w-fit">
                        ⚠ Common Misunderstanding
                      </div>
                      <p className="text-xs leading-relaxed text-foreground">
                        This is <span className="font-semibold">not a diagnosis</span>—it&apos;s a risk indicator. Talk to your doctor about screening options.
                      </p>
                    </div>

                    {/* Next step */}
                    <div className="pt-2 border-t border-primary/10">
                      <p className="text-[10px] font-semibold text-primary mb-1">Next Step:</p>
                      <p className="text-xs text-muted-foreground">Schedule a genetic counselor consultation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
