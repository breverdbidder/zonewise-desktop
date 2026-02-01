/**
 * Report Generator Component
 * UI for generating comprehensive property reports
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportGeneratorProps {
  propertyId: string;
  propertyAddress: string;
}

export function ReportGenerator({ propertyId, propertyAddress }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<'executive_summary' | 'full_analysis' | 'kpi_dashboard'>('executive_summary');
  const [includeAerialImage, setIncludeAerialImage] = useState(true);
  const [include3DVisualization, setInclude3DVisualization] = useState(true);
  const [includeSunShadowAnalysis, setIncludeSunShadowAnalysis] = useState(true);
  const [includeFinancialAnalysis, setIncludeFinancialAnalysis] = useState(false);
  const [includeDevelopmentScenarios, setIncludeDevelopmentScenarios] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const generateMutation = trpc.reports.generateReport.useMutation({
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('Report generated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      propertyId,
      reportType,
      includeAerialImage,
      include3DVisualization,
      includeSunShadowAnalysis,
      includeFinancialAnalysis,
      includeDevelopmentScenarios,
      customBranding: companyName ? {
        companyName,
        primaryColor: '#2563eb',
      } : undefined,
    });
  };

  const reportTypes = [
    {
      value: 'executive_summary',
      label: 'Executive Summary',
      description: '2-page overview with key findings and recommendations',
      pages: '2 pages',
    },
    {
      value: 'full_analysis',
      label: 'Full Property Analysis',
      description: 'Comprehensive 15-20 page report with all 75 KPIs',
      pages: '15-20 pages',
    },
    {
      value: 'kpi_dashboard',
      label: 'KPI Dashboard',
      description: 'Visual KPI presentation organized by category',
      pages: '8-10 pages',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Property Report</CardTitle>
          <CardDescription>
            Create a comprehensive zoning report for {propertyAddress}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Report Type</Label>
            <RadioGroup value={reportType} onValueChange={(value: any) => setReportType(value)}>
              {reportTypes.map((type) => (
                <div key={type.value} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{type.pages}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Report Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Report Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aerial"
                  checked={includeAerialImage}
                  onCheckedChange={(checked) => setIncludeAerialImage(checked as boolean)}
                />
                <Label htmlFor="aerial" className="font-normal cursor-pointer">
                  Include aerial imagery
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="3d"
                  checked={include3DVisualization}
                  onCheckedChange={(checked) => setInclude3DVisualization(checked as boolean)}
                />
                <Label htmlFor="3d" className="font-normal cursor-pointer">
                  Include 3D building envelope visualization
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sun"
                  checked={includeSunShadowAnalysis}
                  onCheckedChange={(checked) => setIncludeSunShadowAnalysis(checked as boolean)}
                />
                <Label htmlFor="sun" className="font-normal cursor-pointer">
                  Include sun/shadow analysis
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="financial"
                  checked={includeFinancialAnalysis}
                  onCheckedChange={(checked) => setIncludeFinancialAnalysis(checked as boolean)}
                />
                <Label htmlFor="financial" className="font-normal cursor-pointer">
                  Include financial opportunity analysis
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scenarios"
                  checked={includeDevelopmentScenarios}
                  onCheckedChange={(checked) => setIncludeDevelopmentScenarios(checked as boolean)}
                />
                <Label htmlFor="scenarios" className="font-normal cursor-pointer">
                  Include development scenarios
                </Label>
              </div>
            </div>
          </div>

          {/* Custom Branding */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Custom Branding (Optional)</Label>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm">Company Name</Label>
              <Input
                id="company"
                placeholder="Your Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Add your company name to customize the report header
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full"
            size="lg"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report Downloads */}
      {generatedReport && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">Report Generated Successfully</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Your report is ready to download in multiple formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {generatedReport.pdfUrl && (
                <Button
                  variant="outline"
                  className="justify-start"
                  asChild
                >
                  <a href={generatedReport.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              )}
              {generatedReport.csvUrl && (
                <Button
                  variant="outline"
                  className="justify-start"
                  asChild
                >
                  <a href={generatedReport.csvUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </a>
                </Button>
              )}
              {generatedReport.excelUrl && (
                <Button
                  variant="outline"
                  className="justify-start"
                  asChild
                >
                  <a href={generatedReport.excelUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Excel
                  </a>
                </Button>
              )}
              {generatedReport.jsonUrl && (
                <Button
                  variant="outline"
                  className="justify-start"
                  asChild
                >
                  <a href={generatedReport.jsonUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                  </a>
                </Button>
              )}
            </div>
            <p className="text-sm text-green-700">
              Generated in {(generatedReport.generationTimeMs / 1000).toFixed(2)} seconds
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ZoneWise vs PropZone</CardTitle>
          <CardDescription>
            See how our reports surpass the competition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium border-b pb-2">
              <div>Feature</div>
              <div className="text-center">PropZone</div>
              <div className="text-center text-primary">ZoneWise</div>
            </div>
            
            {[
              { feature: 'Total KPIs', propzone: '48', zonewise: '75+' },
              { feature: 'Export Formats', propzone: 'PDF only', zonewise: 'PDF, CSV, Excel, JSON' },
              { feature: '3D Visualization', propzone: '❌', zonewise: '✅' },
              { feature: 'Sun/Shadow Analysis', propzone: '❌', zonewise: '✅' },
              { feature: 'AI-Enhanced Insights', propzone: '❌', zonewise: '✅' },
              { feature: 'Financial Analysis', propzone: '❌', zonewise: '✅' },
              { feature: 'Custom Branding', propzone: '❌', zonewise: '✅' },
              { feature: 'Development Scenarios', propzone: '❌', zonewise: '✅' },
            ].map((row, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 text-sm py-2 border-b last:border-0">
                <div className="font-medium">{row.feature}</div>
                <div className="text-center text-muted-foreground">{row.propzone}</div>
                <div className="text-center text-primary font-semibold">{row.zonewise}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
