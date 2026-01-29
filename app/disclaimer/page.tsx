import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
          <p className="text-muted-foreground">
            Important information about the scope and limitations of this service
          </p>
        </div>

        {/* Critical Warning */}
        <Alert variant="warning" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg">Critical Notice</AlertTitle>
          <AlertDescription className="text-base">
            MyDNA Explainer is an educational tool. It does NOT provide medical advice, diagnosis, 
            or treatment recommendations. The information provided should NOT be used as a substitute 
            for professional medical advice, diagnosis, or treatment.
          </AlertDescription>
        </Alert>

        {/* What This Is NOT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              What MyDNA Explainer is NOT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "A medical device or diagnostic tool",
                "A substitute for genetic counseling",
                "A replacement for healthcare provider advice",
                "A source of treatment or medication recommendations",
                "A tool for making medical decisions",
                "A way to diagnose diseases or conditions",
                "A predictor of your health outcomes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* What This IS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              What MyDNA Explainer IS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "An educational resource for understanding genetic terminology",
                "A tool to help prepare questions for your healthcare provider",
                "A plain-language translator for technical genetic terms",
                "A starting point for learning about genetics",
                "A way to look up publicly available variant information",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Full Disclaimer */}
        <Card>
          <CardHeader>
            <CardTitle>Full Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>1. Educational Purpose Only</h3>
            <p>
              The information provided by MyDNA Explainer is for educational and informational 
              purposes only. It is not intended to be a substitute for professional medical advice, 
              diagnosis, or treatment. Always seek the advice of your physician, genetic counselor, 
              or other qualified health provider with any questions you may have regarding a medical 
              condition or genetic test results.
            </p>

            <h3>2. No Doctor-Patient Relationship</h3>
            <p>
              Use of MyDNA Explainer does not create a doctor-patient, genetic counselor-client, 
              or any other healthcare provider relationship. The information provided is general 
              in nature and may not apply to your specific situation.
            </p>

            <h3>3. Limitations of Automated Analysis</h3>
            <p>
              This tool uses artificial intelligence to analyze genetic report text. While we 
              strive for accuracy, automated analysis has limitations:
            </p>
            <ul>
              <li>The AI may misinterpret or miss important information</li>
              <li>Context that a human expert would consider may be missed</li>
              <li>Rare variants or unusual report formats may not be handled correctly</li>
              <li>The tool cannot consider your full medical history</li>
            </ul>

            <h3>4. ClinVar Data Limitations</h3>
            <p>
              Variant lookup results come from the ClinVar database, which:
            </p>
            <ul>
              <li>Is NOT intended for direct diagnostic use (as stated by NCBI)</li>
              <li>Contains submissions of varying quality and evidence levels</li>
              <li>May have classifications that change over time</li>
              <li>Does not include all known genetic variants</li>
              <li>May have conflicting interpretations from different laboratories</li>
            </ul>

            <h3>5. No Guarantee of Accuracy</h3>
            <p>
              While we make every effort to provide accurate information, we make no warranties 
              or representations regarding the accuracy, completeness, or reliability of the 
              information provided. Use of this service is at your own risk.
            </p>

            <h3>6. Not a Substitute for Professional Advice</h3>
            <p>
              <strong>Never disregard professional medical advice or delay in seeking it because 
              of something you have read on this website.</strong> If you think you may have a 
              medical emergency, call your doctor, go to the emergency department, or call 
              emergency services immediately.
            </p>

            <h3>7. Genetic Information is Complex</h3>
            <p>
              Genetic test results must be interpreted in the context of:
            </p>
            <ul>
              <li>Your personal medical history</li>
              <li>Your family medical history</li>
              <li>The specific test methodology used</li>
              <li>Current scientific knowledge (which evolves)</li>
              <li>Your individual circumstances</li>
            </ul>
            <p>
              Only qualified healthcare professionals can provide this contextual interpretation.
            </p>

            <h3>8. Liability Limitation</h3>
            <p>
              To the fullest extent permitted by law, MyDNA Explainer and its operators shall 
              not be liable for any damages arising from:
            </p>
            <ul>
              <li>Use or inability to use this service</li>
              <li>Any information obtained through this service</li>
              <li>Decisions made based on information from this service</li>
              <li>Errors or omissions in the content</li>
            </ul>

            <h3>9. Consult Qualified Professionals</h3>
            <p>
              We strongly recommend that you:
            </p>
            <ul>
              <li>
                <strong>Consult a certified genetic counselor</strong> for interpretation of 
                genetic test results
              </li>
              <li>
                <strong>Speak with your healthcare provider</strong> about any health concerns
              </li>
              <li>
                <strong>Do not make medical decisions</strong> based solely on information 
                from this website
              </li>
            </ul>

            <h3>10. External Links</h3>
            <p>
              This website may contain links to external websites. We are not responsible for 
              the content or privacy practices of those sites.
            </p>

            <h3>11. Changes to This Disclaimer</h3>
            <p>
              We reserve the right to modify this disclaimer at any time. Continued use of the 
              service after changes constitutes acceptance of the modified disclaimer.
            </p>
          </CardContent>
        </Card>

        {/* Final Warning */}
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Remember</AlertTitle>
          <AlertDescription>
            Genetic information is personal and complex. Always discuss your results with a 
            qualified healthcare professional or certified genetic counselor who can provide 
            personalized guidance based on your complete health picture.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
