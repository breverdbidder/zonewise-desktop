---
name: property-valuation
version: 1.0.0
category: analysis
priority: 1
author: ZoneWise.AI
created: 2026-02-01
updated: 2026-02-01

description: |
  Estimate property values using comparable sales, income approach, and cost 
  approach methods. Integrates BCPAO assessed values with market data for 
  investment analysis and max bid calculations.

dependencies:
  - httpx: ^0.27.0

references:
  - valuation-methods.md
  - bcpao-values-api.md
  - arv-calculation.md

tools_exposed:
  - estimateARV
  - getComparableSales
  - calculateMaxBid
  - analyzeInvestmentPotential

keywords:
  - ARV
  - property value
  - comparable sales
  - comps
  - max bid
  - investment analysis
  - BCPAO
  - assessed value
---

# Property Valuation Skill

## Overview

This skill provides property valuation capabilities for foreclosure investment 
analysis. It combines BCPAO assessed values with comparable sales analysis to 
estimate After Repair Value (ARV) and calculate maximum bid amounts.

## When to Use This Skill

Load this skill when the user asks about:
- Property value or worth
- ARV (After Repair Value)
- Comparable sales / comps
- Maximum bid calculation
- Investment analysis
- BCPAO assessed values
- Price per square foot

## Core Functions

### 1. Estimate ARV (After Repair Value)

```typescript
interface ARVEstimate {
  arv: number;              // Estimated value after repairs
  confidence: 'high' | 'medium' | 'low';
  comparables: Comparable[];
  pricePerSqFt: number;
  methodology: string;
}

// ARV calculation using comparable sales
async function estimateARV(
  parcelId: string,
  propertyType: 'SFR' | 'condo' | 'townhouse' | 'multi',
  squareFeet: number,
  bedrooms: number,
  bathrooms: number,
  condition: 'excellent' | 'good' | 'fair' | 'poor'
): Promise<ARVEstimate>
```

### 2. Get Comparable Sales

```typescript
interface Comparable {
  address: string;
  salePrice: number;
  saleDate: Date;
  squareFeet: number;
  pricePerSqFt: number;
  bedrooms: number;
  bathrooms: number;
  distance: number;  // miles from subject
  adjustedPrice: number;
}

// Find comparable sales within radius
async function getComparableSales(
  latitude: number,
  longitude: number,
  radiusMiles: number = 1,
  monthsBack: number = 6,
  propertyType: string,
  minSqFt: number,
  maxSqFt: number
): Promise<Comparable[]>
```

### 3. Calculate Max Bid

The ZoneWise max bid formula:

```
Max Bid = (ARV × 70%) - Repairs - $10K Buffer - MIN($25K, 15% × ARV)
```

```typescript
interface MaxBidResult {
  maxBid: number;
  arv: number;
  repairEstimate: number;
  buffer: number;
  profitMargin: number;
  bidToJudgmentRatio: number;
  recommendation: 'BID' | 'REVIEW' | 'SKIP';
}

function calculateMaxBid(
  arv: number,
  repairEstimate: number,
  judgmentAmount: number
): MaxBidResult {
  const seventyPercent = arv * 0.70;
  const buffer = 10000;
  const profitMargin = Math.min(25000, arv * 0.15);
  
  const maxBid = seventyPercent - repairEstimate - buffer - profitMargin;
  const ratio = maxBid / judgmentAmount;
  
  let recommendation: 'BID' | 'REVIEW' | 'SKIP';
  if (ratio >= 0.75) recommendation = 'BID';
  else if (ratio >= 0.60) recommendation = 'REVIEW';
  else recommendation = 'SKIP';
  
  return {
    maxBid,
    arv,
    repairEstimate,
    buffer,
    profitMargin,
    bidToJudgmentRatio: ratio,
    recommendation
  };
}
```

### 4. BCPAO Integration

```typescript
interface BCPAOValue {
  parcelId: string;
  justValue: number;        // Market value
  assessedValue: number;    // Taxable value
  landValue: number;
  improvementValue: number;
  yearBuilt: number;
  squareFeet: number;
  lastSalePrice: number;
  lastSaleDate: Date;
}

// Get BCPAO assessed values
async function getBCPAOValue(parcelId: string): Promise<BCPAOValue>
```

## Valuation Methods

### 1. Sales Comparison Approach (Primary)

1. Find 3-6 comparable sales within 1 mile, last 6 months
2. Adjust for differences:
   - Square footage: ±$50/sqft
   - Bedrooms: ±$5,000/bedroom
   - Bathrooms: ±$3,000/bathroom
   - Condition: ±10-20%
   - Age: ±$1,000/year
3. Weight by similarity and recency
4. Calculate adjusted average

### 2. Income Approach (Rentals)

```
Value = (Monthly Rent × 12) / Cap Rate

Brevard County Cap Rates (2026):
- SFR: 6-8%
- Multi-family: 7-9%
- Commercial: 8-10%
```

### 3. Cost Approach (New Construction)

```
Value = Land Value + (SqFt × Cost/SqFt) - Depreciation

Brevard County Construction Costs (2026):
- Economy: $150-180/sqft
- Standard: $180-220/sqft
- Custom: $220-300/sqft
```

## Repair Estimates

| Condition | Repairs/SqFt | Example (1,500 sqft) |
|-----------|--------------|----------------------|
| Excellent | $0-5 | $0-7,500 |
| Good | $5-15 | $7,500-22,500 |
| Fair | $15-35 | $22,500-52,500 |
| Poor | $35-60 | $52,500-90,000 |
| Gut Rehab | $60-100+ | $90,000-150,000+ |

## Investment Analysis

```typescript
interface InvestmentAnalysis {
  arv: number;
  purchasePrice: number;
  repairCost: number;
  holdingCosts: number;    // 6 months typical
  sellingCosts: number;    // 8% of ARV
  totalInvestment: number;
  profit: number;
  roi: number;
  cashOnCash: number;
  recommendation: string;
}

function analyzeInvestmentPotential(
  arv: number,
  purchasePrice: number,
  repairCost: number,
  holdingMonths: number = 6
): InvestmentAnalysis {
  const holdingCosts = (purchasePrice + repairCost) * 0.01 * holdingMonths;
  const sellingCosts = arv * 0.08;
  const totalInvestment = purchasePrice + repairCost + holdingCosts;
  const profit = arv - totalInvestment - sellingCosts;
  const roi = (profit / totalInvestment) * 100;
  
  return {
    arv,
    purchasePrice,
    repairCost,
    holdingCosts,
    sellingCosts,
    totalInvestment,
    profit,
    roi,
    cashOnCash: roi * 2, // Assuming 50% leverage
    recommendation: roi >= 20 ? 'Strong Buy' : roi >= 15 ? 'Buy' : roi >= 10 ? 'Hold' : 'Pass'
  };
}
```

## Brevard County Market Data (2026)

| Zip Code | Median Price | Price/SqFt | Avg DOM |
|----------|--------------|------------|---------|
| 32937 (Satellite Beach) | $425,000 | $285 | 32 |
| 32940 (Melbourne/Viera) | $385,000 | $245 | 28 |
| 32953 (Merritt Island) | $365,000 | $235 | 35 |
| 32903 (Indialantic) | $485,000 | $310 | 38 |
| 32901 (Melbourne) | $295,000 | $195 | 45 |
| 32905 (Palm Bay) | $275,000 | $175 | 42 |

## References

For detailed documentation, load:
- `valuation-methods.md` - Deep dive into valuation approaches
- `bcpao-values-api.md` - BCPAO API integration
- `arv-calculation.md` - ARV calculation examples

## Related Skills

- `zoning-analysis` - Verify zoning for intended use
- `envelope-development` - Calculate max buildable for development
- `bcpao-integration` - Get parcel details and photos
