---
name: bcpao-integration
version: 1.0.0
category: data
priority: 2
author: ZoneWise.AI
created: 2026-02-01
updated: 2026-02-01

description: |
  Brevard County Property Appraiser data integration. Fetch parcel details,
  property photos, owner information, assessed values, and sales history.

dependencies:
  - httpx: ^0.27.0

references:
  - bcpao-api.md
  - parcel-schema.md

tools_exposed:
  - searchParcel
  - getParcelDetails
  - getPropertyPhoto
  - getAssessedValues
  - getSalesHistory

keywords:
  - BCPAO
  - parcel
  - property appraiser
  - assessed value
  - owner
  - property photo
---

# BCPAO Integration Skill

## Overview

This skill provides integration with the Brevard County Property Appraiser's 
Office (BCPAO) API. Access parcel information, property photos, assessed values,
and ownership records for any property in Brevard County.

## When to Use This Skill

Load this skill when the user asks about:
- Parcel information or parcel ID lookup
- Property owner details
- Assessed values or tax values
- Property photos
- Sales history
- Building square footage
- Year built

## API Endpoints

### Base URL
```
https://www.bcpao.us/api/v1
```

### Parcel Search
```typescript
// Search by address
GET /search?address=123+Main+St

// Search by owner name
GET /search?owner=Smith

// Search by parcel ID
GET /search?parcel=2712345
```

### Parcel Details
```typescript
interface ParcelDetails {
  parcelId: string;
  address: string;
  owner: string;
  mailingAddress: string;
  legalDescription: string;
  subdivision: string;
  yearBuilt: number;
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  landUse: string;
  zoning: string;
  acreage: number;
}

GET /parcel/{parcelId}
```

### Assessed Values
```typescript
interface AssessedValues {
  parcelId: string;
  taxYear: number;
  marketValue: number;      // Total just value
  assessedValue: number;    // Taxable value
  landValue: number;
  improvementValue: number;
  exemptions: Exemption[];
  taxableValue: number;
  millageRate: number;
  estimatedTax: number;
}

GET /parcel/{parcelId}/values
```

### Property Photos
```typescript
// Get main photo URL
GET /parcel/{parcelId}/photo

// Response includes:
{
  "masterPhotoUrl": "https://www.bcpao.us/photos/{prefix}/{account}011.jpg",
  "additionalPhotos": [...]
}
```

### Sales History
```typescript
interface Sale {
  date: Date;
  price: number;
  grantor: string;
  grantee: string;
  instrument: string;
  bookPage: string;
  qualified: boolean;
}

GET /parcel/{parcelId}/sales
```

## Code Examples

### Search for Parcel
```typescript
import { searchParcel } from '@/lib/bcpao';

const results = await searchParcel({
  address: '123 Main St, Melbourne FL'
});

// Returns array of matching parcels
console.log(results[0].parcelId); // "2712345"
```

### Get Full Details
```typescript
import { getParcelDetails } from '@/lib/bcpao';

const parcel = await getParcelDetails('2712345');

console.log(parcel.owner);        // "SMITH JOHN"
console.log(parcel.squareFeet);   // 1850
console.log(parcel.yearBuilt);    // 1995
```

### Get Photo URL
```typescript
import { getPropertyPhoto } from '@/lib/bcpao';

const photoUrl = await getPropertyPhoto('2712345');
// "https://www.bcpao.us/photos/27/2712345011.jpg"
```

## Error Handling

```typescript
try {
  const parcel = await getParcelDetails(parcelId);
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Parcel not found');
  } else if (error.code === 'RATE_LIMITED') {
    console.log('Too many requests, retry in 60s');
  }
}
```

## Rate Limits

- 100 requests per minute
- 1000 requests per hour
- Cache responses for 24 hours

## References

For detailed documentation, load:
- `bcpao-api.md` - Full API reference
- `parcel-schema.md` - Complete data schema

## Related Skills

- `property-valuation` - Use assessed values in valuation
- `zoning-analysis` - Get zoning from parcel data
- `permit-lookup` - Cross-reference with permits
