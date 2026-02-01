/**
 * ZoneWise.AI Envelope Generator Tests
 * 
 * Comprehensive tests for all 13 Malabar zoning districts.
 * Tests envelope generation, setback calculations, and area computations.
 * 
 * @module envelope-generator.test
 * @version 1.0.0
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import * as turf from '@turf/turf';
import { 
  generateBuildingEnvelope, 
  calculateLotStats,
  ZoningDIMS 
} from '../lib/envelope-generator';

// ============================================================================
// Test Data - All 13 Malabar Zoning Districts
// ============================================================================

const MALABAR_DISTRICTS: Record<string, ZoningDIMS> = {
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

// Sample 1-acre lot polygon for testing
const SAMPLE_LOT: turf.Feature<turf.Polygon> = turf.polygon([[
  [-80.5680, 28.0040],
  [-80.5665, 28.0040],
  [-80.5665, 28.0055],
  [-80.5680, 28.0055],
  [-80.5680, 28.0040]
]]);

// ============================================================================
// Test Suites
// ============================================================================

describe('Envelope Generator - All 13 Malabar Districts', () => {
  
  // Test each district
  Object.entries(MALABAR_DISTRICTS).forEach(([code, dims]) => {
    
    describe(`${code}: ${dims.district_name}`, () => {
      
      test('generates envelope without errors', () => {
        const result = generateBuildingEnvelope(SAMPLE_LOT, dims);
        
        expect(result).toBeDefined();
        expect(result.geometry).toBeDefined();
        expect(result.maxBuildableArea).toBeGreaterThan(0);
        expect(result.maxGFA).toBeGreaterThan(0);
        expect(result.maxFloors).toBeGreaterThan(0);
      });
      
      test('calculates correct max floors from height', () => {
        const result = generateBuildingEnvelope(SAMPLE_LOT, dims);
        const expectedFloors = Math.floor(dims.max_height_ft / 10);
        
        expect(result.maxFloors).toBe(expectedFloors);
      });
      
      test('buildable area is less than lot area (setbacks applied)', () => {
        const result = generateBuildingEnvelope(SAMPLE_LOT, dims);
        const lotArea = turf.area(SAMPLE_LOT) * 10.7639; // sq meters to sq feet
        
        expect(result.maxBuildableArea).toBeLessThan(lotArea);
      });
      
      test('GFA equals lot area * FAR', () => {
        const result = generateBuildingEnvelope(SAMPLE_LOT, dims);
        const lotArea = turf.area(SAMPLE_LOT) * 10.7639;
        const expectedGFA = Math.round(lotArea * dims.max_far);
        
        // Allow 1% tolerance for rounding
        expect(result.maxGFA).toBeCloseTo(expectedGFA, -2);
      });
      
      test('setback polygon is valid GeoJSON', () => {
        const result = generateBuildingEnvelope(SAMPLE_LOT, dims);
        
        expect(result.setbackPolygon).toBeDefined();
        expect(result.setbackPolygon.type).toBe('Feature');
        expect(result.setbackPolygon.geometry.type).toBe('Polygon');
        expect(result.setbackPolygon.geometry.coordinates).toHaveLength(1);
        expect(result.setbackPolygon.geometry.coordinates[0].length).toBeGreaterThan(3);
      });
      
      test('geometry has valid position attribute', () => {
        const result = generateBuildingEnvelope(SAMPLE_LOT, dims);
        const positionAttr = result.geometry.getAttribute('position');
        
        expect(positionAttr).toBeDefined();
        expect(positionAttr.count).toBeGreaterThan(0);
      });
      
      test('geometry has valid normal attribute', () => {
        const result = generateBuildingEnvelope(SAMPLE_LOT, dims);
        const normalAttr = result.geometry.getAttribute('normal');
        
        expect(normalAttr).toBeDefined();
        expect(normalAttr.count).toBe(result.geometry.getAttribute('position')!.count);
      });
      
      test('center coordinates are within Florida', () => {
        const result = generateBuildingEnvelope(SAMPLE_LOT, dims);
        const [lng, lat] = result.center;
        
        // Florida bounds (approximate)
        expect(lng).toBeGreaterThan(-88);
        expect(lng).toBeLessThan(-79);
        expect(lat).toBeGreaterThan(24);
        expect(lat).toBeLessThan(31);
      });
    });
  });
});

describe('calculateLotStats', () => {
  
  test('returns correct stats for RS-1 district', () => {
    const dims = MALABAR_DISTRICTS['RS-1'];
    const stats = calculateLotStats(SAMPLE_LOT, dims);
    
    expect(stats.lotArea).toBeGreaterThan(0);
    expect(stats.buildableArea).toBeGreaterThan(0);
    expect(stats.buildableArea).toBeLessThan(stats.lotArea);
    expect(stats.maxGFA).toBe(Math.round(stats.lotArea * dims.max_far));
    expect(stats.maxFloors).toBe(3); // 35ft / 10ft = 3 floors
  });
  
  test('meetsMinLot flag is correct', () => {
    const dims = MALABAR_DISTRICTS['RS-1']; // 1 acre min
    const stats = calculateLotStats(SAMPLE_LOT, dims);
    const lotAreaAcres = stats.lotArea / 43560;
    
    if (lotAreaAcres >= 1) {
      expect(stats.meetsMinLot).toBe(true);
    } else {
      expect(stats.meetsMinLot).toBe(false);
    }
  });
});

describe('Edge Cases', () => {
  
  test('handles very small lots', () => {
    const smallLot = turf.polygon([[
      [-80.568, 28.004],
      [-80.5679, 28.004],
      [-80.5679, 28.0041],
      [-80.568, 28.0041],
      [-80.568, 28.004]
    ]]);
    const dims = MALABAR_DISTRICTS['RS-2.5'];
    
    // Should not throw
    const result = generateBuildingEnvelope(smallLot, dims);
    expect(result.maxBuildableArea).toBeGreaterThanOrEqual(0);
  });
  
  test('handles large setbacks that nearly consume lot', () => {
    const smallLot = turf.polygon([[
      [-80.568, 28.004],
      [-80.5678, 28.004],
      [-80.5678, 28.0042],
      [-80.568, 28.0042],
      [-80.568, 28.004]
    ]]);
    const dims = MALABAR_DISTRICTS['CON']; // 100ft front setback
    
    // Should not throw, should return minimal buildable area
    const result = generateBuildingEnvelope(smallLot, dims);
    expect(result).toBeDefined();
  });
  
  test('handles irregular polygon shapes', () => {
    const irregularLot = turf.polygon([[
      [-80.568, 28.004],
      [-80.567, 28.0042],
      [-80.566, 28.004],
      [-80.5665, 28.0055],
      [-80.5675, 28.005],
      [-80.568, 28.004]
    ]]);
    const dims = MALABAR_DISTRICTS['RS-10'];
    
    const result = generateBuildingEnvelope(irregularLot, dims);
    expect(result.maxBuildableArea).toBeGreaterThan(0);
  });
});

describe('Performance', () => {
  
  test('generates envelope in under 100ms', () => {
    const dims = MALABAR_DISTRICTS['RS-1'];
    
    const start = performance.now();
    generateBuildingEnvelope(SAMPLE_LOT, dims);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  test('generates all 13 districts in under 500ms', () => {
    const start = performance.now();
    
    Object.values(MALABAR_DISTRICTS).forEach(dims => {
      generateBuildingEnvelope(SAMPLE_LOT, dims);
    });
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
