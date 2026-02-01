import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MapPin, 
  Building2, 
  Ruler, 
  Maximize2,
  Sun,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import BuildingEnvelope3D from "@/components/BuildingEnvelope3D";
import SunShadowAnalysis from "@/components/SunShadowAnalysis";
import MapboxSatellite from "@/components/MapboxSatellite";
import { ReportGenerator } from "@/components/ReportGenerator";

export default function PropertyAnalysis() {
  const { isAuthenticated, user } = useAuth();
  const [address, setAddress] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  // Fetch jurisdictions
  const { data: jurisdictions, isLoading: loadingJurisdictions } = 
    trpc.property.getJurisdictions.useQuery();

  // Fetch districts for selected jurisdiction
  const { data: districts, isLoading: loadingDistricts } = 
    trpc.property.getDistrictsByJurisdiction.useQuery(
      { jurisdictionId: selectedJurisdiction! },
      { enabled: !!selectedJurisdiction }
    );

  // Fetch district details
  const { data: districtDetails, isLoading: loadingDetails } = 
    trpc.property.getDistrictDetails.useQuery(
      { districtId: selectedDistrict! },
      { enabled: !!selectedDistrict }
    );

  // Usage tracking
  const { data: usage } = trpc.usage.getCurrent.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const incrementViewMutation = trpc.usage.incrementView.useMutation({
    onSuccess: () => {
      toast.success("Property view recorded");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSearch = () => {
    if (!address.trim()) {
      toast.error("Please enter an address");
      return;
    }

    // TODO: Implement geocoding and property lookup
    toast.info("Address search coming soon! For now, browse by jurisdiction.");
  };

  const handleViewProperty = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view properties");
      window.location.href = getLoginUrl();
      return;
    }

    if (usage && usage.tier === "free" && usage.viewCount >= 3) {
      toast.error("Free tier limit reached. Please upgrade to continue.");
      return;
    }

    incrementViewMutation.mutate();
  };

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
            {isAuthenticated ? (
              <>
                {usage && (
                  <div className="text-sm text-muted-foreground">
                    {usage.tier === "free" ? (
                      <span>
                        {usage.viewCount}/{usage.limit} views this month
                      </span>
                    ) : (
                      <Badge variant="default">{usage.tier.toUpperCase()}</Badge>
                    )}
                  </div>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Property Search
              </CardTitle>
              <CardDescription>
                Enter an address or browse by jurisdiction to analyze zoning regulations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="address" className="sr-only">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter property address (e.g., 123 Main St, Malabar, FL)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">or browse by jurisdiction</span>
                <Separator className="flex-1" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <select
                    id="jurisdiction"
                    className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                    value={selectedJurisdiction || ""}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      setSelectedJurisdiction(value);
                      setSelectedDistrict(null);
                    }}
                    disabled={loadingJurisdictions}
                  >
                    <option value="">Select a jurisdiction...</option>
                    {jurisdictions?.map((j: any) => (
                      <option key={j.id} value={j.id}>
                        {j.name}, {j.county} County
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="district">Zoning District</Label>
                  <select
                    id="district"
                    className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                    value={selectedDistrict || ""}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      setSelectedDistrict(value);
                      if (value) handleViewProperty();
                    }}
                    disabled={!selectedJurisdiction || loadingDistricts}
                  >
                    <option value="">
                      {!selectedJurisdiction 
                        ? "Select jurisdiction first..." 
                        : "Select a zoning district..."}
                    </option>
                    {districts?.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {loadingDetails && (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading zoning information...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {districtDetails && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Zoning Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {districtDetails.code} - {districtDetails.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {districtDetails.jurisdictions?.name}, {districtDetails.jurisdictions?.county} County, {districtDetails.jurisdictions?.state}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="3d">3D View</TabsTrigger>
                        <TabsTrigger value="sun">Sun/Shadow</TabsTrigger>
                        <TabsTrigger value="map">Map</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4 mt-4">
                        <div>
                          <h3 className="font-semibold mb-2">Description</h3>
                          <p className="text-sm text-muted-foreground">
                            {districtDetails.description || "No description available"}
                          </p>
                        </div>

                        {districtDetails.source_url && (
                          <div>
                            <h3 className="font-semibold mb-2">Source</h3>
                            <a 
                              href={districtDetails.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              View official ordinance
                              <MapPin className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="dimensions" className="space-y-4 mt-4">
                        {districtDetails.dimensions ? (
                          <div className="grid gap-4">
                            {Object.entries(districtDetails.dimensions).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted/50 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">
                              No dimensional standards extracted. View description for details.
                            </span>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="3d" className="mt-4">
                        <div className="aspect-video">
                          <BuildingEnvelope3D
                            dimensions={districtDetails.dimensions}
                            lotWidth={100}
                            lotDepth={150}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="sun" className="mt-4">
                        <SunShadowAnalysis
                          dimensions={districtDetails.dimensions}
                          lotWidth={100}
                          lotDepth={150}
                          latitude={28.3922}
                          longitude={-80.6077}
                        />
                      </TabsContent>

                      <TabsContent value="map" className="mt-4">
                        <MapboxSatellite
                          latitude={28.3922}
                          longitude={-80.6077}
                          lotWidth={100}
                          lotDepth={150}
                        />
                      </TabsContent>

                      <TabsContent value="reports" className="mt-4">
                        {isAuthenticated ? (
                          <ReportGenerator
                            propertyId={String(selectedDistrict)}
                            propertyAddress={`${districtDetails.code} - ${districtDetails.name}`}
                          />
                        ) : (
                          <Card>
                            <CardContent className="py-12 text-center">
                              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                              <p className="text-muted-foreground mb-4">
                                Please sign in to generate property reports
                              </p>
                              <Button asChild>
                                <a href={getLoginUrl()}>Sign In</a>
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Actions & Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Export 3D Model
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data (JSON)
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Ruler className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Setbacks</p>
                        <p className="text-xs text-muted-foreground">
                          {districtDetails.dimensions?.front_setback || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Maximize2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Height Limit</p>
                        <p className="text-xs text-muted-foreground">
                          {districtDetails.dimensions?.max_height || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Lot Coverage</p>
                        <p className="text-xs text-muted-foreground">
                          {districtDetails.dimensions?.max_lot_coverage || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!isAuthenticated && (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base">Upgrade for More</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Sign up for unlimited property views and advanced features
                      </p>
                      <a href={getLoginUrl()}>
                        <Button className="w-full">
                          Get Started Free
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {!selectedDistrict && !loadingDetails && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold">No Property Selected</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Enter an address above or select a jurisdiction and zoning district to view detailed analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
