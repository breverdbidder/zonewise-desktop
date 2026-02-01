import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import SavedProperties from "@/components/SavedProperties";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Eye,
  Crown,
  Settings,
  LogOut,
  ExternalLink,
  Loader2,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Fetch subscription data
  const { data: subscription, isLoading: loadingSubscription } = 
    trpc.billing.getSubscription.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  // Fetch usage data
  const { data: usage, isLoading: loadingUsage } = 
    trpc.usage.getCurrent.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  // Create portal session mutation
  const createPortalMutation = trpc.billing.createPortal.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Logout mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      window.location.href = "/";
    },
  });

  const handleManageSubscription = () => {
    createPortalMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    logoutMutation.mutate();
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tier = subscription?.tier || "free";
  const isFreeTier = tier === "free";
  const viewsRemaining = isFreeTier && usage ? (usage.limit || 3) - usage.viewCount : null;

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
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ""}!</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account and view your property analysis history
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Subscription Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge 
                      variant={isFreeTier ? "secondary" : "default"}
                      className="text-lg px-3 py-1"
                    >
                      {tier.toUpperCase()}
                    </Badge>
                  </div>
                  {loadingSubscription ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      {isFreeTier ? (
                        <p className="text-sm text-muted-foreground">
                          3 property views per month
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Unlimited property views
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUsage ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {usage?.viewCount || 0}
                      {isFreeTier && <span className="text-lg text-muted-foreground"> / 3</span>}
                    </div>
                    {isFreeTier && viewsRemaining !== null && (
                      <p className="text-sm text-muted-foreground">
                        {viewsRemaining} {viewsRemaining === 1 ? "view" : "views"} remaining
                      </p>
                    )}
                    {!isFreeTier && (
                      <p className="text-sm text-muted-foreground">
                        Unlimited views
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">
                    Properties analyzed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upgrade CTA (Free Tier Only) */}
          {isFreeTier && (
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Upgrade to Pro
                </CardTitle>
                <CardDescription>
                  Unlock unlimited property views and advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Unlimited Views</p>
                      <p className="text-xs text-muted-foreground">
                        Analyze as many properties as you need
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Advanced Features</p>
                      <p className="text-xs text-muted-foreground">
                        3D visualization, sun/shadow analysis
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/#pricing">
                    <Button>
                      View Pricing
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    Starting at $49/month
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Management */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{user?.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{user?.name || "Not provided"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Account Actions</p>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                  <p className="text-sm capitalize">{tier}</p>
                </div>
                {subscription?.status && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                      {subscription.status}
                    </Badge>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  {!isFreeTier && subscription && 'stripeCustomerId' in subscription && subscription.stripeCustomerId ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleManageSubscription}
                      disabled={createPortalMutation.isPending}
                    >
                      {createPortalMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Manage Subscription
                        </>
                      )}
                    </Button>
                  ) : (
                    <Link href="/#pricing">
                      <Button variant="outline" size="sm">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account and exports</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link href="/analyze">
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Analyze Property
                </Button>
              </Link>
              <Link href="/exports">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Compare Properties
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Saved Properties */}
          <SavedProperties />
        </div>
      </div>
    </div>
  );
}
