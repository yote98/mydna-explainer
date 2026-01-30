import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const runtime = "nodejs";

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/i.test(slug);
}

async function loadTemplateJson(slug: string): Promise<unknown> {
  if (!isSafeSlug(slug)) return null;
  const filePath = path.join(process.cwd(), "kb", "templates", `${slug}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function downloadDataUrl(filename: string, json: unknown): string {
  const text = JSON.stringify(json, null, 2);
  // Encode as data URL so we don't need an additional API route.
  return `data:application/json;charset=utf-8,${encodeURIComponent(text)}`;
}

type NextStepsTemplate = {
  appointment_preparation: {
    title: string;
    items: Array<{ task: string; why: string }>;
  };
  family_history_worksheet: {
    title: string;
    categories: Array<{ category: string; items: string[] }>;
  };
  confirmatory_testing: {
    title: string;
    when_needed: string[];
    what_to_expect: string[];
  };
  finding_genetic_counselor: {
    title: string;
    resources: Array<{ name: string; url: string; note: string }>;
    what_they_do: string[];
  };
};

function isNextStepsTemplate(data: unknown): data is NextStepsTemplate {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const ap = d.appointment_preparation as Record<string, unknown> | undefined;
  const fh = d.family_history_worksheet as Record<string, unknown> | undefined;
  const ct = d.confirmatory_testing as Record<string, unknown> | undefined;
  const fg = d.finding_genetic_counselor as Record<string, unknown> | undefined;
  return Boolean(
    ap?.title &&
      Array.isArray(ap?.items) &&
      fh?.title &&
      Array.isArray(fh?.categories) &&
      ct?.title &&
      Array.isArray(ct?.when_needed) &&
      Array.isArray(ct?.what_to_expect) &&
      fg?.title &&
      Array.isArray(fg?.resources) &&
      Array.isArray(fg?.what_they_do)
  );
}

type QuestionsTemplate = {
  general_questions: string[];
  for_vus_results: string[];
  for_pathogenic_results: string[];
  for_carrier_status: string[];
  about_the_test: string[];
};

function isQuestionsTemplate(data: unknown): data is QuestionsTemplate {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.general_questions) &&
    Array.isArray(d.for_vus_results) &&
    Array.isArray(d.for_pathogenic_results) &&
    Array.isArray(d.for_carrier_status) &&
    Array.isArray(d.about_the_test)
  );
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadTemplateJson(slug);
  if (!data) notFound();

  const title =
    slug === "next-steps-checklist"
      ? "Next Steps Checklist"
      : slug === "questions-for-clinician"
        ? "Questions for a Clinician"
        : slug;

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2">
              Educational template. Use it to prepare questions and organize follow-up. Not medical advice.
            </p>
          </div>
          <Button asChild variant="outline">
            <a href={downloadDataUrl(`${slug}.json`, data)} download={`${slug}.json`}>
              Download JSON
            </a>
          </Button>
        </div>

        {slug === "next-steps-checklist" && isNextStepsTemplate(data) ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{data.appointment_preparation.title}</CardTitle>
                <CardDescription>Bring these notes to your appointment.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.appointment_preparation.items.map((it, i) => (
                    <li key={i} className="border rounded-lg p-3">
                      <p className="font-medium">{it.task}</p>
                      <p className="text-sm text-muted-foreground mt-1">{it.why}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{data.family_history_worksheet.title}</CardTitle>
                <CardDescription>Gather details before you meet a clinician/genetic counselor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.family_history_worksheet.categories.map((cat, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <p className="font-medium">{cat.category}</p>
                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {cat.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{data.confirmatory_testing.title}</CardTitle>
                <CardDescription>When it may be appropriate and what it usually involves.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <p className="font-medium">When it may be needed</p>
                  <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {data.confirmatory_testing.when_needed.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-medium">What to expect</p>
                  <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {data.confirmatory_testing.what_to_expect.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{data.finding_genetic_counselor.title}</CardTitle>
                <CardDescription>Who they are and how to find one.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-3">
                  <p className="font-medium">Directories & resources</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {data.finding_genetic_counselor.resources.map((r, i) => (
                      <li key={i}>
                        <a className="text-primary hover:underline" href={r.url} target="_blank" rel="noopener noreferrer">
                          {r.name}
                        </a>
                        <p className="text-muted-foreground">{r.note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-medium">What they can help with</p>
                  <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {data.finding_genetic_counselor.what_they_do.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : slug === "questions-for-clinician" && isQuestionsTemplate(data) ? (
          <div className="space-y-4">
            {[
              { title: "General questions", items: data.general_questions },
              { title: "If you have a VUS result", items: data.for_vus_results },
              { title: "If you have a pathogenic/likely pathogenic result", items: data.for_pathogenic_results },
              { title: "If this is carrier screening", items: data.for_carrier_status },
              { title: "About the test itself", items: data.about_the_test },
            ].map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                    {section.items.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Template</CardTitle>
              <CardDescription>This template is shown as raw JSON.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/40 rounded-lg p-4 overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="raw-json">
            <AccordionTrigger>View raw JSON</AccordionTrigger>
            <AccordionContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/40 rounded-lg p-4 overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <p className="text-sm text-muted-foreground">
          <Link className="text-primary hover:underline" href="/translate">
            Back to Translator
          </Link>
        </p>
      </div>
    </div>
  );
}

