/**
 * ZoneWise.AI Responsive Utilities
 * 
 * Hooks and utilities for mobile responsiveness.
 * 
 * @module use-responsive
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Breakpoints (Tailwind defaults)
// ============================================================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint(): Breakpoint | 'xs' {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | 'xs'>('xs');
  
  useEffect(() => {
    const getBreakpoint = (): Breakpoint | 'xs' => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS['2xl']) return '2xl';
      if (width >= BREAKPOINTS.xl) return 'xl';
      if (width >= BREAKPOINTS.lg) return 'lg';
      if (width >= BREAKPOINTS.md) return 'md';
      if (width >= BREAKPOINTS.sm) return 'sm';
      return 'xs';
    };
    
    const handleResize = () => setBreakpoint(getBreakpoint());
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
}

/**
 * Hook to check if screen is mobile (< md)
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < BREAKPOINTS.md);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

/**
 * Hook to check if screen is tablet (md-lg)
 */
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg);
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);
  
  return isTablet;
}

/**
 * Hook to check if screen is desktop (>= lg)
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= BREAKPOINTS.lg);
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  return isDesktop;
}

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0
    );
  }, []);
  
  return isTouch;
}

/**
 * Hook to detect device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  return orientation;
}

/**
 * Hook to get window dimensions
 */
export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

// ============================================================================
// Responsive Layout Helpers
// ============================================================================

/**
 * Get optimal panel layout based on screen size
 */
export function getResponsiveLayout(
  breakpoint: Breakpoint | 'xs'
): {
  sidebarWidth: number;
  showSidebar: boolean;
  viewerHeight: string;
  splitView: boolean;
} {
  switch (breakpoint) {
    case 'xs':
    case 'sm':
      return {
        sidebarWidth: 0,
        showSidebar: false,
        viewerHeight: 'calc(100vh - 120px)',
        splitView: false
      };
    case 'md':
      return {
        sidebarWidth: 280,
        showSidebar: true,
        viewerHeight: 'calc(100vh - 57px)',
        splitView: false
      };
    case 'lg':
    case 'xl':
    case '2xl':
    default:
      return {
        sidebarWidth: 320,
        showSidebar: true,
        viewerHeight: 'calc(100vh - 57px)',
        splitView: true
      };
  }
}

/**
 * Get optimal 3D viewer settings based on device
 */
export function getViewerSettings(
  isMobile: boolean,
  isTouch: boolean
): {
  enableDamping: boolean;
  dampingFactor: number;
  minDistance: number;
  maxDistance: number;
  rotateSpeed: number;
  zoomSpeed: number;
  pixelRatio: number;
} {
  if (isMobile) {
    return {
      enableDamping: true,
      dampingFactor: 0.1,
      minDistance: 15,
      maxDistance: 150,
      rotateSpeed: 0.5,
      zoomSpeed: 0.8,
      pixelRatio: Math.min(window.devicePixelRatio, 2) // Limit for performance
    };
  }
  
  return {
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 10,
    maxDistance: 200,
    rotateSpeed: 1.0,
    zoomSpeed: 1.0,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
  };
}
