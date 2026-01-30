import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const runtime = "nodejs";

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/i.test(slug);
}

async function loadExplainerMarkdown(slug: string): Promise<string | null> {
  if (!isSafeSlug(slug)) return null;
  const filePath = path.join(process.cwd(), "kb", "explainers", `${slug}.md`);
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ExplainerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const md = await loadExplainerMarkdown(slug);
  if (!md) notFound();

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{titleFromSlug(slug)}</h1>
          <p className="text-muted-foreground mt-2">
            Educational explainer. Not medical advice.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Explainer</CardTitle>
            <CardDescription>Rendered as plain text (Markdown source).</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {md}
            </pre>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          <Link className="text-primary hover:underline" href="/translate">
            Back to Translator
          </Link>
        </p>
      </div>
    </div>
  );
}

