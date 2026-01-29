import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">MyDNA Explainer</h3>
            <p className="text-sm text-muted-foreground">
              Helping you understand genetic test reports in plain language. 
              Educational purposes only.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.ncbi.nlm.nih.gov/clinvar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  ClinVar Database
                </a>
              </li>
              <li>
                <a 
                  href="https://www.nsgc.org/findageneticcounselor" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Find a Genetic Counselor
                </a>
              </li>
              <li>
                <a 
                  href="https://medlineplus.gov/genetics/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  MedlinePlus Genetics
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/disclaimer" className="text-muted-foreground hover:text-foreground">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} MyDNA Explainer. For educational purposes only. Not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
