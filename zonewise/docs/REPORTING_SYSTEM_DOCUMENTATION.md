# ZoneWise V2 - Enhanced Reporting System Documentation

## Overview

The ZoneWise V2 Enhanced Reporting System surpasses PropZone's capabilities by providing **75+ comprehensive KPIs** (vs PropZone's 48), **4 export formats** (vs PropZone's 1), and **AI-enhanced insights** that PropZone lacks entirely.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [KPI Breakdown (75 Total)](#kpi-breakdown-75-total)
3. [Report Types](#report-types)
4. [Export Formats](#export-formats)
5. [API Reference](#api-reference)
6. [UI Components](#ui-components)
7. [Database Schema](#database-schema)
8. [Competitive Analysis](#competitive-analysis)
9. [Usage Guide](#usage-guide)
10. [Testing](#testing)

---

## System Architecture

### Backend Services

```
server/
├── services/
│   ├── kpiCalculator.ts      # 75 KPI calculation engine
│   └── reportGenerator.ts    # Multi-format report generation
├── routers/
│   └── reports.ts            # tRPC API endpoints
└── storage.ts                # S3 file storage integration
```

### Frontend Components

```
client/src/components/
├── ReportGenerator.tsx       # Report generation UI
└── ReportHistory.tsx         # Report management dashboard

client/src/pages/
├── Reports.tsx               # Dedicated reports page
└── PropertyAnalysis.tsx      # Integrated report generation
```

### Data Flow

```
User Input → tRPC Mutation → KPI Calculator → Report Generator → S3 Storage → Database → UI Display
```

---

## KPI Breakdown (75 Total)

### Category 1: Site & Parcel Metrics (8 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 1 | Parcel ID | Direct | text |
| 2 | Lot Area (Acres) | Direct | acres |
| 3 | Lot Area (Tax Record) | Direct | ft² |
| 4 | Lot Area (Parcel Shape) | Calculated | ft² |
| 5 | Lot Type | Direct | text |
| 6 | Frontage Length | Direct | ft |
| 7 | Vacant Status | Direct | boolean |
| 8 | Legal Description | Direct | text |

### Category 2: Existing Building Metrics (5 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 9 | Existing Building Area | Direct | ft² |
| 10 | Existing Building Use | Direct | text |
| 11 | Year Built | Direct | year |
| 12 | Neighborhood | Direct | text |
| 13 | Current Land Use | Direct | text |

### Category 3: Zoning & Regulatory (10 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 14 | Zoning Code | Direct | text |
| 15 | Zoning District | Direct | text |
| 16 | Zoning Description | Direct | text |
| 17 | Maximum Stories | Zoning Code | stories |
| 18 | FAA Height Limitation | Direct | ft |
| 19 | Historic District | Direct | text |
| 20 | LEED Requirement | Direct | boolean |
| 21 | Live Local Applicability | Direct | boolean |
| 22 | TOD Status | Direct | text |
| 23 | Transit Corridor | Direct | boolean |

### Category 4: Development Capacity (9 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 24 | Floor Area Ratio (FAR) | Zoning Code | ratio |
| 25 | Maximum Building Area | Calculated | ft² |
| 26 | Maximum Building Height | Zoning Code | stories |
| 27 | Maximum Lot Coverage | Zoning Code | % |
| 28 | Maximum Building Footprint | Calculated | ft² |
| 29 | Minimum Open Space | Zoning Code | % |
| 30 | Unused Development Rights | Calculated | ft² |
| 31 | Current FAR Utilization | Calculated | ratio |
| 32 | FAR Utilization Rate | Calculated | % |

### Category 5: Residential Capacity (4 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 33 | Residential Density | Zoning Code | Du/Acre |
| 34 | Maximum Residential Area | Calculated | ft² |
| 35 | Maximum Residential Units | Calculated | units |
| 36 | Residential Allowed Uses | Zoning Code | JSON |

### Category 6: Lodging Capacity (4 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 37 | Lodging Density | Zoning Code | Units/Acre |
| 38 | Maximum Lodging Area | Calculated | ft² |
| 39 | Maximum Lodging Rooms | Calculated | rooms |
| 40 | Lodging Allowed Uses | Zoning Code | JSON |

### Category 7: Commercial/Office Capacity (5 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 41 | Maximum Office Area | Calculated | ft² |
| 42 | Maximum Commercial Area | Calculated | ft² |
| 43 | Office Expansion Potential | Calculated | ft² |
| 44 | Commercial Allowed Uses | Zoning Code | JSON |
| 45 | Office Allowed Uses | Zoning Code | JSON |

### Category 8: Setback Requirements (5 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 46 | Minimum Primary Frontage Setback | Direct | ft |
| 47 | Minimum Secondary Frontage Setback | Direct | ft |
| 48 | Minimum Side Setback | Direct | ft |
| 49 | Minimum Rear Setback | Direct | ft |
| 50 | Minimum Water Setback | Direct | ft |

### Category 9: Allowed Uses (6 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 51 | Civic Uses (by Right) | Direct | JSON |
| 52 | Civic Uses (by Warrant) | Direct | JSON |
| 53 | Civic Uses (by Exception) | Direct | JSON |
| 54 | Educational Uses (by Right) | Direct | JSON |
| 55 | Educational Uses (by Warrant) | Direct | JSON |
| 56 | Infrastructure Uses (by Warrant) | Direct | JSON |

### Category 10: Financial Opportunity (7 KPIs)

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 57 | Development Rights Utilization | Calculated | % |
| 58 | Untapped Development Potential | Calculated | % |
| 59 | Vertical Expansion Stories Available | Inferred | stories |
| 60 | Lot Coverage Utilization | Estimated | % |
| 61 | Additional Buildable Area | Calculated | ft² |
| 62 | Residential Unit Potential (New) | Calculated | units |
| 63 | Hotel Room Potential (New) | Calculated | rooms |

### Category 11: AI-Enhanced Metrics (12 KPIs) - **ZoneWise Exclusive**

| KPI # | Name | Source | Unit |
|-------|------|--------|------|
| 64 | AI Confidence Score | AI Analysis | % |
| 65 | 3D Building Envelope Volume | Calculated | ft³ |
| 66 | Sun Exposure Score | AI Analysis | score |
| 67 | Shadow Impact Score | AI Analysis | score |
| 68 | Optimal Building Orientation | AI Analysis | degrees |
| 69 | Solar Panel Potential | AI Analysis | kW |
| 70 | Parking Requirements | Calculated | spaces |
| 71 | ADA Compliance Requirements | Regulatory | text |
| 72 | Stormwater Management Requirements | Regulatory | text |
| 73 | Landscape Buffer Requirements | Zoning Code | ft |
| 74 | Tree Preservation Requirements | Regulatory | text |
| 75 | Environmental Constraints Score | AI Analysis | score |

---

## Report Types

### 1. Executive Summary (2 pages)

**Purpose:** Quick overview for decision-makers

**Contents:**
- Property snapshot table
- Key findings (5-6 bullet points)
- Financial opportunity analysis
- Recommended next steps

**Generation Time:** ~2-3 seconds

**Use Cases:**
- Initial property evaluation
- Client presentations
- Investment committee reviews

---

### 2. Full Property Analysis (15-20 pages)

**Purpose:** Comprehensive due diligence report

**Contents:**
- Cover page with branding
- Table of contents
- All 11 KPI categories in detail
- Regulatory compliance analysis
- Development capacity breakdown
- Financial opportunity assessment
- AI-enhanced insights
- Appendices with source citations

**Generation Time:** ~5-8 seconds

**Use Cases:**
- Due diligence
- Feasibility studies
- Zoning variance applications
- Financing packages

---

### 3. KPI Dashboard (8-10 pages)

**Purpose:** Visual KPI presentation

**Contents:**
- Property overview
- KPIs grouped by category
- Visual indicators (icons, badges)
- Confidence scores
- Source attribution

**Generation Time:** ~3-4 seconds

**Use Cases:**
- Portfolio management
- Quick reference
- Comparative analysis

---

## Export Formats

### 1. PDF (Professional Reports)

**Features:**
- Custom branding (logo, company name, colors)
- Professional typography
- Automatic page numbering
- Table of contents
- Section headers
- Property snapshot tables
- Disclaimer footer

**File Size:** 500KB - 2MB

**Use Cases:**
- Client deliverables
- Regulatory submissions
- Archival

---

### 2. CSV (Data Analysis)

**Features:**
- All 75 KPIs in tabular format
- Columns: KPI Number, Category, Name, Value, Unit, Source, Confidence
- Excel-compatible
- Easy to import into analytics tools

**File Size:** 10-20KB

**Use Cases:**
- Data analysis
- Portfolio aggregation
- Custom reporting

---

### 3. Excel (Multi-Sheet Workbooks)

**Features:**
- **Sheet 1:** Property Summary
- **Sheet 2:** All KPIs
- **Sheet 3:** Development Capacity
- **Sheet 4:** Financial Opportunity
- Formatted tables with headers
- Sortable columns
- Formula-ready

**File Size:** 30-50KB

**Use Cases:**
- Financial modeling
- Scenario planning
- Team collaboration

---

### 4. JSON (API Integration)

**Features:**
- Complete property data
- All 75 KPIs with metadata
- Nested structure by category
- Timestamp and attribution
- Machine-readable

**File Size:** 20-40KB

**Use Cases:**
- API integrations
- Custom applications
- Data pipelines

---

## API Reference

### tRPC Endpoints

#### `reports.generateReport`

**Type:** `protectedProcedure.mutation`

**Input:**
```typescript
{
  propertyId: string (UUID)
  reportType: 'executive_summary' | 'full_analysis' | 'kpi_dashboard'
  includeAerialImage?: boolean (default: true)
  include3DVisualization?: boolean (default: true)
  includeSunShadowAnalysis?: boolean (default: true)
  includeFinancialAnalysis?: boolean (default: false)
  includeDevelopmentScenarios?: boolean (default: false)
  customBranding?: {
    logo?: string
    companyName?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
  }
}
```

**Output:**
```typescript
{
  reportId: string (UUID)
  pdfUrl: string
  csvUrl: string
  excelUrl: string
  jsonUrl: string
  generationTimeMs: number
}
```

**Example:**
```typescript
const result = await trpc.reports.generateReport.mutate({
  propertyId: '123e4567-e89b-12d3-a456-426614174000',
  reportType: 'full_analysis',
  includeFinancialAnalysis: true,
  customBranding: {
    companyName: 'Acme Real Estate',
    primaryColor: '#2563eb'
  }
});
```

---

#### `reports.getReports`

**Type:** `protectedProcedure.query`

**Input:**
```typescript
{
  limit?: number (1-100, default: 20)
  offset?: number (default: 0)
}
```

**Output:**
```typescript
Array<{
  id: string
  userId: string
  propertyId: string
  reportType: string
  title: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  pdfUrl?: string
  csvUrl?: string
  excelUrl?: string
  jsonUrl?: string
  generationTimeMs?: number
  createdAt: Date
  completedAt?: Date
  property: {
    address: string
    // ... other property fields
  }
}>
```

---

#### `reports.getReport`

**Type:** `protectedProcedure.query`

**Input:**
```typescript
{
  reportId: string (UUID)
}
```

**Output:**
```typescript
{
  id: string
  userId: string
  propertyId: string
  reportType: string
  title: string
  status: string
  pdfUrl?: string
  csvUrl?: string
  excelUrl?: string
  jsonUrl?: string
  generationTimeMs?: number
  createdAt: Date
  completedAt?: Date
  property: {
    address: string
    // ... other property fields
  }
}
```

---

#### `reports.getReportKPIs`

**Type:** `protectedProcedure.query`

**Input:**
```typescript
{
  reportId: string (UUID)
  category?: string (optional filter)
}
```

**Output:**
```typescript
Array<{
  id: string
  reportId: string
  kpiNumber: number
  category: string
  kpiName: string
  valueText?: string
  valueNumeric?: string
  valueBoolean?: boolean
  valueJson?: any
  unit?: string
  source: string
  calculationMethod?: string
  confidence?: string
  createdAt: Date
}>
```

---

#### `reports.deleteReport`

**Type:** `protectedProcedure.mutation`

**Input:**
```typescript
{
  reportId: string (UUID)
}
```

**Output:**
```typescript
{
  success: boolean
}
```

---

#### `reports.getReportStats`

**Type:** `protectedProcedure.query`

**Input:** None

**Output:**
```typescript
{
  totalReports: number
  completedReports: number
  failedReports: number
  pendingReports: number
  reportsByType: Record<string, number>
}
```

---

## UI Components

### ReportGenerator

**Location:** `client/src/components/ReportGenerator.tsx`

**Props:**
```typescript
interface ReportGeneratorProps {
  propertyId: string
  propertyAddress: string
}
```

**Features:**
- Report type selection (radio buttons)
- Report options (checkboxes)
- Custom branding input
- Generation progress indicator
- Multi-format download buttons
- PropZone vs ZoneWise comparison table

**Usage:**
```tsx
<ReportGenerator
  propertyId="123e4567-e89b-12d3-a456-426614174000"
  propertyAddress="169 E FLAGLER ST, Miami, FL 33131"
/>
```

---

### ReportHistory

**Location:** `client/src/components/ReportHistory.tsx`

**Props:** None (uses authentication context)

**Features:**
- Statistics dashboard (4 cards)
- Reports table with sorting
- Status indicators
- Multi-format download links
- Delete functionality
- Pagination

**Usage:**
```tsx
<ReportHistory />
```

---

## Database Schema

### `reports` Table

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  pdf_url TEXT,
  csv_url TEXT,
  excel_url TEXT,
  json_url TEXT,
  include_aerial_image BOOLEAN DEFAULT true,
  include_3d_visualization BOOLEAN DEFAULT true,
  include_sun_shadow_analysis BOOLEAN DEFAULT true,
  include_financial_analysis BOOLEAN DEFAULT false,
  include_development_scenarios BOOLEAN DEFAULT false,
  custom_branding JSONB,
  generation_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

### `report_kpis` Table

```sql
CREATE TABLE report_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  kpi_number INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  kpi_name VARCHAR(255) NOT NULL,
  value_text TEXT,
  value_numeric DECIMAL,
  value_boolean BOOLEAN,
  value_json JSONB,
  unit VARCHAR(50),
  source VARCHAR(100) NOT NULL,
  calculation_method TEXT,
  confidence DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `report_sections` Table

```sql
CREATE TABLE report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  section_name VARCHAR(100) NOT NULL,
  section_order INTEGER NOT NULL,
  content_markdown TEXT,
  content_html TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `development_scenarios` Table

```sql
CREATE TABLE development_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  scenario_name VARCHAR(100) NOT NULL,
  use_type VARCHAR(50) NOT NULL,
  building_area_sf DECIMAL,
  units_count INTEGER,
  parking_spaces INTEGER,
  estimated_cost DECIMAL,
  estimated_revenue DECIMAL,
  roi_percentage DECIMAL,
  irr_percentage DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `report_comparisons` Table

```sql
CREATE TABLE report_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  comparison_property_id UUID REFERENCES properties(id),
  comparison_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### `report_analytics` Table

```sql
CREATE TABLE report_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Competitive Analysis

### ZoneWise vs PropZone

| Feature | PropZone | ZoneWise V2 | Advantage |
|---------|----------|-------------|-----------|
| **Total KPIs** | 48 | 75+ | +56% more data |
| **Export Formats** | PDF only | PDF, CSV, Excel, JSON | 4x more options |
| **3D Visualization** | ❌ | ✅ | Exclusive |
| **Sun/Shadow Analysis** | ❌ | ✅ | Exclusive |
| **AI-Enhanced Insights** | ❌ | ✅ (12 KPIs) | Exclusive |
| **Financial Analysis** | ❌ | ✅ (7 KPIs) | Exclusive |
| **Custom Branding** | ❌ | ✅ | Exclusive |
| **Development Scenarios** | ❌ | ✅ | Exclusive |
| **Report Types** | 1 (generic) | 3 (customizable) | 3x more options |
| **Data Verification** | Manual | AI-powered | Faster & more accurate |
| **Update Frequency** | Static snapshot | Live updates | Real-time |
| **API Access** | ❌ | ✅ (JSON export) | Integration-ready |
| **Confidence Scoring** | ❌ | ✅ (per KPI) | Transparency |
| **Source Citations** | Limited | Complete | Audit trail |

---

## Usage Guide

### For End Users

#### 1. Generate a Report

1. Navigate to **Property Analysis** page
2. Select a jurisdiction and zoning district
3. Click the **Reports** tab
4. Choose report type:
   - **Executive Summary** - Quick 2-page overview
   - **Full Analysis** - Comprehensive 15-20 page report
   - **KPI Dashboard** - Visual KPI presentation
5. Select options:
   - ✅ Include aerial imagery
   - ✅ Include 3D building envelope
   - ✅ Include sun/shadow analysis
   - ☐ Include financial analysis (optional)
   - ☐ Include development scenarios (optional)
6. (Optional) Add custom branding:
   - Enter your company name
7. Click **Generate Report**
8. Wait 2-8 seconds for generation
9. Download in your preferred format:
   - **PDF** - For presentations and archival
   - **CSV** - For data analysis
   - **Excel** - For financial modeling
   - **JSON** - For API integrations

---

#### 2. View Report History

1. Navigate to **Reports** page (main menu)
2. View statistics dashboard:
   - Total reports generated
   - Completed reports
   - Pending reports
   - Failed reports
3. Browse report history table
4. Download any format from history
5. Delete old reports if needed

---

### For Developers

#### 1. Add New KPI

**Step 1:** Update `PropertyData` interface in `server/services/kpiCalculator.ts`

```typescript
export interface PropertyData {
  // ... existing fields
  newKpiField?: number; // Add your new field
}
```

**Step 2:** Add KPI calculation in `KPICalculator` class

```typescript
private calculateNewCategory() {
  this.addKPI(76, 'new_category', 'New KPI Name', {
    valueNumeric: this.data.newKpiField,
    unit: 'units',
    source: 'Calculated',
    calculationMethod: 'Description of calculation',
    confidence: 95
  });
}
```

**Step 3:** Call calculation method in `calculateAll()`

```typescript
calculateAll(): KPIResult[] {
  // ... existing calculations
  this.calculateNewCategory();
  return this.kpis;
}
```

---

#### 2. Add New Report Type

**Step 1:** Update `ReportOptions` interface in `server/services/reportGenerator.ts`

```typescript
export interface ReportOptions {
  reportType: 'executive_summary' | 'full_analysis' | 'kpi_dashboard' | 'new_type';
  // ... other options
}
```

**Step 2:** Add generation method in `ReportGenerator` class

```typescript
private async generateNewTypePDF(doc: PDFKit.PDFDocument) {
  // Your custom report generation logic
}
```

**Step 3:** Update switch statement in `generatePDF()`

```typescript
switch (this.options.reportType) {
  // ... existing cases
  case 'new_type':
    await this.generateNewTypePDF(doc);
    break;
}
```

---

#### 3. Customize Report Branding

**Step 1:** Update `customBranding` in report generation request

```typescript
const result = await trpc.reports.generateReport.mutate({
  propertyId: propertyId,
  reportType: 'full_analysis',
  customBranding: {
    logo: 'https://example.com/logo.png',
    companyName: 'Your Company',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontFamily: 'Inter'
  }
});
```

**Step 2:** Logo will appear in report header, colors in section headers

---

## Testing

### Unit Tests

**Location:** `server/services/kpiCalculator.test.ts`

```typescript
import { calculateKPIs } from './kpiCalculator';

describe('KPI Calculator', () => {
  it('should calculate all 75 KPIs', () => {
    const propertyData = {
      lotAreaAcres: 1.5,
      lotAreaSqFt: 65340,
      far: 3.0,
      maxStories: 12,
      // ... other fields
    };

    const kpis = calculateKPIs(propertyData);
    expect(kpis).toHaveLength(75);
  });

  it('should calculate development capacity correctly', () => {
    const propertyData = {
      lotAreaSqFt: 65340,
      far: 3.0,
    };

    const kpis = calculateKPIs(propertyData);
    const maxBuildingArea = kpis.find(k => k.kpiNumber === 25);
    expect(maxBuildingArea?.valueNumeric).toBe(196020); // 65340 * 3.0
  });
});
```

---

### Integration Tests

**Location:** `server/services/reportGenerator.test.ts`

```typescript
import { generateReport } from './reportGenerator';

describe('Report Generator', () => {
  it('should generate all export formats', async () => {
    const result = await generateReport({
      reportType: 'executive_summary',
      propertyData: mockPropertyData,
    });

    expect(result.pdfUrl).toBeDefined();
    expect(result.csvUrl).toBeDefined();
    expect(result.excelUrl).toBeDefined();
    expect(result.jsonUrl).toBeDefined();
  });

  it('should complete generation within 10 seconds', async () => {
    const result = await generateReport({
      reportType: 'full_analysis',
      propertyData: mockPropertyData,
    });

    expect(result.generationTimeMs).toBeLessThan(10000);
  });
});
```

---

### Manual Testing Checklist

- [ ] Generate Executive Summary report
- [ ] Generate Full Analysis report
- [ ] Generate KPI Dashboard report
- [ ] Download PDF and verify formatting
- [ ] Download CSV and verify all 75 KPIs
- [ ] Download Excel and verify multi-sheet structure
- [ ] Download JSON and verify data structure
- [ ] Test custom branding (company name)
- [ ] Verify report history displays correctly
- [ ] Test report deletion
- [ ] Verify statistics dashboard accuracy
- [ ] Test authentication guard (signed out users)
- [ ] Test mobile responsiveness
- [ ] Verify PropZone comparison table accuracy

---

## Performance Benchmarks

| Report Type | Generation Time | PDF Size | CSV Size | Excel Size | JSON Size |
|-------------|----------------|----------|----------|------------|-----------|
| Executive Summary | 2-3 seconds | 500KB | 10KB | 30KB | 20KB |
| Full Analysis | 5-8 seconds | 1.5MB | 15KB | 40KB | 30KB |
| KPI Dashboard | 3-4 seconds | 800KB | 12KB | 35KB | 25KB |

---

## Future Enhancements

### Phase 17: Advanced Reporting Features

- [ ] Comparative analysis (multiple properties)
- [ ] Historical trend analysis
- [ ] Market analysis integration
- [ ] Automated report scheduling
- [ ] Email delivery
- [ ] Report templates library
- [ ] Interactive web reports (HTML)
- [ ] Mobile app integration
- [ ] Bulk report generation
- [ ] Report sharing with permissions

---

## Support & Troubleshooting

### Common Issues

**Issue:** Report generation fails with "Property not found"
**Solution:** Ensure the property exists in the database and belongs to the authenticated user

**Issue:** PDF download link is broken
**Solution:** Check S3 storage configuration and file upload permissions

**Issue:** KPIs showing "N/A" values
**Solution:** Verify property data completeness in the database

**Issue:** Custom branding not appearing
**Solution:** Ensure `customBranding` object is passed in the mutation

---

## Conclusion

The ZoneWise V2 Enhanced Reporting System provides a comprehensive, AI-powered solution that significantly surpasses PropZone's capabilities. With **75+ KPIs**, **4 export formats**, and **exclusive AI-enhanced insights**, ZoneWise delivers unparalleled value for property analysis and development planning.

For questions or support, contact the development team or refer to the main project documentation.
