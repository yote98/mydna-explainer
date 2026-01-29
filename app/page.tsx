import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Search, 
  Shield, 
  BookOpen, 
  UserCheck, 
  Lock,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Report Translation",
    description: "Paste your genetic test report and get a plain-language explanation of what it means.",
  },
  {
    icon: Search,
    title: "Variant Lookup",
    description: "Look up specific genetic variants in ClinVar to understand their clinical significance.",
  },
  {
    icon: BookOpen,
    title: "Genetics Education",
    description: "Learn about genetic terms like VUS, pathogenic, penetrance, and more.",
  },
  {
    icon: UserCheck,
    title: "Next Steps Guidance",
    description: "Get suggestions for questions to ask your doctor or genetic counselor.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "We never provide medical advice, diagnosis, or treatment recommendations.",
  },
  {
    icon: Lock,
    title: "Privacy Focused",
    description: "Your data is processed in-session only. We don't store your genetic information.",
  },
];

const whatWeDoNot = [
  "Provide medical diagnoses",
  "Recommend treatments or medications",
  "Calculate your disease risk percentages",
  "Replace genetic counselors or doctors",
  "Store your genetic data",
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Understand Your Genetic Report
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            MyDNA Explainer helps you understand genetic test results in plain language. 
            Get clarity on terms, learn what findings mean, and prepare better questions for your healthcare provider.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/translate">
                Translate My Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/lookup">
                Look Up a Variant
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do NOT Do Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What We Do NOT Do</h2>
          <p className="text-center text-muted-foreground mb-8">
            To protect your health and safety, this tool has strict limitations:
          </p>
          <div className="bg-background rounded-lg p-6 border">
            <ul className="space-y-3">
              {whatWeDoNot.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-destructive font-bold text-sm">✕</span>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Always consult a certified genetic counselor or healthcare provider for personalized medical guidance.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Paste Your Report</h3>
                <p className="text-muted-foreground">
                  Copy the text from your genetic test results and paste it into our translator. 
                  We recommend redacting personal identifiers first.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Get Plain-Language Explanations</h3>
                <p className="text-muted-foreground">
                  We identify genes, variants, and technical terms, then explain what they mean in everyday language. 
                  We also highlight common misunderstandings to avoid.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Prepare for Your Appointment</h3>
                <p className="text-muted-foreground">
                  Use our suggested questions and next-steps checklist to make the most of your 
                  conversation with a genetic counselor or healthcare provider.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Understand Your Results?</h2>
          <p className="text-muted-foreground mb-6">
            Start with our report translator or look up a specific variant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/translate">
                Translate Report
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/lookup">
                Variant Lookup
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
