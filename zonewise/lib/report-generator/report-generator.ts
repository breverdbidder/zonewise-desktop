/**
 * ZoneWise V2 - Development Analysis Report Generator
 * Orchestrates complete report generation from property data
 */

import {
  DevelopmentAnalysisReport,
  PropertyInfo,
  SiteMetrics,
  ExistingBuildingMetrics,
  ZoningInfo,
  SetbackRequirements,
  AllowedUses,
  DevelopmentCapacity,
  FinancialOpportunity,
  KPI,
  KPICategorySummary,
  DevelopmentScenario,
  ActionItem
} from '../types/development-analysis';

import {
  generateKPIs,
  groupKPIsByCategory,
  calculateDevelopmentCapacity,
  calculateFinancialOpportunity
} from './kpi-engine/kpi-calculator';

import {
  generateAllScenarios,
  formatCurrency,
  formatNumber
} from './financial-calculator/financial-calculator';

// Input interface for report generation
export interface ReportInput {
  property: PropertyInfo;
  site: SiteMetrics;
  existingBuilding?: ExistingBuildingMetrics;
  zoning: ZoningInfo;
  setbacks: SetbackRequirements;
  allowedUses: AllowedUses;
  marketPreset?: string;
  landValue?: number;
}

/**
 * Generate executive summary from analysis data
 */
function generateExecutiveSummary(
  property: PropertyInfo,
  site: SiteMetrics,
  existingBuilding: ExistingBuildingMetrics | undefined,
  zoning: ZoningInfo,
  devCapacity: DevelopmentCapacity,
  finOpportunity: FinancialOpportunity,
  recommendedScenario: DevelopmentScenario | undefined
): DevelopmentAnalysisReport['executiveSummary'] {
  const keyFindings: string[] = [];
  const opportunities: string[] = [];
  const challenges: string[] = [];
  
  // Key findings
  keyFindings.push(`Prime ${property.neighborhood || property.city} location with ${site.lotType.toLowerCase()} lot and ${site.frontageLength.toFixed(0)} ft frontage`);
  
  if (finOpportunity.untappedDevelopmentPotential > 50) {
    keyFindings.push(`${finOpportunity.untappedDevelopmentPotential.toFixed(1)}% of development rights currently unused`);
  }
  
  keyFindings.push(`Maximum ${zoning.maxStories} stories / ${formatNumber(devCapacity.maxBuildingArea)} ft² allowed`);
  
  if (existingBuilding) {
    keyFindings.push(`Existing ${formatNumber(existingBuilding.buildingArea)} ft² ${existingBuilding.buildingUse.toLowerCase()} (built ${existingBuilding.yearBuilt})`);
  }
  
  // Opportunities
  opportunities.push(`${formatNumber(devCapacity.unusedDevelopmentRights)} ft² of additional buildable area`);
  
  if (devCapacity.maxResidentialUnits) {
    opportunities.push(`Up to ${formatNumber(devCapacity.maxResidentialUnits)} residential units possible`);
  }
  
  if (devCapacity.maxLodgingRooms) {
    opportunities.push(`Up to ${formatNumber(devCapacity.maxLodgingRooms)} hotel rooms possible`);
  }
  
  if (zoning.liveLocalApplicability) {
    opportunities.push('Live Local Act (SB 102) density bonuses available');
  }
  
  if (zoning.todStatus) {
    opportunities.push(`${zoning.todStatus} - TOD parking reductions apply`);
  }
  
  // Challenges
  if (zoning.historicDistrict) {
    challenges.push(`Historic District: ${zoning.historicDistrict} - preservation review required`);
  }
  
  if (zoning.faaHeightLimitation) {
    challenges.push(`FAA height restriction: ${formatNumber(zoning.faaHeightLimitation)} ft maximum`);
  }
  
  if (existingBuilding && existingBuilding.yearBuilt < 1960) {
    challenges.push('Existing historic structure may require preservation considerations');
  }
  
  // Recommendation
  let recommendation = '';
  if (recommendedScenario) {
    recommendation = `Recommend ${recommendedScenario.name} development: ${formatNumber(recommendedScenario.totalSqFt)} ft² ` +
      `with ${recommendedScenario.revenueStreams} revenue streams. ` +
      `Projected ${recommendedScenario.projections.irr}% IRR, ${recommendedScenario.projections.equityMultiple}x equity multiple, ` +
      `${formatCurrency(recommendedScenario.projections.developmentProfit)} development profit.`;
  }
  
  return {
    keyFindings,
    opportunities,
    challenges,
    recommendation
  };
}

/**
 * Generate action items and recommendations
 */
function generateActionItems(): ActionItem[] {
  return [
    {
      id: 'action-1',
      title: 'Commission Historic Structure Report',
      description: 'Engage qualified consultant for historic preservation analysis',
      timeframe: 'Weeks 3-4',
      budget: 45000,
      priority: 'critical',
      status: 'pending',
      category: 'technical',
      subTasks: ['Issue RFP', 'Review qualifications', 'Execute contract']
    },
    {
      id: 'action-2',
      title: 'Engage Land Use Attorney',
      description: 'Hire firm with local zoning code experience',
      timeframe: 'Weeks 5-6',
      budget: 50000,
      priority: 'critical',
      status: 'pending',
      category: 'legal',
      subTasks: ['Interview firms', 'Review track record', 'Retain counsel']
    },
    {
      id: 'action-3',
      title: 'Select Architecture Firm',
      description: 'RFP for schematic design services',
      timeframe: 'Weeks 7-8',
      budget: 250000,
      priority: 'high',
      status: 'pending',
      category: 'design',
      subTasks: ['Develop RFP', 'Shortlist 3-5 firms', 'Conduct interviews']
    },
    {
      id: 'action-4',
      title: 'Schedule Pre-Application Meeting',
      description: 'Meet with planning department to discuss concept',
      timeframe: 'Weeks 9-10',
      priority: 'high',
      status: 'pending',
      category: 'permits',
      subTasks: ['Contact planning dept', 'Prepare concept', 'Identify stakeholders']
    },
    {
      id: 'action-5',
      title: 'Commission Market Studies',
      description: 'Engage CBRE/JLL for comprehensive market analysis',
      timeframe: 'Weeks 11-12',
      budget: 75000,
      priority: 'high',
      status: 'pending',
      category: 'marketing',
      subTasks: ['Engage broker', 'Define scope', 'Initiate data collection']
    },
    {
      id: 'action-6',
      title: 'Environmental Phase I ESA',
      description: 'Environmental site assessment',
      timeframe: 'Month 4-5',
      budget: 8000,
      priority: 'medium',
      status: 'pending',
      category: 'technical'
    },
    {
      id: 'action-7',
      title: 'Traffic Impact Study',
      description: 'Analyze traffic impacts of proposed development',
      timeframe: 'Month 4-5',
      budget: 35000,
      priority: 'medium',
      status: 'pending',
      category: 'technical'
    },
    {
      id: 'action-8',
      title: 'Geotechnical Study',
      description: 'Soil and foundation analysis',
      timeframe: 'Month 4-5',
      budget: 30000,
      priority: 'medium',
      status: 'pending',
      category: 'technical'
    }
  ];
}

/**
 * Main report generation function
 */
export function generateDevelopmentAnalysisReport(input: ReportInput): DevelopmentAnalysisReport {
  const {
    property,
    site,
    existingBuilding,
    zoning,
    setbacks,
    allowedUses,
    marketPreset = 'miami_cbd',
    landValue
  } = input;
  
  // Calculate development capacity
  const devCapacity = calculateDevelopmentCapacity(site, zoning, existingBuilding);
  
  // Calculate financial opportunity
  const finOpportunity = calculateFinancialOpportunity(site, zoning, devCapacity, existingBuilding);
  
  // Generate all KPIs
  const kpis = generateKPIs({
    property,
    site,
    existingBuilding,
    zoning,
    setbacks,
    allowedUses
  });
  
  // Group KPIs by category
  const kpisByCategory = groupKPIsByCategory(kpis);
  
  // Generate development scenarios
  const scenarios = generateAllScenarios(
    devCapacity,
    site.lotAreaSqFt,
    existingBuilding?.buildingArea || 0,
    marketPreset,
    landValue
  );
  
  // Find recommended scenario (first one marked as recommended, or highest IRR)
  const recommendedScenario = scenarios.find(s => s.isRecommended) || 
    scenarios.reduce((best, s) => s.projections.irr > best.projections.irr ? s : best, scenarios[0]);
  
  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(
    property,
    site,
    existingBuilding,
    zoning,
    devCapacity,
    finOpportunity,
    recommendedScenario
  );
  
  // Generate report
  const report: DevelopmentAnalysisReport = {
    id: `report-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    
    property,
    site,
    existingBuilding,
    zoning,
    setbacks,
    allowedUses,
    
    developmentCapacity: devCapacity,
    financialOpportunity: finOpportunity,
    
    kpis,
    kpisByCategory,
    scenarios,
    recommendedScenario,
    
    executiveSummary
  };
  
  return report;
}

/**
 * Format report for display
 */
export function formatReportSummary(report: DevelopmentAnalysisReport): string {
  const { property, executiveSummary, recommendedScenario, kpis } = report;
  
  let summary = `# Development Analysis Report\n`;
  summary += `## ${property.address}, ${property.city}, ${property.state} ${property.zipCode}\n\n`;
  
  summary += `### Key Findings\n`;
  executiveSummary.keyFindings.forEach(f => {
    summary += `✅ ${f}\n`;
  });
  
  summary += `\n### Opportunities\n`;
  executiveSummary.opportunities.forEach(o => {
    summary += `📈 ${o}\n`;
  });
  
  summary += `\n### Challenges\n`;
  executiveSummary.challenges.forEach(c => {
    summary += `⚠️ ${c}\n`;
  });
  
  if (recommendedScenario) {
    summary += `\n### Recommended Development\n`;
    summary += `**${recommendedScenario.name}**\n`;
    summary += `- Total Area: ${formatNumber(recommendedScenario.totalSqFt)} ft²\n`;
    summary += `- Stories: ${recommendedScenario.stories}\n`;
    summary += `- Development Cost: ${formatCurrency(recommendedScenario.costs.totalCost)}\n`;
    summary += `- Asset Value: ${formatCurrency(recommendedScenario.projections.totalAssetValue)}\n`;
    summary += `- IRR: ${recommendedScenario.projections.irr}%\n`;
    summary += `- Equity Multiple: ${recommendedScenario.projections.equityMultiple}x\n`;
  }
  
  summary += `\n### KPI Summary\n`;
  summary += `- Total KPIs: ${kpis.length}\n`;
  summary += `- Categories: ${report.kpisByCategory.length}\n`;
  
  return summary;
}

export { generateActionItems };
