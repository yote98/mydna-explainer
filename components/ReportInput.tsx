"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, FileText, Loader2, Type, Upload, Shield, Eye } from "lucide-react";
import { FileUpload } from "./FileUpload";

// ============================================================================
// PII Detection & Redaction Patterns
// ============================================================================

interface RedactionResult {
  text: string;
  redactedCount: number;
  redactedTypes: string[];
}

// Patterns for common PII in genetic reports
const PII_PATTERNS: { name: string; pattern: RegExp; replacement: string }[] = [
  // Names (after common labels)
  { 
    name: 'Name',
    pattern: /\b(Patient|Customer|Name|Client|Participant)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/gi,
    replacement: '$1: [REDACTED NAME]'
  },
  // Date of Birth
  {
    name: 'Date of Birth',
    pattern: /\b(DOB|Date of Birth|Birth Date|Birthdate|D\.O\.B\.?)[\s:]*(\d{1,2}[\s\/\-\.]\w{3,9}[\s\/\-\.]\d{2,4}|\d{1,2}[\s\/\-\.]\d{1,2}[\s\/\-\.]\d{2,4})\b/gi,
    replacement: '$1: [REDACTED DOB]'
  },
  // Sample ID / Specimen ID
  {
    name: 'Sample ID',
    pattern: /\b(Sample|Specimen|Barcode|Accession)[\s]*(ID|Number|No\.?|#)?[\s:]*([A-Z0-9\-]{6,20})\b/gi,
    replacement: '$1 ID: [REDACTED ID]'
  },
  // Customer/Patient ID
  {
    name: 'Customer ID',
    pattern: /\b(Customer|Patient|Client|Member|Account)[\s]*(ID|Number|No\.?|#)[\s:]*([A-Z0-9\-]{4,20})\b/gi,
    replacement: '$1 ID: [REDACTED ID]'
  },
  // Order/Report ID
  {
    name: 'Order ID',
    pattern: /\b(Order|Report|Case|Reference)[\s]*(ID|Number|No\.?|#)[\s:]*([A-Z0-9\-]{4,20})\b/gi,
    replacement: '$1 ID: [REDACTED ID]'
  },
  // Email addresses
  {
    name: 'Email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[REDACTED EMAIL]'
  },
  // Phone numbers (various formats)
  {
    name: 'Phone',
    pattern: /\b(\+?\d{1,3}[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}\b/g,
    replacement: '[REDACTED PHONE]'
  },
  // Addresses (simplified - looks for common patterns)
  {
    name: 'Address',
    pattern: /\b\d{1,5}\s+[A-Za-z0-9\s,\.]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir)[\s,\.]*(?:[A-Za-z\s]+)?(?:\d{5}(?:-\d{4})?)?\b/gi,
    replacement: '[REDACTED ADDRESS]'
  },
  // SSN (US)
  {
    name: 'SSN',
    pattern: /\b\d{3}[\s\-]?\d{2}[\s\-]?\d{4}\b/g,
    replacement: '[REDACTED SSN]'
  },
  // Medical Record Number
  {
    name: 'MRN',
    pattern: /\b(MRN|Medical Record|Med Rec)[\s]*(Number|No\.?|#)?[\s:]*([A-Z0-9\-]{4,15})\b/gi,
    replacement: '$1: [REDACTED MRN]'
  },
  // Physician/Doctor names
  {
    name: 'Physician',
    pattern: /\b(Dr\.?|Doctor|Physician|Provider|Ordered by|Requesting)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/gi,
    replacement: '$1 [REDACTED PHYSICIAN]'
  },
];

function redactPII(inputText: string): RedactionResult {
  let text = inputText;
  const redactedTypes: Set<string> = new Set();
  let totalRedacted = 0;

  for (const { name, pattern, replacement } of PII_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      text = text.replace(pattern, replacement);
      redactedTypes.add(name);
      totalRedacted += matches.length;
    }
  }

  return {
    text,
    redactedCount: totalRedacted,
    redactedTypes: Array.from(redactedTypes),
  };
}

// ============================================================================
// Component
// ============================================================================

interface ReportInputProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReportInput({ onSubmit, isLoading = false }: ReportInputProps) {
  const [text, setText] = useState("");
  const [showWarning, setShowWarning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<"paste" | "upload">("paste");
  const [redactionInfo, setRedactionInfo] = useState<{ count: number; types: string[] } | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please paste your genetic report text");
      return;
    }

    if (text.trim().length < 10) {
      setError("Report text seems too short. Please paste more content.");
      return;
    }

    setError(null);
    await onSubmit(text);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (error) setError(null);
  };

  const handleFileTextExtracted = (extractedText: string) => {
    setText(extractedText);
    setInputMethod("paste"); // Switch to paste view to show extracted text
    setError(null);
    setRedactionInfo(null);
  };

  const handleAutoRedact = () => {
    if (!text.trim()) return;
    
    const result = redactPII(text);
    setText(result.text);
    
    if (result.redactedCount > 0) {
      setRedactionInfo({
        count: result.redactedCount,
        types: result.redactedTypes,
      });
    } else {
      setRedactionInfo({ count: 0, types: [] });
    }
  };

  const handlePreviewPII = (): string[] => {
    if (!text.trim()) return [];
    
    const found: string[] = [];
    for (const { name, pattern } of PII_PATTERNS) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        found.push(`${name} (${matches.length})`);
      }
    }
    return found;
  };

  const detectedPII = text.trim() ? handlePreviewPII() : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Analyze Your Genetic Report
        </CardTitle>
        <CardDescription>
          Paste your genetic test report text or upload a file. We&apos;ll help you understand it in plain language.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showWarning && (
          <Alert variant="warning" className="relative">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="pr-8">
              <strong>Privacy notice:</strong> Genetic data can be identifying. Only share information you&apos;re comfortable with. Consider redacting your name and other personal identifiers. We do not store your data.
            </AlertDescription>
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 text-sm"
            >
              Got it
            </button>
          </Alert>
        )}

        <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as "paste" | "upload")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Paste your genetic report text here...

Example content that can be analyzed:
- Variant classifications (Pathogenic, VUS, Benign)
- Gene names (BRCA1, BRCA2, APOE, etc.)
- rsIDs (rs12345678)
- HGVS notation (NM_000123.4:c.123A>G)
- Zygosity (heterozygous, homozygous)"
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                disabled={isLoading}
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{text.length.toLocaleString()} characters</span>
                <span>Maximum: 100,000 characters</span>
              </div>
            </div>

            {/* Auto-Redaction Section */}
            {text.trim() && (
              <div className="space-y-2">
                {detectedPII.length > 0 && (
                  <Alert variant="warning" className="py-2">
                    <Eye className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Potential PII detected:</strong> {detectedPII.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoRedact}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Auto-Redact PII
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Removes names, DOB, IDs, emails, phone numbers
                  </span>
                </div>

                {redactionInfo && (
                  <Alert variant={redactionInfo.count > 0 ? "default" : "warning"} className="py-2">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {redactionInfo.count > 0 ? (
                        <>
                          <strong>Redacted {redactionInfo.count} item(s):</strong> {redactionInfo.types.join(', ')}. 
                          <span className="text-muted-foreground"> Please review the text to ensure all personal info is removed.</span>
                        </>
                      ) : (
                        <>No common PII patterns detected. Please manually review for any personal information.</>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <FileUpload
              onTextExtracted={handleFileTextExtracted}
              disabled={isLoading}
            />
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !text.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Translate Report"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setText("")}
            disabled={isLoading || !text}
          >
            Clear
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Your data is processed securely and not stored. Results are for educational purposes only.
        </p>
      </CardContent>
    </Card>
  );
}
