import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Building2, Loader2, Zap, Users } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import FAQ from "@/components/FAQ";

const pricingTiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring ZoneWise",
    icon: Building2,
    features: [
      "3 property views per month",
      "Basic zoning data access",
      "17 Brevard jurisdictions",
      "301 zoning districts",
      "Community support",
    ],
    limitations: [
      "No 3D visualization",
      "No sun/shadow analysis",
      "No export functionality",
      "No satellite imagery",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Professional",
    price: "$39",
    period: "per month",
    description: "For real estate professionals",
    icon: Zap,
    features: [
      "Unlimited property views",
      "Interactive 3D building envelopes",
      "Sun/shadow analysis",
      "Satellite imagery overlay",
      "Export to PNG, OBJ, JSON",
      "Priority email support",
      "Advanced zoning metrics",
      "Property history tracking",
    ],
    limitations: [],
    cta: "Start Pro Trial",
    highlighted: true,
    stripePriceId: "price_pro_monthly", // Replace with actual Stripe price ID
  },
  {
    id: "team",
    name: "Team",
    price: "$199",
    period: "per month",
    description: "For development teams",
    icon: Users,
    features: [
      "Everything in Professional",
      "Up to 10 team members",
      "Shared project workspace",
      "Collaboration tools",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label exports",
    ],
    limitations: [],
    cta: "Contact Sales",
    highlighted: false,
    stripePriceId: "price_team_monthly", // Replace with actual Stripe price ID
  },
];

export default function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // Get current subscription
  const { data: subscription } = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Create checkout session mutation
  const createCheckoutMutation = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message);
      setLoadingTier(null as string | null);
    },
  });

  const handleSubscribe = (tierId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (tierId === "free") {
      toast.info("You're already on the free plan!");
      return;
    }

    if (tierId === "team") {
      toast.info("Please contact sales@zonewise.ai for Team plan");
      return;
    }

    if (tierId !== "pro" && tierId !== "team") {
      toast.error("Invalid tier");
      return;
    }

    setLoadingTier(tierId as string);
    createCheckoutMutation.mutate({ tier: tierId as "pro" | "team" });
  };

  const currentTier = subscription?.tier || "free";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">ZoneWise</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/analyze">
              <Button variant="ghost">Analyze Property</Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="mb-2">
              Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as your needs grow. All plans include access to verified Brevard County zoning data.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              const isCurrentTier = currentTier === tier.id;
              const isLoading = loadingTier === tier.id && loadingTier !== null;

              return (
                <Card
                  key={tier.id}
                  className={`relative flex flex-col ${
                    tier.highlighted
                      ? "border-primary shadow-lg scale-105"
                      : ""
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-8 w-8 text-primary" />
                      {isCurrentTier && (
                        <Badge variant="secondary">Current Plan</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground ml-2">
                        {tier.period}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <div className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {tier.limitations.length > 0 && (
                      <div className="pt-4 border-t space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Not included:
                        </p>
                        {tier.limitations.map((limitation, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-muted-foreground"
                          >
                            <span className="text-sm">• {limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      onClick={() => handleSubscribe(tier.id)}
                      disabled={isCurrentTier || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : isCurrentTier ? (
                        "Current Plan"
                      ) : (
                        tier.cta
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto space-y-8 pt-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I change plans later?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    What payment methods do you accept?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe payment processor.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Is there a free trial?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The Free plan gives you 3 property views per month with no credit card required. Professional and Team plans offer 14-day money-back guarantees.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    What areas do you cover?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Currently, we cover all 17 jurisdictions in Brevard County, Florida with 301 verified zoning districts. We're expanding to additional counties soon.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I cancel anytime?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          {/* FAQ Section */}
          <div className="pt-16">
            <FAQ />
          </div>

          <div className="text-center space-y-4 pt-12">
            <h2 className="text-2xl font-bold">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground">
              Join real estate professionals using ZoneWise to make informed decisions
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/analyze">
                <Button size="lg">
                  Try Free Now
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:sales@zonewise.ai">Contact Sales</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 ZoneWise.AI - Verified Zoning Intelligence for Brevard County</p>
        </div>
      </footer>
    </div>
  );
}
