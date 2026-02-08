#!/usr/bin/env node
/**
 * ZoneWise Branding Injector
 * 
 * Runs AFTER vite build to inject ZoneWise branding into the viewer dist.
 * This approach means we NEVER modify upstream source files.
 * The injection happens on the built output only.
 * 
 * Usage: node zonewise/branding/inject-branding.mjs
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
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

function injectHtmlBranding() {
  const indexPath = resolve(DIST, "index.html");
  if (!existsSync(indexPath)) {
    console.error("❌ No dist/index.html found. Run vite build first.");
    process.exit(1);
  }

  let html = readFileSync(indexPath, "utf-8");

  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${BRANDING.title}</title>`
  );

  // Replace/add meta description
  if (html.includes(description)) {
    html = html.replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${BRANDING.description}"`
    );
  } else {
    html = html.replace("</head>", `  <meta name="description" content="${BRANDING.description}">
  </head>`);
  }

  // Add theme color
  if (!html.includes("theme-color")) {
    html = html.replace("</head>", `  <meta name="theme-color" content="${BRANDING.themeColor}">
  </head>`);
  }

  // Add Open Graph tags
  const ogTags = `
  <meta property="og:title" content="${BRANDING.ogTitle}">
  <meta property="og:description" content="${BRANDING.ogDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://zonewise.ai">
  `;
  html = html.replace("</head>", `${ogTags}</head>`);

  // Remove Craft Agents analytics (Plausible - their tracking, not ours)
  html = html.replace(/<script[^>]*plausible[^>]*><\/script>/g, "");
  html = html.replace(/<script>\s*window\.plausible[^<]*<\/script>/g, "");

  // Inject ZoneWise override CSS link
  const overrideCss = resolve(__dirname, "override.css");
  if (existsSync(overrideCss)) {
    copyFileSync(overrideCss, resolve(DIST, "zonewise-override.css"));
    html = html.replace("</head>", `  <link rel="stylesheet" href="/s/zonewise-override.css">
  </head>`);
  }

  writeFileSync(indexPath, html);
  console.log("✅ ZoneWise branding injected into viewer dist");
}

// Execute
injectHtmlBranding();

