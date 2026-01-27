interface ZoneWiseLogoProps {
  className?: string
}

/**
 * ZoneWise text logo with map icon
 * Uses accent color from theme (currentColor)
 */
export function ZoneWiseLogo({ className }: ZoneWiseLogoProps) {
  return (
    <svg
      viewBox="0 0 200 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Map pin icon */}
      <path
        d="M8 4C5.24 4 3 6.24 3 9c0 3.75 5 9.5 5 9.5s5-5.75 5-9.5c0-2.76-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
        fill="currentColor"
      />
      {/* ZONEWISE text - clean sans-serif */}
      <text
        x="18"
        y="16"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="14"
        fontWeight="600"
        fill="currentColor"
        dominantBaseline="middle"
      >
        ZoneWise
      </text>
    </svg>
  )
}

// Re-export as CraftAgentsLogo for backwards compatibility
export { ZoneWiseLogo as CraftAgentsLogo }
