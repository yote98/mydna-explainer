"use client";

import { useMemo, useState } from "react";
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
  Info,
  Loader2
} from "lucide-react";
import type { TranslateResponse, ExtractedEntity, NextStep, LiteratureResponse } from "@/lib/schema";

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

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(clamp01(value) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
          aria-label={label}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  );
}

export function ResultTabs({ result }: ResultTabsProps) {
  const detectedGenes = useMemo(() => {
    const genes = result.extracted_entities
      .filter((e) => e.type === "gene")
      .map((e) => e.value.trim())
      .filter(Boolean);
    return Array.from(new Set(genes)).slice(0, 3);
  }, [result.extracted_entities]);

  const detectedTopics = useMemo(() => {
    const topics = result.extracted_entities
      .filter((e) => e.type === "condition")
      .map((e) => e.value.trim())
      .filter(Boolean);
    return Array.from(new Set(topics)).slice(0, 2);
  }, [result.extracted_entities]);

  const evidence = useMemo(() => {
    const entities = result.extracted_entities || [];
    const getEntity = (type: ExtractedEntity["type"]) => entities.find((e) => e.type === type);
    const classification = getEntity("variant_classification")?.value;
    const classificationConfidence = getEntity("variant_classification")?.confidence;

    const confidenceScore =
      classificationConfidence === "high" ? 1 :
        classificationConfidence === "medium" ? 0.7 :
          classificationConfidence === "low" ? 0.4 : 0.3;

    const hasGene = entities.some((e) => e.type === "gene");
    const hasVariantId = entities.some((e) => e.type === "rsid" || e.type === "hgvs");
    const hasZygosity = entities.some((e) => e.type === "zygosity");
    const hasCondition = entities.some((e) => e.type === "condition");

    // This is NOT medical risk. It's “how complete/grounded the *inputs* look”.
    const completenessScore = clamp01(
      (hasGene ? 0.35 : 0) +
      (hasVariantId ? 0.35 : 0) +
      (hasZygosity ? 0.15 : 0) +
      (hasCondition ? 0.15 : 0)
    );

    const cls = (classification || "").toLowerCase();
    const isVus = /\bvus\b|uncertain/.test(cls);
    const isPathogenic = /\bpathogenic\b/.test(cls);
    const isBenign = /\bbenign\b/.test(cls);

    const actionClarityScore = clamp01(
      isVus ? 0.5 :
        (isPathogenic || isBenign) ? 0.8 :
          0.4
    );

    const likelyNeedsConfirmation =
      isPathogenic || /likely\s*pathogenic/.test(cls);

    const cautionNotes: string[] = [];
    if (!hasVariantId) cautionNotes.push("No rsID/HGVS detected (harder to confirm the exact variant).");
    if (!hasZygosity) cautionNotes.push("No zygosity detected (one vs two copies can matter).");
    if (isVus) cautionNotes.push("VUS is not a positive result; avoid decisions based on it alone.");

    return {
      classification: classification || "Not detected",
      confidenceScore,
      completenessScore,
      actionClarityScore,
      likelyNeedsConfirmation,
      cautionNotes,
    };
  }, [result.extracted_entities]);

  const [literature, setLiterature] = useState<LiteratureResponse | null>(null);
  const [literatureLoading, setLiteratureLoading] = useState(false);
  const [literatureError, setLiteratureError] = useState<string | null>(null);

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

  const handleFetchLiterature = async () => {
    if (detectedGenes.length === 0) return;
    setLiteratureLoading(true);
    setLiteratureError(null);

    try {
      const resp = await fetch("/api/literature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genes: detectedGenes,
          topics: detectedTopics.length > 0 ? detectedTopics : undefined,
          max_results: 5,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || data?.details || "Failed to fetch literature");
      setLiterature(data);
    } catch (err) {
      setLiteratureError(err instanceof Error ? err.message : "Failed to fetch literature");
    } finally {
      setLiteratureLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Disclaimer Banner */}
      <Alert variant="scientific" className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-primary/80">{result.disclaimer}</AlertDescription>
      </Alert>

      {/* Refusals (if any) */}
      {result.refusals.length > 0 && (
        <Alert variant="warning" className="border-amber-200 bg-amber-50/50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-bold text-amber-900 uppercase text-[10px] tracking-widest font-mono">SAFETY_OVERRIDE_REFUSALS:</p>
              {result.refusals.map((refusal, i) => (
                <div key={i} className="pl-4 border-l-2 border-amber-300">
                  <p className="text-sm font-medium text-amber-900"><strong>Intent:</strong> {refusal.user_intent}</p>
                  <p className="text-xs text-amber-800 opacity-80 mt-1">{refusal.refusal_text}</p>
                  <div className="mt-2 bg-white/50 p-2 rounded-[4px] border border-amber-200">
                    <p className="text-xs text-amber-900"><strong>Actionable Alternative:</strong> {refusal.safe_alternative}</p>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto bg-primary/5 p-1 rounded-lg border border-primary/10">
          <TabsTrigger value="summary" className="py-2.5 text-xs font-bold uppercase tracking-tighter">Summary</TabsTrigger>
          <TabsTrigger value="glossary" className="py-2.5 text-xs font-bold uppercase tracking-tighter">Glossary</TabsTrigger>
          <TabsTrigger value="cautions" className="py-2.5 text-xs font-bold uppercase tracking-tighter">Cautions</TabsTrigger>
          <TabsTrigger value="next-steps" className="py-2.5 text-xs font-bold uppercase tracking-tighter">Next_Steps</TabsTrigger>
          <TabsTrigger value="evidence" className="py-2.5 text-xs font-bold uppercase tracking-tighter">Evidence</TabsTrigger>
          <TabsTrigger value="sources" className="py-2.5 text-xs font-bold uppercase tracking-tighter">Sources</TabsTrigger>
        </TabsList>

        {/* Plain English Summary */}
        <TabsContent value="summary" className="mt-6">
          <Card className="lab-glass border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 tech-grid opacity-[0.03] pointer-events-none" />
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Translation Summary
                  </CardTitle>
                  <CardDescription className="font-mono text-[10px] uppercase tracking-widest mt-1 text-primary/60">
                    Plain_English_Interpretation_Engine
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold font-mono text-primary uppercase">v.Analytic_FINAL</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              {/* Extracted Entities */}
              {result.extracted_entities.length > 0 && (
                <div className="bg-primary/5 rounded-[4px] border border-primary/10 p-4">
                  <h4 className="font-mono font-bold text-[10px] uppercase tracking-widest text-primary/60 mb-3 flex items-center gap-2">
                    <div className="w-1 h-3 bg-primary" />
                    Identified_Genomic_Tokens
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {result.extracted_entities.map((entity, i) => (
                      <EntityBadge key={i} entity={entity} />
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Text */}
              <div className="prose prose-sm dark:prose-invert max-w-none group">
                <div className="relative p-6 bg-white border border-indigo-50 shadow-sm rounded-[4px] transition-all hover:shadow-md">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base font-medium leading-relaxed">
                    {result.summary_plain_english}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glossary */}
        <TabsContent value="glossary" className="mt-6">
          <Card className="lab-glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <BookOpen className="h-5 w-5 text-primary" />
                Genomic Glossary
              </CardTitle>
              <CardDescription className="font-mono text-[10px] uppercase tracking-widest text-primary/60">
                Technical_Terminology_Reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.glossary.map((entry, i) => (
                  <div key={i} className="group relative p-4 bg-white border border-indigo-50 rounded-[4px] shadow-sm transition-all hover:shadow-md">
                    <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-primary transition-all duration-300" />
                    <h4 className="font-bold text-lg text-slate-800">{entry.term}</h4>
                    <p className="mt-2 text-slate-600 border-l-2 border-primary/10 pl-4">{entry.meaning}</p>
                    <div className="mt-4 flex items-start gap-2 p-2 bg-primary/5 rounded-[4px] border border-primary/10">
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-primary/80">
                        <strong className="font-mono uppercase tracking-tighter">Significance:</strong> {entry.why_it_matters}
                      </p>
                    </div>
                    {entry.common_misreadings && entry.common_misreadings.length > 0 && (
                      <div className="mt-3 pl-6 pr-4 py-2 border-l-2 border-amber-200 bg-amber-50/30 rounded-r-[4px]">
                        <p className="text-[10px] font-bold font-mono text-amber-600 uppercase tracking-widest mb-1">
                          Potential_Misinterpretation_Risks:
                        </p>
                        <ul className="text-xs space-y-1 text-amber-800/80 italic">
                          {entry.common_misreadings.map((misreading, j) => (
                            <li key={j} className="flex gap-2">
                              <span className="text-amber-400">•</span>
                              {misreading}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                {result.glossary.length === 0 && (
                  <div className="text-center py-12 bg-primary/5 rounded-lg border border-dashed border-primary/20 text-muted-foreground font-mono text-sm">
                    NO_GLOSSARY_ITEMS_IDENTIFIED
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* What This Does NOT Mean */}
        <TabsContent value="cautions" className="mt-6">
          <Card className="lab-glass border-amber-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Risk Literacy & Cautions
              </CardTitle>
              <CardDescription className="font-mono text-[10px] uppercase tracking-widest text-amber-600/60">
                Interpretive_Boundary_Awareness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.what_this_does_not_mean.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-[4px] group transition-all hover:bg-white hover:shadow-sm">
                    <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <XCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-amber-900 font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
                {result.what_this_does_not_mean.length === 0 && (
                  <div className="text-center py-12 bg-amber-50/30 rounded-lg border border-dashed border-amber-200 text-amber-800/60 font-mono text-sm">
                    NO_SPECIFIC_CAUTIONS_GENERATED
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions to Ask */}
          <Card className="mt-6 lab-glass border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <HelpCircle className="h-5 w-5 text-primary" />
                Clinician Question Builder
              </CardTitle>
              <CardDescription className="font-mono text-[10px] uppercase tracking-widest text-primary/60">
                Actionable_Health_Dialog_Support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-1 gap-3">
                {result.questions_to_ask.map((question, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white border border-indigo-50 rounded-[4px] shadow-sm hover:border-primary/20 transition-all">
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <span className="text-slate-700 font-medium leading-relaxed">{question}</span>
                  </div>
                ))}
              </div>
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

        {/* Evidence (safe: no “risk levels”) */}
        <TabsContent value="evidence">
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This section visualizes <strong>evidence signals</strong> and <strong>input completeness</strong> (not medical risk).
              It helps you understand what the report includes and what’s missing.
            </AlertDescription>
          </Alert>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Evidence & Next-Step Clarity
              </CardTitle>
              <CardDescription>
                Educational indicators based on extracted items (genes, variant IDs, zygosity, classification).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  <span className="text-muted-foreground mr-1">Classification:</span>
                  <span className="font-mono">{evidence.classification}</span>
                </Badge>
                {evidence.likelyNeedsConfirmation && (
                  <Badge variant="warning">Often confirm clinically (ask a professional)</Badge>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <ProgressBar value={evidence.confidenceScore} label="Extraction confidence" />
                  <p className="text-xs text-muted-foreground mt-2">
                    How confident the app is about the extracted classification text.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <ProgressBar value={evidence.completenessScore} label="Input completeness" />
                  <p className="text-xs text-muted-foreground mt-2">
                    More complete inputs (gene + variant ID + zygosity) are easier to verify with a clinician.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <ProgressBar value={evidence.actionClarityScore} label="Next-step clarity" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Some classifications (like VUS) are inherently less actionable without more evidence.
                  </p>
                </div>
              </div>

              {evidence.cautionNotes.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="font-medium mb-2">Potential gaps to review</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {evidence.cautionNotes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border rounded-lg p-4">
                <p className="font-medium">Suggested “action map” (educational)</p>
                <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="font-medium">Do now</p>
                    <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
                      <li>Save your report + this summary for reference.</li>
                      <li>Note the exact gene and any variant IDs (rsID/HGVS) if present.</li>
                      <li>Use the “Questions for a clinician” template if you plan follow-up.</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="font-medium">Do soon / if relevant</p>
                    <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
                      <li>If the report suggests a pathogenic/likely pathogenic finding, ask about confirmatory clinical testing.</li>
                      <li>If it’s a VUS, ask how reclassification updates are handled.</li>
                      <li>Discuss family history context with a professional if you’re concerned.</li>
                    </ul>
                  </div>
                </div>
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

              {/* Suggested Reading (PubMed) */}
              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">Suggested Reading (PubMed)</h4>
                    <p className="text-sm text-muted-foreground">
                      Optional: fetch a few review/guideline articles for detected genes/topics. Your full report text is not sent—only gene/topic keywords.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleFetchLiterature}
                    disabled={literatureLoading || detectedGenes.length === 0}
                  >
                    {literatureLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching…
                      </>
                    ) : (
                      "Find papers"
                    )}
                  </Button>
                </div>

                {detectedGenes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No genes were detected in the extracted entities, so we can’t run a targeted literature search yet.
                  </p>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Genes:</span> {detectedGenes.join(", ")}
                    {detectedTopics.length > 0 && (
                      <>
                        {" "}
                        <span className="font-medium">Topics:</span> {detectedTopics.join(", ")}
                      </>
                    )}
                  </div>
                )}

                {literatureError && (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{literatureError}</AlertDescription>
                  </Alert>
                )}

                {literature && (
                  <div className="space-y-3">
                    <Alert variant="info">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">{literature.disclaimer}</AlertDescription>
                    </Alert>

                    {literature.articles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No recent review/guideline results found for this query.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {literature.articles.map((a, i) => (
                          <div key={i} className="border rounded-lg p-3">
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline"
                            >
                              {a.title}
                            </a>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {a.journal && <span>{a.journal}</span>}
                              {a.year && <span>{a.journal ? " · " : ""}{a.year}</span>}
                              {a.pmid && <span>{(a.journal || a.year) ? " · " : ""}PMID: {a.pmid}</span>}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{a.why_relevant}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
