/**
 * ZoneWise.AI Envelope Module
 * 
 * Components and utilities for 3D building envelope visualization.
 * 
 * @module envelope
 * @version 1.0.0
 */

// ============================================================================
// Main Components
// ============================================================================

export { EnvelopeViewer, type EnvelopeViewerProps } from './EnvelopeViewer';
export { MapEnvelopeViewer, type MapEnvelopeViewerProps } from './MapEnvelopeViewer';
export { ZoneWiseApp } from './ZoneWiseApp';
export { EnvelopeTest } from './EnvelopeTest';

// ============================================================================
// Core Library
// ============================================================================

export { 
  generateBuildingEnvelope,
  calculateLotStats,
  geoToLocal as envelopeGeoToLocal,
  localToGeo as envelopeLocalToGeo,
  type ZoningDIMS,
  type EnvelopeResult
} from '../../lib/envelope-generator';

export * from '../../lib/geo-utils';

// ============================================================================
// Supabase Integration
// ============================================================================

export {
  getSupabaseClient,
  fetchZoningDistricts,
  fetchZoningDistrictByCode,
  searchZoningDistricts,
  fetchJurisdictions,
  fetchJurisdictionsByCounty,
  fetchJurisdictionByName,
  type ZoningDistrictRow,
  type JurisdictionRow,
  type ZoningSearchParams,
  type AsyncState,
  createInitialAsyncState
} from '../../lib/supabase-zoning';

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
