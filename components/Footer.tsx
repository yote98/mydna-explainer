import Link from "next/link"
import { Dna, AlertTriangle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Dna className="w-6 h-6 text-primary" />
              <span className="font-serif font-bold text-lg">MyDNA Explainer</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              GENETIC REPORT TRANSLATION
              <br />
              & EDUCATION PLATFORM
            </p>
            <p className="text-xs font-mono text-muted-foreground mt-4">◆ POWERED BY CLINVAR</p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-mono text-muted-foreground mb-4">TOOLS</h4>
            <ul className="space-y-2">
              {[
                  { name: "Translator", href: "/translate" },
                  { name: "Variant Lookup", href: "/lookup" },
                  { name: "Next Steps Checklist", href: "/kb/templates/next-steps-checklist" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div>
            <h4 className="text-xs font-mono text-muted-foreground mb-4">LEARN</h4>
            <ul className="space-y-2">
              {[
                  { name: "What is a VUS?", href: "/kb/explainers/vus-explained" },
                  { name: "ClinVar Classifications", href: "/kb/explainers/clinvar-classifications" },
                  { name: "Test Limitations", href: "/kb/explainers/dtc-testing-limitations" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-mono">IMPORTANT DISCLAIMER</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              <span className="font-bold text-foreground">Not Medical Advice.</span> This tool is for educational purposes only. 
              It does not provide medical diagnosis or treatment. Always consult with a certified genetic counselor or healthcare provider.
            </p>
             <div className="flex gap-4">
                <Link href="/privacy" className="text-xs text-muted-foreground hover:underline">Privacy Policy</Link>
                <Link href="/disclaimer" className="text-xs text-muted-foreground hover:underline">Terms of Use</Link>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MyDNA Explainer.</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            SYSTEM OPERATIONAL
          </p>
        </div>
      </div>
    </footer>
  )
}
