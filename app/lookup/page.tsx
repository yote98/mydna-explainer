import { VariantLookup } from "@/components/VariantLookup";
import { SafetyBanner } from "@/components/SafetyBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Database, ShieldAlert, CheckCircle2, HelpCircle, Activity } from "lucide-react";

export default function LookupPage() {
  return (
    <div className="py-8 px-4 bg-secondary/10 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Database className="w-3 h-3" />
            CLINVAR DATABASE
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">Variant Lookup</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Instantly decode RSIDs and HGVS notations using the world&apos;s most trusted genetic variant archive.
          </p>
        </div>

        {/* Safety Banner */}
        <SafetyBanner dismissible variant="compact" />

        {/* Lookup Component */}
        <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
             <div className="p-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent opacity-50" />
            <VariantLookup />
        </div>

        {/* Information Grid */}
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" />
                About ClinVar
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
                <p className="mb-4">
                ClinVar is a freely accessible, public archive of reports on the relationships among 
                human variations and phenotypes, hosted by the National Center for Biotechnology Information (NCBI).
                </p>
                <p>
                It serves as a critical resource for determining whether a specific genetic variant has been 
                linked to disease in clinical studies.
                </p>
            </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Classification Guide
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <span className="text-sm font-semibold block text-foreground">Pathogenic</span>
                        <span className="text-xs text-muted-foreground">Strong evidence causes disease</span>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <HelpCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <span className="text-sm font-semibold block text-foreground">Uncertain Significance (VUS)</span>
                        <span className="text-xs text-muted-foreground">Insufficient evidence to classify</span>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                        <span className="text-sm font-semibold block text-foreground">Benign</span>
                        <span className="text-xs text-muted-foreground">Strong evidence it is harmless</span>
                    </div>
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
