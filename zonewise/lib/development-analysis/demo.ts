/**
 * ZoneWise V2 - Development Analysis Report Demo
 * Demonstrates generating a complete 169 E Flagler style report
 */

import {
  generateSampleReport,
  exportReport,
  getReportSummary,
  VERSION,
  MODULE_NAME
} from './index';

async function runDemo() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${MODULE_NAME} v${VERSION}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Generate the sample 169 E Flagler report
  console.log('🏢 Generating development analysis report...\n');
  const report = generateSampleReport();
  
  // Display summary
  console.log('📋 REPORT SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Property: ${report.property.address}`);
  console.log(`City: ${report.property.city}, ${report.property.state} ${report.property.zipCode}`);
  console.log(`Parcel ID: ${report.property.parcelId}`);
  console.log(`Generated: ${new Date(report.createdAt).toLocaleString()}`);
  console.log();
  
  // KPI Summary
  console.log('📊 KPI ANALYSIS');
  console.log('-'.repeat(40));
  console.log(`Total KPIs: ${report.kpis.length}`);
  console.log(`Categories: ${report.kpisByCategory.length}`);
  console.log();
  
  report.kpisByCategory.forEach(cat => {
    console.log(`  ${cat.label}: ${cat.kpiCount} KPIs`);
  });
  console.log();
  
  // Development Capacity
  console.log('🏗️ DEVELOPMENT CAPACITY');
  console.log('-'.repeat(40));
  console.log(`Max Building Area: ${report.developmentCapacity.maxBuildingArea.toLocaleString()} ft²`);
  console.log(`Max Height: ${report.developmentCapacity.maxBuildingHeightStories} stories`);
  console.log(`Unused Rights: ${report.developmentCapacity.unusedDevelopmentRights.toLocaleString()} ft²`);
  console.log(`FAR Utilization: ${report.developmentCapacity.farUtilizationRate.toFixed(1)}%`);
  console.log(`Max Residential: ${report.developmentCapacity.maxResidentialUnits?.toLocaleString()} units`);
  console.log(`Max Hotel: ${report.developmentCapacity.maxLodgingRooms?.toLocaleString()} rooms`);
  console.log();
  
  // Financial Opportunity
  console.log('💰 FINANCIAL OPPORTUNITY');
  console.log('-'.repeat(40));
  console.log(`Untapped Potential: ${report.financialOpportunity.untappedDevelopmentPotential.toFixed(1)}%`);
  console.log(`Additional Buildable: ${report.financialOpportunity.additionalBuildableArea.toLocaleString()} ft²`);
  console.log(`Vertical Expansion: ${report.financialOpportunity.verticalExpansionStories} stories`);
  console.log();
  
  // Scenarios
  console.log('📈 DEVELOPMENT SCENARIOS');
  console.log('-'.repeat(40));
  
  report.scenarios.forEach((scenario, i) => {
    const rec = scenario.isRecommended ? ' ⭐ RECOMMENDED' : '';
    console.log(`\n${i + 1}. ${scenario.name}${rec}`);
    console.log(`   Type: ${scenario.type}`);
    console.log(`   Total: ${scenario.totalSqFt.toLocaleString()} ft² | ${scenario.stories} stories`);
    console.log(`   Components:`);
    scenario.components.forEach(c => {
      const units = c.units ? ` (${c.units} units)` : '';
      console.log(`     - ${c.name}: ${c.area.toLocaleString()} ft²${units}`);
    });
    console.log(`   Financials:`);
    console.log(`     - Dev Cost: $${(scenario.costs.totalCost / 1000000).toFixed(1)}M`);
    console.log(`     - Asset Value: $${(scenario.projections.totalAssetValue / 1000000).toFixed(1)}M`);
    console.log(`     - Profit: $${(scenario.projections.developmentProfit / 1000000).toFixed(1)}M`);
    console.log(`     - ROI: ${scenario.projections.roi.toFixed(1)}% | IRR: ${scenario.projections.irr}%`);
    console.log(`     - Equity Multiple: ${scenario.projections.equityMultiple}x`);
    console.log(`   Risk: ${scenario.riskLevel} | Demand: ${scenario.marketDemand}`);
  });
  console.log();
  
  // Executive Summary
  console.log('📝 EXECUTIVE SUMMARY');
  console.log('-'.repeat(40));
  console.log('\nKey Findings:');
  report.executiveSummary.keyFindings.forEach(f => console.log(`  ✅ ${f}`));
  console.log('\nOpportunities:');
  report.executiveSummary.opportunities.forEach(o => console.log(`  📈 ${o}`));
  console.log('\nChallenges:');
  report.executiveSummary.challenges.forEach(c => console.log(`  ⚠️ ${c}`));
  console.log('\nRecommendation:');
  console.log(`  ${report.executiveSummary.recommendation}`);
  console.log();
  
  // Export options
  console.log('📤 EXPORT OPTIONS');
  console.log('-'.repeat(40));
  
  const csvData = exportReport(report, 'csv') as string;
  console.log(`CSV: ${csvData.split('\n').length} rows generated`);
  
  const jsonData = exportReport(report, 'json') as string;
  console.log(`JSON: ${(JSON.stringify(JSON.parse(jsonData)).length / 1024).toFixed(1)} KB`);
  
  const mdData = exportReport(report, 'markdown') as string;
  console.log(`Markdown: ${mdData.split('\n').length} lines`);
  
  const ghData = exportReport(report, 'github') as Record<string, string>;
  console.log(`GitHub: ${Object.keys(ghData).length} files`);
  Object.keys(ghData).forEach(file => console.log(`  - ${file}`));
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Report generation complete!');
  console.log(`${'='.repeat(60)}\n`);
  
  return report;
}

// Run the demo
runDemo().catch(console.error);

export { runDemo };
