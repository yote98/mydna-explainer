"use client";

import { useState } from "react";
import { ReportInput } from "@/components/ReportInput";
import { ResultTabs } from "@/components/ResultTabs";
import { SafetyBanner } from "@/components/SafetyBanner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { TranslateResponse } from "@/lib/schema";

export default function TranslatePage() {
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to analyze report");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Translate Your Genetic Report</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Paste your genetic test results below to get a plain-language explanation. 
            We&apos;ll help you understand the terminology and prepare questions for your healthcare provider.
          </p>
        </div>

        {/* Safety Banner */}
        <SafetyBanner dismissible />

        {/* Input Section */}
        <ReportInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {result && <ResultTabs result={result} />}
      </div>
    </div>
  );
}
