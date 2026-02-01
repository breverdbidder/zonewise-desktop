---
name: permit-lookup
version: 1.0.0
category: data
priority: 2
author: ZoneWise.AI
created: 2026-02-01
updated: 2026-02-01

description: |
  Search building permits, code violations, and inspection history for Brevard 
  County properties. Identify unpermitted work, active violations, and required 
  permits for renovation projects.

dependencies:
  - httpx: ^0.27.0
  - beautifulsoup4: ^4.12.0

references:
  - brevard-permit-portal.md
  - permit-types.md
  - violation-codes.md

tools_exposed:
  - searchPermits
  - getPermitHistory
  - checkViolations
  - estimatePermitCosts
  - getRequiredPermits

keywords:
  - permits
  - building permit
  - code violation
  - inspection
  - unpermitted work
  - certificate of occupancy
  - CO
---

# Permit Lookup Skill

## Overview

This skill provides access to Brevard County building permit data, code 
violations, and inspection history. Essential for due diligence on foreclosure 
properties to identify unpermitted work and active violations.

## When to Use This Skill

Load this skill when the user asks about:
- Building permits for a property
- Code violations or liens
- Inspection history
- Unpermitted work / additions
- Certificate of Occupancy (CO)
- Required permits for renovation
- Permit costs and timeline

## Data Sources

| Source | URL | Data |
|--------|-----|------|
| Brevard County Permits | permits.brevardfl.gov | Active & historical permits |
| Code Enforcement | brevardfl.gov/CodeEnforcement | Violations & liens |
| BCPAO | bcpao.us | Property details, additions |

## Core Functions

### 1. Search Permits

```typescript
interface Permit {
  permitNumber: string;
  type: PermitType;
  status: 'Active' | 'Closed' | 'Expired' | 'Void';
  description: string;
  issuedDate: Date;
  expirationDate: Date;
  finalDate?: Date;
  contractor: string;
  estimatedCost: number;
  inspections: Inspection[];
}

type PermitType = 
  | 'Building'
  | 'Electrical'
  | 'Plumbing'
  | 'Mechanical'
  | 'Roofing'
  | 'Pool'
  | 'Fence'
  | 'Demolition'
  | 'Site Work';

async function searchPermits(
  parcelId: string,
  startDate?: Date,
  endDate?: Date,
  permitType?: PermitType
): Promise<Permit[]>
```

### 2. Get Permit History

```typescript
interface PermitHistory {
  parcelId: string;
  address: string;
  totalPermits: number;
  permits: Permit[];
  openPermits: number;
  closedPermits: number;
  expiredPermits: number;
  lastPermitDate: Date;
  estimatedUnpermittedWork: string[];
}

async function getPermitHistory(parcelId: string): Promise<PermitHistory>
```

### 3. Check Violations

```typescript
interface Violation {
  caseNumber: string;
  type: ViolationType;
  status: 'Open' | 'Closed' | 'Lien Filed';
  description: string;
  openedDate: Date;
  closedDate?: Date;
  lienAmount?: number;
  correctiveAction: string;
}

type ViolationType =
  | 'Building Code'
  | 'Zoning'
  | 'Property Maintenance'
  | 'Overgrown Vegetation'
  | 'Unpermitted Construction'
  | 'Unsafe Structure'
  | 'Signs'
  | 'Vehicles';

async function checkViolations(parcelId: string): Promise<Violation[]>
```

### 4. Detect Unpermitted Work

```typescript
interface UnpermittedWorkAnalysis {
  parcelId: string;
  bcpaoSquareFeet: number;
  lastPermittedSqFt: number;
  difference: number;
  suspectedUnpermitted: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

// Compare BCPAO sqft vs permitted additions
async function detectUnpermittedWork(parcelId: string): Promise<UnpermittedWorkAnalysis>
```

### 5. Get Required Permits

```typescript
interface RequiredPermit {
  type: PermitType;
  description: string;
  estimatedCost: number;
  estimatedTimeDays: number;
  contractorRequired: boolean;
  inspectionsRequired: string[];
}

function getRequiredPermits(
  workDescription: string,
  propertyType: 'residential' | 'commercial'
): RequiredPermit[]
```

## Permit Types & Costs (Brevard County 2026)

| Permit Type | Base Fee | Per $1K Cost | Min | Max |
|-------------|----------|--------------|-----|-----|
| Building | $50 | $6.50 | $100 | $5,000 |
| Electrical | $50 | $4.00 | $75 | $2,000 |
| Plumbing | $50 | $4.00 | $75 | $2,000 |
| Mechanical (HVAC) | $50 | $4.00 | $75 | $2,000 |
| Roofing | $50 | $3.00 | $100 | $1,000 |
| Pool | $200 | N/A | $200 | $500 |
| Fence | $50 | N/A | $50 | $100 |
| Demolition | $100 | N/A | $100 | $500 |

### Permit Timeline

| Permit Type | Review Time | Inspection Wait |
|-------------|-------------|-----------------|
| Building (residential) | 5-10 days | 1-2 days |
| Building (commercial) | 15-30 days | 1-2 days |
| Electrical | 1-3 days | 1 day |
| Plumbing | 1-3 days | 1 day |
| Roofing | 1-2 days | 1 day |
| Pool | 10-15 days | 1-2 days |

## Work Requiring Permits

### Always Requires Permit
- New construction
- Additions (any size)
- Structural changes (walls, beams)
- Electrical work (except replacing fixtures)
- Plumbing work (except faucets)
- HVAC replacement
- Roofing (full replacement)
- Pool installation
- Fence over 6ft

### No Permit Required
- Painting (interior/exterior)
- Flooring replacement
- Cabinet replacement
- Fixture replacement (same location)
- Landscaping
- Fence under 6ft (check setbacks)
- Minor repairs (same-for-same)

## Red Flags in Permit History

```typescript
const RED_FLAGS = [
  'Permit expired without final inspection',
  'Building permit but no electrical/plumbing',
  'Square footage increased without permit',
  'Pool with no permit history',
  'Garage conversion (no permit)',
  'Open code violations',
  'Liens from code enforcement',
  'Stop work order',
  'Unsafe structure notice'
];
```

## Integration with Property Analysis

```typescript
async function analyzePermitRisk(parcelId: string): Promise<{
  riskScore: number;  // 0-100
  issues: string[];
  estimatedCostToResolve: number;
  recommendation: string;
}> {
  const permits = await getPermitHistory(parcelId);
  const violations = await checkViolations(parcelId);
  const unpermitted = await detectUnpermittedWork(parcelId);
  
  let riskScore = 0;
  const issues: string[] = [];
  
  // Check for open violations
  if (violations.some(v => v.status === 'Open')) {
    riskScore += 30;
    issues.push('Open code violations');
  }
  
  // Check for liens
  if (violations.some(v => v.lienAmount && v.lienAmount > 0)) {
    riskScore += 25;
    issues.push('Code enforcement liens');
  }
  
  // Check for unpermitted work
  if (unpermitted.riskLevel === 'high') {
    riskScore += 25;
    issues.push('Suspected unpermitted additions');
  }
  
  // Check for expired permits
  if (permits.expiredPermits > 0) {
    riskScore += 15;
    issues.push('Expired permits without final');
  }
  
  return {
    riskScore,
    issues,
    estimatedCostToResolve: calculateResolutionCost(issues),
    recommendation: riskScore > 50 ? 'HIGH RISK - Factor into bid' : 
                   riskScore > 25 ? 'MODERATE RISK - Investigate' : 
                   'LOW RISK'
  };
}
```

## References

For detailed documentation, load:
- `brevard-permit-portal.md` - Portal navigation guide
- `permit-types.md` - Complete permit type reference
- `violation-codes.md` - Code enforcement violation codes

## Related Skills

- `property-valuation` - Factor permit issues into value
- `bcpao-integration` - Get property details
- `zoning-analysis` - Verify permitted use
