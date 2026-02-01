/**
 * ZoneWise V2 - Development Analysis Report Types
 * Comprehensive KPI schema supporting 63+ metrics across 10 categories
 */

// KPI Categories
export type KPICategory = 
  | 'site_parcel_metrics'
  | 'existing_building_metrics'
  | 'zoning_regulatory'
  | 'development_capacity'
  | 'residential_capacity'
  | 'lodging_capacity'
  | 'commercial_office_capacity'
  | 'setback_requirements'
  | 'allowed_uses'
  | 'financial_opportunity';

export const KPI_CATEGORY_LABELS: Record<KPICategory, string> = {
  site_parcel_metrics: 'Site & Parcel Metrics',
  existing_building_metrics: 'Existing Building Metrics',
  zoning_regulatory: 'Zoning & Regulatory',
  development_capacity: 'Development Capacity',
  residential_capacity: 'Residential Capacity',
  lodging_capacity: 'Lodging Capacity',
  commercial_office_capacity: 'Commercial/Office Capacity',
  setback_requirements: 'Setback Requirements',
  allowed_uses: 'Allowed Uses',
  financial_opportunity: 'Financial Opportunity'
};

export type DataSource = 'DIRECT' | 'CALCULATED' | 'ESTIMATED' | 'INFERRED' | 'GIS' | 'COUNTY_API' | 'CENSUS' | 'AI_ANALYSIS';

export interface KPI {
  id: number;
  category: KPICategory;
  name: string;
  value: string | number | boolean | null;
  unit?: string;
  source: DataSource;
  sourceDocument?: string;
  pageSection?: string;
  calculationMethod?: string;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  formattedValue?: string;
}

export interface KPICategorySummary {
  category: KPICategory;
  label: string;
  kpiCount: number;
  kpis: KPI[];
}

export interface PropertyInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  parcelId: string;
  legalDescription?: string;
  county: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
}

export interface SiteMetrics {
  lotAreaAcres: number;
  lotAreaSqFt: number;
  lotAreaTaxRecord?: number;
  lotAreaParcelShape?: number;
  lotType: 'Interior' | 'Corner' | 'Through' | 'Flag' | 'Irregular';
  frontageLength: number;
  isVacant: boolean;
  currentLandUse: string;
}

export interface ExistingBuildingMetrics {
  buildingArea: number;
  buildingUse: string;
  yearBuilt: number;
  stories?: number;
  condition?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface ZoningInfo {
  zoningCode: string;
  zoningDistrict: string;
  zoningDescription: string;
  baseFAR: number;
  maxFAR: number;
  maxStories: number;
  maxHeightFeet?: number;
  maxLotCoverage: number;
  minOpenSpace: number;
  faaHeightLimitation?: number;
  historicDistrict?: string;
  leedRequirement?: string;
  liveLocalApplicability?: boolean;
  todStatus?: string;
  transitCorridor?: boolean;
}

export interface SetbackRequirements {
  primaryFrontage: number;
  secondaryFrontage?: number;
  side: number | null;
  rear: number;
  water?: number | null;
}

export interface AllowedUseCategory {
  byRight: string[];
  byWarrant: string[];
  byException: string[];
}

export interface AllowedUses {
  residential: AllowedUseCategory;
  commercial: AllowedUseCategory;
  office: AllowedUseCategory;
  civic: AllowedUseCategory;
  educational: AllowedUseCategory;
  lodging: AllowedUseCategory;
}

export interface DevelopmentCapacity {
  maxBuildingArea: number;
  maxBuildingHeightStories: number;
  maxBuildingHeightFeet?: number;
  maxBuildingFootprint: number;
  maxLotCoverage: number;
  unusedDevelopmentRights: number;
  currentFARUtilization: number;
  farUtilizationRate: number;
  residentialDensity?: number;
  maxResidentialArea?: number;
  maxResidentialUnits?: number;
  lodgingDensity?: number;
  maxLodgingArea?: number;
  maxLodgingRooms?: number;
  maxOfficeArea?: number;
  maxCommercialArea?: number;
  officeExpansionPotential?: number;
}

export interface FinancialOpportunity {
  developmentRightsUtilization: number;
  untappedDevelopmentPotential: number;
  verticalExpansionStories: number;
  lotCoverageUtilization: number;
  additionalBuildableArea: number;
  residentialUnitPotential: number;
  hotelRoomPotential: number;
}

export type DevelopmentScenarioType = 'mixed_use' | 'residential_only' | 'hotel_condo' | 'office_expansion' | 'retail_destination' | 'adaptive_reuse';

export interface DevelopmentComponent {
  type: 'residential' | 'hotel' | 'office' | 'retail' | 'parking' | 'amenity';
  name: string;
  area: number;
  units?: number;
  unitType?: string;
  avgUnitSize?: number;
  annualRevenue?: number;
  capRate?: number;
  assetValue?: number;
}

export interface DevelopmentCosts {
  hardCosts: number;
  softCosts: number;
  landCost: number;
  financingCosts: number;
  contingency: number;
  totalCost: number;
}

export interface FinancialProjections {
  totalRevenue: number;
  weightedCapRate: number;
  totalAssetValue: number;
  developmentProfit: number;
  roi: number;
  irr: number;
  equityMultiple: number;
  cashOnCash: number;
}

export interface DevelopmentScenario {
  id: string;
  name: string;
  type: DevelopmentScenarioType;
  description: string;
  isRecommended?: boolean;
  totalSqFt: number;
  stories: number;
  farUtilization: number;
  components: DevelopmentComponent[];
  costs: DevelopmentCosts;
  projections: FinancialProjections;
  riskLevel: 'Low' | 'Medium-Low' | 'Medium' | 'Medium-High' | 'High';
  revenueStreams: number;
  marketDemand: 'Low' | 'Medium' | 'Medium-High' | 'High' | 'Very High';
  managementComplexity: 'Low' | 'Medium' | 'High';
  exitFlexibility: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  timeframe: string;
  budget?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  category: 'team' | 'legal' | 'design' | 'permits' | 'financial' | 'marketing' | 'technical';
  subTasks?: string[];
}

export interface DevelopmentAnalysisReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  property: PropertyInfo;
  site: SiteMetrics;
  existingBuilding?: ExistingBuildingMetrics;
  zoning: ZoningInfo;
  setbacks: SetbackRequirements;
  allowedUses: AllowedUses;
  developmentCapacity: DevelopmentCapacity;
  financialOpportunity: FinancialOpportunity;
  kpis: KPI[];
  kpisByCategory: KPICategorySummary[];
  scenarios: DevelopmentScenario[];
  recommendedScenario?: DevelopmentScenario;
  executiveSummary: {
    keyFindings: string[];
    opportunities: string[];
    challenges: string[];
    recommendation: string;
  };
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'markdown' | 'github';
