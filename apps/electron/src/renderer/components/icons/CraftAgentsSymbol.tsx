interface ZoneWiseSymbolProps {
  className?: string
}

/**
 * ZoneWise map/zone symbol - represents zoning intelligence
 * Uses accent color from theme (currentColor from className)
 */
export function ZoneWiseSymbol({ className }: ZoneWiseSymbolProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Map pin with zone grid */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9c0-2.76 2.24-5 5-5z"
        fill="currentColor"
      />
      {/* Zone grid inside pin */}
      <rect x="9" y="6" width="2.5" height="2.5" fill="currentColor" rx="0.5" />
      <rect x="12.5" y="6" width="2.5" height="2.5" fill="currentColor" rx="0.5" />
      <rect x="9" y="9.5" width="2.5" height="2.5" fill="currentColor" rx="0.5" />
      <rect x="12.5" y="9.5" width="2.5" height="2.5" fill="currentColor" rx="0.5" />
    </svg>
  )
}

// Re-export as CraftAgentsSymbol for backwards compatibility
export { ZoneWiseSymbol as CraftAgentsSymbol }
