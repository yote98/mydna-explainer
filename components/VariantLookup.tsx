"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Search, 
  Loader2, 
  ExternalLink, 
  AlertTriangle,
  Info,
  HelpCircle
} from "lucide-react";
import type { ClinvarResponse } from "@/lib/schema";

interface VariantLookupProps {
  onLookup?: (query: string) => Promise<ClinvarResponse>;
}

function SignificanceBadge({ significance }: { significance: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; }> = {
    "Pathogenic": { variant: "destructive" },
    "Likely pathogenic": { variant: "destructive" },
    "Uncertain significance": { variant: "warning" },
    "Likely benign": { variant: "success" },
    "Benign": { variant: "success" },
    "Conflicting interpretations": { variant: "warning" },
    "Not provided": { variant: "outline" },
    "Other": { variant: "outline" },
  };

  const { variant } = config[significance] || config["Other"];

  return <Badge variant={variant} className="text-sm">{significance}</Badge>;
}

function ReviewStatusInfo({ status }: { status: string }) {
  const descriptions: Record<string, string> = {
    "practice guideline": "Highest confidence - reviewed by expert guidelines",
    "reviewed by expert panel": "High confidence - multiple experts reviewed",
    "criteria provided, multiple submitters, no conflicts": "Good confidence - multiple labs agree",
    "criteria provided, conflicting interpretations": "Labs disagree on classification",
    "criteria provided, single submitter": "Only one lab has submitted",
    "no assertion criteria provided": "Limited evidence available",
    "no assertion provided": "No classification provided",
  };

  return (
    <div className="text-sm">
      <span className="font-medium">Review Status: </span>
      <span className="text-muted-foreground">{status}</span>
      {descriptions[status] && (
        <p className="text-xs text-muted-foreground mt-1">{descriptions[status]}</p>
      )}
    </div>
  );
}

export function VariantLookup({ onLookup }: VariantLookupProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClinvarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!query.trim()) {
      setError("Please enter a variant identifier");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (onLookup) {
        const data = await onLookup(query);
        setResult(data);
      } else {
        // Default API call
        const response = await fetch(`/api/clinvar?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to lookup variant");
        }
        
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lookup variant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleLookup();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            ClinVar Variant Lookup
          </CardTitle>
          <CardDescription>
            Look up a specific genetic variant by rsID, HGVS notation, or ClinVar Variation ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., rs1234567, NM_000123.4:c.123A>G, or VCV000012345"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="font-mono"
            />
            <Button onClick={handleLookup} disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Accepted formats:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><span className="font-mono">rs1234567</span> - dbSNP Reference ID</li>
              <li><span className="font-mono">NM_000123.4:c.123A&gt;G</span> - HGVS notation</li>
              <li><span className="font-mono">VCV000012345</span> or <span className="font-mono">12345</span> - ClinVar Variation ID</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {result.found && result.variant ? (
            <>
              {/* Variant Details Card */}
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{result.variant.name}</CardTitle>
                      {result.variant.gene_symbol && (
                        <CardDescription className="mt-1">
                          Gene: <span className="font-mono font-semibold">{result.variant.gene_symbol}</span>
                        </CardDescription>
                      )}
                    </div>
                    <SignificanceBadge significance={result.variant.clinical_significance} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ReviewStatusInfo status={result.variant.review_status} />

                  {result.variant.conditions.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-1">Associated Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.variant.conditions.map((condition, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {result.variant.last_evaluated && (
                      <span>Last evaluated: {result.variant.last_evaluated}</span>
                    )}
                    {result.variant.submissions_count !== undefined && (
                      <span>Submissions: {result.variant.submissions_count}</span>
                    )}
                  </div>

                  <a
                    href={result.variant.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    View on ClinVar <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>

              {/* Interpretation Guide */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5" />
                    How to Interpret This Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{result.interpretation_guide}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Not Found */
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="font-semibold">No Results Found</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {result.interpretation_guide}
                  </p>
                  {result.error && (
                    <p className="text-sm text-destructive">{result.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {result.disclaimer}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
