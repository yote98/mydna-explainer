import Link from "next/link"
import { ArrowRight, Dna, Lock, Search, Shield } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative bg-gradient-to-br from-primary/5 via-white to-primary/5 border border-primary/20 rounded-3xl p-12 md:p-16 overflow-hidden">
          {/* Decorative corner icons */}
          <div className="absolute top-8 left-8 w-10 h-10 border border-primary/30 rounded-lg flex items-center justify-center">
            <Dna className="w-4 h-4 text-primary/60" />
          </div>
          <div className="absolute top-8 right-8 w-10 h-10 border border-primary/30 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary/60" />
          </div>
          <div className="absolute bottom-8 left-8 w-10 h-10 border border-primary/30 rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-primary/60" />
          </div>
          <div className="absolute bottom-8 right-8 w-10 h-10 border border-primary/30 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary/60" />
          </div>

          {/* Main content */}
          <div className="text-center max-w-2xl mx-auto relative z-10">
            <h2 className="font-serif text-4xl md:text-5xl mb-4 leading-tight">
              Take control of your
              <br />
              genetic health journey.
            </h2>
            <p className="text-muted-foreground mb-8">
              Start with education. Talk confidently with your doctor. Make informed decisions. 100% free, 100% private.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/translate" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                Translate My Report
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/lookup" className="inline-flex items-center justify-center gap-2 bg-white text-primary border border-primary/20 px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/5 transition-colors">
                Learn About Variants
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
