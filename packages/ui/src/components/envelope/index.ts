/**
 * ZoneWise.AI Envelope Module
 * 
 * Complete module for 3D building envelope visualization with sun/shadow analysis.
 * 
 * @module envelope
 * @version 1.1.0
 */

// ============================================================================
// Phase 1-4: Core Components
// ============================================================================

export { EnvelopeViewer, type EnvelopeViewerProps } from './EnvelopeViewer';
export { MapEnvelopeViewer, type MapEnvelopeViewerProps } from './MapEnvelopeViewer';
export { ZoneWiseApp } from './ZoneWiseApp';
export { EnvelopeTest } from './EnvelopeTest';
export { ExportPanel, type ExportPanelProps } from './ExportPanel';

// ============================================================================
// Phase 5: Sun/Shadow Components
// ============================================================================

export { SunShadowViewer, type SunShadowViewerProps } from './SunShadowViewer';
export { SunHoursHeatmap, type SunHoursHeatmapProps } from './SunHoursHeatmap';

// ============================================================================
// Core Library - Envelope Generation
// ============================================================================

export { 
  generateBuildingEnvelope,
  calculateLotStats,
  geoToLocal,
  localToGeo,
  type ZoningDIMS,
  type EnvelopeResult
} from '../../lib/envelope-generator';

// ============================================================================
// Core Library - Geospatial Utilities
// ============================================================================

export {
  feetToMeters,
  metersToFeet,
  sqftToSqm,
  sqmToSqft,
  metersPerDegreeLon,
  geoToLocal as geoUtilsGeoToLocal,
  localToGeo as geoUtilsLocalToGeo,
  geoToThree,
  threeToGeo,
  getPolygonCenter,
  getPolygonBbox,
  getPolygonAreaSqFt,
  calculateViewDistance,
  formatCoordinates,
  parseCoordinates,
  calculateBearing,
  calculateDistance
} from '../../lib/geo-utils';

// ============================================================================
// Core Library - Export Utilities
// ============================================================================

export {
  exportToPNG,
  exportToPNGWithOverlay,
  exportToOBJ,
  exportToOBJWithMaterial,
  exportToJSON,
  exportToGeoJSON
} from '../../lib/export-utils';

// ============================================================================
// Core Library - Sun Analysis (Phase 5)
// ============================================================================

export {
  calculateSunPosition,
  getSunTimes,
  getDaylightHours,
  generateSunPath,
  sunPositionToVector,
  getSunDirection,
  createSunLight,
  analyzeSunHours,
  generateAnalysisGrid,
  getSunHoursColor,
  createSunHoursHeatmap,
  getSolarDates,
  formatTime,
  formatSunPosition,
  isDST,
  type SunPosition,
  type SunTimes,
  type SunPathPoint,
  type ShadowAnalysis,
  type SunAnalysisConfig
} from '../../lib/sun-analysis';

// ============================================================================
// Core Library - Supabase Integration
// ============================================================================

export {
  getSupabaseClient,
  fetchZoningDistricts,
  fetchZoningDistrictByCode,
  searchZoningDistricts,
  fetchJurisdictions,
  fetchJurisdictionsByCounty,
  fetchJurisdictionByName,
  createInitialAsyncState,
  type ZoningDistrictRow,
  type JurisdictionRow,
  type ZoningSearchParams,
  type AsyncState
} from '../../lib/supabase-zoning';

// ============================================================================
// Core Library - Responsive Utilities
// ============================================================================

export {
  BREAKPOINTS,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useMediaQuery,
  useIsTouchDevice,
  useOrientation,
  useWindowSize,
  getResponsiveLayout,
  getViewerSettings,
  type Breakpoint
} from '../../lib/use-responsive';

// ============================================================================
// Sample Data (for testing)
// ============================================================================

export {
  MALABAR_DISTRICTS,
  SAMPLE_LOT_POLYGON,
  DEFAULT_TEST_DIMS,
  getDistrictByCode,
  getAllDistrictCodes
} from '../../data/malabar-sample-data';
