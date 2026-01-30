"use client";

import Link from "next/link"
import { ArrowRight, Dna, Shield, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-8 md:pt-12 lg:pt-16">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute inset-0 tech-grid opacity-30" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 text-xs font-semibold font-mono text-primary border border-primary/20 bg-primary/10 backdrop-blur-md rounded-full px-4 py-1.5 w-fit mx-auto lg:mx-0 shadow-sm"
            >
              <Dna className="w-3.5 h-3.5" />
              <span className="tracking-wide">EDUCATIONAL ONLY • PRIVACY FIRST</span>
            </motion.div>

            <h1 className="gradient-headline font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-balance">
              Translate Your Genetic Report
            </h1>

            <p className="text-muted-foreground text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Upload your raw text. Get plain-language explanations. <br className="hidden md:block" />
              Empower your conversation with your doctor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/translate" className="group relative inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-[4px] text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-100">
                Translate My Report
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/lookup" className="inline-flex items-center justify-center gap-2 bg-white border border-border text-foreground px-8 py-3.5 rounded-[4px] text-sm font-medium hover:bg-muted transition-all shadow-xs hover:shadow-sm">
                Variant Lookup
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>No Data Stored</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>In-Session Only</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block perspective-1000"
          >
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-primary/20 blur-[100px] opacity-20 animate-pulse" />

            <div className="lab-glass p-1 relative transform transition-all hover:scale-[1.02] duration-700 ring-1 ring-white/20">
              {/* Scanning Effect Overlay */}
              <div className="scan-line !opacity-20" />

              {/* Mock Browser Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 bg-white/40 rounded-t-xl">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-40 bg-black/5 rounded-full flex items-center px-3">
                    <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="h-full bg-primary/30"
                      />
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-primary/40">v.04.12_STABLE</span>
                </div>
              </div>

              {/* Mock Content */}
              <div className="grid grid-cols-2 h-[420px] bg-white/80 rounded-b-xl overflow-hidden relative">
                {/* Input Side - The "Raw" Sequence */}
                <div className="p-8 border-r border-indigo-100/50 space-y-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-widest">Raw_Report_Input</span>
                    <Dna className="w-4 h-4 text-primary/30 animate-spin-slow" />
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 bg-black/5 border border-black/5 rounded-[4px] font-mono text-xs text-slate-600 leading-relaxed shadow-inner group-hover:bg-black/10 transition-colors">
                      <div className="text-primary/40 mb-2 border-b border-black/5 pb-1 flex justify-between">
                        <span>Locus: 17q21.31</span>
                        <span className="text-emerald-500">READ_OK</span>
                      </div>
                      <span className="font-bold text-slate-800">BRCA1 c.68_69delAG</span><br />
                      <span className="text-slate-400">(p.Glu23fs*17)</span><br /><br />
                      <span className="text-red-500/80 font-bold bg-red-50 px-1.5 py-0.5 rounded-[2px] inline-block mt-2">PATHOGENIC_VARIANT</span>
                    </div>

                    {/* Metadata Bit */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 bg-black/5 rounded-[2px] border border-black/5 p-2 flex items-center justify-center">
                        <div className="w-full h-1 bg-primary/20 rounded" />
                      </div>
                      <div className="h-8 bg-black/5 rounded-[2px] border border-black/5 p-2 flex items-center justify-center">
                        <div className="w-2/3 h-1 bg-primary/20 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Mono Accent */}
                  <div className="absolute bottom-4 left-8 text-[40px] font-mono text-primary/5 select-none font-bold">
                    DNA_SEQ
                  </div>
                </div>

                {/* Output Side - The "Translated" Clarity */}
                <div className="p-8 bg-indigo-50/30 space-y-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold font-mono text-primary uppercase tracking-widest">Plain_English_Translation</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse delay-75" />
                      <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse delay-150" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-5 bg-white rounded-[4px] border border-indigo-100 shadow-md relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        This finding indicates a <span className="text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded-[2px]">missing structural piece</span> of DNA within the inheritance model of the BRCA1 gene.
                      </p>
                    </motion.div>

                    <div className="p-4 rounded-[4px] border border-emerald-100 bg-emerald-50/50 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-emerald-800 font-semibold tracking-tight uppercase">Confirmed ClinVar Pathogenic</p>
                    </div>

                    <div className="p-4 rounded-[4px] border border-indigo-100 bg-indigo-50/50 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <p className="text-[11px] text-indigo-800 font-semibold tracking-tight uppercase">Privacy Grade: Clinical</p>
                    </div>
                  </div>

                  {/* Absolute Accents */}
                  <div className="absolute bottom-4 right-8 text-[40px] font-mono text-indigo-500/5 select-none font-bold">
                    OUTPUT
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
