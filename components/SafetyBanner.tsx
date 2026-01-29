"use client";

import { X, Shield } from "lucide-react";
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
      <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 text-primary dark:text-blue-300">
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Educational only.</strong> Not medical advice. Consult a healthcare provider for personalized guidance.
            </span>
          </div>
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="text-primary/60 hover:text-primary dark:text-blue-400 dark:hover:text-blue-200 p-1 hover:bg-primary/10 dark:hover:bg-blue-900/50 rounded-full transition-colors"
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
    <Alert variant="info" className="mb-6 bg-primary/5 border-primary/10 text-primary">
      <Shield className="h-5 w-5 text-primary" />
      <AlertDescription className="ml-2 text-foreground/80">
        <div className="space-y-2">
          <p className="font-semibold text-primary">Important: This tool is for educational purposes only</p>
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
          className="absolute top-4 right-4 text-primary/60 hover:text-primary p-1 hover:bg-primary/10 rounded-full transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}
