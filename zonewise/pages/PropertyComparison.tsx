import { useEffect, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowLeft, 
  Loader2, 
  MapPin,
  Ruler,
  Home,
  TrendingUp,
  X,
  FileDown
} from 'lucide-react';
import { exportComparisonToPDF, downloadComparisonHTML, type PropertyComparisonData } from '@/utils/pdfExport';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { getLoginUrl } from '@/const';

export default function PropertyComparison() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Fetch all properties
  const { data: properties, isLoading } = trpc.properties.getProperties.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get selected properties for comparison
  const selectedProperties = properties?.filter((p: any) => selectedIds.includes(p.id)) || [];

  const toggleProperty = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      if (selectedIds.length >= 4) {
        return; // Max 4 properties
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const parseZoningData = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {selectedProperties.length >= 2 && (
              <Button
                onClick={async () => {
                  try {
                    const comparisonData: PropertyComparisonData = {
                      properties: selectedProperties.map((p: any) => {
                        const zoning = parseZoningData(p.zoningData);
                        return {
                          address: p.address,
                          jurisdiction: zoning?.jurisdiction || 'Unknown',
                          zoningDistrict: zoning?.district || 'Unknown',
                          setbacks: {
                            front: zoning?.setbacks?.front || 0,
                            rear: zoning?.setbacks?.rear || 0,
                            side: zoning?.setbacks?.side || 0,
                          },
                          heightLimit: zoning?.heightLimit || 0,
                          lotSize: zoning?.lotSize || 0,
                          coverage: zoning?.coverage || 0,
                          uses: zoning?.permittedUses || [],
                        };
                      }),
                      generatedAt: new Date(),
                    };
                    await exportComparisonToPDF(comparisonData);
                    toast.success('PDF export opened in new window');
                  } catch (error) {
                    console.error('PDF export failed:', error);
                    toast.error('Failed to export PDF. Please try again.');
                  }
                }}
                variant="outline"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            )}
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Property Comparison
            </h1>
            <p className="text-muted-foreground mt-2">
              Compare zoning regulations, building envelopes, and setbacks side-by-side
            </p>
          </div>

          {/* Property Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Properties to Compare</CardTitle>
              <CardDescription>
                Choose up to 4 properties for side-by-side comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !properties || properties.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">No saved properties</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save some properties first to compare them
                  </p>
                  <Link href="/analyze">
                    <Button>Analyze Property</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {properties.map((property: any) => {
                    const isSelected = selectedIds.includes(property.id);
                    return (
                      <div
                        key={property.id}
                        onClick={() => toggleProperty(property.id)}
                        className={`
                          flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all
                          ${isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-accent/50'}
                          ${selectedIds.length >= 4 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {/* Thumbnail */}
                        {property.thumbnail && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img
                              src={property.thumbnail}
                              alt={property.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {property.name}
                                {isSelected && (
                                  <Badge variant="default" className="text-xs">
                                    Selected
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {property.address}
                              </p>
                            </div>
                          </div>

                          {property.zoningCode && (
                            <Badge variant="outline" className="text-xs">
                              {property.zoningCode}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comparison Table */}
          {selectedProperties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Comparison Results</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                </CardTitle>
                <CardDescription>
                  Side-by-side comparison of {selectedProperties.length} properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold bg-muted/50">Attribute</th>
                        {selectedProperties.map((property: any) => (
                          <th key={property.id} className="text-left p-4 font-semibold bg-muted/50">
                            <div className="space-y-1">
                              <div className="font-semibold">{property.name}</div>
                              <div className="text-xs text-muted-foreground font-normal">
                                {property.zoningCode}
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Address */}
                      <tr className="border-b hover:bg-accent/30">
                        <td className="p-4 font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Address
                        </td>
                        {selectedProperties.map((property: any) => (
                          <td key={property.id} className="p-4 text-sm">
                            {property.address}
                          </td>
                        ))}
                      </tr>

                      {/* Coordinates */}
                      <tr className="border-b hover:bg-accent/30">
                        <td className="p-4 font-medium">Coordinates</td>
                        {selectedProperties.map((property: any) => (
                          <td key={property.id} className="p-4 text-sm">
                            {property.latitude}, {property.longitude}
                          </td>
                        ))}
                      </tr>

                      {/* Zoning Code */}
                      <tr className="border-b hover:bg-accent/30">
                        <td className="p-4 font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          Zoning Code
                        </td>
                        {selectedProperties.map((property: any) => (
                          <td key={property.id} className="p-4">
                            <Badge variant="outline">{property.zoningCode || 'N/A'}</Badge>
                          </td>
                        ))}
                      </tr>

                      {/* Zoning Description */}
                      <tr className="border-b hover:bg-accent/30">
                        <td className="p-4 font-medium">Zoning Description</td>
                        {selectedProperties.map((property: any) => (
                          <td key={property.id} className="p-4 text-sm">
                            {property.zoningDescription || 'N/A'}
                          </td>
                        ))}
                      </tr>

                      {/* Dimensional Standards */}
                      {(() => {
                        const zoningDataArray = selectedProperties.map((p: any) =>
                          parseZoningData(p.zoningDataJson)
                        );
                        const hasAnyData = zoningDataArray.some((data: any) => data);

                        if (!hasAnyData) return null;

                        return (
                          <>
                            <tr className="bg-muted/30">
                              <td colSpan={selectedProperties.length + 1} className="p-4 font-bold">
                                <div className="flex items-center gap-2">
                                  <Ruler className="h-5 w-5 text-primary" />
                                  Dimensional Standards
                                </div>
                              </td>
                            </tr>

                            {/* Min Lot Area */}
                            <tr className="border-b hover:bg-accent/30">
                              <td className="p-4 font-medium pl-8">Min Lot Area</td>
                              {zoningDataArray.map((data: any, idx: number) => (
                                <td key={idx} className="p-4 text-sm">
                                  {data?.minLotArea || 'N/A'}
                                </td>
                              ))}
                            </tr>

                            {/* Min Lot Width */}
                            <tr className="border-b hover:bg-accent/30">
                              <td className="p-4 font-medium pl-8">Min Lot Width</td>
                              {zoningDataArray.map((data: any, idx: number) => (
                                <td key={idx} className="p-4 text-sm">
                                  {data?.minLotWidth || 'N/A'}
                                </td>
                              ))}
                            </tr>

                            {/* Max Height */}
                            <tr className="border-b hover:bg-accent/30">
                              <td className="p-4 font-medium pl-8">Max Height</td>
                              {zoningDataArray.map((data: any, idx: number) => (
                                <td key={idx} className="p-4 text-sm">
                                  {data?.maxHeight || 'N/A'}
                                </td>
                              ))}
                            </tr>

                            {/* Front Setback */}
                            <tr className="border-b hover:bg-accent/30">
                              <td className="p-4 font-medium pl-8">Front Setback</td>
                              {zoningDataArray.map((data: any, idx: number) => (
                                <td key={idx} className="p-4 text-sm">
                                  {data?.frontSetback || 'N/A'}
                                </td>
                              ))}
                            </tr>

                            {/* Rear Setback */}
                            <tr className="border-b hover:bg-accent/30">
                              <td className="p-4 font-medium pl-8">Rear Setback</td>
                              {zoningDataArray.map((data: any, idx: number) => (
                                <td key={idx} className="p-4 text-sm">
                                  {data?.rearSetback || 'N/A'}
                                </td>
                              ))}
                            </tr>

                            {/* Side Setback */}
                            <tr className="border-b hover:bg-accent/30">
                              <td className="p-4 font-medium pl-8">Side Setback</td>
                              {zoningDataArray.map((data: any, idx: number) => (
                                <td key={idx} className="p-4 text-sm">
                                  {data?.sideSetback || 'N/A'}
                                </td>
                              ))}
                            </tr>

                            {/* Max Coverage */}
                            <tr className="border-b hover:bg-accent/30">
                              <td className="p-4 font-medium pl-8">Max Coverage</td>
                              {zoningDataArray.map((data: any, idx: number) => (
                                <td key={idx} className="p-4 text-sm">
                                  {data?.maxCoverage || 'N/A'}
                                </td>
                              ))}
                            </tr>
                          </>
                        );
                      })()}

                      {/* Created Date */}
                      <tr className="border-b hover:bg-accent/30">
                        <td className="p-4 font-medium">Created</td>
                        {selectedProperties.map((property: any) => (
                          <td key={property.id} className="p-4 text-sm text-muted-foreground">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
