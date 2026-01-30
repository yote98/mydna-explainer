"use client";

import { FileText, Search, Stethoscope, ArrowRight } from "lucide-react"
import { motion, Variants } from "framer-motion"

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
      active: true
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <section className="py-24 bg-secondary/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[10px] font-bold font-mono text-primary tracking-[0.2em] uppercase border-l-2 border-primary pl-3 mb-4">
            Analysis Workflow
          </span>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
            From clinical data to <br />
            <span className="text-primary italic">plain-language</span> clarity.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Our educational process bridges the gap between complex genetic reports and the conversations you need to have with your healthcare provider.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div key={step.number} variants={itemVariants} className="relative group">
              {/* Step Marker */}
              <div className="absolute -top-12 -left-2 mono-number opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                {step.number}
              </div>

              <div className="lab-glass p-8 h-full transition-all duration-500 hover:border-primary/40 group-hover:shadow-[0_20px_40px_rgba(79,70,229,0.08)]">
                {step.active && <div className="scan-line" />}

                {/* Visual state */}
                <div className="aspect-square bg-white/40 rounded-[4px] mb-8 flex items-center justify-center relative overflow-hidden border border-border/50 group-hover:bg-white/60 transition-colors">
                  {step.visual === "note" && (
                    <div className="bg-white p-4 rounded-[4px] shadow-sm rotate-[-2deg] border border-border/30 w-3/4">
                      <div className="flex items-center gap-2 mb-2 border-b border-border/20 pb-1">
                        <FileText className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-mono text-muted-foreground">LAB_REPORT_01</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-1 bg-muted/40 rounded w-full" />
                        <div className="h-1 bg-muted/40 rounded w-5/6" />
                        <div className="h-1 bg-primary/20 rounded w-4/6" />
                      </div>
                    </div>
                  )}
                  {step.visual === "scan" && (
                    <div className="space-y-3 w-full px-6 flex flex-col items-center">
                      <div className="relative w-full">
                        <div className="bg-indigo-50/50 border border-primary/20 p-3 rounded-[4px] relative z-10">
                          <p className="text-[10px] font-mono text-muted-foreground mb-1">RAW_INPUT</p>
                          <p className="text-[10px] font-medium leading-relaxed">&quot;Variant c.68_69delAG...&quot;</p>
                          <div className="h-px bg-primary/20 my-2" />
                          <p className="text-[10px] font-bold text-primary">&quot;Missing piece of DNA...&quot;</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {step.visual === "draft" && (
                    <div className="bg-white/80 border border-border/50 rounded-[4px] p-4 shadow-sm w-4/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold font-mono text-muted-foreground tracking-tighter uppercase">ClinVar Lookup</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex gap-3 items-center">
                        <Search className="w-4 h-4 text-primary" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-1 bg-primary/10 rounded w-full" />
                          <div className="h-1 bg-primary/10 rounded w-4/5" />
                        </div>
                      </div>
                    </div>
                  )}
                  {step.visual === "send" && (
                    <div className="text-center">
                      <div className="inline-flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                          <Stethoscope className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold font-mono text-primary uppercase tracking-widest">Counselor Ready</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold font-mono text-primary/40">{step.number}</span>
                    <div className="h-px bg-primary/20 flex-1" />
                  </div>
                  <h3 className="font-serif text-xl mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-6 z-20 items-center justify-center text-primary/20">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
