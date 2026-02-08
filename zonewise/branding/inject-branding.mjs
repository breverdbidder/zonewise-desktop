#!/usr/bin/env node
/**
 * ZoneWise Branding Injector
 * 
 * Runs AFTER vite build to:
 * 1. Inject ZoneWise branding into the viewer HTML
 * 2. Copy marketing landing page to dist root
 * 
 * This means we NEVER modify upstream source files.
 * 
 * Result:
 *   / → Marketing landing page (zonewise/marketing/index.html)
 *   /s/ → Craft Agents session viewer (apps/viewer built output)
 * 
 * Usage: node zonewise/branding/inject-branding.mjs
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const DIST = resolve(ROOT, "apps/viewer/dist");

const BRANDING = {
  title: "ZoneWise.AI - Florida Real Estate Intelligence",
  description: "AI-powered zoning intelligence across all 67 Florida counties. Distressed assets decoded.",
  themeColor: "#1E3A5F",
  ogTitle: "ZoneWise.AI",
  ogDescription: "Florida's AI-Powered Real Estate Intelligence Platform",
};

function injectViewerBranding() {
  // The viewer outputs to /s/ subdirectory (base path in vite.config.ts)
  // So the index.html is at dist/s/index.html after build
  const viewerIndex = resolve(DIST, "s/index.html");
  if (!existsSync(viewerIndex)) {
    // Fallback: might be at dist/index.html if base path changed
    const fallback = resolve(DIST, "index.html");
    if (!existsSync(fallback)) {
      console.warn("⚠️ No viewer index.html found in dist/ or dist/s/");
      return;
    }
  }
  
  const indexPath = existsSync(resolve(DIST, "s/index.html")) 
    ? resolve(DIST, "s/index.html") 
    : resolve(DIST, "index.html");

  let html = readFileSync(indexPath, "utf-8");

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${BRANDING.title}</title>`);

  // Replace meta description
  if (html.includes(description)) {
    html = html.replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${BRANDING.description}"`
    );
  }

  // Add theme color
  if (!html.includes("theme-color")) {
    html = html.replace("</head>", `  <meta name="theme-color" content="${BRANDING.themeColor}">
  </head>`);
  }

  // Add OG tags
  html = html.replace("</head>", `  <meta property="og:title" content="${BRANDING.ogTitle}">
  <meta property="og:description" content="${BRANDING.ogDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://zonewise.ai">
  </head>`);

  // Remove Craft Agents analytics
  html = html.replace(/<script[^>]*plausible[^>]*><\/script>/g, "");
  html = html.replace(/<script>\s*window\.plausible[^<]*<\/script>/g, "");

  // Inject override CSS
  const overrideCss = resolve(__dirname, "override.css");
  if (existsSync(overrideCss)) {
    const cssTarget = existsSync(resolve(DIST, "s")) ? resolve(DIST, "s/zonewise-override.css") : resolve(DIST, "zonewise-override.css");
    copyFileSync(overrideCss, cssTarget);
    html = html.replace("</head>", `  <link rel="stylesheet" href="zonewise-override.css">
  </head>`);
  }

  writeFileSync(indexPath, html);
  console.log("✅ Viewer branding injected");
}

function copyMarketingPage() {
  const marketingIndex = resolve(ROOT, "zonewise/marketing/index.html");
  if (!existsSync(marketingIndex)) {
    console.warn("⚠️ No marketing landing page found at zonewise/marketing/index.html");
    return;
  }

  // Copy marketing page to dist root
  writeFileSync(resolve(DIST, "index.html"), readFileSync(marketingIndex));
  console.log("✅ Marketing landing page copied to dist root");
}

// Execute
console.log("🎨 ZoneWise Branding Injection");
console.log("  Root:", ROOT);
console.log("  Dist:", DIST);
injectViewerBranding();
copyMarketingPage();
console.log("🚀 Done! / → Marketing, /s/ → Viewer");

