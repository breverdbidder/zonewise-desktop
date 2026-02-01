/**
 * ZoneWise V2 - Unified Export Service
 * Multi-format export for development analysis reports
 * 
 * Supports: CSV, JSON, Markdown, GitHub Structure, DOCX, PDF
 */

import type { DevelopmentAnalysisReport, KPI } from '../../types/development-analysis';

// Re-export specialized exporters
export { generateDOCX } from './docx-export';
export { generatePDFContent, type PDFDocumentStructure } from './pdf-export';

// Formatting helpers
function formatNum(num: number): string {
  return num.toLocaleString('en-US');
}

function formatCurrency(num: number): string {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

/**
 * Export report to CSV format (KPIs only)
 */
export function exportToCSV(report: DevelopmentAnalysisReport): string {
  const headers = ['KPI_Number', 'Category', 'KPI_Name', 'Value', 'Unit', 'Source', 'Page_Section', 'Calculation_Method'];
  const rows = [headers.join(',')];
  
  report.kpis.forEach(kpi => {
    const row = [
      kpi.id,
      `"${kpi.category}"`,
      `"${kpi.name}"`,
      kpi.value !== null ? `"${kpi.value}"` : '',
      kpi.unit ? `"${kpi.unit}"` : '',
      kpi.source,
      kpi.pageSection ? `"${kpi.pageSection}"` : '',
      kpi.calculationMethod ? `"${kpi.calculationMethod}"` : ''
    ];
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

/**
 * Export report to JSON format
 */
export function exportToJSON(report: DevelopmentAnalysisReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Export report to Markdown format
 */
export function exportToMarkdown(report: DevelopmentAnalysisReport): string {
  const lines: string[] = [];
  const prop = report.property;
  const dc = report.developmentCapacity;
  const fo = report.financialOpportunity;
  
  // Title
  lines.push(`# Development Analysis Report`);
  lines.push(`## ${prop.address}`);
  lines.push(`### ${prop.city}, ${prop.state} ${prop.zipCode || ''}`);
  lines.push('');
  lines.push(`*Generated: ${new Date(report.generatedAt).toLocaleString()}*`);
  lines.push(`*Version: ${report.version}*`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push('### Property Snapshot');
  lines.push('');
  lines.push('| Attribute | Current | Maximum | Opportunity |');
  lines.push('|-----------|---------|---------|-------------|');
  lines.push(`| Building Area | Existing | ${formatNum(dc.maxBuildingArea)} ft² | +${formatNum(dc.unusedDevelopmentRights)} ft² |`);
  lines.push(`| FAR Utilization | ${dc.farUtilizationRate.toFixed(1)}% | ${report.zoning.maxFAR} | ${fo.untappedDevelopmentPotential.toFixed(1)}% untapped |`);
  lines.push(`| Residential | N/A | ${formatNum(dc.maxResidentialUnits || 0)} units | ${formatNum(fo.residentialPotentialUnits || 0)} potential |`);
  lines.push(`| Hotel | N/A | ${formatNum(dc.maxLodgingRooms || 0)} rooms | ${formatNum(fo.hotelPotentialRooms || 0)} potential |`);
  lines.push('');
  
  // Key Findings
  lines.push('### Key Findings');
  report.executiveSummary.keyFindings.forEach(f => lines.push(`- ${f}`));
  lines.push('');
  
  // Opportunities
  lines.push('### Opportunities');
  report.executiveSummary.opportunities.forEach(o => lines.push(`- ✅ ${o}`));
  lines.push('');
  
  // Challenges
  lines.push('### Challenges');
  report.executiveSummary.challenges.forEach(c => lines.push(`- ⚠️ ${c}`));
  lines.push('');
  
  // Recommendation
  lines.push('### Recommendation');
  lines.push('');
  lines.push(`> ${report.executiveSummary.recommendation}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // KPI Analysis
  lines.push('## KPI Analysis');
  lines.push('');
  lines.push(`*${report.kpis.length} KPIs across ${report.kpisByCategory.length} categories*`);
  lines.push('');
  
  report.kpisByCategory.forEach(cat => {
    lines.push(`### ${cat.label} (${cat.kpiCount} KPIs)`);
    lines.push('');
    lines.push('| # | KPI | Value | Source |');
    lines.push('|---|-----|-------|--------|');
    cat.kpis.forEach(kpi => {
      const val = kpi.value !== null ? `${kpi.value}${kpi.unit ? ' ' + kpi.unit : ''}` : 'N/A';
      lines.push(`| ${kpi.id} | ${kpi.name} | ${val} | ${kpi.source} |`);
    });
    lines.push('');
  });
  
  lines.push('---');
  lines.push('');
  
  // Development Scenarios
  lines.push('## Development Scenarios');
  lines.push('');
  
  // Comparison table
  lines.push('### Scenario Comparison');
  lines.push('');
  const scenarioHeaders = ['Metric', ...report.scenarios.map(s => s.isRecommended ? `**${s.name}** ⭐` : s.name)];
  lines.push(`| ${scenarioHeaders.join(' | ')} |`);
  lines.push(`| ${scenarioHeaders.map(() => '---').join(' | ')} |`);
  lines.push(`| Total Area | ${report.scenarios.map(s => formatNum(s.totalSqFt) + ' ft²').join(' | ')} |`);
  lines.push(`| Stories | ${report.scenarios.map(s => s.stories).join(' | ')} |`);
  lines.push(`| Total Cost | ${report.scenarios.map(s => formatCurrency(s.costs.totalCost)).join(' | ')} |`);
  lines.push(`| Asset Value | ${report.scenarios.map(s => formatCurrency(s.projections.totalAssetValue)).join(' | ')} |`);
  lines.push(`| Profit | ${report.scenarios.map(s => formatCurrency(s.projections.developmentProfit)).join(' | ')} |`);
  lines.push(`| IRR | ${report.scenarios.map(s => s.projections.irr.toFixed(1) + '%').join(' | ')} |`);
  lines.push(`| Equity Multiple | ${report.scenarios.map(s => s.projections.equityMultiple.toFixed(2) + 'x').join(' | ')} |`);
  lines.push('');
  
  // Individual scenarios
  report.scenarios.forEach(scenario => {
    const rec = scenario.isRecommended ? ' ⭐ RECOMMENDED' : '';
    lines.push(`### ${scenario.name}${rec}`);
    lines.push('');
    lines.push(`*${scenario.description}*`);
    lines.push('');
    lines.push('**Components:**');
    scenario.components.forEach(c => {
      const units = c.units ? ` (${formatNum(c.units)} units)` : '';
      lines.push(`- ${c.name}: ${formatNum(c.area)} ft²${units} (${c.percentage.toFixed(1)}%)`);
    });
    lines.push('');
    lines.push('**Financials:**');
    lines.push(`- Development Cost: ${formatCurrency(scenario.costs.totalCost)}`);
    lines.push(`- Asset Value: ${formatCurrency(scenario.projections.totalAssetValue)}`);
    lines.push(`- Profit: ${formatCurrency(scenario.projections.developmentProfit)}`);
    lines.push(`- IRR: ${scenario.projections.irr.toFixed(1)}% | ROI: ${scenario.projections.roi.toFixed(1)}%`);
    lines.push(`- Equity Multiple: ${scenario.projections.equityMultiple.toFixed(2)}x`);
    lines.push('');
    lines.push(`**Assessment:** Risk: ${scenario.riskLevel} | Demand: ${scenario.marketDemand} | Complexity: ${scenario.managementComplexity}`);
    lines.push('');
  });
  
  lines.push('---');
  lines.push('');
  lines.push('*Generated by ZoneWise V2 | © 2026 Everest Capital USA*');
  
  return lines.join('\n');
}

/**
 * Export report as GitHub repository structure
 */
export function exportToGitHubStructure(report: DevelopmentAnalysisReport): Record<string, string> {
  const files: Record<string, string> = {};
  const address = report.property.address.replace(/\s+/g, '-').toLowerCase();
  
  // Main README
  files['README.md'] = `# ${report.property.address} - Development Analysis

> Generated by ZoneWise V2

## Quick Stats

| Metric | Value |
|--------|-------|
| Max Building Area | ${formatNum(report.developmentCapacity.maxBuildingArea)} ft² |
| Unused Rights | ${formatNum(report.developmentCapacity.unusedDevelopmentRights)} ft² |
| Max Stories | ${report.developmentCapacity.maxBuildingHeightStories} |
| Recommended IRR | ${report.recommendedScenario?.projections.irr.toFixed(1)}% |

## Contents

- [Executive Summary](01-executive-summary/README.md)
- [Property Overview](02-property-overview/README.md)
- [KPI Analysis](03-kpi-analysis/README.md)
- [Development Scenarios](07-development-scenarios/README.md)
- [Financial Analysis](09-financial-analysis/README.md)

## Data

- [Complete KPI List (CSV)](data/complete-kpi-list.csv)
- [Full Report (JSON)](data/report.json)

---
*© 2026 Everest Capital USA / ZoneWise V2*
`;

  // Executive Summary
  files['01-executive-summary/README.md'] = `# Executive Summary

## Key Findings
${report.executiveSummary.keyFindings.map(f => `- ${f}`).join('\n')}

## Opportunities
${report.executiveSummary.opportunities.map(o => `- ✅ ${o}`).join('\n')}

## Challenges
${report.executiveSummary.challenges.map(c => `- ⚠️ ${c}`).join('\n')}

## Recommendation

> ${report.executiveSummary.recommendation}
`;

  // KPI CSV
  files['data/complete-kpi-list.csv'] = exportToCSV(report);
  
  // Full JSON
  files['data/report.json'] = exportToJSON(report);
  
  // .gitignore
  files['.gitignore'] = `node_modules/
.env
*.log
`;

  return files;
}

/**
 * Get supported export formats
 */
export function getSupportedFormats(): string[] {
  return ['csv', 'json', 'markdown', 'github', 'docx', 'pdf'];
}
