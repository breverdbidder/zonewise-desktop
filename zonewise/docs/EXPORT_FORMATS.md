# ZoneWise V2 Export Formats

## Supported Formats

| Format | Extension | Description | Use Case |
|--------|-----------|-------------|----------|
| CSV | .csv | KPI data in tabular format | Spreadsheet analysis |
| JSON | .json | Complete report data structure | API integration |
| Markdown | .md | Formatted documentation | Documentation, GitHub |
| GitHub | folder | Complete repository structure | Version control |
| DOCX | .docx | Microsoft Word document | Professional reports |
| PDF | .pdf | Portable Document Format | Printing, sharing |

## DOCX Export

Professional Word documents with:
- Title page with property metrics
- Table of contents (auto-generated)
- Executive summary with snapshot table
- Property overview with site/zoning tables
- KPI analysis by category
- Development scenarios comparison
- Financial analysis with cost breakdown

**Dependencies:**
```bash
npm install docx
```

**Usage:**
```typescript
import { generateDOCX } from './src/lib/export/docx-export';

const buffer = await generateDOCX(report);
fs.writeFileSync('report.docx', buffer);
```

## PDF Export

### TypeScript (Browser/Node.js)
Uses jsPDF for client-side generation:

```typescript
import { generatePDFContent } from './src/lib/export/pdf-export';

const structure = generatePDFContent(report);
// Use with jsPDF to render
```

### Python (Server-side)
Uses ReportLab for robust server-side generation:

```bash
pip install reportlab
python scripts/pdf_generator.py report.json output.pdf
```

The Python generator produces professional PDFs with:
- Branded title page
- Color-coded tables
- Executive summary with metrics
- Property and zoning details
- Scenario comparison tables
- Financial analysis dashboards

## Best Practices

1. **DOCX for editable reports** - Use when stakeholders need to annotate or modify
2. **PDF for final distribution** - Use for printing or email attachments
3. **CSV for data analysis** - Use when importing to Excel or databases
4. **JSON for integrations** - Use for API responses or data pipelines
5. **Markdown for documentation** - Use for GitHub READMEs or wikis

---
*ZoneWise V2 | © 2026 Everest Capital USA*
