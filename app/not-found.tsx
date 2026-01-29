import Link from "next/link"
import { Dna, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Dna className="w-12 h-12 text-primary" />
      </div>
      
      <h1 className="font-serif text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        It looks like this genetic sequence is incomplete. The page you are looking for might have been moved or doesn&apos;t exist.
      </p>

      <Button asChild>
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </Button>
    </div>
  )
}
