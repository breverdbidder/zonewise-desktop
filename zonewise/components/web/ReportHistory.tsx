/**
 * Report History Component
 * Display all generated reports with download links
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Download, MoreVertical, Trash2, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function ReportHistory() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: reports, isLoading, refetch } = trpc.reports.getReports.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  const { data: stats } = trpc.reports.getReportStats.useQuery();

  const deleteMutation = trpc.reports.deleteReport.useMutation({
    onSuccess: () => {
      toast.success('Report deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });

  const handleDelete = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteMutation.mutate({ reportId });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'generating':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      failed: 'destructive',
      generating: 'secondary',
      pending: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatReportType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Reports</CardDescription>
              <CardTitle className="text-3xl">{stats.totalReports}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.completedReports}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.pendingReports}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Failed</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.failedReports}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>
            All your generated property reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports && reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {report.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatReportType(report.reportType)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        {getStatusBadge(report.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {report.status === 'completed' && (
                        <div className="flex gap-1">
                          {report.pdfUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                                PDF
                              </a>
                            </Button>
                          )}
                          {report.csvUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={report.csvUrl} target="_blank" rel="noopener noreferrer">
                                CSV
                              </a>
                            </Button>
                          )}
                          {report.excelUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={report.excelUrl} target="_blank" rel="noopener noreferrer">
                                Excel
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {report.status === 'completed' && report.pdfUrl && (
                            <DropdownMenuItem asChild>
                              <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(report.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground">
                Generate your first property report to get started
              </p>
            </div>
          )}

          {/* Pagination */}
          {reports && reports.length === pageSize && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={reports.length < pageSize}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
