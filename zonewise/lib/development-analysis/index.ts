/**
 * ZoneWise V2 - Development Analysis Report Module
 * Complete report generation system for development feasibility studies
 * 
 * Features:
 * - 63+ KPI extraction and calculation across 10 categories
 * - 3 development scenario modeling (Mixed-Use, Residential, Hotel+Condo)
 * - Financial analysis (IRR, ROI, equity multiple, cap rates)
 * - Multi-format export (PDF, Excel, CSV, JSON, Markdown, GitHub)
 * - React components for interactive report display
 * - Supabase storage for report persistence
 * 
 * @version 2.0.0
 * @author ZoneWise V2 / Everest Capital USA
 */

// Types
export * from './types/development-analysis';

// KPI Engine
export {
  generateKPIs,
  groupKPIsByCategory,
  kpisToCSV,
  calculateDevelopmentCapacity,
  calculateFinancialOpportunity
} from './lib/kpi-engine/kpi-calculator';

// Financial Calculator
export {
  generateMixedUseScenario,
  generateResidentialScenario,
  generateHotelCondoScenario,
  generateAllScenarios,
  formatCurrency,
  formatNumber,
  MARKET_PRESETS
} from './lib/financial-calculator/financial-calculator';

// Report Generator
export {
  generateDevelopmentAnalysisReport,
  formatReportSummary,
  generateActionItems
} from './lib/report-generator/report-generator';

// Export Service
export {
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
  exportToGitHubStructure
} from './lib/export/export-service';

// API
export {
  generateReport,
  generateSampleReport,
  exportReport,
  getReportSummary,
  handleGenerateReport,
  handleExportReport,
  SAMPLE_169_FLAGLER
} from './api/development-analysis-api';

// React Components
export { DevelopmentReportView } from './components/report/DevelopmentReportView';

// Version info
export const VERSION = '2.0.0';
export const MODULE_NAME = 'ZoneWise V2 Development Analysis';
