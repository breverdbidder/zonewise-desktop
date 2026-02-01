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

// Re-export types and utilities from lib
export { 
  generateBuildingEnvelope,
  calculateLotStats,
  geoToLocal as envelopeGeoToLocal,
  localToGeo as envelopeLocalToGeo,
  type ZoningDIMS,
  type EnvelopeResult
} from '../../lib/envelope-generator';
