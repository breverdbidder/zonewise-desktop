#!/usr/bin/env node
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const DIST = resolve(ROOT, "apps/viewer/dist");

console.log("ZoneWise Branding Injection");
console.log("  Root:", ROOT);
console.log("  Dist:", DIST);

const paths = [resolve(DIST, "s/index.html"), resolve(DIST, "index.html")];
let indexPath = null;
for (const p of paths) {
  if (existsSync(p)) { indexPath = p; break; }
}

if (!indexPath) {
  console.warn("No index.html found - skipping branding");
  process.exit(0);
}

console.log("  Found:", indexPath);
let html = readFileSync(indexPath, "utf-8");

html = html.replace(/<title>[^<]*<\/title>/, "<title>ZoneWise.AI - Florida Real Estate Intelligence</title>");
html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="AI-powered zoning intelligence across all 67 Florida counties."');

if (!html.includes("theme-color")) {
  html = html.replace("</head>", '  <meta name="theme-color" content="#1E3A5F">\n  </head>');
}

if (!html.includes("og:title")) {
  const ogTags = [
    '  <meta property="og:title" content="ZoneWise.AI">',
    '  <meta property="og:description" content="Florida AI-Powered Real Estate Intelligence">',
    '  <meta property="og:type" content="website">',
    '  <meta property="og:url" content="https://zonewise.ai">'
  ].join("\n  ");
  html = html.replace("</head>", ogTags + "\n  </head>");
}

html = html.replace(/<script[^>]*plausible[^>]*><\/script>/g, "");
html = html.replace(/<script>\s*window\.plausible[^<]*<\/script>/g, "");

const overrideCss = resolve(__dirname, "override.css");
if (existsSync(overrideCss)) {
  const targetDir = indexPath.includes("/s/") ? resolve(DIST, "s") : DIST;
  copyFileSync(overrideCss, resolve(targetDir, "zonewise-override.css"));
  html = html.replace("</head>", '  <link rel="stylesheet" href="zonewise-override.css">\n  </head>');
  console.log("  CSS override injected");
}

writeFileSync(indexPath, html);
console.log("  Viewer branding done");

const marketingIndex = resolve(ROOT, "zonewise/marketing/index.html");
if (existsSync(marketingIndex) && indexPath.includes("/s/")) {
  writeFileSync(resolve(DIST, "index.html"), readFileSync(marketingIndex));
  console.log("  Marketing page copied to root");
}

console.log("Done!");
