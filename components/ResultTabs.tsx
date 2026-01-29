"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  AlertTriangle, 
  HelpCircle, 
  Link as LinkIcon, 
  Download,
  XCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import type { TranslateResponse, ExtractedEntity, NextStep } from "@/lib/schema";

interface ResultTabsProps {
  result: TranslateResponse;
}

function EntityBadge({ entity }: { entity: ExtractedEntity }) {
  const variantColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    gene: "default",
    rsid: "secondary",
    hgvs: "secondary",
    variant_classification: "warning",
    zygosity: "outline",
    condition: "destructive",
    unknown: "outline",
  };

  return (
    <Badge variant={variantColors[entity.type] || "outline"} className="mr-2 mb-2">
      <span className="font-mono">{entity.value}</span>
      <span className="ml-1 text-xs opacity-70">({entity.type})</span>
    </Badge>
  );
}

function UrgencyBadge({ urgency }: { urgency: NextStep["urgency"] }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string }> = {
    routine: { variant: "secondary", label: "Routine" },
    soon: { variant: "warning", label: "Soon" },
    important: { variant: "destructive", label: "Important" },
    informational: { variant: "outline", label: "FYI" },
  };

  const { variant, label } = config[urgency] || config.informational;

  return <Badge variant={variant}>{label}</Badge>;
}

export function ResultTabs({ result }: ResultTabsProps) {
  const handleDownload = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genetic-report-analysis-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Disclaimer Banner */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertDescription>{result.disclaimer}</AlertDescription>
      </Alert>

      {/* Refusals (if any) */}
      {result.refusals.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Some requests could not be fulfilled:</p>
              {result.refusals.map((refusal, i) => (
                <div key={i} className="pl-4 border-l-2 border-amber-400">
                  <p><strong>Request:</strong> {refusal.user_intent}</p>
                  <p><strong>Why:</strong> {refusal.refusal_text}</p>
                  <p><strong>Alternative:</strong> {refusal.safe_alternative}</p>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="glossary">Glossary</TabsTrigger>
          <TabsTrigger value="cautions">Cautions</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        {/* Plain English Summary */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Plain English Summary
              </CardTitle>
              <CardDescription>
                What your genetic report shows, explained simply
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Extracted Entities */}
              {result.extracted_entities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                    Identified Items:
                  </h4>
                  <div className="flex flex-wrap">
                    {result.extracted_entities.map((entity, i) => (
                      <EntityBadge key={i} entity={entity} />
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Text */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{result.summary_plain_english}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glossary */}
        <TabsContent value="glossary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Key Terms Explained
              </CardTitle>
              <CardDescription>
                Definitions of technical terms found in your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.glossary.map((entry, i) => (
                  <div key={i} className="border-b pb-4 last:border-0">
                    <h4 className="font-semibold text-lg">{entry.term}</h4>
                    <p className="mt-1">{entry.meaning}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <strong>Why it matters:</strong> {entry.why_it_matters}
                    </p>
                    {entry.common_misreadings && entry.common_misreadings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Common misunderstandings:
                        </p>
                        <ul className="text-sm list-disc list-inside text-muted-foreground">
                          {entry.common_misreadings.map((misreading, j) => (
                            <li key={j}>{misreading}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                {result.glossary.length === 0 && (
                  <p className="text-muted-foreground">No specific terms to define.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* What This Does NOT Mean */}
        <TabsContent value="cautions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-amber-500" />
                What This Does NOT Mean
              </CardTitle>
              <CardDescription>
                Common misinterpretations to avoid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.what_this_does_not_mean.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <XCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p>{item}</p>
                  </div>
                ))}
                {result.what_this_does_not_mean.length === 0 && (
                  <p className="text-muted-foreground">No specific cautions to note.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions to Ask */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Questions for Your Healthcare Provider
              </CardTitle>
              <CardDescription>
                Suggested questions to discuss with a genetic counselor or doctor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.questions_to_ask.map((question, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Next Steps */}
        <TabsContent value="next-steps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Recommended Next Steps
              </CardTitle>
              <CardDescription>
                What to consider doing next (not medical advice)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.next_steps.map((step, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold">{step.title}</h4>
                      <UrgencyBadge urgency={step.urgency} />
                    </div>
                    <p className="mt-2 text-sm">{step.rationale}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <strong>Who to talk to:</strong> {step.who_to_talk_to}
                    </p>
                  </div>
                ))}
                {result.next_steps.length === 0 && (
                  <p className="text-muted-foreground">No specific next steps identified.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Sources & Resources
              </CardTitle>
              <CardDescription>
                References and helpful links for further reading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.sources.map((source, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <LinkIcon className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div>
                        {source.url ? (
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            {source.label}
                          </a>
                        ) : (
                          <span className="font-medium">{source.label}</span>
                        )}
                        <p className="text-sm text-muted-foreground">{source.why_relevant}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {result.sources.length === 0 && (
                  <p className="text-muted-foreground">No specific sources cited.</p>
                )}
              </div>

              {/* Download Button */}
              <div className="mt-6 pt-4 border-t">
                <Button variant="outline" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Analysis (JSON)
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Download your results to share with a healthcare provider
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
