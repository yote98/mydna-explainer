"use client";

import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

interface SafetyBannerProps {
  variant?: "default" | "compact";
  dismissible?: boolean;
}

export function SafetyBanner({ variant = "default", dismissible = false }: SafetyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === "compact") {
    return (
      <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Educational only.</strong> Not medical advice. Consult a healthcare provider for personalized guidance.
            </span>
          </div>
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertDescription className="ml-2">
        <div className="space-y-2">
          <p className="font-semibold">Important: This tool is for educational purposes only</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>This is <strong>not</strong> medical advice, diagnosis, or treatment</li>
            <li>Genetic information should be interpreted by qualified professionals</li>
            <li>Always consult a genetic counselor or healthcare provider for personalized guidance</li>
            <li>We do not store your genetic data - all processing happens in-session only</li>
          </ul>
        </div>
      </AlertDescription>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}
