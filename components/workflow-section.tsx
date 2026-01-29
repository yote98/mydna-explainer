import { FileText, Search, Stethoscope } from "lucide-react"

export default function WorkflowSection() {
  const steps = [
    {
      number: "01",
      title: "Paste Your Report",
      description: "Copy text from your genetic test PDF (Myriad, Invitae, 23andMe, etc.) and paste it securely.",
      visual: "note",
    },
    {
      number: "02",
      title: "AI Translation",
      description: "Our engine identifies genetic / technical terms and translates them into plain English.",
      visual: "scan",
    },
    {
      number: "03",
      title: "Variant Context",
      description: "Automatically cross-reference specific variants with ClinVar to check current classifications.",
      visual: "draft",
    },
    {
      number: "04",
      title: "Appointment Readiness",
      description: "Get a checklist of smart questions to prepare for your genetic counselor or physician.",
      visual: "send",
    },
  ]

  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between mb-16">
          <div>
            <span className="text-xs font-mono text-primary tracking-wider">◆ HOW_IT_WORKS</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 max-w-md leading-tight">
              From confusion to clarity in seconds.
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs hidden md:block">
            No medical training required. Just paste, read, and prepare.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="bg-card border border-border rounded-2xl p-6 h-full">
                {/* Visual placeholder */}
                <div className="aspect-square bg-secondary/50 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                  {step.visual === "note" && (
                    <div className="bg-white p-4 rounded shadow-sm rotate-[-2deg] border border-border/50 w-3/4">
                      <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-1">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground">LAB_REPORT.PDF</span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                        <div className="h-1 bg-muted-foreground/20 rounded w-5/6" />
                        <div className="h-1 bg-muted-foreground/20 rounded w-4/6" />
                        <div className="h-1 bg-red-200 rounded w-1/2 mt-2" />
                      </div>
                    </div>
                  )}
                  {step.visual === "scan" && (
                    <div className="space-y-2 w-full px-4 flex flex-col items-center">
                       <div className="relative w-full">
                         <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-lg h-12" />
                         <div className="bg-white border border-primary/20 p-2 rounded-lg relative z-10">
                            <p className="text-[10px] text-muted-foreground">&quot;Pathogenic variant...&quot;</p>
                            <div className="h-px bg-border my-1" />
                            <p className="text-[10px] font-semibold text-primary">&quot;Higher risk found...&quot;</p>
                         </div>
                       </div>
                    </div>
                  )}
                  {step.visual === "draft" && (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-sm w-4/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-muted-foreground">CLINVAR</span>
                        <span className="text-[10px] font-mono text-green-600">MATCH</span>
                      </div>
                      <div className="flex gap-2 items-center">
                         <Search className="w-4 h-4 text-primary/50" />
                         <div className="flex-1 space-y-1">
                            <div className="h-1.5 bg-primary/20 rounded w-full" />
                            <div className="h-1.5 bg-primary/20 rounded w-2/3" />
                         </div>
                      </div>
                    </div>
                  )}
                  {step.visual === "send" && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-accent/50 rounded-full px-4 py-2 border border-primary/10">
                        <Stethoscope className="w-3 h-3 text-primary" />
                        <span className="text-xs font-mono text-primary">READY</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{step.number}</span>
                </div>
                <h3 className="font-medium text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
