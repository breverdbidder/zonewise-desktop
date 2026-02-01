/**
 * ZoneWise V2 - PDF Export Service
 * Professional PDF generation for development analysis reports
 * 
 * Uses jsPDF library for browser/Node.js compatibility
 * Alternative: reportlab for Python environments
 */

import type { DevelopmentAnalysisReport, KPI, DevelopmentScenario } from '../../types/development-analysis';

// Colors matching ZoneWise brand (RGB format for jsPDF)
const COLORS = {
  primary: [30, 58, 95],        // #1E3A5F Navy
  secondary: [44, 82, 130],     // #2C5282 Blue
  accent: [56, 161, 105],       // #38A169 Green
  warning: [214, 158, 46],      // #D69E2E Yellow
  danger: [229, 62, 62],        // #E53E3E Red
  lightGray: [247, 250, 252],   // #F7FAFC
  mediumGray: [226, 232, 240],  // #E2E8F0
  darkGray: [74, 85, 104],      // #4A5568
  white: [255, 255, 255],
  black: [0, 0, 0]
};

// Page dimensions (US Letter in points: 612 x 792)
const PAGE = {
  width: 612,
  height: 792,
  marginLeft: 50,
  marginRight: 50,
  marginTop: 60,
  marginBottom: 60
};

const CONTENT_WIDTH = PAGE.width - PAGE.marginLeft - PAGE.marginRight;

// Formatting helpers
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function formatCurrency(num: number): string {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

/**
 * Generate PDF using jsPDF (for browser/Node.js)
 * This provides the PDF generation logic that works with jsPDF
 */
export function generatePDFContent(report: DevelopmentAnalysisReport): PDFDocumentStructure {
  const pages: PDFPage[] = [];
  
  // Page 1: Title Page
  pages.push(createTitlePage(report));
  
  // Page 2: Executive Summary
  pages.push(createExecutiveSummaryPage(report));
  
  // Page 3: Property Overview
  pages.push(createPropertyOverviewPage(report));
  
  // Page 4+: KPI Analysis (may span multiple pages)
  pages.push(...createKPIPages(report));
  
  // Scenarios Page
  pages.push(createScenariosPage(report));
  
  // Financial Analysis Page
  pages.push(createFinancialPage(report));
  
  return {
    metadata: {
      title: `Development Analysis - ${report.property.address}`,
      author: 'ZoneWise V2',
      subject: 'Development Feasibility Analysis',
      creator: 'ZoneWise V2 by Everest Capital USA'
    },
    pages
  };
}

interface PDFDocumentStructure {
  metadata: {
    title: string;
    author: string;
    subject: string;
    creator: string;
  };
  pages: PDFPage[];
}

interface PDFPage {
  elements: PDFElement[];
}

type PDFElement = 
  | { type: 'text'; x: number; y: number; text: string; fontSize: number; fontStyle?: 'normal' | 'bold' | 'italic'; color?: number[]; align?: 'left' | 'center' | 'right' }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; color?: number[]; width?: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; fill?: number[]; stroke?: number[] }
  | { type: 'table'; x: number; y: number; headers: string[]; rows: string[][]; columnWidths: number[]; headerColor?: number[]; }

function createTitlePage(report: DevelopmentAnalysisReport): PDFPage {
  return {
    elements: [
      // Background header bar
      { type: 'rect', x: 0, y: 0, width: PAGE.width, height: 200, fill: COLORS.primary },
      
      // Title
      { type: 'text', x: PAGE.width / 2, y: 100, text: 'DEVELOPMENT ANALYSIS REPORT', fontSize: 24, fontStyle: 'bold', color: COLORS.white, align: 'center' },
      
      // Address
      { type: 'text', x: PAGE.width / 2, y: 280, text: report.property.address, fontSize: 28, fontStyle: 'bold', color: COLORS.primary, align: 'center' },
      { type: 'text', x: PAGE.width / 2, y: 310, text: `${report.property.city}, ${report.property.state} ${report.property.zipCode || ''}`, fontSize: 16, color: COLORS.darkGray, align: 'center' },
      
      // Subtitle
      { type: 'text', x: PAGE.width / 2, y: 380, text: '63+ KPIs | 3 Development Scenarios | Financial Analysis', fontSize: 12, fontStyle: 'italic', color: COLORS.secondary, align: 'center' },
      
      // Decorative line
      { type: 'line', x1: 150, y1: 420, x2: PAGE.width - 150, y2: 420, color: COLORS.accent, width: 2 },
      
      // Key metrics preview
      { type: 'text', x: PAGE.width / 2, y: 480, text: 'KEY METRICS', fontSize: 14, fontStyle: 'bold', color: COLORS.primary, align: 'center' },
      
      { type: 'text', x: 150, y: 520, text: 'Max Building Area:', fontSize: 11, color: COLORS.darkGray },
      { type: 'text', x: 300, y: 520, text: formatNumber(report.developmentCapacity.maxBuildingArea) + ' ft²', fontSize: 11, fontStyle: 'bold', color: COLORS.primary },
      
      { type: 'text', x: 150, y: 545, text: 'Unused Rights:', fontSize: 11, color: COLORS.darkGray },
      { type: 'text', x: 300, y: 545, text: formatNumber(report.developmentCapacity.unusedDevelopmentRights) + ' ft²', fontSize: 11, fontStyle: 'bold', color: COLORS.accent },
      
      { type: 'text', x: 350, y: 520, text: 'FAR Utilization:', fontSize: 11, color: COLORS.darkGray },
      { type: 'text', x: 480, y: 520, text: formatPercent(report.developmentCapacity.farUtilizationRate), fontSize: 11, fontStyle: 'bold', color: COLORS.primary },
      
      { type: 'text', x: 350, y: 545, text: 'Max Stories:', fontSize: 11, color: COLORS.darkGray },
      { type: 'text', x: 480, y: 545, text: String(report.developmentCapacity.maxBuildingHeightStories), fontSize: 11, fontStyle: 'bold', color: COLORS.primary },
      
      // Footer
      { type: 'text', x: PAGE.width / 2, y: 700, text: `Generated: ${new Date(report.generatedAt).toLocaleDateString()}`, fontSize: 10, color: COLORS.darkGray, align: 'center' },
      { type: 'text', x: PAGE.width / 2, y: 720, text: 'Powered by ZoneWise V2 | © 2026 Everest Capital USA', fontSize: 10, color: COLORS.accent, align: 'center' }
    ]
  };
}

function createExecutiveSummaryPage(report: DevelopmentAnalysisReport): PDFPage {
  const elements: PDFElement[] = [
    // Header
    { type: 'rect', x: 0, y: 0, width: PAGE.width, height: 50, fill: COLORS.primary },
    { type: 'text', x: PAGE.marginLeft, y: 32, text: 'Executive Summary', fontSize: 18, fontStyle: 'bold', color: COLORS.white },
    
    // Property Snapshot section
    { type: 'text', x: PAGE.marginLeft, y: 80, text: 'Property Snapshot', fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    
    // Snapshot table
    {
      type: 'table',
      x: PAGE.marginLeft,
      y: 100,
      headers: ['Attribute', 'Current', 'Maximum', 'Opportunity'],
      rows: [
        ['Building Area', formatNumber(report.site.lotAreaSqFt * (report.developmentCapacity.currentFARUtilization / 100)) + ' ft²', formatNumber(report.developmentCapacity.maxBuildingArea) + ' ft²', '+' + formatNumber(report.developmentCapacity.unusedDevelopmentRights) + ' ft²'],
        ['FAR', formatPercent(report.developmentCapacity.farUtilizationRate), String(report.zoning.maxFAR), formatPercent(report.financialOpportunity.untappedDevelopmentPotential) + ' untapped'],
        ['Residential', 'N/A', formatNumber(report.developmentCapacity.maxResidentialUnits || 0) + ' units', formatNumber(report.financialOpportunity.residentialPotentialUnits || 0) + ' potential'],
        ['Hotel', 'N/A', formatNumber(report.developmentCapacity.maxLodgingRooms || 0) + ' rooms', formatNumber(report.financialOpportunity.hotelPotentialRooms || 0) + ' potential']
      ],
      columnWidths: [120, 120, 120, 120],
      headerColor: COLORS.primary
    }
  ];
  
  let yPos = 240;
  
  // Key Findings
  elements.push({ type: 'text', x: PAGE.marginLeft, y: yPos, text: 'Key Findings', fontSize: 14, fontStyle: 'bold', color: COLORS.primary });
  yPos += 20;
  
  report.executiveSummary.keyFindings.slice(0, 4).forEach(finding => {
    elements.push({ type: 'text', x: PAGE.marginLeft + 10, y: yPos, text: '• ' + finding, fontSize: 10, color: COLORS.black });
    yPos += 18;
  });
  
  yPos += 10;
  
  // Opportunities
  elements.push({ type: 'text', x: PAGE.marginLeft, y: yPos, text: 'Opportunities', fontSize: 14, fontStyle: 'bold', color: COLORS.accent });
  yPos += 20;
  
  report.executiveSummary.opportunities.slice(0, 3).forEach(opp => {
    elements.push({ type: 'text', x: PAGE.marginLeft + 10, y: yPos, text: '• ' + opp, fontSize: 10, color: COLORS.black });
    yPos += 18;
  });
  
  yPos += 10;
  
  // Challenges
  elements.push({ type: 'text', x: PAGE.marginLeft, y: yPos, text: 'Challenges', fontSize: 14, fontStyle: 'bold', color: COLORS.warning });
  yPos += 20;
  
  report.executiveSummary.challenges.slice(0, 3).forEach(challenge => {
    elements.push({ type: 'text', x: PAGE.marginLeft + 10, y: yPos, text: '• ' + challenge, fontSize: 10, color: COLORS.black });
    yPos += 18;
  });
  
  yPos += 20;
  
  // Recommendation box
  elements.push(
    { type: 'rect', x: PAGE.marginLeft, y: yPos, width: CONTENT_WIDTH, height: 60, fill: [230, 255, 250] },
    { type: 'text', x: PAGE.marginLeft + 10, y: yPos + 15, text: 'Recommendation', fontSize: 12, fontStyle: 'bold', color: COLORS.accent },
    { type: 'text', x: PAGE.marginLeft + 10, y: yPos + 35, text: report.executiveSummary.recommendation.substring(0, 100) + '...', fontSize: 10, color: COLORS.black }
  );
  
  // Page number
  elements.push({ type: 'text', x: PAGE.width / 2, y: PAGE.height - 30, text: 'Page 2', fontSize: 9, color: COLORS.darkGray, align: 'center' });
  
  return { elements };
}

function createPropertyOverviewPage(report: DevelopmentAnalysisReport): PDFPage {
  const elements: PDFElement[] = [
    // Header
    { type: 'rect', x: 0, y: 0, width: PAGE.width, height: 50, fill: COLORS.primary },
    { type: 'text', x: PAGE.marginLeft, y: 32, text: 'Property Overview', fontSize: 18, fontStyle: 'bold', color: COLORS.white },
    
    // Site Information
    { type: 'text', x: PAGE.marginLeft, y: 80, text: 'Site Information', fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    {
      type: 'table',
      x: PAGE.marginLeft,
      y: 100,
      headers: ['Property', 'Value'],
      rows: [
        ['Address', report.property.address],
        ['City/State', `${report.property.city}, ${report.property.state} ${report.property.zipCode || ''}`],
        ['Parcel ID', report.property.parcelId || 'N/A'],
        ['County', report.property.county || 'N/A'],
        ['Lot Area', `${report.site.lotAreaAcres.toFixed(2)} acres (${formatNumber(report.site.lotAreaSqFt)} ft²)`],
        ['Lot Type', report.site.lotType || 'N/A'],
        ['Frontage', report.site.frontageLength ? `${formatNumber(report.site.frontageLength)} ft` : 'N/A'],
        ['Current Use', report.site.currentLandUse || 'N/A']
      ],
      columnWidths: [150, 350],
      headerColor: COLORS.secondary
    },
    
    // Zoning Profile
    { type: 'text', x: PAGE.marginLeft, y: 320, text: 'Zoning Profile', fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    {
      type: 'table',
      x: PAGE.marginLeft,
      y: 340,
      headers: ['Zoning', 'Value'],
      rows: [
        ['Code', report.zoning.zoningCode],
        ['District', report.zoning.zoningDistrict],
        ['Max FAR', String(report.zoning.maxFAR)],
        ['Max Stories', String(report.zoning.maxStories || 'N/A')],
        ['Max Height', report.zoning.maxHeightFeet ? `${formatNumber(report.zoning.maxHeightFeet)} ft` : 'N/A'],
        ['Max Lot Coverage', report.zoning.maxLotCoverage ? formatPercent(report.zoning.maxLotCoverage) : 'N/A'],
        ['Historic District', report.zoning.historicDistrict || 'None'],
        ['TOD Status', report.zoning.todStatus || 'N/A'],
        ['Live Local Act', report.zoning.liveLocalApplicability ? 'Applicable' : 'Not Applicable']
      ],
      columnWidths: [150, 350],
      headerColor: COLORS.secondary
    },
    
    // Page number
    { type: 'text', x: PAGE.width / 2, y: PAGE.height - 30, text: 'Page 3', fontSize: 9, color: COLORS.darkGray, align: 'center' }
  ];
  
  return { elements };
}

function createKPIPages(report: DevelopmentAnalysisReport): PDFPage[] {
  const pages: PDFPage[] = [];
  let pageNum = 4;
  
  // Create a summary KPI page
  const summaryElements: PDFElement[] = [
    { type: 'rect', x: 0, y: 0, width: PAGE.width, height: 50, fill: COLORS.primary },
    { type: 'text', x: PAGE.marginLeft, y: 32, text: 'KPI Analysis Summary', fontSize: 18, fontStyle: 'bold', color: COLORS.white },
    { type: 'text', x: PAGE.marginLeft, y: 80, text: `${report.kpis.length} KPIs analyzed across ${report.kpisByCategory.length} categories`, fontSize: 12, fontStyle: 'italic', color: COLORS.darkGray }
  ];
  
  let yPos = 110;
  
  // Show category summaries
  report.kpisByCategory.forEach((category, idx) => {
    if (yPos > 700) return; // Don't overflow
    
    summaryElements.push(
      { type: 'text', x: PAGE.marginLeft, y: yPos, text: `${category.label}`, fontSize: 12, fontStyle: 'bold', color: COLORS.secondary },
      { type: 'text', x: PAGE.marginLeft + 250, y: yPos, text: `${category.kpiCount} KPIs`, fontSize: 11, color: COLORS.darkGray }
    );
    
    // Show top 3 KPIs from each category
    category.kpis.slice(0, 3).forEach((kpi, kpiIdx) => {
      yPos += 18;
      if (yPos > 700) return;
      summaryElements.push(
        { type: 'text', x: PAGE.marginLeft + 20, y: yPos, text: `• ${kpi.name}: `, fontSize: 10, color: COLORS.black },
        { type: 'text', x: PAGE.marginLeft + 180, y: yPos, text: String(kpi.value || 'N/A') + (kpi.unit ? ` ${kpi.unit}` : ''), fontSize: 10, fontStyle: 'bold', color: COLORS.primary }
      );
    });
    
    yPos += 30;
  });
  
  summaryElements.push({ type: 'text', x: PAGE.width / 2, y: PAGE.height - 30, text: `Page ${pageNum}`, fontSize: 9, color: COLORS.darkGray, align: 'center' });
  pages.push({ elements: summaryElements });
  
  return pages;
}

function createScenariosPage(report: DevelopmentAnalysisReport): PDFPage {
  const elements: PDFElement[] = [
    { type: 'rect', x: 0, y: 0, width: PAGE.width, height: 50, fill: COLORS.primary },
    { type: 'text', x: PAGE.marginLeft, y: 32, text: 'Development Scenarios', fontSize: 18, fontStyle: 'bold', color: COLORS.white },
    
    // Comparison table
    { type: 'text', x: PAGE.marginLeft, y: 80, text: 'Scenario Comparison', fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    {
      type: 'table',
      x: PAGE.marginLeft,
      y: 100,
      headers: ['Metric', ...report.scenarios.map(s => s.isRecommended ? s.name + ' ★' : s.name)],
      rows: [
        ['Total Area', ...report.scenarios.map(s => formatNumber(s.totalSqFt) + ' ft²')],
        ['Stories', ...report.scenarios.map(s => String(s.stories))],
        ['Total Cost', ...report.scenarios.map(s => formatCurrency(s.costs.totalCost))],
        ['Asset Value', ...report.scenarios.map(s => formatCurrency(s.projections.totalAssetValue))],
        ['Profit', ...report.scenarios.map(s => formatCurrency(s.projections.developmentProfit))],
        ['IRR', ...report.scenarios.map(s => formatPercent(s.projections.irr))],
        ['Equity Multiple', ...report.scenarios.map(s => `${s.projections.equityMultiple.toFixed(2)}x`)]
      ],
      columnWidths: [100, 130, 130, 130],
      headerColor: COLORS.primary
    }
  ];
  
  let yPos = 320;
  
  // Individual scenario details
  report.scenarios.forEach((scenario, idx) => {
    if (yPos > 650) return;
    
    elements.push(
      { type: 'text', x: PAGE.marginLeft, y: yPos, text: scenario.name + (scenario.isRecommended ? ' ★ RECOMMENDED' : ''), fontSize: 12, fontStyle: 'bold', color: scenario.isRecommended ? COLORS.accent : COLORS.secondary },
      { type: 'text', x: PAGE.marginLeft, y: yPos + 18, text: `Components: ${scenario.components.map(c => c.name).join(', ')}`, fontSize: 9, color: COLORS.darkGray },
      { type: 'text', x: PAGE.marginLeft, y: yPos + 32, text: `Risk: ${scenario.riskLevel} | Demand: ${scenario.marketDemand} | ${scenario.revenueStreams} revenue streams`, fontSize: 9, color: COLORS.darkGray }
    );
    
    yPos += 60;
  });
  
  elements.push({ type: 'text', x: PAGE.width / 2, y: PAGE.height - 30, text: 'Page 5', fontSize: 9, color: COLORS.darkGray, align: 'center' });
  
  return { elements };
}

function createFinancialPage(report: DevelopmentAnalysisReport): PDFPage {
  const recommended = report.recommendedScenario;
  if (!recommended) {
    return { elements: [] };
  }
  
  const elements: PDFElement[] = [
    { type: 'rect', x: 0, y: 0, width: PAGE.width, height: 50, fill: COLORS.primary },
    { type: 'text', x: PAGE.marginLeft, y: 32, text: 'Financial Analysis', fontSize: 18, fontStyle: 'bold', color: COLORS.white },
    { type: 'text', x: PAGE.marginLeft, y: 80, text: `Based on recommended scenario: ${recommended.name}`, fontSize: 12, fontStyle: 'italic', color: COLORS.darkGray },
    
    // Development Costs
    { type: 'text', x: PAGE.marginLeft, y: 110, text: 'Development Costs', fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    {
      type: 'table',
      x: PAGE.marginLeft,
      y: 130,
      headers: ['Cost Category', 'Amount'],
      rows: [
        ['Hard Costs', formatCurrency(recommended.costs.hardCosts)],
        ['Soft Costs', formatCurrency(recommended.costs.softCosts)],
        ['Land Cost', formatCurrency(recommended.costs.landCost)],
        ['Financing Costs', formatCurrency(recommended.costs.financingCosts)],
        ['Contingency', formatCurrency(recommended.costs.contingency)],
        ['TOTAL', formatCurrency(recommended.costs.totalCost)]
      ],
      columnWidths: [200, 200],
      headerColor: COLORS.secondary
    },
    
    // Investment Returns
    { type: 'text', x: PAGE.marginLeft, y: 320, text: 'Investment Returns', fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    {
      type: 'table',
      x: PAGE.marginLeft,
      y: 340,
      headers: ['Metric', 'Value'],
      rows: [
        ['Total Asset Value', formatCurrency(recommended.projections.totalAssetValue)],
        ['Development Profit', formatCurrency(recommended.projections.developmentProfit)],
        ['Return on Investment (ROI)', formatPercent(recommended.projections.roi)],
        ['Internal Rate of Return (IRR)', formatPercent(recommended.projections.irr)],
        ['Equity Multiple', `${recommended.projections.equityMultiple.toFixed(2)}x`],
        ['Cash-on-Cash Return', formatPercent(recommended.projections.cashOnCash)]
      ],
      columnWidths: [250, 150],
      headerColor: COLORS.accent
    },
    
    // Key metrics highlight
    { type: 'rect', x: PAGE.marginLeft, y: 540, width: CONTENT_WIDTH, height: 80, fill: [230, 255, 250] },
    { type: 'text', x: PAGE.width / 2, y: 560, text: 'KEY INVESTMENT METRICS', fontSize: 12, fontStyle: 'bold', color: COLORS.accent, align: 'center' },
    { type: 'text', x: 120, y: 590, text: `IRR: ${formatPercent(recommended.projections.irr)}`, fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    { type: 'text', x: 270, y: 590, text: `ROI: ${formatPercent(recommended.projections.roi)}`, fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    { type: 'text', x: 420, y: 590, text: `Multiple: ${recommended.projections.equityMultiple.toFixed(2)}x`, fontSize: 14, fontStyle: 'bold', color: COLORS.primary },
    
    // Page number
    { type: 'text', x: PAGE.width / 2, y: PAGE.height - 30, text: 'Page 6', fontSize: 9, color: COLORS.darkGray, align: 'center' }
  ];
  
  return { elements };
}

/**
 * Generate PDF using Node.js (server-side)
 * This uses jsPDF or PDFKit for actual PDF generation
 */
export async function generatePDFBuffer(report: DevelopmentAnalysisReport): Promise<Buffer> {
  // This is a stub - actual implementation would use jsPDF or PDFKit
  // For browser: use jsPDF
  // For Node.js: use PDFKit or jsPDF with node-canvas
  
  const structure = generatePDFContent(report);
  
  // Return placeholder - actual implementation requires jsPDF/PDFKit runtime
  console.log(`PDF structure generated: ${structure.pages.length} pages`);
  
  // In production, this would use:
  // - jsPDF for browser
  // - PDFKit or Puppeteer for Node.js
  
  throw new Error('PDF generation requires jsPDF or PDFKit runtime. Use generatePDFContent() for structure.');
}

export { generatePDFContent, type PDFDocumentStructure, type PDFPage, type PDFElement };
