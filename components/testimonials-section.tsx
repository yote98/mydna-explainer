export default function TestimonialsSection() {
  const testimonials = [
    {
      id: "RPT-2024",
      quote:
        "I was terrified when I saw 'Pathogenic' on my report. This tool explained that it just means 'disease-causing' in a specific context and helped me ask my doctor the right questions.",
      author: "Sarah M.",
      role: "BRCA1 CARRIER",
    },
    {
      id: "VUS-8821",
      quote:
        "My genetic counselor was booked out for months. MyDNA Explainer helped me understand the difference between a VUS and a confirmable diagnosis while I waited.",
      author: "James L.",
      role: "LYNCH SYNDROME PATIENT",
    },
    {
      id: "EDU-9920",
      quote:
        "As a med student, I use this to quickly translate complex variant descriptions into plain English for my patients. It's incredibly accurate for a first pass.",
      author: "Dr. Elena R.",
      role: "MEDICAL RESIDENT",
    },
    {
      id: "FAM-1102",
      quote:
        "We didn't know how to tell our kids about our hereditary cancer risk. The 'Explain Like I'm 5' tone option was a lifesaver for our family meeting.",
      author: "The Chen Family",
      role: "HEREDITARY SCREENING",
    },
    {
      id: "PRI-3321",
      quote: "I love that it runs locally and doesn't save my data. I'm paranoid about genetic privacy, and this is the only tool I trust.",
      author: "David Park",
      role: "PRIVACY ADVOCATE",
    },
  ]

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between mb-16">
          <div>
            <span className="text-xs font-mono text-muted-foreground tracking-wider">◆ COMMUNITY STORIES</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 max-w-md leading-tight">
              Clarity when it matters most
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs hidden md:block">
            Real stories from people who took control of their genetic health.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div key={testimonial.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground">REF</span>
                <span className="text-xs font-mono text-primary">{testimonial.id}</span>
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-primary/50">
                    {testimonial.author.charAt(0)}
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6 italic">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-xs font-mono text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {testimonials.slice(3, 4).map((testimonial) => (
            <div key={testimonial.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground">REF</span>
                <span className="text-xs font-mono text-primary">{testimonial.id}</span>
                 <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-primary/50">
                    {testimonial.author.charAt(0)}
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6 italic">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-xs font-mono text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Privacy CTA */}
          <div className="bg-secondary/50 border border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center mb-3">
              <span className="text-lg">🔒</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">PRIVACY FIRST</span>
            <p className="text-sm text-muted-foreground mt-1">We never share your story.</p>
          </div>

          {testimonials.slice(4).map((testimonial) => (
            <div key={testimonial.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground">REF</span>
                <span className="text-xs font-mono text-primary">{testimonial.id}</span>
                 <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-primary/50">
                    {testimonial.author.charAt(0)}
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6 italic">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-xs font-mono text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
