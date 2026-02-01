import { useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileImage, Box, Map, Calendar, Loader2, Building2, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { getLoginUrl } from '@/const';

export default function ExportHistory() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Fetch export history
  const { data: exports, isLoading } = trpc.exports.getExportHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate statistics
  const totalExports = exports?.length || 0;
  const pngCount = exports?.filter((e) => e.format === 'png').length || 0;
  const objCount = exports?.filter((e) => e.format === 'obj').length || 0;
  const geojsonCount = exports?.filter((e) => e.format === 'geojson').length || 0;

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'png':
        return <FileImage className="h-4 w-4" />;
      case 'obj':
        return <Box className="h-4 w-4" />;
      case 'geojson':
        return <Map className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'png':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'obj':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'geojson':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
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
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Download className="h-8 w-8 text-primary" />
              Export History
            </h1>
            <p className="text-muted-foreground mt-2">View and manage all your exported property analyses</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Exports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalExports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  PNG Screenshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{pngCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  OBJ Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{objCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  GeoJSON Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{geojsonCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Export List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>All your exported files are listed below</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !exports || exports.length === 0 ? (
                <div className="text-center py-12">
                  <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">No exports yet</p>
                  <p className="text-sm text-muted-foreground">
                    Export property analyses to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exports.map((exportItem) => (
                    <div
                      key={exportItem.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Format Badge */}
                        <Badge
                          variant="outline"
                          className={`${getFormatColor(exportItem.format)} flex items-center gap-1.5 px-3 py-1.5`}
                        >
                          {getFormatIcon(exportItem.format)}
                          <span className="uppercase font-semibold">{exportItem.format}</span>
                        </Badge>

                        {/* File Info */}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {exportItem.fileKey || `Export #${exportItem.id}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(exportItem.createdAt).toLocaleString()}</span>
                            {exportItem.fileSize && (
                              <>
                                <span>•</span>
                                <span>{(exportItem.fileSize / 1024).toFixed(2)} KB</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Download Button */}
                      {exportItem.fileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(exportItem.fileUrl || '', '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
