/**
 * Zoning data types matching Supabase schema
 */

export interface ZoningDimensions {
  min_lot_sqft?: number;
  min_lot_width_ft?: number;
  max_height_ft?: number;
  setbacks_ft?: {
    front: number;
    side: number;
    rear: number;
  };
  density_du_acre?: number;
  source?: string;
  verified_date?: string;
  source_url?: string;
}

export interface ZoningDistrict {
  id: number;
  jurisdiction_id: number;
  code: string;
  name: string;
  category: string | null;
  description: string | null;
  ordinance_section: string | null;
  effective_date: string | null;
  created_at: string;
  dimensions?: ZoningDimensions;
}

export interface Jurisdiction {
  id: number;
  name: string;
  county: string;
  state: string;
  population: number;
  data_completeness: number;
  data_source: string;
  last_updated: string;
  active: boolean;
  created_at: string;
}

export interface Property {
  address: string;
  latitude: number;
  longitude: number;
  jurisdiction: Jurisdiction;
  zoning: ZoningDistrict;
  lotWidth: number;
  lotDepth: number;
}
