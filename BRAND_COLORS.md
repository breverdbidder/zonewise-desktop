# House Brand — BidDeed.AI + ZoneWise.AI

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary (Navy) | `#1E3A5F` | Headers, primary buttons, navigation, sidebar |
| Accent (Orange) | `#F59E0B` | CTAs, highlights, active states, brand `.AI` |
| Accent Hover | `#FBBF24` | Hover states on accent elements |
| Accent Dark | `#D97706` | Pressed/active states on accent elements |
| Background (Light) | `#FFFFFF` | Light mode surfaces |
| Background (Dark) | `#020617` | Dark mode surfaces |

## Typography

| Token | Font | Usage |
|-------|------|-------|
| Sans | Inter | All UI text (set via `html[data-font="inter"]`) |
| Display | Plus Jakarta Sans / Fraunces | Marketing headings (viewer) |
| Mono | JetBrains Mono | Code blocks, data displays |

## Radius

Default: `0rem` (sharp corners per current theme)

## CSS Variables (Viewer)

```css
--zw-navy: #1E3A5F;
--zw-accent: #F59E0B;
--zw-accent-light: #FBBF24;
--zw-accent-dark: #D97706;
--accent: #F59E0B;
--accent-foreground: white;
```

## Rules

- NEVER hardcode `#F47B20` — this was the old wrong orange
- Use `var(--zw-accent)` or `var(--accent)` in CSS
- Use `text-accent` / `bg-accent` in Tailwind classes
- Minimize hardcoded hex in TSX — prefer CSS variables or Tailwind tokens
- Both BidDeed.AI and ZoneWise.AI repos MUST use `#F59E0B` as accent
