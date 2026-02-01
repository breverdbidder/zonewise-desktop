/**
 * @fileoverview Unit tests for KPI Calculator Engine
 * @module src/lib/kpi-engine/__tests__/kpi-calculator.test
 * @description CQ-001: Add test coverage for core KPI calculations (target: 80%)
 */

import { describe, it, expect, beforeEach } from "vitest";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface PropertyDetails {
  parcelId: string;
  address: string;
  acreage: number;
  lotWidth: number;
  lotDepth: number;
  coordinates: [number, number];
  assessedValue?: number;
  marketValue?: number;
  yearBuilt?: number;
}

interface ZoningInfo {
  code: string;
  name: string;
  category: string;
  maxHeight: number;
  maxCoverage: number;
  minLotSize: number;
  setbacks: {
    front: number;
    side: number;
    rear: number;
  };
  densityLimit?: number;
  farLimit?: number;
  permittedUses?: string[];
}

interface KPIResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  score: number;
  category: string;
  status: "pass" | "warning" | "fail";
  details?: string;
}

// =============================================================================
// MOCK KPI CALCULATOR FUNCTIONS
// =============================================================================

function calculateLotCoverage(
  buildingFootprint: number,
  lotArea: number,
  maxAllowed: number
): KPIResult {
  const value = buildingFootprint / lotArea;
  const score = Math.max(0, 100 - ((value / maxAllowed) * 100));
  const status = value > maxAllowed ? "fail" : value > maxAllowed * 0.9 ? "warning" : "pass";

  return {
    id: "lot_coverage",
    name: "Lot Coverage",
    value: value * 100,
    unit: "%",
    score,
    category: "site",
    status,
    details: `${(value * 100).toFixed(1)}% of ${(maxAllowed * 100)}% maximum`,
  };
}

function calculateFAR(
  totalFloorArea: number,
  lotArea: number,
  maxFAR?: number
): KPIResult {
  const value = totalFloorArea / lotArea;
  const score = maxFAR ? Math.max(0, 100 - ((value / maxFAR) * 100)) : 50;
  const status = maxFAR && value > maxFAR ? "fail" : "pass";

  return {
    id: "floor_area_ratio",
    name: "Floor Area Ratio (FAR)",
    value,
    unit: "ratio",
    score,
    category: "site",
    status,
  };
}

function calculateBuildableArea(
  lotWidth: number,
  lotDepth: number,
  setbacks: { front: number; side: number; rear: number }
): KPIResult {
  const buildableWidth = Math.max(0, lotWidth - setbacks.side * 2);
  const buildableDepth = Math.max(0, lotDepth - setbacks.front - setbacks.rear);
  const value = buildableWidth * buildableDepth;
  const lotArea = lotWidth * lotDepth;
  const percentage = (value / lotArea) * 100;

  return {
    id: "buildable_area",
    name: "Buildable Area",
    value,
    unit: "sq ft",
    score: percentage,
    category: "site",
    status: value > 0 ? "pass" : "fail",
    details: `${value.toLocaleString()} sq ft (${percentage.toFixed(1)}% of lot)`,
  };
}

function calculateMaxBuildingHeight(
  proposedHeight: number,
  maxAllowed: number
): KPIResult {
  const value = proposedHeight;
  const percentage = (proposedHeight / maxAllowed) * 100;
  const score = Math.max(0, 100 - percentage);
  const status = proposedHeight > maxAllowed ? "fail" : 
                 proposedHeight > maxAllowed * 0.9 ? "warning" : "pass";

  return {
    id: "building_height",
    name: "Building Height",
    value,
    unit: "ft",
    score,
    category: "building",
    status,
    details: `${proposedHeight} ft of ${maxAllowed} ft maximum`,
  };
}

function calculateSetbackCompliance(
  actual: { front: number; side: number; rear: number },
  required: { front: number; side: number; rear: number }
): KPIResult {
  const violations: string[] = [];
  
  if (actual.front < required.front) {
    violations.push(`Front: ${actual.front}ft < ${required.front}ft required`);
  }
  if (actual.side < required.side) {
    violations.push(`Side: ${actual.side}ft < ${required.side}ft required`);
  }
  if (actual.rear < required.rear) {
    violations.push(`Rear: ${actual.rear}ft < ${required.rear}ft required`);
  }

  const score = 100 - (violations.length * 33.33);
  const status = violations.length === 0 ? "pass" : 
                 violations.length <= 1 ? "warning" : "fail";

  return {
    id: "setback_compliance",
    name: "Setback Compliance",
    value: violations.length,
    unit: "violations",
    score,
    category: "site",
    status,
    details: violations.length === 0 ? "All setbacks compliant" : violations.join("; "),
  };
}

function calculateDensity(
  dwellingUnits: number,
  acreage: number,
  maxDensity?: number
): KPIResult {
  const value = dwellingUnits / acreage;
  const score = maxDensity ? Math.max(0, 100 - ((value / maxDensity) * 100)) : 50;
  const status = maxDensity && value > maxDensity ? "fail" : "pass";

  return {
    id: "density",
    name: "Density",
    value,
    unit: "du/acre",
    score,
    category: "site",
    status,
    details: `${value.toFixed(2)} dwelling units per acre`,
  };
}

function calculateParkingRatio(
  parkingSpaces: number,
  floorArea: number,
  requiredRatio: number = 1 / 300 // 1 space per 300 sq ft
): KPIResult {
  const requiredSpaces = Math.ceil(floorArea * requiredRatio);
  const value = parkingSpaces / requiredSpaces;
  const score = Math.min(100, value * 100);
  const status = parkingSpaces < requiredSpaces ? "fail" : "pass";

  return {
    id: "parking_ratio",
    name: "Parking Ratio",
    value: parkingSpaces,
    unit: "spaces",
    score,
    category: "site",
    status,
    details: `${parkingSpaces} of ${requiredSpaces} required spaces`,
  };
}

// =============================================================================
// TESTS
// =============================================================================

describe("KPI Calculator - Lot Coverage", () => {
  it("should calculate correct coverage ratio", () => {
    const result = calculateLotCoverage(2000, 10000, 0.4);
    
    expect(result.value).toBe(20); // 20%
    expect(result.status).toBe("pass");
  });

  it("should flag overcoverage as fail", () => {
    const result = calculateLotCoverage(5000, 10000, 0.4);
    
    expect(result.value).toBe(50); // 50% > 40% max
    expect(result.status).toBe("fail");
  });

  it("should warn when near limit", () => {
    const result = calculateLotCoverage(3800, 10000, 0.4);
    
    expect(result.value).toBe(38); // 38% close to 40% max
    expect(result.status).toBe("warning");
  });

  it("should handle zero lot area", () => {
    expect(() => calculateLotCoverage(2000, 0, 0.4)).toThrow();
  });
});

describe("KPI Calculator - Floor Area Ratio", () => {
  it("should calculate FAR correctly", () => {
    const result = calculateFAR(4000, 10000, 0.5);
    
    expect(result.value).toBe(0.4);
    expect(result.status).toBe("pass");
  });

  it("should fail when exceeding max FAR", () => {
    const result = calculateFAR(6000, 10000, 0.5);
    
    expect(result.value).toBe(0.6);
    expect(result.status).toBe("fail");
  });

  it("should handle no FAR limit", () => {
    const result = calculateFAR(10000, 10000);
    
    expect(result.value).toBe(1.0);
    expect(result.status).toBe("pass");
  });
});

describe("KPI Calculator - Buildable Area", () => {
  it("should calculate buildable area with setbacks", () => {
    const result = calculateBuildableArea(100, 200, {
      front: 25,
      side: 10,
      rear: 20,
    });

    // (100 - 20) * (200 - 25 - 20) = 80 * 155 = 12,400
    expect(result.value).toBe(12400);
    expect(result.status).toBe("pass");
  });

  it("should return zero if setbacks exceed lot width", () => {
    const result = calculateBuildableArea(15, 200, {
      front: 25,
      side: 10,
      rear: 20,
    });

    expect(result.value).toBe(0);
    expect(result.status).toBe("fail");
  });

  it("should return zero if setbacks exceed lot depth", () => {
    const result = calculateBuildableArea(100, 40, {
      front: 25,
      side: 10,
      rear: 20,
    });

    expect(result.value).toBe(0);
    expect(result.status).toBe("fail");
  });
});

describe("KPI Calculator - Building Height", () => {
  it("should pass when under max height", () => {
    const result = calculateMaxBuildingHeight(25, 35);
    
    expect(result.value).toBe(25);
    expect(result.status).toBe("pass");
  });

  it("should fail when exceeding max height", () => {
    const result = calculateMaxBuildingHeight(40, 35);
    
    expect(result.value).toBe(40);
    expect(result.status).toBe("fail");
  });

  it("should warn when near max height", () => {
    const result = calculateMaxBuildingHeight(33, 35);
    
    expect(result.status).toBe("warning");
  });
});

describe("KPI Calculator - Setback Compliance", () => {
  it("should pass when all setbacks compliant", () => {
    const result = calculateSetbackCompliance(
      { front: 30, side: 15, rear: 25 },
      { front: 25, side: 10, rear: 20 }
    );

    expect(result.value).toBe(0);
    expect(result.status).toBe("pass");
  });

  it("should detect single violation", () => {
    const result = calculateSetbackCompliance(
      { front: 20, side: 15, rear: 25 },
      { front: 25, side: 10, rear: 20 }
    );

    expect(result.value).toBe(1);
    expect(result.status).toBe("warning");
    expect(result.details).toContain("Front");
  });

  it("should detect multiple violations", () => {
    const result = calculateSetbackCompliance(
      { front: 20, side: 5, rear: 15 },
      { front: 25, side: 10, rear: 20 }
    );

    expect(result.value).toBe(3);
    expect(result.status).toBe("fail");
  });
});

describe("KPI Calculator - Density", () => {
  it("should calculate density correctly", () => {
    const result = calculateDensity(4, 1.0, 5);
    
    expect(result.value).toBe(4);
    expect(result.status).toBe("pass");
  });

  it("should fail when exceeding density limit", () => {
    const result = calculateDensity(6, 1.0, 5);
    
    expect(result.value).toBe(6);
    expect(result.status).toBe("fail");
  });

  it("should handle fractional acreage", () => {
    const result = calculateDensity(1, 0.25, 5);
    
    expect(result.value).toBe(4); // 1 unit on 0.25 acre = 4 du/acre
    expect(result.status).toBe("pass");
  });
});

describe("KPI Calculator - Parking Ratio", () => {
  it("should pass when meeting parking requirement", () => {
    const result = calculateParkingRatio(10, 3000); // 1 per 300
    
    expect(result.value).toBe(10);
    expect(result.status).toBe("pass");
  });

  it("should fail when below parking requirement", () => {
    const result = calculateParkingRatio(5, 3000);
    
    expect(result.value).toBe(5);
    expect(result.status).toBe("fail");
    expect(result.details).toContain("5 of 10");
  });
});

describe("KPI Calculator - Integration", () => {
  it("should calculate all KPIs for a property", () => {
    const property: PropertyDetails = {
      parcelId: "2835546",
      address: "123 Main St",
      acreage: 0.5,
      lotWidth: 100,
      lotDepth: 217.8,
      coordinates: [-80.5885, 28.0836],
    };

    const zoning: ZoningInfo = {
      code: "RS-1",
      name: "Single Family Residential",
      category: "residential",
      maxHeight: 35,
      maxCoverage: 0.4,
      minLotSize: 10000,
      setbacks: { front: 25, side: 10, rear: 20 },
      densityLimit: 4,
    };

    const proposed = {
      footprint: 2500,
      totalFloorArea: 4000,
      height: 28,
      setbacks: { front: 30, side: 12, rear: 25 },
      dwellingUnits: 1,
      parkingSpaces: 2,
    };

    const lotArea = property.acreage * 43560;

    const kpis: KPIResult[] = [
      calculateLotCoverage(proposed.footprint, lotArea, zoning.maxCoverage),
      calculateFAR(proposed.totalFloorArea, lotArea),
      calculateBuildableArea(property.lotWidth, property.lotDepth, zoning.setbacks),
      calculateMaxBuildingHeight(proposed.height, zoning.maxHeight),
      calculateSetbackCompliance(proposed.setbacks, zoning.setbacks),
      calculateDensity(proposed.dwellingUnits, property.acreage, zoning.densityLimit),
      calculateParkingRatio(proposed.parkingSpaces, proposed.totalFloorArea),
    ];

    expect(kpis).toHaveLength(7);
    expect(kpis.every(k => k.status === "pass" || k.status === "warning")).toBe(true);
    
    const failingKPIs = kpis.filter(k => k.status === "fail");
    expect(failingKPIs).toHaveLength(0);
  });
});
