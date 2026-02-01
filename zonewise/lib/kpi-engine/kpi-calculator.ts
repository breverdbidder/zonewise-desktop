/**
 * ZoneWise V2 - KPI Calculation Engine
 * Generates 63+ comprehensive KPIs from property and zoning data
 */

import {
  KPI,
  KPICategory,
  KPICategorySummary,
  KPI_CATEGORY_LABELS,
  PropertyInfo,
  SiteMetrics,
  ExistingBuildingMetrics,
  ZoningInfo,
  SetbackRequirements,
  AllowedUses,
  DevelopmentCapacity,
  FinancialOpportunity,
  DataSource
} from '../types/development-analysis';

interface KPIInputData {
  property: PropertyInfo;
  site: SiteMetrics;
  existingBuilding?: ExistingBuildingMetrics;
  zoning: ZoningInfo;
  setbacks: SetbackRequirements;
  allowedUses: AllowedUses;
}

// Format number with commas
function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
}

// Format as percentage
function formatPercent(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`;
}

// Format as currency
function formatCurrency(num: number): string {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  }
  return `$${formatNumber(num)}`;
}

/**
 * Calculate all development capacity metrics
 */
export function calculateDevelopmentCapacity(
  site: SiteMetrics,
  zoning: ZoningInfo,
  existingBuilding?: ExistingBuildingMetrics
): DevelopmentCapacity {
  const lotAreaSqFt = site.lotAreaSqFt;
  const lotAreaAcres = site.lotAreaAcres;
  const existingArea = existingBuilding?.buildingArea || 0;
  
  // Core calculations
  const maxBuildingArea = Math.floor(lotAreaSqFt * zoning.maxFAR);
  const maxBuildingFootprint = Math.floor(lotAreaSqFt * (zoning.maxLotCoverage / 100));
  const unusedDevelopmentRights = Math.max(0, maxBuildingArea - existingArea);
  const currentFARUtilization = existingArea / lotAreaSqFt;
  const farUtilizationRate = (currentFARUtilization / zoning.maxFAR) * 100;
  
  // Residential capacity
  const residentialDensity = zoning.maxFAR >= 10 ? 1000 : zoning.maxFAR >= 5 ? 500 : 100;
  const maxResidentialUnits = Math.floor(lotAreaAcres * residentialDensity);
  
  // Lodging capacity (typically 2x residential density)
  const lodgingDensity = residentialDensity * 2;
  const maxLodgingRooms = Math.floor(lotAreaAcres * lodgingDensity);
  
  return {
    maxBuildingArea,
    maxBuildingHeightStories: zoning.maxStories,
    maxBuildingHeightFeet: zoning.maxHeightFeet,
    maxBuildingFootprint,
    maxLotCoverage: zoning.maxLotCoverage,
    unusedDevelopmentRights,
    currentFARUtilization,
    farUtilizationRate,
    residentialDensity,
    maxResidentialArea: maxBuildingArea,
    maxResidentialUnits,
    lodgingDensity,
    maxLodgingArea: maxBuildingArea,
    maxLodgingRooms,
    maxOfficeArea: maxBuildingArea,
    maxCommercialArea: maxBuildingArea,
    officeExpansionPotential: unusedDevelopmentRights
  };
}

/**
 * Calculate financial opportunity metrics
 */
export function calculateFinancialOpportunity(
  site: SiteMetrics,
  zoning: ZoningInfo,
  developmentCapacity: DevelopmentCapacity,
  existingBuilding?: ExistingBuildingMetrics
): FinancialOpportunity {
  const existingArea = existingBuilding?.buildingArea || 0;
  const maxArea = developmentCapacity.maxBuildingArea;
  
  const developmentRightsUtilization = (existingArea / maxArea) * 100;
  const untappedDevelopmentPotential = 100 - developmentRightsUtilization;
  
  // Estimate lot coverage utilization
  const estimatedFootprint = existingArea > 0 
    ? Math.min(existingArea / (existingBuilding?.stories || 1), site.lotAreaSqFt)
    : 0;
  const lotCoverageUtilization = (estimatedFootprint / site.lotAreaSqFt) * 100;
  
  // Vertical expansion potential
  const currentStories = existingBuilding?.stories || 0;
  const verticalExpansionStories = zoning.maxStories - currentStories;
  
  return {
    developmentRightsUtilization,
    untappedDevelopmentPotential,
    verticalExpansionStories,
    lotCoverageUtilization,
    additionalBuildableArea: developmentCapacity.unusedDevelopmentRights,
    residentialUnitPotential: developmentCapacity.maxResidentialUnits || 0,
    hotelRoomPotential: developmentCapacity.maxLodgingRooms || 0
  };
}

/**
 * Generate all 63+ KPIs from input data
 */
export function generateKPIs(data: KPIInputData): KPI[] {
  const kpis: KPI[] = [];
  let kpiId = 1;
  
  const devCapacity = calculateDevelopmentCapacity(data.site, data.zoning, data.existingBuilding);
  const finOpportunity = calculateFinancialOpportunity(data.site, data.zoning, devCapacity, data.existingBuilding);
  
  // ============================================================================
  // Category 1: Site & Parcel Metrics (8 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'site_parcel_metrics',
    name: 'Parcel ID',
    value: data.property.parcelId,
    source: 'DIRECT',
    pageSection: 'Page 1',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.property.parcelId
  });
  
  kpis.push({
    id: kpiId++,
    category: 'site_parcel_metrics',
    name: 'Lot Area (Acres)',
    value: data.site.lotAreaAcres,
    unit: 'acres',
    source: 'DIRECT',
    pageSection: 'Page 1',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: `${data.site.lotAreaAcres.toFixed(2)} acres`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'site_parcel_metrics',
    name: 'Lot Area (Tax Record)',
    value: data.site.lotAreaTaxRecord || data.site.lotAreaSqFt,
    unit: 'ft²',
    source: 'DIRECT',
    pageSection: 'Page 1',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: `${formatNumber(data.site.lotAreaTaxRecord || data.site.lotAreaSqFt)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'site_parcel_metrics',
    name: 'Lot Area (Parcel Shape)',
    value: data.site.lotAreaParcelShape || data.site.lotAreaSqFt,
    unit: 'ft²',
    source: 'GIS',
    pageSection: 'Page 1',
    calculationMethod: 'GIS calculation',
    confidence: 'high',
    formattedValue: `${formatNumber(data.site.lotAreaParcelShape || data.site.lotAreaSqFt)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'site_parcel_metrics',
    name: 'Lot Type',
    value: data.site.lotType,
    source: 'DIRECT',
    pageSection: 'Page 1',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.site.lotType
  });
  
  kpis.push({
    id: kpiId++,
    category: 'site_parcel_metrics',
    name: 'Frontage Length',
    value: data.site.frontageLength,
    unit: 'ft',
    source: 'DIRECT',
    pageSection: 'Page 1',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: `${data.site.frontageLength.toFixed(2)} ft`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'site_parcel_metrics',
    name: 'Vacant Status',
    value: data.site.isVacant ? 'Yes' : 'No',
    source: 'DIRECT',
    pageSection: 'Page 1',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.site.isVacant ? 'Yes' : 'No'
  });
  
  kpis.push({
    id: kpiId++,
    category: 'site_parcel_metrics',
    name: 'Legal Description',
    value: data.property.legalDescription || 'N/A',
    source: 'DIRECT',
    pageSection: 'Page 1',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.property.legalDescription || 'N/A'
  });
  
  // ============================================================================
  // Category 2: Existing Building Metrics (5 KPIs)
  // ============================================================================
  
  if (data.existingBuilding) {
    kpis.push({
      id: kpiId++,
      category: 'existing_building_metrics',
      name: 'Existing Building Area',
      value: data.existingBuilding.buildingArea,
      unit: 'ft²',
      source: 'DIRECT',
      pageSection: 'Page 1',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: `${formatNumber(data.existingBuilding.buildingArea)} ft²`
    });
    
    kpis.push({
      id: kpiId++,
      category: 'existing_building_metrics',
      name: 'Existing Building Use',
      value: data.existingBuilding.buildingUse,
      source: 'DIRECT',
      pageSection: 'Page 1',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: data.existingBuilding.buildingUse
    });
    
    kpis.push({
      id: kpiId++,
      category: 'existing_building_metrics',
      name: 'Year Built',
      value: data.existingBuilding.yearBuilt,
      source: 'DIRECT',
      pageSection: 'Page 1',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: String(data.existingBuilding.yearBuilt)
    });
    
    kpis.push({
      id: kpiId++,
      category: 'existing_building_metrics',
      name: 'Neighborhood',
      value: data.property.neighborhood || 'N/A',
      source: 'DIRECT',
      pageSection: 'Page 1',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: data.property.neighborhood || 'N/A'
    });
    
    kpis.push({
      id: kpiId++,
      category: 'existing_building_metrics',
      name: 'Current Land Use',
      value: data.site.currentLandUse,
      source: 'DIRECT',
      pageSection: 'Page 1',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: data.site.currentLandUse
    });
  }
  
  // ============================================================================
  // Category 3: Zoning & Regulatory (10 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'zoning_regulatory',
    name: 'Zoning Code',
    value: data.zoning.zoningCode,
    source: 'DIRECT',
    pageSection: 'Page 1',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.zoning.zoningCode
  });
  
  kpis.push({
    id: kpiId++,
    category: 'zoning_regulatory',
    name: 'Zoning District',
    value: data.zoning.zoningDistrict,
    source: 'DIRECT',
    pageSection: 'Page 1-2',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.zoning.zoningDistrict
  });
  
  kpis.push({
    id: kpiId++,
    category: 'zoning_regulatory',
    name: 'Zoning Description',
    value: data.zoning.zoningDescription,
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.zoning.zoningDescription
  });
  
  kpis.push({
    id: kpiId++,
    category: 'zoning_regulatory',
    name: 'Maximum Stories',
    value: data.zoning.maxStories,
    unit: 'stories',
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: `${data.zoning.maxStories} stories`
  });
  
  if (data.zoning.faaHeightLimitation) {
    kpis.push({
      id: kpiId++,
      category: 'zoning_regulatory',
      name: 'FAA Height Limitation',
      value: data.zoning.faaHeightLimitation,
      unit: 'ft',
      source: 'DIRECT',
      pageSection: 'Page 2',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: `${formatNumber(data.zoning.faaHeightLimitation)} ft`
    });
  }
  
  if (data.zoning.historicDistrict) {
    kpis.push({
      id: kpiId++,
      category: 'zoning_regulatory',
      name: 'Historic District',
      value: data.zoning.historicDistrict,
      source: 'DIRECT',
      pageSection: 'Page 2',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: data.zoning.historicDistrict
    });
  }
  
  if (data.zoning.leedRequirement) {
    kpis.push({
      id: kpiId++,
      category: 'zoning_regulatory',
      name: 'LEED Requirement',
      value: data.zoning.leedRequirement,
      source: 'DIRECT',
      pageSection: 'Page 2',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: data.zoning.leedRequirement
    });
  }
  
  kpis.push({
    id: kpiId++,
    category: 'zoning_regulatory',
    name: 'Live Local Applicability',
    value: data.zoning.liveLocalApplicability ? 'Yes (SB 102)' : 'No',
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.zoning.liveLocalApplicability ? 'Yes (SB 102)' : 'No'
  });
  
  if (data.zoning.todStatus) {
    kpis.push({
      id: kpiId++,
      category: 'zoning_regulatory',
      name: 'TOD Status',
      value: data.zoning.todStatus,
      source: 'DIRECT',
      pageSection: 'Page 2',
      calculationMethod: 'Direct from report',
      confidence: 'high',
      formattedValue: data.zoning.todStatus
    });
  }
  
  kpis.push({
    id: kpiId++,
    category: 'zoning_regulatory',
    name: 'Transit Corridor',
    value: data.zoning.transitCorridor ? 'Yes' : 'No',
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.zoning.transitCorridor ? 'Yes' : 'No'
  });
  
  // ============================================================================
  // Category 4: Development Capacity (9 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'Floor Area Ratio (FAR)',
    value: data.zoning.maxFAR,
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: data.zoning.maxFAR.toFixed(2)
  });
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'Maximum Building Area',
    value: devCapacity.maxBuildingArea,
    unit: 'ft²',
    source: 'CALCULATED',
    pageSection: 'Page 2',
    calculationMethod: 'FAR × Lot Area',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.maxBuildingArea)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'Maximum Building Height',
    value: data.zoning.maxStories,
    unit: 'stories',
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: `${data.zoning.maxStories} stories`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'Maximum Lot Coverage',
    value: data.zoning.maxLotCoverage,
    unit: '%',
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: `${data.zoning.maxLotCoverage}%`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'Maximum Building Footprint',
    value: devCapacity.maxBuildingFootprint,
    unit: 'ft²',
    source: 'CALCULATED',
    pageSection: 'Page 2',
    calculationMethod: 'Lot Area × Coverage',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.maxBuildingFootprint)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'Minimum Open Space',
    value: data.zoning.minOpenSpace,
    unit: '%',
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: `${data.zoning.minOpenSpace.toFixed(2)}%`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'Unused Development Rights',
    value: devCapacity.unusedDevelopmentRights,
    unit: 'ft²',
    source: 'CALCULATED',
    calculationMethod: 'Max Area - Existing',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.unusedDevelopmentRights)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'Current FAR Utilization',
    value: devCapacity.currentFARUtilization,
    source: 'CALCULATED',
    calculationMethod: 'Existing Area ÷ Lot Area',
    confidence: 'high',
    formattedValue: `~${devCapacity.currentFARUtilization.toFixed(2)}`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'development_capacity',
    name: 'FAR Utilization Rate',
    value: devCapacity.farUtilizationRate,
    unit: '%',
    source: 'CALCULATED',
    calculationMethod: 'Current FAR ÷ Max FAR',
    confidence: 'high',
    formattedValue: formatPercent(devCapacity.farUtilizationRate)
  });
  
  // ============================================================================
  // Category 5: Residential Capacity (4 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'residential_capacity',
    name: 'Residential Density',
    value: devCapacity.residentialDensity,
    unit: 'Du/Acre',
    source: 'DIRECT',
    pageSection: 'Page 2',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.residentialDensity || 0)} Du/Acre`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'residential_capacity',
    name: 'Maximum Residential Area',
    value: devCapacity.maxResidentialArea,
    unit: 'ft²',
    source: 'CALCULATED',
    pageSection: 'Page 2',
    calculationMethod: 'Same as Max Building Area',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.maxResidentialArea || 0)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'residential_capacity',
    name: 'Maximum Residential Units',
    value: devCapacity.maxResidentialUnits,
    unit: 'units',
    source: 'CALCULATED',
    pageSection: 'Page 2',
    calculationMethod: 'Density × Lot Area',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.maxResidentialUnits || 0)} units`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'residential_capacity',
    name: 'Residential Allowed Uses',
    value: data.allowedUses.residential.byRight.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 4',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: data.allowedUses.residential.byRight.join(', ')
  });
  
  // ============================================================================
  // Category 6: Lodging Capacity (4 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'lodging_capacity',
    name: 'Lodging Density',
    value: devCapacity.lodgingDensity,
    unit: 'Units/Acre',
    source: 'DIRECT',
    pageSection: 'Page 2-3',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.lodgingDensity || 0)} Units/Acre`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'lodging_capacity',
    name: 'Maximum Lodging Area',
    value: devCapacity.maxLodgingArea,
    unit: 'ft²',
    source: 'CALCULATED',
    pageSection: 'Page 3',
    calculationMethod: 'Same as Max Building Area',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.maxLodgingArea || 0)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'lodging_capacity',
    name: 'Maximum Lodging Rooms',
    value: devCapacity.maxLodgingRooms,
    unit: 'rooms',
    source: 'CALCULATED',
    pageSection: 'Page 3',
    calculationMethod: 'Density × Lot Area',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.maxLodgingRooms || 0)} rooms`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'lodging_capacity',
    name: 'Lodging Allowed Uses',
    value: data.allowedUses.lodging.byRight.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 4',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: data.allowedUses.lodging.byRight.join(', ')
  });
  
  // ============================================================================
  // Category 7: Commercial/Office Capacity (5 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'commercial_office_capacity',
    name: 'Maximum Office Area',
    value: devCapacity.maxOfficeArea,
    unit: 'ft²',
    source: 'CALCULATED',
    pageSection: 'Page 3',
    calculationMethod: 'Same as Max Building Area',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.maxOfficeArea || 0)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'commercial_office_capacity',
    name: 'Maximum Commercial Area',
    value: devCapacity.maxCommercialArea,
    unit: 'ft²',
    source: 'CALCULATED',
    pageSection: 'Page 3',
    calculationMethod: 'Same as Max Building Area',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.maxCommercialArea || 0)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'commercial_office_capacity',
    name: 'Office Expansion Potential',
    value: devCapacity.officeExpansionPotential,
    unit: 'ft²',
    source: 'CALCULATED',
    calculationMethod: 'Max - Existing Area',
    confidence: 'high',
    formattedValue: `${formatNumber(devCapacity.officeExpansionPotential || 0)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'commercial_office_capacity',
    name: 'Commercial Allowed Uses',
    value: data.allowedUses.commercial.byRight.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: data.allowedUses.commercial.byRight.join(', ')
  });
  
  kpis.push({
    id: kpiId++,
    category: 'commercial_office_capacity',
    name: 'Office Allowed Uses',
    value: data.allowedUses.office.byRight.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 4',
    calculationMethod: 'Zoning Code',
    confidence: 'high',
    formattedValue: data.allowedUses.office.byRight.join(', ')
  });
  
  // ============================================================================
  // Category 8: Setback Requirements (5 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'setback_requirements',
    name: 'Minimum Primary Frontage Setback',
    value: data.setbacks.primaryFrontage,
    unit: 'ft',
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: `${data.setbacks.primaryFrontage.toFixed(2)} ft`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'setback_requirements',
    name: 'Minimum Secondary Frontage Setback',
    value: data.setbacks.secondaryFrontage ?? data.setbacks.primaryFrontage,
    unit: 'ft',
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: `${(data.setbacks.secondaryFrontage ?? data.setbacks.primaryFrontage).toFixed(2)} ft`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'setback_requirements',
    name: 'Minimum Side Setback',
    value: data.setbacks.side !== null ? data.setbacks.side : '- (Not specified)',
    unit: data.setbacks.side !== null ? 'ft' : undefined,
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.setbacks.side !== null ? `${data.setbacks.side} ft` : '- (Not specified)'
  });
  
  kpis.push({
    id: kpiId++,
    category: 'setback_requirements',
    name: 'Minimum Rear Setback',
    value: data.setbacks.rear,
    unit: 'ft',
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: `${data.setbacks.rear} ft`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'setback_requirements',
    name: 'Minimum Water Setback',
    value: data.setbacks.water !== null ? data.setbacks.water : 'N/A',
    unit: data.setbacks.water !== null ? 'ft' : undefined,
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.setbacks.water !== null ? `${data.setbacks.water} ft` : 'N/A'
  });
  
  // ============================================================================
  // Category 9: Allowed Uses (6 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'allowed_uses',
    name: 'Civic Uses (by Right)',
    value: data.allowedUses.civic.byRight.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.allowedUses.civic.byRight.join(', ') || 'None'
  });
  
  kpis.push({
    id: kpiId++,
    category: 'allowed_uses',
    name: 'Civic Uses (by Warrant)',
    value: data.allowedUses.civic.byWarrant.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.allowedUses.civic.byWarrant.join(', ') || 'None'
  });
  
  kpis.push({
    id: kpiId++,
    category: 'allowed_uses',
    name: 'Civic Uses (by Exception)',
    value: data.allowedUses.civic.byException.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.allowedUses.civic.byException.join(', ') || 'None'
  });
  
  kpis.push({
    id: kpiId++,
    category: 'allowed_uses',
    name: 'Educational Uses (by Right)',
    value: data.allowedUses.educational.byRight.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 4',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.allowedUses.educational.byRight.join(', ') || 'None'
  });
  
  kpis.push({
    id: kpiId++,
    category: 'allowed_uses',
    name: 'Educational Uses (by Warrant)',
    value: data.allowedUses.educational.byWarrant.join(', '),
    source: 'DIRECT',
    pageSection: 'Page 4',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: data.allowedUses.educational.byWarrant.join(', ') || 'None'
  });
  
  kpis.push({
    id: kpiId++,
    category: 'allowed_uses',
    name: 'Infrastructure Uses (by Warrant)',
    value: 'Community Support Facility, Infrastructure, Marina, Public Parking, Transit',
    source: 'DIRECT',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: 'Community Support Facility, Infrastructure, Marina, Public Parking, Transit'
  });
  
  // ============================================================================
  // Category 10: Financial Opportunity (7 KPIs)
  // ============================================================================
  
  kpis.push({
    id: kpiId++,
    category: 'financial_opportunity',
    name: 'Development Rights Utilization',
    value: finOpportunity.developmentRightsUtilization,
    unit: '%',
    source: 'CALCULATED',
    calculationMethod: 'Existing ÷ Max Building Area',
    confidence: 'high',
    formattedValue: formatPercent(finOpportunity.developmentRightsUtilization)
  });
  
  kpis.push({
    id: kpiId++,
    category: 'financial_opportunity',
    name: 'Untapped Development Potential',
    value: finOpportunity.untappedDevelopmentPotential,
    unit: '%',
    source: 'CALCULATED',
    calculationMethod: '100% - Utilization Rate',
    confidence: 'high',
    formattedValue: formatPercent(finOpportunity.untappedDevelopmentPotential)
  });
  
  kpis.push({
    id: kpiId++,
    category: 'financial_opportunity',
    name: 'Vertical Expansion Stories Available',
    value: finOpportunity.verticalExpansionStories,
    unit: 'stories',
    source: 'INFERRED',
    calculationMethod: 'Max Stories - Current Use',
    confidence: 'medium',
    formattedValue: `~${finOpportunity.verticalExpansionStories} stories`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'financial_opportunity',
    name: 'Lot Coverage Utilization',
    value: finOpportunity.lotCoverageUtilization,
    unit: '%',
    source: 'ESTIMATED',
    calculationMethod: 'Based on footprint analysis',
    confidence: 'medium',
    formattedValue: `~${formatPercent(finOpportunity.lotCoverageUtilization)}`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'financial_opportunity',
    name: 'Additional Buildable Area',
    value: finOpportunity.additionalBuildableArea,
    unit: 'ft²',
    source: 'CALCULATED',
    calculationMethod: 'Max - Existing Area',
    confidence: 'high',
    formattedValue: `${formatNumber(finOpportunity.additionalBuildableArea)} ft²`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'financial_opportunity',
    name: 'Residential Unit Potential (New)',
    value: finOpportunity.residentialUnitPotential,
    unit: 'units',
    source: 'CALCULATED',
    pageSection: 'Page 2',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: `${formatNumber(finOpportunity.residentialUnitPotential)} units`
  });
  
  kpis.push({
    id: kpiId++,
    category: 'financial_opportunity',
    name: 'Hotel Room Potential (New)',
    value: finOpportunity.hotelRoomPotential,
    unit: 'rooms',
    source: 'CALCULATED',
    pageSection: 'Page 3',
    calculationMethod: 'Direct from report',
    confidence: 'high',
    formattedValue: `${formatNumber(finOpportunity.hotelRoomPotential)} rooms`
  });
  
  return kpis;
}

/**
 * Group KPIs by category
 */
export function groupKPIsByCategory(kpis: KPI[]): KPICategorySummary[] {
  const categories: KPICategory[] = [
    'site_parcel_metrics',
    'existing_building_metrics',
    'zoning_regulatory',
    'development_capacity',
    'residential_capacity',
    'lodging_capacity',
    'commercial_office_capacity',
    'setback_requirements',
    'allowed_uses',
    'financial_opportunity'
  ];
  
  return categories.map(category => {
    const categoryKpis = kpis.filter(k => k.category === category);
    return {
      category,
      label: KPI_CATEGORY_LABELS[category],
      kpiCount: categoryKpis.length,
      kpis: categoryKpis
    };
  }).filter(c => c.kpiCount > 0);
}

/**
 * Export KPIs to CSV format
 */
export function kpisToCSV(kpis: KPI[]): string {
  const headers = ['KPI_Number', 'Category', 'KPI_Name', 'Value', 'Source', 'Page_Section', 'Calculation_Method'];
  const rows = kpis.map(kpi => [
    kpi.id,
    KPI_CATEGORY_LABELS[kpi.category],
    kpi.name,
    String(kpi.formattedValue || kpi.value),
    kpi.source,
    kpi.pageSection || '-',
    kpi.calculationMethod || '-'
  ]);
  
  return [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export { calculateDevelopmentCapacity, calculateFinancialOpportunity };
