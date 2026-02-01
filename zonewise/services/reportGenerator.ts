/**
 * Report Generator Service
 * Generates comprehensive property zoning reports in multiple formats
 * Surpasses PropZone with AI-enhanced analysis and multiple export options
 */

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import { Readable } from 'stream';
import { storagePut } from '../storage';
import { calculateKPIs, type PropertyData, type KPIResult } from './kpiCalculator';

export interface ReportOptions {
  reportType: 'executive_summary' | 'full_analysis' | 'development_scenarios' | 'financial_analysis' | 'kpi_dashboard' | 'comparison';
  propertyData: PropertyData;
  includeAerialImage?: boolean;
  include3DVisualization?: boolean;
  includeSunShadowAnalysis?: boolean;
  includeFinancialAnalysis?: boolean;
  includeDevelopmentScenarios?: boolean;
  customBranding?: {
    logo?: string;
    companyName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

export interface GeneratedReport {
  pdfUrl?: string;
  csvUrl?: string;
  excelUrl?: string;
  jsonUrl?: string;
  totalPages?: number;
  fileSize?: number;
  generationTimeMs: number;
}

export class ReportGenerator {
  private options: ReportOptions;
  private kpis: KPIResult[];
  private startTime: number;

  constructor(options: ReportOptions) {
    this.options = options;
    this.kpis = calculateKPIs(options.propertyData);
    this.startTime = Date.now();
  }

  /**
   * Generate all report formats
   */
  async generateAll(): Promise<GeneratedReport> {
    const [pdfUrl, csvUrl, excelUrl, jsonUrl] = await Promise.all([
      this.generatePDF(),
      this.generateCSV(),
      this.generateExcel(),
      this.generateJSON()
    ]);

    return {
      pdfUrl,
      csvUrl,
      excelUrl,
      jsonUrl,
      generationTimeMs: Date.now() - this.startTime
    };
  }

  /**
   * Generate PDF report
   */
  async generatePDF(): Promise<string> {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Property Zoning Report - ${this.options.propertyData.address}`,
        Author: this.options.customBranding?.companyName || 'ZoneWise.AI',
        Subject: 'Property Zoning Analysis',
        Keywords: 'zoning, property, development, analysis'
      }
    });

    // Collect PDF chunks
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Generate content based on report type
    switch (this.options.reportType) {
      case 'executive_summary':
        await this.generateExecutiveSummaryPDF(doc);
        break;
      case 'full_analysis':
        await this.generateFullAnalysisPDF(doc);
        break;
      case 'kpi_dashboard':
        await this.generateKPIDashboardPDF(doc);
        break;
      default:
        await this.generateFullAnalysisPDF(doc);
    }

    // Finalize PDF
    doc.end();

    // Wait for PDF to finish
    await new Promise<void>((resolve) => {
      doc.on('end', () => resolve());
    });

    // Combine chunks and upload
    const pdfBuffer = Buffer.concat(chunks);
    const filename = `report-${Date.now()}.pdf`;
    const { url } = await storagePut(`reports/${filename}`, pdfBuffer, 'application/pdf');

    return url;
  }

  /**
   * Generate Executive Summary PDF (2 pages)
   */
  private async generateExecutiveSummaryPDF(doc: PDFKit.PDFDocument) {
    const { propertyData, customBranding } = this.options;
    const primaryColor = customBranding?.primaryColor || '#2563eb';

    // Page 1: Cover & Property Snapshot
    this.addPDFHeader(doc, 'Property Zoning Report');
    
    doc.fontSize(24)
       .fillColor(primaryColor)
       .text('Property Zoning Report', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(16)
       .fillColor('#000000')
       .text(propertyData.address || 'Property Address', { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(12)
       .fillColor('#666666')
       .text(`Report Prepared On: ${new Date().toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       })}`, { align: 'center' });

    doc.moveDown(3);

    // Property Snapshot Table
    doc.fontSize(14)
       .fillColor('#000000')
       .text('Property Snapshot', { underline: true });
    
    doc.moveDown();

    const snapshotData = [
      ['Parcel ID', propertyData.parcelId || 'N/A'],
      ['Lot Area', `${propertyData.lotAreaAcres?.toFixed(2) || 'N/A'} acres (${propertyData.lotAreaSqFt?.toLocaleString() || 'N/A'} ft²)`],
      ['Zoning District', propertyData.zoningDistrict || 'N/A'],
      ['Maximum FAR', propertyData.far?.toFixed(2) || 'N/A'],
      ['Maximum Stories', propertyData.maxStories?.toString() || 'N/A'],
      ['Existing Building', `${propertyData.existingBuildingArea?.toLocaleString() || 'N/A'} ft²`]
    ];

    this.addPDFTable(doc, snapshotData);

    doc.moveDown(2);

    // Key Findings
    doc.fontSize(14)
       .fillColor('#000000')
       .text('Key Findings', { underline: true });
    
    doc.moveDown();
    doc.fontSize(10);

    const maxBuildingArea = propertyData.far && propertyData.lotAreaSqFt 
      ? propertyData.far * propertyData.lotAreaSqFt 
      : 0;
    const unusedRights = maxBuildingArea - (propertyData.existingBuildingArea || 0);
    const utilizationRate = propertyData.existingBuildingArea && maxBuildingArea
      ? (propertyData.existingBuildingArea / maxBuildingArea) * 100
      : 0;

    doc.list([
      `Maximum Development Capacity: ${maxBuildingArea.toLocaleString()} ft²`,
      `Unused Development Rights: ${unusedRights.toLocaleString()} ft² (${(100 - utilizationRate).toFixed(1)}% untapped)`,
      `Residential Potential: ${propertyData.residentialDensity && propertyData.lotAreaAcres ? Math.floor(propertyData.residentialDensity * propertyData.lotAreaAcres) : 0} units`,
      `Lodging Potential: ${propertyData.lodgingDensity && propertyData.lotAreaAcres ? Math.floor(propertyData.lodgingDensity * propertyData.lotAreaAcres) : 0} rooms`,
      `Vertical Expansion: Up to ${propertyData.maxStories || 0} stories available`
    ]);

    // Page 2: Development Opportunity & Next Steps
    doc.addPage();
    this.addPDFHeader(doc, 'Development Opportunity Analysis');

    doc.fontSize(14)
       .fillColor('#000000')
       .text('Financial Opportunity', { underline: true });
    
    doc.moveDown();

    const opportunityData = [
      ['Metric', 'Value'],
      ['Development Rights Utilization', `${utilizationRate.toFixed(1)}%`],
      ['Untapped Potential', `${(100 - utilizationRate).toFixed(1)}%`],
      ['Additional Buildable Area', `${unusedRights.toLocaleString()} ft²`],
      ['Estimated Development Value', '$' + (unusedRights * 350).toLocaleString()]
    ];

    this.addPDFTable(doc, opportunityData);

    doc.moveDown(2);

    // Next Steps
    doc.fontSize(14)
       .fillColor('#000000')
       .text('Recommended Next Steps', { underline: true });
    
    doc.moveDown();
    doc.fontSize(10);

    doc.list([
      'Conduct detailed feasibility study',
      'Engage architect for schematic design',
      'Pre-application meeting with planning department',
      'Assess historic preservation requirements',
      'Evaluate financing options and capital stack',
      'Conduct market analysis for optimal use mix'
    ]);

    this.addPDFFooter(doc);
  }

  /**
   * Generate Full Analysis PDF (15-20 pages)
   */
  private async generateFullAnalysisPDF(doc: PDFKit.PDFDocument) {
    const { propertyData, customBranding } = this.options;
    const primaryColor = customBranding?.primaryColor || '#2563eb';

    // Cover Page
    this.addPDFHeader(doc, 'Comprehensive Property Analysis');
    
    doc.fontSize(28)
       .fillColor(primaryColor)
       .text('Property Zoning Report', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(18)
       .fillColor('#000000')
       .text(propertyData.address || 'Property Address', { align: 'center' });
    
    doc.moveDown(4);
    doc.fontSize(12)
       .fillColor('#666666')
       .text(`Report Prepared On: ${new Date().toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       })}`, { align: 'center' });

    // Table of Contents
    doc.addPage();
    doc.fontSize(18)
       .fillColor('#000000')
       .text('Table of Contents', { underline: true });
    
    doc.moveDown();
    doc.fontSize(11);

    const tocItems = [
      '1. Executive Summary',
      '2. Property Overview',
      '3. Lot Information',
      '4. Existing Property Details',
      '5. Zoning Information',
      '6. Development Capacity',
      '7. Residential Capacity',
      '8. Lodging Capacity',
      '9. Commercial/Office Capacity',
      '10. Setback Requirements',
      '11. Allowed Uses',
      '12. Financial Opportunity Analysis',
      '13. AI-Enhanced Analysis',
      '14. Appendices'
    ];

    tocItems.forEach((item, index) => {
      doc.text(item);
      if (index < tocItems.length - 1) doc.moveDown(0.5);
    });

    // Section 3: Lot Information
    doc.addPage();
    this.addPDFSectionHeader(doc, 'Lot Information');

    const lotKPIs = this.kpis.filter(kpi => kpi.category === 'site_parcel_metrics');
    this.addPDFKPISection(doc, lotKPIs);

    // Section 4: Existing Property Details
    doc.addPage();
    this.addPDFSectionHeader(doc, 'Existing Property Details');

    const existingKPIs = this.kpis.filter(kpi => kpi.category === 'existing_building_metrics');
    this.addPDFKPISection(doc, existingKPIs);

    // Section 5: Zoning Information
    doc.addPage();
    this.addPDFSectionHeader(doc, 'Zoning Information');

    const zoningKPIs = this.kpis.filter(kpi => kpi.category === 'zoning_regulatory');
    this.addPDFKPISection(doc, zoningKPIs);

    // Section 6: Development Capacity
    doc.addPage();
    this.addPDFSectionHeader(doc, 'Development Capacity');

    const devCapacityKPIs = this.kpis.filter(kpi => kpi.category === 'development_capacity');
    this.addPDFKPISection(doc, devCapacityKPIs);

    // Section 7-11: Other categories
    const categories = [
      { name: 'Residential Capacity', key: 'residential_capacity' },
      { name: 'Lodging Capacity', key: 'lodging_capacity' },
      { name: 'Commercial/Office Capacity', key: 'commercial_office_capacity' },
      { name: 'Setback Requirements', key: 'setback_requirements' },
      { name: 'Allowed Uses', key: 'allowed_uses' }
    ];

    categories.forEach(category => {
      doc.addPage();
      this.addPDFSectionHeader(doc, category.name);
      const kpis = this.kpis.filter(kpi => kpi.category === category.key);
      this.addPDFKPISection(doc, kpis);
    });

    // Section 12: Financial Opportunity
    doc.addPage();
    this.addPDFSectionHeader(doc, 'Financial Opportunity Analysis');

    const financialKPIs = this.kpis.filter(kpi => kpi.category === 'financial_opportunity');
    this.addPDFKPISection(doc, financialKPIs);

    // Section 13: AI-Enhanced Analysis
    doc.addPage();
    this.addPDFSectionHeader(doc, 'AI-Enhanced Analysis');
    
    doc.fontSize(10)
       .fillColor('#666666')
       .text('ZoneWise Exclusive: Advanced AI-powered insights', { italics: true });
    
    doc.moveDown();

    const aiKPIs = this.kpis.filter(kpi => kpi.category === 'ai_enhanced_metrics');
    this.addPDFKPISection(doc, aiKPIs);

    this.addPDFFooter(doc);
  }

  /**
   * Generate KPI Dashboard PDF
   */
  private async generateKPIDashboardPDF(doc: PDFKit.PDFDocument) {
    const { propertyData } = this.options;

    this.addPDFHeader(doc, 'KPI Dashboard');
    
    doc.fontSize(20)
       .fillColor('#000000')
       .text('Property KPI Dashboard', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(14)
       .text(propertyData.address || 'Property Address', { align: 'center' });
    
    doc.moveDown(2);

    // Group KPIs by category
    const categories = [
      'site_parcel_metrics',
      'existing_building_metrics',
      'zoning_regulatory',
      'development_capacity',
      'residential_capacity',
      'lodging_capacity',
      'commercial_office_capacity',
      'setback_requirements',
      'financial_opportunity',
      'ai_enhanced_metrics'
    ];

    categories.forEach((category, index) => {
      if (index > 0 && index % 2 === 0) {
        doc.addPage();
        this.addPDFHeader(doc, 'KPI Dashboard (continued)');
      }

      const categoryKPIs = this.kpis.filter(kpi => kpi.category === category);
      if (categoryKPIs.length > 0) {
        const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        doc.fontSize(12)
           .fillColor('#2563eb')
           .text(categoryName, { underline: true });
        
        doc.moveDown(0.5);
        
        categoryKPIs.slice(0, 5).forEach(kpi => {
          const value = kpi.valueText || kpi.valueNumeric || kpi.valueBoolean?.toString() || 'N/A';
          const unit = kpi.unit ? ` ${kpi.unit}` : '';
          
          doc.fontSize(10)
             .fillColor('#000000')
             .text(`${kpi.kpiName}: ${value}${unit}`);
        });
        
        doc.moveDown();
      }
    });

    this.addPDFFooter(doc);
  }

  /**
   * Generate CSV export
   */
  async generateCSV(): Promise<string> {
    const records = this.kpis.map(kpi => ({
      'KPI Number': kpi.kpiNumber,
      'Category': kpi.category.replace(/_/g, ' '),
      'KPI Name': kpi.kpiName,
      'Value': kpi.valueText || kpi.valueNumeric || kpi.valueBoolean || JSON.stringify(kpi.valueJson),
      'Unit': kpi.unit || '',
      'Source': kpi.source,
      'Calculation Method': kpi.calculationMethod || '',
      'Confidence': kpi.confidence || 100
    }));

    const csv = stringify(records, {
      header: true,
      columns: ['KPI Number', 'Category', 'KPI Name', 'Value', 'Unit', 'Source', 'Calculation Method', 'Confidence']
    });

    const filename = `report-${Date.now()}.csv`;
    const { url } = await storagePut(`reports/${filename}`, Buffer.from(csv), 'text/csv');

    return url;
  }

  /**
   * Generate Excel export with multiple sheets
   */
  async generateExcel(): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.options.customBranding?.companyName || 'ZoneWise.AI';
    workbook.created = new Date();

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Property Information', key: 'label', width: 30 },
      { header: 'Value', key: 'value', width: 40 }
    ];

    const { propertyData } = this.options;
    summarySheet.addRows([
      { label: 'Address', value: propertyData.address || 'N/A' },
      { label: 'Parcel ID', value: propertyData.parcelId || 'N/A' },
      { label: 'Lot Area (Acres)', value: propertyData.lotAreaAcres || 'N/A' },
      { label: 'Zoning District', value: propertyData.zoningDistrict || 'N/A' },
      { label: 'Maximum FAR', value: propertyData.far || 'N/A' },
      { label: 'Maximum Stories', value: propertyData.maxStories || 'N/A' }
    ]);

    // Sheet 2: All KPIs
    const kpiSheet = workbook.addWorksheet('All KPIs');
    kpiSheet.columns = [
      { header: 'KPI #', key: 'number', width: 8 },
      { header: 'Category', key: 'category', width: 25 },
      { header: 'KPI Name', key: 'name', width: 35 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'Source', key: 'source', width: 20 },
      { header: 'Confidence', key: 'confidence', width: 12 }
    ];

    this.kpis.forEach(kpi => {
      kpiSheet.addRow({
        number: kpi.kpiNumber,
        category: kpi.category.replace(/_/g, ' '),
        name: kpi.kpiName,
        value: kpi.valueText || kpi.valueNumeric || kpi.valueBoolean || JSON.stringify(kpi.valueJson),
        unit: kpi.unit || '',
        source: kpi.source,
        confidence: kpi.confidence || 100
      });
    });

    // Sheet 3: Development Capacity
    const devCapSheet = workbook.addWorksheet('Development Capacity');
    const devCapKPIs = this.kpis.filter(kpi => kpi.category === 'development_capacity');
    devCapSheet.columns = [
      { header: 'Metric', key: 'metric', width: 35 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Unit', key: 'unit', width: 10 }
    ];

    devCapKPIs.forEach(kpi => {
      devCapSheet.addRow({
        metric: kpi.kpiName,
        value: kpi.valueText || kpi.valueNumeric || kpi.valueBoolean,
        unit: kpi.unit || ''
      });
    });

    // Sheet 4: Financial Opportunity
    const financialSheet = workbook.addWorksheet('Financial Opportunity');
    const financialKPIs = this.kpis.filter(kpi => kpi.category === 'financial_opportunity');
    financialSheet.columns = [
      { header: 'Metric', key: 'metric', width: 35 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Unit', key: 'unit', width: 10 }
    ];

    financialKPIs.forEach(kpi => {
      financialSheet.addRow({
        metric: kpi.kpiName,
        value: kpi.valueText || kpi.valueNumeric || kpi.valueBoolean,
        unit: kpi.unit || ''
      });
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `report-${Date.now()}.xlsx`;
    const { url } = await storagePut(
      `reports/${filename}`,
      buffer as Buffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    return url;
  }

  /**
   * Generate JSON export
   */
  async generateJSON(): Promise<string> {
    const data = {
      propertyData: this.options.propertyData,
      kpis: this.kpis,
      reportType: this.options.reportType,
      generatedAt: new Date().toISOString(),
      generatedBy: this.options.customBranding?.companyName || 'ZoneWise.AI'
    };

    const json = JSON.stringify(data, null, 2);
    const filename = `report-${Date.now()}.json`;
    const { url } = await storagePut(`reports/${filename}`, Buffer.from(json), 'application/json');

    return url;
  }

  // ========== PDF Helper Methods ==========

  private addPDFHeader(doc: PDFKit.PDFDocument, title: string) {
    const { customBranding } = this.options;
    
    doc.fontSize(10)
       .fillColor('#666666')
       .text(customBranding?.companyName || 'ZoneWise.AI', 50, 30, { align: 'right' });
  }

  private addPDFFooter(doc: PDFKit.PDFDocument) {
    const pageCount = (doc as any).bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8)
         .fillColor('#999999')
         .text(
           `Page ${i + 1} of ${pageCount}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
      
      doc.text(
        'Disclaimer: This report is for informational purposes only and should not be considered legal advice. Please consult with a qualified professional for specific zoning and development guidance.',
        50,
        doc.page.height - 35,
        { align: 'center', width: doc.page.width - 100 }
      );
    }
  }

  private addPDFSectionHeader(doc: PDFKit.PDFDocument, title: string) {
    doc.fontSize(16)
       .fillColor('#2563eb')
       .text(title, { underline: true });
    
    doc.moveDown();
  }

  private addPDFKPISection(doc: PDFKit.PDFDocument, kpis: KPIResult[]) {
    kpis.forEach(kpi => {
      const value = kpi.valueText || kpi.valueNumeric || kpi.valueBoolean?.toString() || JSON.stringify(kpi.valueJson) || 'N/A';
      const unit = kpi.unit ? ` ${kpi.unit}` : '';
      
      doc.fontSize(11)
         .fillColor('#000000')
         .text(`${kpi.kpiName}:`, { continued: true })
         .fillColor('#333333')
         .text(` ${value}${unit}`);
      
      doc.moveDown(0.5);
    });
  }

  private addPDFTable(doc: PDFKit.PDFDocument, data: string[][]) {
    const startX = 50;
    let startY = doc.y;
    const colWidth = (doc.page.width - 100) / 2;
    const rowHeight = 20;

    data.forEach((row, index) => {
      if (index === 0) {
        // Header row
        doc.fontSize(10)
           .fillColor('#2563eb')
           .text(row[0], startX, startY, { width: colWidth })
           .text(row[1], startX + colWidth, startY, { width: colWidth });
      } else {
        // Data rows
        doc.fontSize(10)
           .fillColor('#000000')
           .text(row[0], startX, startY, { width: colWidth })
           .fillColor('#333333')
           .text(row[1], startX + colWidth, startY, { width: colWidth });
      }
      
      startY += rowHeight;
    });

    doc.y = startY + 10;
  }
}

/**
 * Generate report in all formats
 */
export async function generateReport(options: ReportOptions): Promise<GeneratedReport> {
  const generator = new ReportGenerator(options);
  return await generator.generateAll();
}
