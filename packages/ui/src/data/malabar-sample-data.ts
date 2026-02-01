/**
 * Malabar Zoning Sample Data
 * 
 * Real zoning data from Town of Malabar, FL for testing the EnvelopeViewer.
 * Source: Malabar Land Development Code Article III (Municode verified)
 * 
 * @module malabar-sample-data
 */

import { ZoningDIMS } from '../lib/envelope-generator';

/**
 * All 13 Malabar Zoning Districts with verified DIMS
 * Source: library.municode.com - Town of Malabar LDC Article III
 */
export const MALABAR_DISTRICTS: Record<string, ZoningDIMS> = {
  'RR-65': {
    district_code: 'RR-65',
    district_name: 'Rural Residential (65,000 sf)',
    min_lot_sqft: 65000,
    min_lot_width_ft: 150,
    max_height_ft: 35,
    max_far: 0.25,
    setbacks_ft: { front: 50, side: 25, rear: 25 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'RS-65': {
    district_code: 'RS-65',
    district_name: 'Residential Single-Family (65,000 sf)',
    min_lot_sqft: 65000,
    min_lot_width_ft: 150,
    max_height_ft: 35,
    max_far: 0.25,
    setbacks_ft: { front: 35, side: 15, rear: 25 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'RS-10': {
    district_code: 'RS-10',
    district_name: 'Residential Single-Family (10,000 sf)',
    min_lot_sqft: 10000,
    min_lot_width_ft: 85,
    max_height_ft: 35,
    max_far: 0.35,
    setbacks_ft: { front: 25, side: 7.5, rear: 20 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'RS-5': {
    district_code: 'RS-5',
    district_name: 'Residential Single-Family (5,000 sf)',
    min_lot_sqft: 5000,
    min_lot_width_ft: 50,
    max_height_ft: 35,
    max_far: 0.40,
    setbacks_ft: { front: 20, side: 5, rear: 15 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'RS-2.5': {
    district_code: 'RS-2.5',
    district_name: 'Residential Single-Family (2,500 sf)',
    min_lot_sqft: 2500,
    min_lot_width_ft: 40,
    max_height_ft: 35,
    max_far: 0.50,
    setbacks_ft: { front: 20, side: 5, rear: 10 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'RS-1': {
    district_code: 'RS-1',
    district_name: 'Residential Single-Family (1 acre)',
    min_lot_sqft: 43560,
    min_lot_width_ft: 150,
    max_height_ft: 35,
    max_far: 0.30,
    setbacks_ft: { front: 35, side: 15, rear: 25 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'RM-6': {
    district_code: 'RM-6',
    district_name: 'Residential Multi-Family (6 units/acre)',
    min_lot_sqft: 7260,
    min_lot_width_ft: 60,
    max_height_ft: 45,
    max_far: 0.60,
    setbacks_ft: { front: 25, side: 10, rear: 20 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'R/LC': {
    district_code: 'R/LC',
    district_name: 'Residential/Limited Commercial',
    min_lot_sqft: 10000,
    min_lot_width_ft: 100,
    max_height_ft: 35,
    max_far: 0.40,
    setbacks_ft: { front: 25, side: 10, rear: 20 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'C-1': {
    district_code: 'C-1',
    district_name: 'Neighborhood Commercial',
    min_lot_sqft: 10000,
    min_lot_width_ft: 100,
    max_height_ft: 35,
    max_far: 0.50,
    setbacks_ft: { front: 25, side: 10, rear: 20 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'C-2': {
    district_code: 'C-2',
    district_name: 'General Commercial',
    min_lot_sqft: 20000,
    min_lot_width_ft: 100,
    max_height_ft: 45,
    max_far: 0.60,
    setbacks_ft: { front: 30, side: 15, rear: 20 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'GI': {
    district_code: 'GI',
    district_name: 'General Industrial',
    min_lot_sqft: 43560,
    min_lot_width_ft: 150,
    max_height_ft: 50,
    max_far: 0.50,
    setbacks_ft: { front: 50, side: 25, rear: 25 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'PUD': {
    district_code: 'PUD',
    district_name: 'Planned Unit Development',
    min_lot_sqft: 43560,
    min_lot_width_ft: 100,
    max_height_ft: 45,
    max_far: 0.50,
    setbacks_ft: { front: 25, side: 10, rear: 20 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  },
  'CON': {
    district_code: 'CON',
    district_name: 'Conservation',
    min_lot_sqft: 217800,
    min_lot_width_ft: 300,
    max_height_ft: 25,
    max_far: 0.10,
    setbacks_ft: { front: 100, side: 50, rear: 50 },
    source_url: 'https://library.municode.com/fl/malabar/codes/land_development_code',
    verified_date: '2026-01-30',
    jurisdiction: 'Town of Malabar'
  }
};

/**
 * Sample lot polygon in Malabar (approximately 1 acre)
 * Location: Near Malabar Road, Town of Malabar, FL
 * Coordinates: WGS84 (EPSG:4326)
 */
export const SAMPLE_LOT_POLYGON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {
    parcel_id: 'SAMPLE-001',
    address: '123 Sample Road, Malabar, FL 32950',
    owner: 'Test Owner',
    lot_area_sqft: 45000
  },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-80.5695, 28.0035],  // SW corner
      [-80.5680, 28.0035],  // SE corner
      [-80.5680, 28.0050],  // NE corner
      [-80.5695, 28.0050],  // NW corner
      [-80.5695, 28.0035]   // Close polygon (back to SW)
    ]]
  }
};

/**
 * Default test district for quick testing
 */
export const DEFAULT_TEST_DIMS = MALABAR_DISTRICTS['RS-1'];

/**
 * Get district by code
 */
export function getDistrictByCode(code: string): ZoningDIMS | undefined {
  return MALABAR_DISTRICTS[code.toUpperCase()];
}

/**
 * Get all district codes
 */
export function getAllDistrictCodes(): string[] {
  return Object.keys(MALABAR_DISTRICTS);
}
