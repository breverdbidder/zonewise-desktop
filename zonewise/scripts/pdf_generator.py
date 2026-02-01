#!/usr/bin/env python3
"""
ZoneWise V2 - PDF Export Service (Python/ReportLab)
Professional PDF generation for development analysis reports

Usage:
    python pdf_generator.py report.json output.pdf
"""

import json
import sys
from datetime import datetime
from io import BytesIO
from typing import Any, Dict, List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.pdfgen import canvas

# Brand Colors
COLORS = {
    'primary': colors.HexColor('#1E3A5F'),
    'secondary': colors.HexColor('#2C5282'),
    'accent': colors.HexColor('#38A169'),
    'warning': colors.HexColor('#D69E2E'),
    'danger': colors.HexColor('#E53E3E'),
    'light_gray': colors.HexColor('#F7FAFC'),
    'medium_gray': colors.HexColor('#E2E8F0'),
    'dark_gray': colors.HexColor('#4A5568'),
}


def format_number(num: float) -> str:
    """Format number with commas"""
    return f"{num:,.0f}"


def format_currency(num: float) -> str:
    """Format currency with appropriate suffix"""
    if num >= 1_000_000_000:
        return f"${num / 1_000_000_000:.1f}B"
    if num >= 1_000_000:
        return f"${num / 1_000_000:.1f}M"
    if num >= 1_000:
        return f"${num / 1_000:.0f}K"
    return f"${num:.0f}"


def format_percent(num: float) -> str:
    """Format percentage"""
    return f"{num:.1f}%"


class ZoneWisePDFReport:
    """Generate professional PDF reports for development analysis"""
    
    def __init__(self, report_data: Dict[str, Any]):
        self.data = report_data
        self.styles = getSampleStyleSheet()
        self._setup_styles()
    
    def _setup_styles(self):
        """Configure custom styles"""
        self.styles.add(ParagraphStyle(
            name='Title',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=COLORS['primary'],
            spaceAfter=20,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=COLORS['primary'],
            spaceBefore=20,
            spaceAfter=10
        ))
        
        self.styles.add(ParagraphStyle(
            name='SubHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            textColor=COLORS['secondary'],
            spaceBefore=15,
            spaceAfter=8
        ))
        
        self.styles.add(ParagraphStyle(
            name='BodyText',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.black,
            spaceAfter=6
        ))
        
        self.styles.add(ParagraphStyle(
            name='Highlight',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=COLORS['accent'],
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=COLORS['dark_gray'],
            alignment=TA_CENTER
        ))
    
    def _create_table(self, data: List[List[str]], col_widths: List[float] = None,
                      header_color: colors.Color = None) -> Table:
        """Create formatted table"""
        table = Table(data, colWidths=col_widths)
        
        style = [
            ('BACKGROUND', (0, 0), (-1, 0), header_color or COLORS['primary']),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, COLORS['medium_gray']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]
        
        # Alternate row colors
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(('BACKGROUND', (0, i), (-1, i), COLORS['light_gray']))
        
        table.setStyle(TableStyle(style))
        return table
    
    def _build_title_page(self) -> List:
        """Build title page elements"""
        prop = self.data['property']
        dc = self.data['developmentCapacity']
        
        elements = [
            Spacer(1, 2 * inch),
            Paragraph('DEVELOPMENT ANALYSIS REPORT', self.styles['Title']),
            Spacer(1, 0.3 * inch),
            Paragraph(prop['address'], ParagraphStyle(
                name='Address',
                fontSize=20,
                textColor=COLORS['primary'],
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            )),
            Paragraph(f"{prop['city']}, {prop['state']} {prop.get('zipCode', '')}", ParagraphStyle(
                name='City',
                fontSize=14,
                textColor=COLORS['dark_gray'],
                alignment=TA_CENTER
            )),
            Spacer(1, 0.5 * inch),
            Paragraph('63+ KPIs | 3 Development Scenarios | Financial Analysis', ParagraphStyle(
                name='Subtitle',
                fontSize=11,
                textColor=COLORS['secondary'],
                alignment=TA_CENTER,
                fontName='Helvetica-Oblique'
            )),
            Spacer(1, 1 * inch),
        ]
        
        # Key metrics box
        metrics_data = [
            ['Key Metrics', ''],
            ['Max Building Area', f"{format_number(dc['maxBuildingArea'])} ft²"],
            ['Unused Rights', f"{format_number(dc['unusedDevelopmentRights'])} ft²"],
            ['FAR Utilization', format_percent(dc['farUtilizationRate'])],
            ['Max Stories', str(dc['maxBuildingHeightStories'])],
        ]
        
        metrics_table = self._create_table(metrics_data, [2.5 * inch, 2.5 * inch], COLORS['accent'])
        elements.append(metrics_table)
        
        elements.extend([
            Spacer(1, 1.5 * inch),
            Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", self.styles['Footer']),
            Paragraph('Powered by ZoneWise V2 | © 2026 Everest Capital USA', self.styles['Footer']),
            PageBreak()
        ])
        
        return elements
    
    def _build_executive_summary(self) -> List:
        """Build executive summary section"""
        summary = self.data['executiveSummary']
        dc = self.data['developmentCapacity']
        fo = self.data['financialOpportunity']
        
        elements = [
            Paragraph('Executive Summary', self.styles['SectionHeader']),
            Paragraph('Property Snapshot', self.styles['SubHeader']),
        ]
        
        # Snapshot table
        snapshot_data = [
            ['Attribute', 'Current', 'Maximum', 'Opportunity'],
            ['Building Area', 'Existing', f"{format_number(dc['maxBuildingArea'])} ft²", f"+{format_number(dc['unusedDevelopmentRights'])} ft²"],
            ['FAR', format_percent(dc['farUtilizationRate']), str(self.data['zoning']['maxFAR']), f"{format_percent(fo['untappedDevelopmentPotential'])} untapped"],
            ['Residential', 'N/A', f"{format_number(dc.get('maxResidentialUnits', 0))} units", f"{format_number(fo.get('residentialPotentialUnits', 0))} potential"],
            ['Hotel', 'N/A', f"{format_number(dc.get('maxLodgingRooms', 0))} rooms", f"{format_number(fo.get('hotelPotentialRooms', 0))} potential"],
        ]
        elements.append(self._create_table(snapshot_data, [1.3*inch, 1.5*inch, 1.5*inch, 1.7*inch]))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Key Findings
        elements.append(Paragraph('Key Findings', self.styles['SubHeader']))
        for finding in summary['keyFindings']:
            elements.append(Paragraph(f"• {finding}", self.styles['BodyText']))
        
        # Opportunities
        elements.append(Paragraph('Opportunities', self.styles['SubHeader']))
        for opp in summary['opportunities']:
            elements.append(Paragraph(f"• {opp}", self.styles['Highlight']))
        
        # Challenges
        elements.append(Paragraph('Challenges', self.styles['SubHeader']))
        for challenge in summary['challenges']:
            elements.append(Paragraph(f"• {challenge}", self.styles['BodyText']))
        
        # Recommendation
        elements.append(Paragraph('Recommendation', self.styles['SubHeader']))
        elements.append(Paragraph(summary['recommendation'], ParagraphStyle(
            name='Recommendation',
            parent=self.styles['BodyText'],
            backColor=colors.HexColor('#E6FFFA'),
            borderPadding=10
        )))
        
        elements.append(PageBreak())
        return elements
    
    def _build_property_overview(self) -> List:
        """Build property overview section"""
        prop = self.data['property']
        site = self.data['site']
        zoning = self.data['zoning']
        
        elements = [
            Paragraph('Property Overview', self.styles['SectionHeader']),
            Paragraph('Site Information', self.styles['SubHeader']),
        ]
        
        site_data = [
            ['Property', 'Value'],
            ['Address', prop['address']],
            ['City/State', f"{prop['city']}, {prop['state']} {prop.get('zipCode', '')}"],
            ['Parcel ID', prop.get('parcelId', 'N/A')],
            ['County', prop.get('county', 'N/A')],
            ['Lot Area', f"{site['lotAreaAcres']:.2f} acres ({format_number(site['lotAreaSqFt'])} ft²)"],
            ['Lot Type', site.get('lotType', 'N/A')],
            ['Frontage', f"{format_number(site.get('frontageLength', 0))} ft" if site.get('frontageLength') else 'N/A'],
            ['Current Use', site.get('currentLandUse', 'N/A')],
        ]
        elements.append(self._create_table(site_data, [2*inch, 4*inch], COLORS['secondary']))
        elements.append(Spacer(1, 0.3 * inch))
        
        elements.append(Paragraph('Zoning Profile', self.styles['SubHeader']))
        zoning_data = [
            ['Zoning', 'Value'],
            ['Code', zoning['zoningCode']],
            ['District', zoning['zoningDistrict']],
            ['Max FAR', str(zoning['maxFAR'])],
            ['Max Stories', str(zoning.get('maxStories', 'N/A'))],
            ['Max Height', f"{format_number(zoning.get('maxHeightFeet', 0))} ft" if zoning.get('maxHeightFeet') else 'N/A'],
            ['Max Lot Coverage', format_percent(zoning.get('maxLotCoverage', 0)) if zoning.get('maxLotCoverage') else 'N/A'],
            ['Historic District', zoning.get('historicDistrict', 'None')],
            ['TOD Status', zoning.get('todStatus', 'N/A')],
            ['Live Local Act', 'Applicable' if zoning.get('liveLocalApplicability') else 'Not Applicable'],
        ]
        elements.append(self._create_table(zoning_data, [2*inch, 4*inch], COLORS['secondary']))
        
        elements.append(PageBreak())
        return elements
    
    def _build_scenarios_section(self) -> List:
        """Build development scenarios section"""
        scenarios = self.data['scenarios']
        
        elements = [
            Paragraph('Development Scenarios', self.styles['SectionHeader']),
            Paragraph('Scenario Comparison', self.styles['SubHeader']),
        ]
        
        # Comparison table
        headers = ['Metric'] + [s['name'] + (' ★' if s.get('isRecommended') else '') for s in scenarios]
        comparison_data = [
            headers,
            ['Total Area'] + [f"{format_number(s['totalSqFt'])} ft²" for s in scenarios],
            ['Stories'] + [str(s['stories']) for s in scenarios],
            ['Total Cost'] + [format_currency(s['costs']['totalCost']) for s in scenarios],
            ['Asset Value'] + [format_currency(s['projections']['totalAssetValue']) for s in scenarios],
            ['Profit'] + [format_currency(s['projections']['developmentProfit']) for s in scenarios],
            ['IRR'] + [format_percent(s['projections']['irr']) for s in scenarios],
            ['Equity Multiple'] + [f"{s['projections']['equityMultiple']:.2f}x" for s in scenarios],
        ]
        
        col_widths = [1.5*inch] + [1.5*inch] * len(scenarios)
        elements.append(self._create_table(comparison_data, col_widths))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Individual scenario details
        for scenario in scenarios:
            rec = ' ★ RECOMMENDED' if scenario.get('isRecommended') else ''
            elements.append(Paragraph(f"{scenario['name']}{rec}", self.styles['SubHeader']))
            
            components = ', '.join([c['name'] for c in scenario['components']])
            elements.append(Paragraph(f"Components: {components}", self.styles['BodyText']))
            elements.append(Paragraph(
                f"Risk: {scenario['riskLevel']} | Demand: {scenario['marketDemand']} | {scenario['revenueStreams']} revenue streams",
                self.styles['BodyText']
            ))
            elements.append(Spacer(1, 0.15 * inch))
        
        elements.append(PageBreak())
        return elements
    
    def _build_financial_section(self) -> List:
        """Build financial analysis section"""
        recommended = self.data.get('recommendedScenario')
        if not recommended:
            return []
        
        elements = [
            Paragraph('Financial Analysis', self.styles['SectionHeader']),
            Paragraph(f"Based on recommended scenario: {recommended['name']}", ParagraphStyle(
                name='ScenarioNote',
                fontSize=10,
                textColor=COLORS['dark_gray'],
                fontName='Helvetica-Oblique'
            )),
            Spacer(1, 0.2 * inch),
        ]
        
        # Development Costs
        elements.append(Paragraph('Development Costs', self.styles['SubHeader']))
        costs = recommended['costs']
        costs_data = [
            ['Cost Category', 'Amount'],
            ['Hard Costs', format_currency(costs['hardCosts'])],
            ['Soft Costs', format_currency(costs['softCosts'])],
            ['Land Cost', format_currency(costs['landCost'])],
            ['Financing Costs', format_currency(costs['financingCosts'])],
            ['Contingency', format_currency(costs['contingency'])],
            ['TOTAL', format_currency(costs['totalCost'])],
        ]
        elements.append(self._create_table(costs_data, [3*inch, 2*inch], COLORS['secondary']))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Investment Returns
        elements.append(Paragraph('Investment Returns', self.styles['SubHeader']))
        proj = recommended['projections']
        returns_data = [
            ['Metric', 'Value'],
            ['Total Asset Value', format_currency(proj['totalAssetValue'])],
            ['Development Profit', format_currency(proj['developmentProfit'])],
            ['Return on Investment (ROI)', format_percent(proj['roi'])],
            ['Internal Rate of Return (IRR)', format_percent(proj['irr'])],
            ['Equity Multiple', f"{proj['equityMultiple']:.2f}x"],
            ['Cash-on-Cash Return', format_percent(proj['cashOnCash'])],
        ]
        elements.append(self._create_table(returns_data, [3*inch, 2*inch], COLORS['accent']))
        
        return elements
    
    def generate(self, output_path: str):
        """Generate the PDF report"""
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Build document
        elements = []
        elements.extend(self._build_title_page())
        elements.extend(self._build_executive_summary())
        elements.extend(self._build_property_overview())
        elements.extend(self._build_scenarios_section())
        elements.extend(self._build_financial_section())
        
        doc.build(elements)
        print(f"✅ PDF generated: {output_path}")
    
    def generate_buffer(self) -> bytes:
        """Generate PDF and return as bytes"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        elements = []
        elements.extend(self._build_title_page())
        elements.extend(self._build_executive_summary())
        elements.extend(self._build_property_overview())
        elements.extend(self._build_scenarios_section())
        elements.extend(self._build_financial_section())
        
        doc.build(elements)
        return buffer.getvalue()


def main():
    """CLI entry point"""
    if len(sys.argv) < 3:
        print("Usage: python pdf_generator.py <report.json> <output.pdf>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    with open(input_file, 'r') as f:
        report_data = json.load(f)
    
    generator = ZoneWisePDFReport(report_data)
    generator.generate(output_file)


if __name__ == '__main__':
    main()
