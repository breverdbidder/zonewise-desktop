/**
 * ZoneWise V2 - Development Analysis API
 * Main API service for generating comprehensive development reports
 */

import {
  DevelopmentAnalysisReport,
  PropertyInfo,
  SiteMetrics,
  ExistingBuildingMetrics,
  ZoningInfo,
  SetbackRequirements,
  AllowedUses
} from '../types/development-analysis';

import {
  generateDevelopmentAnalysisReport,
  formatReportSummary,
  ReportInput
} from '../lib/report-generator/report-generator';

import {
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
  exportToGitHubStructure
} from '../lib/export/export-service';

// Sample data matching 169 E Flagler St example
export const SAMPLE_169_FLAGLER: ReportInput = {
  property: {
    address: '169 E Flagler St',
    city: 'Miami',
    state: 'FL',
    zipCode: '33131',
    parcelId: '0101110701010',
    legalDescription: 'MIAMI NORTH PB B-41 LOTS 1 2 3 18 19 20 & E35FT OF LOTS 4 & 17 LESS 10FT OFF E SIDE OF LOTS 1 & 20 BLK 117',
    county: 'Miami-Dade',
    neighborhood: 'CBD'
  },
  site: {
    lotAreaAcres: 1.14,
    lotAreaSqFt: 50750,
    lotAreaTaxRecord: 50750,
    lotAreaParcelShape: 49462,
    lotType: 'Corner',
    frontageLength: 632.79,
    isVacant: false,
    currentLandUse: 'Office'
  },
  existingBuilding: {
    buildingArea: 347565,
    buildingUse: 'Office Building',
    yearBuilt: 1939,
    stories: 12
  },
  zoning: {
    zoningCode: 'Miami 21 Code',
    zoningDistrict: 'T6-80-O',
    zoningDescription: 'T6-80A-Open, Urban Core Zone - Highest density, greatest variety of uses, regional civic buildings, small blocks, wide sidewalks, buildings close to frontage',
    baseFAR: 12.0,
    maxFAR: 24.0,
    maxStories: 80,
    maxHeightFeet: 1010,
    maxLotCoverage: 80,
    minOpenSpace: 10,
    faaHeightLimitation: 1010,
    historicDistrict: 'Downtown Miami Commercial Historic District',
    leedRequirement: 'LEED Certified',
    liveLocalApplicability: true,
    todStatus: 'TOD 1/2 Mile',
    transitCorridor: true
  },
  setbacks: {
    primaryFrontage: 10,
    secondaryFrontage: 10,
    side: null,
    rear: 0,
    water: null
  },
  allowedUses: {
    residential: {
      byRight: ['Single Family', 'Two Family', 'Multi Family', 'Dormitory', 'Live-Work', 'Community Residence'],
      byWarrant: [],
      byException: []
    },
    commercial: {
      byRight: ['Entertainment', 'Food Service', 'General Commercial', 'Place of Assembly', 'Recreation'],
      byWarrant: [],
      byException: []
    },
    office: {
      byRight: ['Home Office', 'Office'],
      byWarrant: [],
      byException: []
    },
    civic: {
      byRight: ['Recreational Facility', 'Religious Facility'],
      byWarrant: ['Community Facility'],
      byException: ['Regional Activity Complex']
    },
    educational: {
      byRight: ['Learning Center', 'Pre-School', 'Research Facility'],
      byWarrant: ['Childcare', 'College/University', 'Elementary', 'Middle/High School', 'Special Training'],
      byException: []
    },
    lodging: {
      byRight: ['Bed & Breakfast', 'Inn', 'Hotel'],
      byWarrant: [],
      byException: []
    }
  },
  marketPreset: 'miami_cbd'
};

/**
 * Generate a complete development analysis report
 */
export function generateReport(input: ReportInput): DevelopmentAnalysisReport {
  return generateDevelopmentAnalysisReport(input);
}

/**
 * Generate sample 169 E Flagler report
 */
export function generateSampleReport(): DevelopmentAnalysisReport {
  return generateDevelopmentAnalysisReport(SAMPLE_169_FLAGLER);
}

/**
 * Export report to various formats
 */
export function exportReport(
  report: DevelopmentAnalysisReport,
  format: 'csv' | 'json' | 'markdown' | 'github'
): string | Record<string, string> {
  switch (format) {
    case 'csv':
      return exportToCSV(report);
    case 'json':
      return exportToJSON(report);
    case 'markdown':
      return exportToMarkdown(report);
    case 'github':
      return exportToGitHubStructure(report);
  }
}

/**
 * Get report summary as text
 */
export function getReportSummary(report: DevelopmentAnalysisReport): string {
  return formatReportSummary(report);
}

/**
 * API request/response types for REST API
 */
export interface GenerateReportRequest {
  property: PropertyInfo;
  site: SiteMetrics;
  existingBuilding?: ExistingBuildingMetrics;
  zoning: ZoningInfo;
  setbacks: SetbackRequirements;
  allowedUses: AllowedUses;
  marketPreset?: string;
  landValue?: number;
}

export interface GenerateReportResponse {
  success: boolean;
  report?: DevelopmentAnalysisReport;
  summary?: string;
  error?: string;
}

export interface ExportReportRequest {
  reportId: string;
  format: 'csv' | 'json' | 'markdown' | 'github' | 'pdf' | 'excel';
}

export interface ExportReportResponse {
  success: boolean;
  data?: string | object;
  filename?: string;
  mimeType?: string;
  error?: string;
}

/**
 * REST API handler for generating reports
 */
export async function handleGenerateReport(
  request: GenerateReportRequest
): Promise<GenerateReportResponse> {
  try {
    const report = generateReport(request);
    const summary = getReportSummary(report);
    
    return {
      success: true,
      report,
      summary
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating report'
    };
  }
}

/**
 * REST API handler for exporting reports
 */
export async function handleExportReport(
  report: DevelopmentAnalysisReport,
  format: 'csv' | 'json' | 'markdown' | 'github'
): Promise<ExportReportResponse> {
  try {
    const data = exportReport(report, format);
    
    const mimeTypes: Record<string, string> = {
      csv: 'text/csv',
      json: 'application/json',
      markdown: 'text/markdown',
      github: 'application/json'
    };
    
    const extensions: Record<string, string> = {
      csv: 'csv',
      json: 'json',
      markdown: 'md',
      github: 'json'
    };
    
    const address = report.property.address.replace(/\s+/g, '-').toLowerCase();
    const filename = `${address}-report.${extensions[format]}`;
    
    return {
      success: true,
      data,
      filename,
      mimeType: mimeTypes[format]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error exporting report'
    };
  }
}

// Re-export types and utilities
export * from '../types/development-analysis';
export { generateKPIs, groupKPIsByCategory, kpisToCSV } from '../lib/kpi-engine/kpi-calculator';
export { generateAllScenarios, MARKET_PRESETS } from '../lib/financial-calculator/financial-calculator';
export { formatReportSummary } from '../lib/report-generator/report-generator';
