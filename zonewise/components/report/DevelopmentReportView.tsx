/**
 * ZoneWise V2 - Development Analysis Report Component
 * Full-featured report display with all sections
 */

import React, { useState } from 'react';
import {
  DevelopmentAnalysisReport,
  KPICategorySummary,
  DevelopmentScenario,
  KPI_CATEGORY_LABELS
} from '../../types/development-analysis';
import {
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
  exportToGitHubStructure,
  formatCurrency,
  formatNum
} from '../../lib/export/export-service';

interface ReportViewProps {
  report: DevelopmentAnalysisReport;
  onExport?: (format: string, data: string | object) => void;
}

// Tab navigation
type ReportTab = 'summary' | 'property' | 'kpis' | 'scenarios' | 'financial';

export function DevelopmentReportView({ report, onExport }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const tabs: { id: ReportTab; label: string; icon: string }[] = [
    { id: 'summary', label: 'Executive Summary', icon: '📋' },
    { id: 'property', label: 'Property Overview', icon: '🏢' },
    { id: 'kpis', label: 'KPI Analysis', icon: '📊' },
    { id: 'scenarios', label: 'Development Scenarios', icon: '🏗️' },
    { id: 'financial', label: 'Financial Analysis', icon: '💰' },
  ];

  const handleExport = (format: 'csv' | 'json' | 'markdown' | 'github') => {
    let data: string | object;
    let filename: string;
    
    switch (format) {
      case 'csv':
        data = exportToCSV(report);
        filename = `${report.property.address.replace(/\s+/g, '-')}-kpis.csv`;
        break;
      case 'json':
        data = exportToJSON(report);
        filename = `${report.property.address.replace(/\s+/g, '-')}-report.json`;
        break;
      case 'markdown':
        data = exportToMarkdown(report);
        filename = `${report.property.address.replace(/\s+/g, '-')}-report.md`;
        break;
      case 'github':
        data = exportToGitHubStructure(report);
        filename = `${report.property.address.replace(/\s+/g, '-')}-github-structure`;
        break;
    }
    
    if (onExport) {
      onExport(format, data);
    } else {
      // Default: download file
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'json' ? 'application/json' : 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="development-report">
      {/* Header */}
      <header className="report-header">
        <div className="header-content">
          <h1>{report.property.address}</h1>
          <p className="subtitle">{report.property.city}, {report.property.state} {report.property.zipCode}</p>
          <p className="meta">
            <span>Parcel ID: {report.property.parcelId}</span>
            <span>Report Date: {new Date(report.createdAt).toLocaleDateString()}</span>
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="export-buttons">
          <button onClick={() => handleExport('csv')} className="btn-export">
            📄 CSV
          </button>
          <button onClick={() => handleExport('json')} className="btn-export">
            { } JSON
          </button>
          <button onClick={() => handleExport('markdown')} className="btn-export">
            📝 Markdown
          </button>
          <button onClick={() => handleExport('github')} className="btn-export btn-primary">
            🐙 GitHub Repo
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="report-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="icon">{tab.icon}</span>
            <span className="label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="report-content">
        {activeTab === 'summary' && (
          <ExecutiveSummaryTab report={report} />
        )}
        {activeTab === 'property' && (
          <PropertyOverviewTab report={report} />
        )}
        {activeTab === 'kpis' && (
          <KPIAnalysisTab 
            report={report} 
            expandedCategories={expandedCategories}
            onToggleCategory={toggleCategory}
          />
        )}
        {activeTab === 'scenarios' && (
          <DevelopmentScenariosTab report={report} />
        )}
        {activeTab === 'financial' && (
          <FinancialAnalysisTab report={report} />
        )}
      </main>
    </div>
  );
}

// Executive Summary Tab
function ExecutiveSummaryTab({ report }: { report: DevelopmentAnalysisReport }) {
  const { executiveSummary, developmentCapacity, recommendedScenario, zoning } = report;
  
  return (
    <div className="tab-content summary-tab">
      {/* Property Snapshot */}
      <section className="snapshot-section">
        <h2>Property Snapshot</h2>
        <table className="snapshot-table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Current</th>
              <th>Maximum Potential</th>
              <th>Opportunity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Building Area</strong></td>
              <td>{formatNum(report.existingBuilding?.buildingArea || 0)} ft²</td>
              <td>{formatNum(developmentCapacity.maxBuildingArea)} ft²</td>
              <td className="highlight">+{formatNum(developmentCapacity.unusedDevelopmentRights)} ft²</td>
            </tr>
            <tr>
              <td><strong>FAR Utilized</strong></td>
              <td>{developmentCapacity.currentFARUtilization.toFixed(2)}</td>
              <td>{zoning.maxFAR.toFixed(2)}</td>
              <td className="highlight">{(100 - developmentCapacity.farUtilizationRate).toFixed(1)}% untapped</td>
            </tr>
            <tr>
              <td><strong>Height</strong></td>
              <td>{report.existingBuilding?.stories || 'N/A'} stories</td>
              <td>{zoning.maxStories} stories</td>
              <td className="highlight">Full vertical expansion</td>
            </tr>
            <tr>
              <td><strong>Development Rights</strong></td>
              <td>{developmentCapacity.farUtilizationRate.toFixed(1)}% used</td>
              <td>100%</td>
              <td className="highlight">{(100 - developmentCapacity.farUtilizationRate).toFixed(1)}% available</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Key Findings */}
      <section className="findings-section">
        <div className="findings-grid">
          <div className="findings-card success">
            <h3>✅ Key Findings</h3>
            <ul>
              {executiveSummary.keyFindings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
          
          <div className="findings-card opportunity">
            <h3>📈 Opportunities</h3>
            <ul>
              {executiveSummary.opportunities.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
          
          <div className="findings-card warning">
            <h3>⚠️ Challenges</h3>
            <ul>
              {executiveSummary.challenges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recommended Scenario */}
      {recommendedScenario && (
        <section className="recommendation-section">
          <h2>⭐ Recommended Development Scenario</h2>
          <div className="recommendation-card">
            <h3>{recommendedScenario.name}</h3>
            <p className="scenario-desc">{recommendedScenario.description}</p>
            
            <div className="scenario-details">
              <div className="components">
                <h4>Components</h4>
                <ul>
                  {recommendedScenario.components.map((c, i) => (
                    <li key={i}>
                      {c.units ? `${formatNum(c.units)} ` : ''}{c.name}
                      {!c.units && ` (${formatNum(c.area)} ft²)`}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="financials">
                <h4>Financial Highlights</h4>
                <div className="metrics-grid">
                  <div className="metric">
                    <span className="label">Development Cost</span>
                    <span className="value">{formatCurrency(recommendedScenario.costs.totalCost)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Asset Value</span>
                    <span className="value">{formatCurrency(recommendedScenario.projections.totalAssetValue)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">ROI</span>
                    <span className="value">{recommendedScenario.projections.roi.toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="label">IRR</span>
                    <span className="value">{recommendedScenario.projections.irr}%</span>
                  </div>
                  <div className="metric">
                    <span className="label">Equity Multiple</span>
                    <span className="value">{recommendedScenario.projections.equityMultiple}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Property Overview Tab
function PropertyOverviewTab({ report }: { report: DevelopmentAnalysisReport }) {
  const { property, site, zoning, developmentCapacity, setbacks } = report;
  
  return (
    <div className="tab-content property-tab">
      {/* Site Information */}
      <section>
        <h2>Site Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Address</label>
            <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
          </div>
          <div className="info-item">
            <label>Parcel ID</label>
            <span>{property.parcelId}</span>
          </div>
          {property.legalDescription && (
            <div className="info-item full-width">
              <label>Legal Description</label>
              <span>{property.legalDescription}</span>
            </div>
          )}
        </div>
      </section>

      {/* Site Characteristics */}
      <section>
        <h2>Site Characteristics</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Detail</th>
              <th>Development Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Lot Size</strong></td>
              <td>{formatNum(site.lotAreaSqFt)} ft² ({site.lotAreaAcres.toFixed(2)} acres)</td>
              <td>{site.lotAreaSqFt > 40000 ? 'Sufficient for high-rise' : 'Mid-rise potential'}</td>
            </tr>
            <tr>
              <td><strong>Lot Type</strong></td>
              <td>{site.lotType}</td>
              <td>{site.lotType === 'Corner' ? 'Enhanced visibility, dual frontage' : 'Standard configuration'}</td>
            </tr>
            <tr>
              <td><strong>Frontage</strong></td>
              <td>{site.frontageLength.toFixed(2)} ft</td>
              <td>{site.frontageLength > 200 ? 'Excellent' : 'Good'} street presence</td>
            </tr>
            <tr>
              <td><strong>Vacant</strong></td>
              <td>{site.isVacant ? 'Yes' : 'No'}</td>
              <td>{site.isVacant ? 'Ready for development' : 'Existing structure'}</td>
            </tr>
            <tr>
              <td><strong>Neighborhood</strong></td>
              <td>{property.neighborhood || 'N/A'}</td>
              <td>{property.neighborhood?.includes('CBD') ? 'Prime downtown location' : 'Location context'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Zoning Profile */}
      <section>
        <h2>Zoning Profile</h2>
        <div className="zoning-header">
          <div className="zoning-badge">
            <span className="district">{zoning.zoningDistrict}</span>
          </div>
          <p className="zoning-description">{zoning.zoningDescription}</p>
        </div>
        
        <h3>Maximum Development Rights</h3>
        <div className="rights-grid">
          <div className="right-item">
            <label>FAR</label>
            <span className="value">{zoning.maxFAR.toFixed(2)}</span>
          </div>
          <div className="right-item">
            <label>Height</label>
            <span className="value">{zoning.maxStories} stories</span>
          </div>
          <div className="right-item">
            <label>Lot Coverage</label>
            <span className="value">{zoning.maxLotCoverage}%</span>
          </div>
          {developmentCapacity.residentialDensity && (
            <div className="right-item">
              <label>Residential Density</label>
              <span className="value">{formatNum(developmentCapacity.residentialDensity)} du/acre</span>
            </div>
          )}
          {developmentCapacity.lodgingDensity && (
            <div className="right-item">
              <label>Lodging Density</label>
              <span className="value">{formatNum(developmentCapacity.lodgingDensity)} units/acre</span>
            </div>
          )}
        </div>
      </section>

      {/* Setbacks */}
      <section>
        <h2>Setback Requirements</h2>
        <table className="data-table">
          <tbody>
            <tr>
              <td><strong>Primary Frontage</strong></td>
              <td>{setbacks.primaryFrontage} ft</td>
            </tr>
            <tr>
              <td><strong>Secondary Frontage</strong></td>
              <td>{setbacks.secondaryFrontage ?? setbacks.primaryFrontage} ft</td>
            </tr>
            <tr>
              <td><strong>Side</strong></td>
              <td>{setbacks.side !== null ? `${setbacks.side} ft` : 'Not specified'}</td>
            </tr>
            <tr>
              <td><strong>Rear</strong></td>
              <td>{setbacks.rear} ft</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Special Regulations */}
      <section>
        <h2>Special Regulations & Incentives</h2>
        <div className="regulations-list">
          {zoning.liveLocalApplicability && (
            <div className="regulation success">
              ✅ <strong>Live Local Act (SB 102)</strong> - Density bonuses available
            </div>
          )}
          {zoning.todStatus && (
            <div className="regulation success">
              ✅ <strong>Transit-Oriented Development</strong> - {zoning.todStatus}
            </div>
          )}
          {zoning.transitCorridor && (
            <div className="regulation success">
              ✅ <strong>Transit Corridor</strong> - Parking reductions available
            </div>
          )}
          {zoning.leedRequirement && (
            <div className="regulation info">
              ✅ <strong>{zoning.leedRequirement}</strong> - Required
            </div>
          )}
          {zoning.historicDistrict && (
            <div className="regulation warning">
              ⚠️ <strong>Historic District</strong> - {zoning.historicDistrict}
            </div>
          )}
          {zoning.faaHeightLimitation && (
            <div className="regulation warning">
              ⚠️ <strong>FAA Height Limitation</strong> - {formatNum(zoning.faaHeightLimitation)} ft maximum
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// KPI Analysis Tab
function KPIAnalysisTab({ 
  report, 
  expandedCategories, 
  onToggleCategory 
}: { 
  report: DevelopmentAnalysisReport;
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
}) {
  const { kpis, kpisByCategory, developmentCapacity } = report;
  
  return (
    <div className="tab-content kpi-tab">
      {/* Summary Stats */}
      <section className="kpi-summary">
        <h2>{kpis.length} Key Performance Indicators</h2>
        <div className="stats-grid">
          <div className="stat">
            <span className="value">{kpis.length}</span>
            <span className="label">Total KPIs</span>
          </div>
          <div className="stat">
            <span className="value">{kpisByCategory.length}</span>
            <span className="label">Categories</span>
          </div>
          <div className="stat">
            <span className="value">{kpis.filter(k => k.source === 'CALCULATED').length}</span>
            <span className="label">Calculated</span>
          </div>
          <div className="stat">
            <span className="value">{(100 - developmentCapacity.farUtilizationRate).toFixed(1)}%</span>
            <span className="label">Untapped Potential</span>
          </div>
        </div>
      </section>

      {/* KPI Categories */}
      <section className="kpi-categories">
        {kpisByCategory.map(cat => (
          <div key={cat.category} className="kpi-category">
            <button 
              className="category-header"
              onClick={() => onToggleCategory(cat.category)}
            >
              <span className="category-name">
                {cat.label}
                <span className="count">({cat.kpiCount} KPIs)</span>
              </span>
              <span className="toggle">
                {expandedCategories.has(cat.category) ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedCategories.has(cat.category) && (
              <table className="kpi-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>KPI</th>
                    <th>Value</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.kpis.map(kpi => (
                    <tr key={kpi.id}>
                      <td>{kpi.id}</td>
                      <td>{kpi.name}</td>
                      <td className="value">{kpi.formattedValue || String(kpi.value)}</td>
                      <td>
                        <span className={`source-badge ${kpi.source.toLowerCase()}`}>
                          {kpi.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

// Development Scenarios Tab
function DevelopmentScenariosTab({ report }: { report: DevelopmentAnalysisReport }) {
  const { scenarios, zoning } = report;
  
  return (
    <div className="tab-content scenarios-tab">
      {/* Scenario Comparison */}
      <section>
        <h2>{scenarios.length} Development Options Analyzed</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Total SF</th>
              <th>FAR</th>
              <th>Dev Cost</th>
              <th>IRR</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => (
              <tr key={s.id} className={s.isRecommended ? 'recommended' : ''}>
                <td>
                  <strong>{s.name}</strong>
                  {s.isRecommended && <span className="star">⭐</span>}
                </td>
                <td>{formatNum(s.totalSqFt)}</td>
                <td>{(s.farUtilization / 100 * zoning.maxFAR).toFixed(1)}</td>
                <td>{formatCurrency(s.costs.totalCost)}</td>
                <td>{s.projections.irr}%</td>
                <td>
                  <span className={`risk-badge ${s.riskLevel.toLowerCase().replace('-', '')}`}>
                    {s.riskLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Scenario Details */}
      {scenarios.map(scenario => (
        <section key={scenario.id} className="scenario-detail">
          <h3>
            {scenario.name}
            {scenario.isRecommended && <span className="recommended-badge">⭐ Recommended</span>}
          </h3>
          <p className="description">{scenario.description}</p>
          
          <div className="scenario-grid">
            <div className="components-section">
              <h4>Components</h4>
              <ul>
                {scenario.components.map((c, i) => (
                  <li key={i}>
                    <strong>{c.name}</strong>: {formatNum(c.area)} ft²
                    {c.units && ` (${formatNum(c.units)} units)`}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="costs-section">
              <h4>Development Costs</h4>
              <table>
                <tbody>
                  <tr>
                    <td>Hard Costs</td>
                    <td>{formatCurrency(scenario.costs.hardCosts)}</td>
                  </tr>
                  <tr>
                    <td>Soft Costs</td>
                    <td>{formatCurrency(scenario.costs.softCosts)}</td>
                  </tr>
                  <tr>
                    <td>Land & Financing</td>
                    <td>{formatCurrency(scenario.costs.landCost + scenario.costs.financingCosts)}</td>
                  </tr>
                  <tr className="total">
                    <td><strong>Total</strong></td>
                    <td><strong>{formatCurrency(scenario.costs.totalCost)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="returns-section">
              <h4>Returns</h4>
              <div className="returns-grid">
                <div className="return-item">
                  <label>Asset Value</label>
                  <span>{formatCurrency(scenario.projections.totalAssetValue)}</span>
                </div>
                <div className="return-item">
                  <label>Profit</label>
                  <span>{formatCurrency(scenario.projections.developmentProfit)}</span>
                </div>
                <div className="return-item">
                  <label>ROI</label>
                  <span>{scenario.projections.roi.toFixed(1)}%</span>
                </div>
                <div className="return-item">
                  <label>IRR</label>
                  <span>{scenario.projections.irr}%</span>
                </div>
                <div className="return-item">
                  <label>Equity Multiple</label>
                  <span>{scenario.projections.equityMultiple}x</span>
                </div>
              </div>
            </div>
            
            <div className="assessment-section">
              <h4>Assessment</h4>
              <div className="assessment-grid">
                <div><label>Risk Level</label><span>{scenario.riskLevel}</span></div>
                <div><label>Revenue Streams</label><span>{scenario.revenueStreams}</span></div>
                <div><label>Market Demand</label><span>{scenario.marketDemand}</span></div>
                <div><label>Management</label><span>{scenario.managementComplexity}</span></div>
                <div><label>Exit Flexibility</label><span>{scenario.exitFlexibility}</span></div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

// Financial Analysis Tab
function FinancialAnalysisTab({ report }: { report: DevelopmentAnalysisReport }) {
  const scenario = report.recommendedScenario || report.scenarios[0];
  if (!scenario) return <div>No financial data available</div>;
  
  const total = scenario.costs.totalCost;
  
  return (
    <div className="tab-content financial-tab">
      <h2>Financial Analysis: {scenario.name}</h2>
      
      {/* Revenue Projections */}
      <section>
        <h3>Revenue Projections</h3>
        <table className="financial-table">
          <thead>
            <tr>
              <th>Revenue Stream</th>
              <th>Annual Income</th>
              <th>Cap Rate</th>
              <th>Asset Value</th>
            </tr>
          </thead>
          <tbody>
            {scenario.components.filter(c => c.annualRevenue).map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{formatCurrency(c.annualRevenue || 0)}</td>
                <td>{((c.capRate || 0) * 100).toFixed(1)}%</td>
                <td>{formatCurrency(c.assetValue || 0)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Total</strong></td>
              <td><strong>{formatCurrency(scenario.projections.totalRevenue)}</strong></td>
              <td><strong>{(scenario.projections.weightedCapRate * 100).toFixed(1)}%</strong></td>
              <td><strong>{formatCurrency(scenario.projections.totalAssetValue)}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Development Costs */}
      <section>
        <h3>Development Costs</h3>
        <table className="financial-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hard Costs</td>
              <td>{formatCurrency(scenario.costs.hardCosts)}</td>
              <td>{((scenario.costs.hardCosts / total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Soft Costs</td>
              <td>{formatCurrency(scenario.costs.softCosts)}</td>
              <td>{((scenario.costs.softCosts / total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Land & Financing</td>
              <td>{formatCurrency(scenario.costs.landCost + scenario.costs.financingCosts)}</td>
              <td>{(((scenario.costs.landCost + scenario.costs.financingCosts) / total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Contingency</td>
              <td>{formatCurrency(scenario.costs.contingency)}</td>
              <td>{((scenario.costs.contingency / total) * 100).toFixed(1)}%</td>
            </tr>
            <tr className="total-row">
              <td><strong>Total</strong></td>
              <td><strong>{formatCurrency(total)}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Returns Analysis */}
      <section>
        <h3>Returns Analysis</h3>
        <div className="returns-dashboard">
          <div className="return-card primary">
            <span className="label">Development Profit</span>
            <span className="value">{formatCurrency(scenario.projections.developmentProfit)}</span>
          </div>
          <div className="return-card">
            <span className="label">ROI</span>
            <span className="value">{scenario.projections.roi.toFixed(1)}%</span>
          </div>
          <div className="return-card">
            <span className="label">IRR (10-year)</span>
            <span className="value">{scenario.projections.irr}%</span>
          </div>
          <div className="return-card">
            <span className="label">Equity Multiple</span>
            <span className="value">{scenario.projections.equityMultiple}x</span>
          </div>
          <div className="return-card">
            <span className="label">Cash-on-Cash (Year 1)</span>
            <span className="value">{scenario.projections.cashOnCash.toFixed(1)}%</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DevelopmentReportView;
