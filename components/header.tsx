import Link from "next/link"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">D</span>
          </div>
          <span className="font-serif text-lg tracking-tight">MyDNA Explainer</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/kb/explainers/vus-explained" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Learn
          </Link>
        </nav>

        <Link href="/translate" className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
          Try Free
        </Link>
      </div>
    </header>
  )
}
