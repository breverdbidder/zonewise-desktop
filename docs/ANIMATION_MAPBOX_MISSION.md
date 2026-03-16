# CLAUDE CODE MISSION: ZoneWise.AI Vite Animation + Mapbox Heatmap Build

> **Paste into Claude Code. Zero questions. Full autonomous.**
> **Context:** This session hit 50% context building animations in the WRONG repo (Next.js zonewise-web). Everything below goes into the CORRECT repo: `zonewise-desktop` (Vite SPA).

---

## TARGET REPO

```
breverdbidder/zonewise-desktop
PAT: $GH_PAT (from GitHub secrets)
```

## ARCHITECTURE (CONFIRMED — DO NOT DEVIATE)

```
Vite + React 18 + TailwindCSS + Shadcn/ui → Vercel (zonewise-desktop-viewer.vercel.app)
zonewise.ai proxies to it via vercel.json rewrites in zonewise-web repo
```

## HOUSE BRAND (MANDATORY)

```
PRIMARY:    #1E3A5F (Navy)
ACCENT/CTA: #F59E0B (Orange)
BACKGROUND: #020617 (Slate-950)
FONT:       Inter body + display pairing
```

---

## PHASE 1: ANIMATION SYSTEM

### Install framer-motion

```bash
cd apps/viewer
npm install framer-motion
```

### Create `zonewise/components/animations/` directory with these 6 components:

1. **AnimatedSection.tsx** — Scroll-triggered fade-up/slide reveals using `useInView` from framer-motion
2. **StaggerChildren.tsx + StaggerItem** — Cascading child animations for card grids
3. **AnimatedCounter.tsx** — Count-up numbers on scroll (IntersectionObserver + requestAnimationFrame + ease-out-cubic)
4. **MeshGradient.tsx** — 3 animated blurred orbs (navy, orange accent, deep navy) with 20-30s infinite float loops
5. **GlowButton.tsx** — Hover triggers: scale(1.04), box-shadow glow, shimmer sweep left-to-right
6. **index.ts** — Barrel export

### Animation tokens (add to CSS or Tailwind config):

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.22, 1.36, 0.36, 1);
--stagger-base: 60ms;
```

### Wire animations into the landing page (Home.tsx or App.tsx root route):

- Hero: 6 staggered reveals (0ms → 680ms) + MeshGradient background
- Stats bar: AnimatedCounter for 67, 369, 5950+, 10.5M
- 12 Wise Module cards: StaggerChildren at 60ms intervals + hover lift
- Agent cards: StaggerChildren at 100ms + hover elevation
- CTAs: GlowButton with orange halo
- Origin story: paragraph-by-paragraph AnimatedSection
- Pricing cards: StaggerChildren + hover lift
- `prefers-reduced-motion` respected everywhere

### Reference: Animation patterns CSS

```css
/* Page load stagger */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Button glow */
.btn-brand:hover {
  transform: scale(1.04);
  box-shadow: 0 0 24px rgba(245, 158, 11, 0.4), 0 0 48px rgba(245, 158, 11, 0.15);
}

/* Card hover lift */
.card-animated:hover {
  transform: translateY(-4px);
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

/* BID/REVIEW/SKIP badge pulse */
@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--pulse-color); }
  50% { box-shadow: 0 0 0 8px transparent; }
}

/* Mesh gradient background */
@keyframes meshShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Table row stagger */
@keyframes rowSlideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## PHASE 2: MAPBOX HEATMAP + SATELLITE (REVENTURE.APP CLONE)

### Existing components to build on:

- `zonewise/components/web/MapboxSatellite.tsx` — Already has satellite-streets-v12, 3D pitch, markers, geocoding. EXTEND, don't rewrite.
- `zonewise/components/web/Map.tsx` — Base map component
- Mapbox token: `$VITE_MAPBOX_TOKEN (from env)`

### Reference repos to pull from:

```
breverdbidder/reventure-clone      — Vite app with Zillow data pipeline
breverdbidder/biddeed-foreclosure-map — Foreclosure map with data/scripts
breverdbidder/biddeed-housing-map    — Housing heatmap with Zillow CSV data pipeline
```

### Build: MapboxHeatmap.tsx (NEW component)

Reverse-engineered from https://www.reventure.app/map:

1. **Choropleth heatmap layer** by ZIP code / county
   - Color ramp: green (affordable) → yellow (moderate) → red (expensive)
   - Data source: Zillow ZHVI CSV (free download) → Supabase `housing_metrics` table
   - Toggle between: Home Value | Rent | Inventory | Days on Market | Price Cuts

2. **Satellite toggle** — Switch between:
   - `mapbox://styles/mapbox/satellite-streets-v12` (satellite)
   - `mapbox://styles/mapbox/dark-v11` (dark with heatmap overlay)
   - `mapbox://styles/mapbox/light-v11` (light with heatmap overlay)

3. **Parcel highlighting** (PropertyOnion style):
   ```javascript
   map.addLayer({
     id: 'parcel-highlight',
     type: 'fill',
     source: 'parcels',
     paint: {
       'fill-color': '#F59E0B',
       'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.35, 0],
       'fill-opacity-transition': { duration: 300 }
     }
   });
   ```

4. **Foreclosure overlay** (PropertyOnion reverse engineering):
   - Pull auction data from Supabase `multi_county_auctions` (245,017 rows)
   - Color-code markers: BID (green #22C55E) / REVIEW (orange #F59E0B) / SKIP (red #EF4444)
   - Cluster at low zoom, expand at high zoom
   - Click marker → property card with judgment amount, ARV, ML score

5. **Map controls** (Reventure style):
   - Layer toggle panel (top-right): Satellite | Heatmap | Foreclosures | Parcels
   - Metric selector dropdown: Home Value | Rent | Inventory | Days on Market
   - County/ZIP filter
   - Legend bar at bottom showing color ramp + values
   - Search bar with Mapbox Geocoding API

### Data pipeline (reference from existing repos):

```
Zillow Research CSV → GitHub Actions → parse → Supabase housing_metrics table
Census API → demographics by ZIP → Supabase demographics table
multi_county_auctions (245K rows) → foreclosure overlay
fl_parcels → parcel boundaries
```

Supabase URL: `https://mocerqjnksmhcjzxrewo.supabase.co`
Anon key ends: `$SUPABASE_ANON_KEY_SUFFIX`

---

## PHASE 3: SPLIT-SCREEN INTEGRATION

### Existing layout: `zonewise/components/web/CraftAgentLayout.tsx`

Wire the new map into the split-screen:
- Left panel (40%): AIChatBox.tsx — streaming chat with SSE from zonewise-agents.onrender.com
- Right panel (60%): Tabbed view:
  - **Map** tab → MapboxHeatmap with all overlays
  - **Report** tab → ReportGenerator output
  - **3D** tab → BuildingEnvelope3D (already built)
  - **Sun** tab → SunShadowAnalysis (already built)

### App.tsx routing:

```tsx
/ → Marketing landing page (with animations from Phase 1)
/app → CraftAgentLayout (split-screen chat + map)
/app/map → Full-screen MapboxHeatmap
/dashboard → DashboardLayout
/login, /signup → Auth pages
```

---

## PHASE 4: ANTI-SLOP CHECKLIST

Before shipping, verify NONE present:
- ❌ Blue-purple gradient backgrounds
- ❌ Generic Inter-only typography
- ❌ Three-column icon card sections
- ❌ Generic testimonial carousel
- ❌ White backgrounds (brand is dark-first for app, light for marketing)
- ❌ Unbranded default shadcn/ui components
- ❌ Static numbers (must animate)
- ❌ No hover states on interactive elements

---

## DEPLOYMENT

Vercel auto-deploys from `main` branch.
- Project: `zonewise-desktop-viewer` on Vercel
- Org: `team_UEds2qBzyD9e7rOrX8aakj9K`
- Domain: proxied from zonewise.ai

### Env vars already set on Vercel:
- ANTHROPIC_API_KEY ✅
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
- SUPABASE_SERVICE_ROLE_KEY ✅
- NEXT_PUBLIC_APP_URL ✅
- NEXT_PUBLIC_MAPBOX_TOKEN ✅
- NEXT_PUBLIC_SUPABASE_URL ✅

### For Vite, use VITE_ prefix:
```
VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN (from env)
VITE_SUPABASE_URL=https://mocerqjnksmhcjzxrewo.supabase.co
VITE_SUPABASE_ANON_KEY=(ends $SUPABASE_ANON_KEY_SUFFIX — get from SUPABASE_CREDENTIALS.md or Vercel env)
VITE_API_URL=https://zonewise-agents.onrender.com
```

---

## SESSION MANAGEMENT

- Context hits 50% → kill and restart with this spec
- NEVER /compact
- Install Context7 plugin + CC Status Line before starting
- TODO.md protocol: load → find task → execute → mark [x] → push

---

## PRIORITY ORDER

1. Animations (framer-motion) — visible impact, fastest win
2. MapboxHeatmap with satellite/choropleth — the core feature
3. Foreclosure overlay with auction data — differentiation from Reventure
4. Split-screen wiring — CraftAgentLayout integration
5. Landing page with all animations applied

**Execute in this order. Ship after each phase. Don't batch.**
