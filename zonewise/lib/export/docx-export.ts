/**
 * ZoneWise V2 - DOCX Export Service
 * Professional Word document generation for development analysis reports
 * 
 * Uses docx-js library with proper formatting per skill guidelines
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  PageOrientation,
  LevelFormat,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
  TableOfContents
} from 'docx';

import type { DevelopmentAnalysisReport, KPI, DevelopmentScenario } from '../../types/development-analysis';

// Colors matching ZoneWise brand
const COLORS = {
  primary: '1E3A5F',      // Navy
  secondary: '2C5282',    // Blue
  accent: '38A169',       // Green
  warning: 'D69E2E',      // Yellow
  danger: 'E53E3E',       // Red
  lightGray: 'F7FAFC',
  mediumGray: 'E2E8F0',
  darkGray: '4A5568'
};

// Border styles
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: COLORS.mediumGray };
const tableBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

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
 * Generate DOCX document from development analysis report
 */
export async function generateDOCX(report: DevelopmentAnalysisReport): Promise<Buffer> {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22 } // 11pt default
        }
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 36, bold: true, font: 'Arial', color: COLORS.primary },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 28, bold: true, font: 'Arial', color: COLORS.secondary },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 24, bold: true, font: 'Arial', color: COLORS.darkGray },
          paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 }
        }
      ]
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: 'ZoneWise V2 Development Analysis', font: 'Arial', size: 18, color: COLORS.darkGray })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Page ', font: 'Arial', size: 18 }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18 }),
                new TextRun({ text: ' | © 2026 Everest Capital USA', font: 'Arial', size: 18, color: COLORS.darkGray })
              ]
            })
          ]
        })
      },
      children: [
        // Title Page
        ...createTitleSection(report),
        new Paragraph({ children: [new PageBreak()] }),
        
        // Table of Contents
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Table of Contents')] }),
        new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }),
        new Paragraph({ children: [new PageBreak()] }),
        
        // Executive Summary
        ...createExecutiveSummarySection(report),
        new Paragraph({ children: [new PageBreak()] }),
        
        // Property Overview
        ...createPropertyOverviewSection(report),
        new Paragraph({ children: [new PageBreak()] }),
        
        // KPI Analysis
        ...createKPISection(report),
        new Paragraph({ children: [new PageBreak()] }),
        
        // Development Scenarios
        ...createScenariosSection(report),
        new Paragraph({ children: [new PageBreak()] }),
        
        // Financial Analysis
        ...createFinancialSection(report)
      ]
    }]
  });

  return await Packer.toBuffer(doc);
}

function createTitleSection(report: DevelopmentAnalysisReport): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'DEVELOPMENT ANALYSIS REPORT', font: 'Arial', size: 48, bold: true, color: COLORS.primary })
      ]
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: report.property.address, font: 'Arial', size: 36, bold: true })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `${report.property.city}, ${report.property.state} ${report.property.zipCode || ''}`, font: 'Arial', size: 28, color: COLORS.darkGray })
      ]
    }),
    new Paragraph({ spacing: { before: 800 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '63+ KPIs | 3 Development Scenarios | Financial Analysis', font: 'Arial', size: 22, italics: true, color: COLORS.secondary })
      ]
    }),
    new Paragraph({ spacing: { before: 1200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `Generated: ${new Date(report.generatedAt).toLocaleDateString()}`, font: 'Arial', size: 20, color: COLORS.darkGray })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Powered by ZoneWise V2', font: 'Arial', size: 20, color: COLORS.accent })
      ]
    })
  ];
}

function createExecutiveSummarySection(report: DevelopmentAnalysisReport): Paragraph[] {
  const elements: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Executive Summary')] })
  ];

  // Property Snapshot Table
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Property Snapshot')] }),
    createSnapshotTable(report)
  );

  // Key Findings
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Key Findings')] })
  );
  report.executiveSummary.keyFindings.forEach(finding => {
    elements.push(new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      children: [new TextRun({ text: finding, font: 'Arial', size: 22 })]
    }));
  });

  // Opportunities
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Opportunities')] })
  );
  report.executiveSummary.opportunities.forEach(opp => {
    elements.push(new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      children: [new TextRun({ text: opp, font: 'Arial', size: 22 })]
    }));
  });

  // Challenges
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Challenges')] })
  );
  report.executiveSummary.challenges.forEach(challenge => {
    elements.push(new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      children: [new TextRun({ text: challenge, font: 'Arial', size: 22 })]
    }));
  });

  // Recommendation
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Recommendation')] }),
    new Paragraph({
      shading: { fill: 'E6FFFA', type: ShadingType.CLEAR },
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: report.executiveSummary.recommendation, font: 'Arial', size: 22 })]
    })
  );

  return elements;
}

function createSnapshotTable(report: DevelopmentAnalysisReport): Table {
  const dc = report.developmentCapacity;
  const fo = report.financialOpportunity;
  
  const rows = [
    ['Attribute', 'Current', 'Maximum', 'Opportunity'],
    ['Building Area', formatNumber(report.site.lotAreaSqFt * (dc.currentFARUtilization / 100)) + ' ft²', formatNumber(dc.maxBuildingArea) + ' ft²', `+${formatNumber(dc.unusedDevelopmentRights)} ft²`],
    ['FAR Utilization', formatPercent(dc.farUtilizationRate), `${report.zoning.maxFAR}`, formatPercent(fo.untappedDevelopmentPotential) + ' untapped'],
    ['Stories', report.site.lotAreaSqFt > 0 ? 'Existing' : 'N/A', String(dc.maxBuildingHeightStories), `+${fo.verticalExpansionStories} stories`],
    ['Residential Units', 'N/A', formatNumber(dc.maxResidentialUnits || 0), `${formatNumber(fo.residentialPotentialUnits || 0)} potential`],
    ['Hotel Rooms', 'N/A', formatNumber(dc.maxLodgingRooms || 0), `${formatNumber(fo.hotelPotentialRooms || 0)} potential`]
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2340, 2340, 2340, 2340],
    rows: rows.map((row, i) => new TableRow({
      children: row.map((cell, j) => new TableCell({
        borders: tableBorders,
        width: { size: 2340, type: WidthType.DXA },
        shading: { fill: i === 0 ? COLORS.primary : (i % 2 === 0 ? COLORS.lightGray : 'FFFFFF'), type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text: cell,
            font: 'Arial',
            size: 20,
            bold: i === 0,
            color: i === 0 ? 'FFFFFF' : (j === 3 ? COLORS.accent : '000000')
          })]
        })]
      }))
    }))
  });
}

function createPropertyOverviewSection(report: DevelopmentAnalysisReport): Paragraph[] {
  const elements: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Property Overview')] })
  ];

  // Site Information
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Site Information')] }),
    createInfoTable([
      ['Address', report.property.address],
      ['City/State', `${report.property.city}, ${report.property.state} ${report.property.zipCode || ''}`],
      ['Parcel ID', report.property.parcelId || 'N/A'],
      ['County', report.property.county || 'N/A'],
      ['Lot Area', `${report.site.lotAreaAcres.toFixed(2)} acres (${formatNumber(report.site.lotAreaSqFt)} ft²)`],
      ['Lot Type', report.site.lotType || 'N/A'],
      ['Frontage', report.site.frontageLength ? `${formatNumber(report.site.frontageLength)} ft` : 'N/A'],
      ['Current Use', report.site.currentLandUse || 'N/A']
    ])
  );

  // Zoning Information
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Zoning Profile')] }),
    createInfoTable([
      ['Zoning Code', report.zoning.zoningCode],
      ['District', report.zoning.zoningDistrict],
      ['Max FAR', String(report.zoning.maxFAR)],
      ['Max Stories', String(report.zoning.maxStories || 'N/A')],
      ['Max Height', report.zoning.maxHeightFeet ? `${formatNumber(report.zoning.maxHeightFeet)} ft` : 'N/A'],
      ['Max Lot Coverage', report.zoning.maxLotCoverage ? formatPercent(report.zoning.maxLotCoverage) : 'N/A'],
      ['Historic District', report.zoning.historicDistrict || 'None'],
      ['TOD Status', report.zoning.todStatus || 'N/A'],
      ['Live Local Act', report.zoning.liveLocalApplicability ? 'Applicable' : 'Not Applicable']
    ])
  );

  return elements;
}

function createInfoTable(data: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [3500, 5860],
    rows: data.map((row, i) => new TableRow({
      children: [
        new TableCell({
          borders: tableBorders,
          width: { size: 3500, type: WidthType.DXA },
          shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: row[0], font: 'Arial', size: 20, bold: true })]
          })]
        }),
        new TableCell({
          borders: tableBorders,
          width: { size: 5860, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: row[1], font: 'Arial', size: 20 })]
          })]
        })
      ]
    }))
  });
}

function createKPISection(report: DevelopmentAnalysisReport): Paragraph[] {
  const elements: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('KPI Analysis')] }),
    new Paragraph({
      children: [new TextRun({ text: `${report.kpis.length} KPIs analyzed across ${report.kpisByCategory.length} categories`, font: 'Arial', size: 22, italics: true, color: COLORS.darkGray })]
    })
  ];

  // KPI Summary by Category
  report.kpisByCategory.forEach(category => {
    elements.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`${category.label} (${category.kpiCount} KPIs)`)] })
    );

    const kpiRows: string[][] = [['#', 'KPI', 'Value', 'Source']];
    category.kpis.forEach(kpi => {
      kpiRows.push([
        String(kpi.id),
        kpi.name,
        kpi.value !== null ? String(kpi.value) + (kpi.unit ? ` ${kpi.unit}` : '') : 'N/A',
        kpi.source
      ]);
    });

    elements.push(createKPITable(kpiRows));
  });

  return elements;
}

function createKPITable(rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [700, 4000, 2800, 1860],
    rows: rows.map((row, i) => new TableRow({
      children: [
        new TableCell({
          borders: tableBorders,
          width: { size: 700, type: WidthType.DXA },
          shading: { fill: i === 0 ? COLORS.primary : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: row[0], font: 'Arial', size: 18, bold: i === 0, color: i === 0 ? 'FFFFFF' : '000000' })]
          })]
        }),
        new TableCell({
          borders: tableBorders,
          width: { size: 4000, type: WidthType.DXA },
          shading: { fill: i === 0 ? COLORS.primary : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({
            children: [new TextRun({ text: row[1], font: 'Arial', size: 18, bold: i === 0, color: i === 0 ? 'FFFFFF' : '000000' })]
          })]
        }),
        new TableCell({
          borders: tableBorders,
          width: { size: 2800, type: WidthType.DXA },
          shading: { fill: i === 0 ? COLORS.primary : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({
            children: [new TextRun({ text: row[2], font: 'Arial', size: 18, bold: i === 0, color: i === 0 ? 'FFFFFF' : COLORS.primary })]
          })]
        }),
        new TableCell({
          borders: tableBorders,
          width: { size: 1860, type: WidthType.DXA },
          shading: { fill: i === 0 ? COLORS.primary : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({
            children: [new TextRun({ text: row[3], font: 'Arial', size: 16, bold: i === 0, color: i === 0 ? 'FFFFFF' : COLORS.darkGray })]
          })]
        })
      ]
    }))
  });
}

function createScenariosSection(report: DevelopmentAnalysisReport): Paragraph[] {
  const elements: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Development Scenarios')] })
  ];

  // Scenario Comparison Table
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Scenario Comparison')] }),
    createScenarioComparisonTable(report.scenarios)
  );

  // Individual Scenario Details
  report.scenarios.forEach(scenario => {
    elements.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [
        new TextRun({ text: scenario.name, font: 'Arial' }),
        scenario.isRecommended ? new TextRun({ text: ' ★ RECOMMENDED', font: 'Arial', color: COLORS.accent }) : new TextRun('')
      ]}),
      new Paragraph({
        children: [new TextRun({ text: scenario.description, font: 'Arial', size: 22, italics: true, color: COLORS.darkGray })]
      })
    );

    // Components
    elements.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('Components')] }));
    scenario.components.forEach(comp => {
      const units = comp.units ? ` (${formatNumber(comp.units)} units)` : '';
      elements.push(new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [new TextRun({ text: `${comp.name}: ${formatNumber(comp.area)} ft²${units} (${formatPercent(comp.percentage)})`, font: 'Arial', size: 22 })]
      }));
    });

    // Financials
    elements.push(
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('Financial Summary')] }),
      createInfoTable([
        ['Total Development Cost', formatCurrency(scenario.costs.totalCost)],
        ['Total Asset Value', formatCurrency(scenario.projections.totalAssetValue)],
        ['Development Profit', formatCurrency(scenario.projections.developmentProfit)],
        ['ROI', formatPercent(scenario.projections.roi)],
        ['IRR', formatPercent(scenario.projections.irr)],
        ['Equity Multiple', `${scenario.projections.equityMultiple.toFixed(2)}x`],
        ['Risk Level', scenario.riskLevel],
        ['Market Demand', scenario.marketDemand]
      ])
    );
  });

  return elements;
}

function createScenarioComparisonTable(scenarios: DevelopmentScenario[]): Table {
  const headers = ['Metric', ...scenarios.map(s => s.name)];
  const rows = [
    headers,
    ['Total Area', ...scenarios.map(s => formatNumber(s.totalSqFt) + ' ft²')],
    ['Stories', ...scenarios.map(s => String(s.stories))],
    ['Total Cost', ...scenarios.map(s => formatCurrency(s.costs.totalCost))],
    ['Asset Value', ...scenarios.map(s => formatCurrency(s.projections.totalAssetValue))],
    ['Profit', ...scenarios.map(s => formatCurrency(s.projections.developmentProfit))],
    ['IRR', ...scenarios.map(s => formatPercent(s.projections.irr))],
    ['Equity Multiple', ...scenarios.map(s => `${s.projections.equityMultiple.toFixed(2)}x`)]
  ];

  const colWidth = Math.floor(9360 / (scenarios.length + 1));
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: Array(scenarios.length + 1).fill(colWidth),
    rows: rows.map((row, i) => new TableRow({
      children: row.map((cell, j) => {
        const isRecommended = j > 0 && scenarios[j-1]?.isRecommended;
        return new TableCell({
          borders: tableBorders,
          width: { size: colWidth, type: WidthType.DXA },
          shading: { 
            fill: i === 0 ? COLORS.primary : (isRecommended ? 'E6FFFA' : 'FFFFFF'), 
            type: ShadingType.CLEAR 
          },
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [new Paragraph({
            alignment: j === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
            children: [new TextRun({
              text: cell,
              font: 'Arial',
              size: 18,
              bold: i === 0 || j === 0,
              color: i === 0 ? 'FFFFFF' : (isRecommended ? COLORS.accent : '000000')
            })]
          })]
        });
      })
    }))
  });
}

function createFinancialSection(report: DevelopmentAnalysisReport): Paragraph[] {
  const recommended = report.recommendedScenario;
  if (!recommended) return [];

  const elements: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Financial Analysis')] }),
    new Paragraph({
      children: [new TextRun({ text: `Based on recommended scenario: ${recommended.name}`, font: 'Arial', size: 22, italics: true })]
    })
  ];

  // Development Costs Breakdown
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Development Costs')] }),
    createInfoTable([
      ['Hard Costs', formatCurrency(recommended.costs.hardCosts)],
      ['Soft Costs', formatCurrency(recommended.costs.softCosts)],
      ['Land Cost', formatCurrency(recommended.costs.landCost)],
      ['Financing Costs', formatCurrency(recommended.costs.financingCosts)],
      ['Contingency', formatCurrency(recommended.costs.contingency)],
      ['TOTAL COST', formatCurrency(recommended.costs.totalCost)]
    ])
  );

  // Returns Dashboard
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Investment Returns')] }),
    createInfoTable([
      ['Total Asset Value', formatCurrency(recommended.projections.totalAssetValue)],
      ['Development Profit', formatCurrency(recommended.projections.developmentProfit)],
      ['Return on Investment (ROI)', formatPercent(recommended.projections.roi)],
      ['Internal Rate of Return (IRR)', formatPercent(recommended.projections.irr)],
      ['Equity Multiple', `${recommended.projections.equityMultiple.toFixed(2)}x`],
      ['Cash-on-Cash Return', formatPercent(recommended.projections.cashOnCash)]
    ])
  );

  // Revenue by Component
  elements.push(
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Revenue by Component')] })
  );
  
  const revenueRows: string[][] = [['Component', 'Annual Revenue', 'Cap Rate', 'Asset Value']];
  recommended.components.forEach(comp => {
    revenueRows.push([
      comp.name,
      comp.annualRevenue ? formatCurrency(comp.annualRevenue) : 'N/A',
      comp.capRate ? formatPercent(comp.capRate * 100) : 'N/A',
      comp.assetValue ? formatCurrency(comp.assetValue) : 'N/A'
    ]);
  });
  elements.push(createKPITable(revenueRows));

  return elements;
}

export { generateDOCX };
