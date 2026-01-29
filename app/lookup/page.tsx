import { VariantLookup } from "@/components/VariantLookup";
import { SafetyBanner } from "@/components/SafetyBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function LookupPage() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">ClinVar Variant Lookup</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Look up a specific genetic variant to see its clinical classification and what it means.
            Enter an rsID, HGVS notation, or ClinVar Variation ID.
          </p>
        </div>

        {/* Safety Banner */}
        <SafetyBanner dismissible />

        {/* Lookup Component */}
        <VariantLookup />

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              About ClinVar
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              ClinVar is a freely accessible, public database of reports on the relationships among 
              human genetic variations and diseases. It is maintained by the National Center for 
              Biotechnology Information (NCBI).
            </p>
            <h4>Understanding ClinVar Classifications</h4>
            <ul>
              <li>
                <strong>Pathogenic</strong>: Strong evidence that this variant causes disease
              </li>
              <li>
                <strong>Likely Pathogenic</strong>: Probable disease association (&gt;90% certainty)
              </li>
              <li>
                <strong>Uncertain Significance (VUS)</strong>: Not enough evidence to classify
              </li>
              <li>
                <strong>Likely Benign</strong>: Probably harmless (&gt;90% certainty)
              </li>
              <li>
                <strong>Benign</strong>: Strong evidence this variant is not disease-causing
              </li>
            </ul>
            <h4>Important Notes</h4>
            <ul>
              <li>Classifications can change as new evidence emerges</li>
              <li>The same variant may have different significance in different contexts</li>
              <li>ClinVar is NOT intended for direct diagnostic use</li>
              <li>Always discuss findings with a qualified healthcare professional</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Data source: <a href="https://www.ncbi.nlm.nih.gov/clinvar/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NCBI ClinVar</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
