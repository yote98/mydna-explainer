import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Trash2, Server } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Key Points Summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <Lock className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">No Data Storage</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We do not store your genetic report data. All processing happens in-session and is discarded.
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Eye className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">No Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We do not use tracking cookies or analytics that capture your genetic information.
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Trash2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Immediate Deletion</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Your data is processed in memory and immediately discarded after generating results.
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Server className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Secure Processing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All communications are encrypted. We use industry-standard security practices.
            </CardContent>
          </Card>
        </div>

        {/* Full Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Full Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>1. Information We Process</h3>
            <p>
              When you use MyDNA Explainer, you may provide:
            </p>
            <ul>
              <li>Genetic test report text (for translation)</li>
              <li>Variant identifiers (for ClinVar lookups)</li>
            </ul>
            <p>
              <strong>We do not collect or store this information.</strong> It is processed in memory, 
              used only to generate your results, and immediately discarded.
            </p>

            <h3>2. No Account Required</h3>
            <p>
              MyDNA Explainer does not require you to create an account. We do not collect:
            </p>
            <ul>
              <li>Names or email addresses</li>
              <li>Login credentials</li>
              <li>Payment information</li>
              <li>Personal identifiers</li>
            </ul>

            <h3>3. No Data Retention</h3>
            <p>
              Your genetic data is processed in real-time and is NOT:
            </p>
            <ul>
              <li>Stored in any database</li>
              <li>Saved to disk</li>
              <li>Logged in application logs</li>
              <li>Shared with third parties</li>
              <li>Used for training AI models</li>
            </ul>
            <p>
              Once your session ends, there is no record of the data you submitted.
            </p>

            <h3>4. Third-Party Services</h3>
            <p>
              We use the following third-party services:
            </p>
            <ul>
              <li>
                <strong>LLM Provider (OpenAI/Anthropic)</strong>: Your report text is sent to an 
                AI service for analysis. These services have their own privacy policies and data 
                handling practices. We recommend reviewing their policies if you have concerns.
              </li>
              <li>
                <strong>NCBI ClinVar API</strong>: Variant lookups query the public ClinVar database. 
                Only the variant identifier (rsID, etc.) is sent, not any personal information.
              </li>
            </ul>

            <h3>5. Cookies and Analytics</h3>
            <p>
              We do not use:
            </p>
            <ul>
              <li>Tracking cookies</li>
              <li>Analytics services that capture your genetic data</li>
              <li>Marketing pixels or tracking scripts</li>
            </ul>
            <p>
              We may use essential cookies for site functionality only.
            </p>

            <h3>6. Your Recommendations</h3>
            <p>
              To further protect your privacy:
            </p>
            <ul>
              <li>Consider redacting your name and identifiers before pasting report text</li>
              <li>Do not share results with your name attached</li>
              <li>Use the download feature to keep results locally</li>
              <li>Be cautious about sharing genetic information generally</li>
            </ul>

            <h3>7. Data Security</h3>
            <p>
              We implement security measures including:
            </p>
            <ul>
              <li>HTTPS encryption for all communications</li>
              <li>No logging of submitted genetic text</li>
              <li>Request IDs only (no content) in server logs</li>
              <li>Regular security reviews</li>
            </ul>

            <h3>8. Children&apos;s Privacy</h3>
            <p>
              This service is not intended for use by children under 18 without parental consent. 
              We do not knowingly collect information from children.
            </p>

            <h3>9. International Users</h3>
            <p>
              If you are located outside the United States, please be aware that your data 
              may be processed on servers located in the US or other countries. By using this 
              service, you consent to this transfer.
            </p>

            <h3>10. Changes to This Policy</h3>
            <p>
              We may update this privacy policy from time to time. Any changes will be posted 
              on this page with an updated revision date.
            </p>

            <h3>11. Contact</h3>
            <p>
              If you have questions about this privacy policy, please contact us through the 
              website.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
