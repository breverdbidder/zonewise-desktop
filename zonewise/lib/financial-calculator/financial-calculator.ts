/**
 * ZoneWise V2 - Financial Calculator
 * Generates development scenarios with complete financial analysis
 */

import {
  DevelopmentScenario,
  DevelopmentScenarioType,
  DevelopmentComponent,
  DevelopmentCosts,
  FinancialProjections,
  DevelopmentCapacity
} from '../types/development-analysis';

// Cost assumptions by market tier
interface MarketAssumptions {
  hardCostPerSqFt: {
    residential: number;
    hotel: number;
    office: number;
    retail: number;
    parking: number;
  };
  softCostPercent: number;
  contingencyPercent: number;
  financingRate: number;
  capRates: {
    residential: number;
    hotel: number;
    office: number;
    retail: number;
  };
  rentPerSqFt: {
    residential: number;
    hotel: number;  // RevPAR
    office: number;
    retail: number;
  };
  avgUnitSizes: {
    residential: number;
    hotel: number;
  };
}

// Market tier presets
const MARKET_PRESETS: Record<string, MarketAssumptions> = {
  miami_cbd: {
    hardCostPerSqFt: {
      residential: 400,
      hotel: 500,
      office: 350,
      retail: 300,
      parking: 150
    },
    softCostPercent: 0.25,
    contingencyPercent: 0.10,
    financingRate: 0.065,
    capRates: {
      residential: 0.05,
      hotel: 0.075,
      office: 0.065,
      retail: 0.06
    },
    rentPerSqFt: {
      residential: 42,  // Annual per sqft
      hotel: 200,       // RevPAR
      office: 55,
      retail: 65
    },
    avgUnitSizes: {
      residential: 950,
      hotel: 450
    }
  },
  brevard_county: {
    hardCostPerSqFt: {
      residential: 250,
      hotel: 350,
      office: 200,
      retail: 180,
      parking: 100
    },
    softCostPercent: 0.20,
    contingencyPercent: 0.10,
    financingRate: 0.07,
    capRates: {
      residential: 0.06,
      hotel: 0.085,
      office: 0.075,
      retail: 0.07
    },
    rentPerSqFt: {
      residential: 24,
      hotel: 120,
      office: 28,
      retail: 22
    },
    avgUnitSizes: {
      residential: 1100,
      hotel: 400
    }
  }
};

/**
 * Calculate component financials
 */
function calculateComponentFinancials(
  component: Partial<DevelopmentComponent>,
  assumptions: MarketAssumptions
): DevelopmentComponent {
  const type = component.type || 'residential';
  const area = component.area || 0;
  
  let units = component.units;
  let annualRevenue = 0;
  let capRate = assumptions.capRates[type as keyof typeof assumptions.capRates] || 0.06;
  
  // Calculate units if not provided
  if (!units && area > 0) {
    if (type === 'residential') {
      units = Math.floor(area / assumptions.avgUnitSizes.residential);
    } else if (type === 'hotel') {
      units = Math.floor(area / assumptions.avgUnitSizes.hotel);
    }
  }
  
  // Calculate annual revenue
  if (type === 'residential' && units) {
    const avgUnitSize = area / units;
    annualRevenue = units * avgUnitSize * assumptions.rentPerSqFt.residential;
  } else if (type === 'hotel' && units) {
    // RevPAR × rooms × 365 × occupancy
    annualRevenue = assumptions.rentPerSqFt.hotel * units * 365 * 0.75;
  } else if (type === 'office' || type === 'retail') {
    const rentPerSqFt = assumptions.rentPerSqFt[type];
    const occupancy = type === 'office' ? 0.90 : 0.95;
    annualRevenue = area * rentPerSqFt * occupancy;
  }
  
  const assetValue = capRate > 0 ? Math.round(annualRevenue / capRate) : 0;
  
  return {
    type,
    name: component.name || type.charAt(0).toUpperCase() + type.slice(1),
    area,
    units,
    avgUnitSize: units ? Math.round(area / units) : undefined,
    annualRevenue: Math.round(annualRevenue),
    capRate,
    assetValue
  };
}

/**
 * Calculate development costs
 */
function calculateDevelopmentCosts(
  components: DevelopmentComponent[],
  landCost: number,
  assumptions: MarketAssumptions
): DevelopmentCosts {
  let hardCosts = 0;
  
  for (const comp of components) {
    const costPerSqFt = assumptions.hardCostPerSqFt[comp.type as keyof typeof assumptions.hardCostPerSqFt] || 300;
    hardCosts += comp.area * costPerSqFt;
  }
  
  const softCosts = hardCosts * assumptions.softCostPercent;
  const contingency = (hardCosts + softCosts) * assumptions.contingencyPercent;
  const financingCosts = (hardCosts + softCosts + landCost) * assumptions.financingRate * 3; // 3 year construction
  
  const totalCost = landCost + hardCosts + softCosts + contingency + financingCosts;
  
  return {
    landCost: Math.round(landCost),
    hardCosts: Math.round(hardCosts),
    softCosts: Math.round(softCosts),
    financingCosts: Math.round(financingCosts),
    contingency: Math.round(contingency),
    totalCost: Math.round(totalCost)
  };
}

/**
 * Calculate financial projections
 */
function calculateProjections(
  components: DevelopmentComponent[],
  costs: DevelopmentCosts
): FinancialProjections {
  const totalRevenue = components.reduce((sum, c) => sum + (c.annualRevenue || 0), 0);
  const totalAssetValue = components.reduce((sum, c) => sum + (c.assetValue || 0), 0);
  
  // Weighted average cap rate
  const weightedCapRate = totalRevenue > 0 ? totalRevenue / totalAssetValue : 0;
  
  const developmentProfit = totalAssetValue - costs.totalCost;
  const roi = costs.totalCost > 0 ? (developmentProfit / costs.totalCost) * 100 : 0;
  
  // Simplified IRR calculation (assumes 4-year development cycle)
  const irr = roi > 0 ? Math.pow(1 + roi / 100, 0.25) - 1 : 0;
  const equityPercent = 0.35; // Assume 35% equity
  const equityInvested = costs.totalCost * equityPercent;
  const equityMultiple = equityInvested > 0 ? (equityInvested + developmentProfit) / equityInvested : 0;
  
  // Cash on cash (first stabilized year)
  const noi = totalRevenue * 0.65; // Assume 35% expenses
  const debtService = (costs.totalCost * (1 - equityPercent)) * 0.07; // 7% debt service
  const cashFlow = noi - debtService;
  const cashOnCash = equityInvested > 0 ? (cashFlow / equityInvested) * 100 : 0;
  
  return {
    totalRevenue: Math.round(totalRevenue),
    netOperatingIncome: Math.round(noi),
    weightedCapRate: Math.round(weightedCapRate * 1000) / 1000,
    totalAssetValue: Math.round(totalAssetValue),
    developmentProfit: Math.round(developmentProfit),
    roi: Math.round(roi * 10) / 10,
    irr: Math.round(irr * 1000) / 10,
    equityMultiple: Math.round(equityMultiple * 10) / 10,
    cashOnCash: Math.round(cashOnCash * 10) / 10
  };
}

/**
 * Generate mixed-use development scenario
 */
export function generateMixedUseScenario(
  devCapacity: DevelopmentCapacity,
  lotAreaSqFt: number,
  existingArea: number,
  marketPreset: string = 'miami_cbd',
  landValue?: number
): DevelopmentScenario {
  const assumptions = MARKET_PRESETS[marketPreset] || MARKET_PRESETS.brevard_county;
  
  // Calculate available development
  const maxArea = devCapacity.maxBuildingArea;
  const targetArea = Math.min(maxArea * 0.75, maxArea - existingArea); // Use 75% of max or unused
  
  // Mixed-use allocation
  const residentialArea = Math.floor(targetArea * 0.45);
  const hotelArea = Math.floor(targetArea * 0.25);
  const officeArea = Math.floor(targetArea * 0.20);
  const retailArea = Math.floor(targetArea * 0.10);
  
  const components: DevelopmentComponent[] = [
    calculateComponentFinancials({ type: 'residential', name: 'Residential Units', area: residentialArea }, assumptions),
    calculateComponentFinancials({ type: 'hotel', name: 'Hotel Rooms', area: hotelArea }, assumptions),
    calculateComponentFinancials({ type: 'office', name: 'Class A Office', area: officeArea }, assumptions),
    calculateComponentFinancials({ type: 'retail', name: 'Ground Floor Retail', area: retailArea }, assumptions)
  ];
  
  const totalSqFt = components.reduce((sum, c) => sum + c.area, 0);
  const estimatedLandValue = landValue || lotAreaSqFt * 150; // $150/sqft default
  const costs = calculateDevelopmentCosts(components, estimatedLandValue, assumptions);
  const projections = calculateProjections(components, costs);
  
  return {
    id: 'scenario-mixed-use',
    name: 'Mixed-Use Tower',
    type: 'mixed_use',
    description: `${devCapacity.maxBuildingHeightStories}-story mixed-use development combining residential, hotel, office, and retail uses to maximize revenue diversification and development rights utilization.`,
    isRecommended: true,
    totalSqFt,
    stories: Math.min(devCapacity.maxBuildingHeightStories, Math.ceil(totalSqFt / (lotAreaSqFt * 0.7))),
    farUtilization: (totalSqFt / maxArea) * 100,
    components,
    costs,
    projections,
    riskLevel: 'Medium',
    revenueStreams: 4,
    marketDemand: 'High',
    managementComplexity: 'High',
    exitFlexibility: 'Excellent'
  };
}

/**
 * Generate residential-only scenario
 */
export function generateResidentialScenario(
  devCapacity: DevelopmentCapacity,
  lotAreaSqFt: number,
  existingArea: number,
  marketPreset: string = 'miami_cbd',
  landValue?: number
): DevelopmentScenario {
  const assumptions = MARKET_PRESETS[marketPreset] || MARKET_PRESETS.brevard_county;
  
  const maxArea = devCapacity.maxBuildingArea;
  const targetArea = Math.min(maxArea * 0.70, maxArea - existingArea);
  
  const residentialArea = Math.floor(targetArea * 0.95);
  const retailArea = Math.floor(targetArea * 0.05);
  
  const components: DevelopmentComponent[] = [
    calculateComponentFinancials({ type: 'residential', name: 'Luxury Apartments', area: residentialArea }, assumptions),
    calculateComponentFinancials({ type: 'retail', name: 'Ground Floor Retail', area: retailArea }, assumptions)
  ];
  
  const totalSqFt = components.reduce((sum, c) => sum + c.area, 0);
  const estimatedLandValue = landValue || lotAreaSqFt * 150;
  const costs = calculateDevelopmentCosts(components, estimatedLandValue, assumptions);
  const projections = calculateProjections(components, costs);
  
  return {
    id: 'scenario-residential',
    name: 'Luxury Residential Tower',
    type: 'residential_only',
    description: 'Premium residential development targeting high-income renters with ground-floor retail amenities.',
    totalSqFt,
    stories: Math.min(devCapacity.maxBuildingHeightStories, Math.ceil(totalSqFt / (lotAreaSqFt * 0.7))),
    farUtilization: (totalSqFt / maxArea) * 100,
    components,
    costs,
    projections,
    riskLevel: 'Medium-Low',
    revenueStreams: 2,
    marketDemand: 'High',
    managementComplexity: 'Low',
    exitFlexibility: 'Good'
  };
}

/**
 * Generate hotel + condo scenario
 */
export function generateHotelCondoScenario(
  devCapacity: DevelopmentCapacity,
  lotAreaSqFt: number,
  existingArea: number,
  marketPreset: string = 'miami_cbd',
  landValue?: number
): DevelopmentScenario {
  const assumptions = MARKET_PRESETS[marketPreset] || MARKET_PRESETS.brevard_county;
  
  const maxArea = devCapacity.maxBuildingArea;
  const targetArea = Math.min(maxArea * 0.55, maxArea - existingArea);
  
  const hotelArea = Math.floor(targetArea * 0.60);
  const condoArea = Math.floor(targetArea * 0.35);
  const retailArea = Math.floor(targetArea * 0.05);
  
  const components: DevelopmentComponent[] = [
    calculateComponentFinancials({ type: 'hotel', name: 'Upper Upscale Hotel', area: hotelArea }, assumptions),
    calculateComponentFinancials({ type: 'residential', name: 'Condominiums', area: condoArea }, assumptions),
    calculateComponentFinancials({ type: 'retail', name: 'Restaurant/Retail', area: retailArea }, assumptions)
  ];
  
  const totalSqFt = components.reduce((sum, c) => sum + c.area, 0);
  const estimatedLandValue = landValue || lotAreaSqFt * 150;
  const costs = calculateDevelopmentCosts(components, estimatedLandValue, assumptions);
  const projections = calculateProjections(components, costs);
  
  return {
    id: 'scenario-hotel-condo',
    name: 'Hotel + Condominiums',
    type: 'hotel_condo',
    description: 'Hospitality-focused development with for-sale residential units providing immediate cash return and ongoing hotel revenue.',
    totalSqFt,
    stories: Math.min(devCapacity.maxBuildingHeightStories, Math.ceil(totalSqFt / (lotAreaSqFt * 0.7))),
    farUtilization: (totalSqFt / maxArea) * 100,
    components,
    costs,
    projections,
    riskLevel: 'Medium',
    revenueStreams: 3,
    marketDemand: 'Medium-High',
    managementComplexity: 'Medium',
    exitFlexibility: 'Good'
  };
}

/**
 * Generate all development scenarios
 */
export function generateAllScenarios(
  devCapacity: DevelopmentCapacity,
  lotAreaSqFt: number,
  existingArea: number = 0,
  marketPreset: string = 'miami_cbd',
  landValue?: number
): DevelopmentScenario[] {
  return [
    generateMixedUseScenario(devCapacity, lotAreaSqFt, existingArea, marketPreset, landValue),
    generateResidentialScenario(devCapacity, lotAreaSqFt, existingArea, marketPreset, landValue),
    generateHotelCondoScenario(devCapacity, lotAreaSqFt, existingArea, marketPreset, landValue)
  ];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export { MARKET_PRESETS, MarketAssumptions };
