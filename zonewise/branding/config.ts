// ZoneWise.AI Branding Configuration
// Override Craft Agents default branding

export const ZONEWISE_BRANDING = {
  // App Identity
  appName: "ZoneWise.AI Desktop",
  appTagline: "AI-Powered Zoning Intelligence",
  companyName: "Everest Capital USA",
  
  // Colors (from ZoneWise brand)
  colors: {
    primary: "#1E3A5F",      // Navy (header)
    secondary: "#00D9FF",    // Electric Cyan (accents)
    success: "#E8F5E9",      // Light Green
    warning: "#FFF3E0",      // Light Orange
    danger: "#FFEBEE",       // Light Red
    info: "#E3F2FD",         // Light Blue
    background: "#FFFFFF",
    foreground: "#1A1A1A",
  },
  
  // Typography
  fonts: {
    primary: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
  
  // Credits (TRADEMARK.md compliance)
  credits: {
    poweredBy: "Powered by Craft Agents technology",
    upstream: "https://github.com/lukilabs/craft-agents-oss",
    license: "Apache License 2.0",
  },
  
  // Default workspace
  defaultWorkspace: {
    name: "Brevard County Zoning",
    icon: "🏗️",
    skills: ["zoning-analysis", "parcel-lookup", "setback-calculator"],
    sources: ["bcpao-mcp", "gis-mcp", "municode-mcp"],
  },
  
  // Feature flags
  features: {
    showCraftAgentsBranding: false,
    showZoneWiseBranding: true,
    enableBrevardCountyData: true,
  },
};

export default ZONEWISE_BRANDING;
