/**
 * ZoneWise.AI Envelope Module
 * 
 * Components and utilities for 3D building envelope visualization.
 * 
 * @module envelope
 * @version 1.0.0
 */

// Components
export { EnvelopeViewer, type EnvelopeViewerProps } from './EnvelopeViewer';
export { EnvelopeTest } from './EnvelopeTest';

// Re-export types and utilities from lib
export { 
  generateBuildingEnvelope,
  calculateLotStats,
  geoToLocal as envelopeGeoToLocal,
  localToGeo as envelopeLocalToGeo,
  type ZoningDIMS,
  type EnvelopeResult
} from '../../lib/envelope-generator';

// Re-export sample data for testing
export {
  MALABAR_DISTRICTS,
  SAMPLE_LOT_POLYGON,
  DEFAULT_TEST_DIMS,
  getDistrictByCode,
  getAllDistrictCodes
} from '../../data/malabar-sample-data';
