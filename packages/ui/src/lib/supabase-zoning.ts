/**
 * ZoneWise.AI Supabase Zoning Integration
 * 
 * Functions for fetching zoning data from Supabase.
 * Connects to the zoning_districts and jurisdictions tables.
 * 
 * @module supabase-zoning
 * @version 1.0.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ZoningDIMS } from './envelope-generator';

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNTk5MjYsImV4cCI6MjA0NzYzNTkyNn0.qfTs54n5IxFbLTFKNdP5rqnO3v5JT8XF6M_bFQcaqTY';

// ============================================================================
// Types
// ============================================================================

export interface ZoningDistrictRow {
  id: string;
  jurisdiction_id: string;
  district_code: string;
  district_name: string;
  min_lot_sqft: number | null;
  min_lot_width_ft: number | null;
  max_height_ft: number | null;
  max_far: number | null;
  front_setback_ft: number | null;
  side_setback_ft: number | null;
  rear_setback_ft: number | null;
  source_url: string | null;
  verified_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface JurisdictionRow {
  id: string;
  name: string;
  state: string;
  county: string;
  type: string;
  source_url: string | null;
  created_at: string;
}

export interface ZoningSearchParams {
  jurisdiction?: string;
  district_code?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Client
// ============================================================================

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// ============================================================================
// Zoning Districts
// ============================================================================

/**
 * Convert database row to ZoningDIMS interface
 */
function rowToZoningDIMS(row: ZoningDistrictRow, jurisdictionName?: string): ZoningDIMS {
  return {
    district_code: row.district_code,
    district_name: row.district_name,
    min_lot_sqft: row.min_lot_sqft ?? 0,
    min_lot_width_ft: row.min_lot_width_ft ?? 0,
    max_height_ft: row.max_height_ft ?? 35,
    max_far: row.max_far ?? 0.25,
    setbacks_ft: {
      front: row.front_setback_ft ?? 25,
      side: row.side_setback_ft ?? 10,
      rear: row.rear_setback_ft ?? 20
    },
    source_url: row.source_url ?? undefined,
    verified_date: row.verified_date ?? undefined,
    jurisdiction: jurisdictionName
  };
}

/**
 * Fetch all zoning districts for a jurisdiction
 */
export async function fetchZoningDistricts(
  jurisdictionId: string
): Promise<ZoningDIMS[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('zoning_districts')
    .select('*, jurisdictions(name)')
    .eq('jurisdiction_id', jurisdictionId)
    .order('district_code');
  
  if (error) {
    console.error('Error fetching zoning districts:', error);
    throw new Error(`Failed to fetch zoning districts: ${error.message}`);
  }
  
  return (data || []).map(row => 
    rowToZoningDIMS(row, (row as any).jurisdictions?.name)
  );
}

/**
 * Fetch a single zoning district by code
 */
export async function fetchZoningDistrictByCode(
  jurisdictionId: string,
  districtCode: string
): Promise<ZoningDIMS | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('zoning_districts')
    .select('*, jurisdictions(name)')
    .eq('jurisdiction_id', jurisdictionId)
    .eq('district_code', districtCode)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching zoning district:', error);
    throw new Error(`Failed to fetch zoning district: ${error.message}`);
  }
  
  return rowToZoningDIMS(data, (data as any).jurisdictions?.name);
}

/**
 * Search zoning districts
 */
export async function searchZoningDistricts(
  params: ZoningSearchParams
): Promise<ZoningDIMS[]> {
  const client = getSupabaseClient();
  
  let query = client
    .from('zoning_districts')
    .select('*, jurisdictions(name, county, state)');
  
  if (params.jurisdiction) {
    query = query.eq('jurisdiction_id', params.jurisdiction);
  }
  
  if (params.district_code) {
    query = query.ilike('district_code', `%${params.district_code}%`);
  }
  
  if (params.search) {
    query = query.or(
      `district_code.ilike.%${params.search}%,district_name.ilike.%${params.search}%`
    );
  }
  
  if (params.limit) {
    query = query.limit(params.limit);
  }
  
  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
  }
  
  const { data, error } = await query.order('district_code');
  
  if (error) {
    console.error('Error searching zoning districts:', error);
    throw new Error(`Failed to search zoning districts: ${error.message}`);
  }
  
  return (data || []).map(row => 
    rowToZoningDIMS(row, (row as any).jurisdictions?.name)
  );
}

// ============================================================================
// Jurisdictions
// ============================================================================

/**
 * Fetch all jurisdictions
 */
export async function fetchJurisdictions(): Promise<JurisdictionRow[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('jurisdictions')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching jurisdictions:', error);
    throw new Error(`Failed to fetch jurisdictions: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Fetch jurisdictions by county
 */
export async function fetchJurisdictionsByCounty(
  county: string,
  state: string = 'FL'
): Promise<JurisdictionRow[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('jurisdictions')
    .select('*')
    .eq('county', county)
    .eq('state', state)
    .order('name');
  
  if (error) {
    console.error('Error fetching jurisdictions by county:', error);
    throw new Error(`Failed to fetch jurisdictions: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get jurisdiction by name
 */
export async function fetchJurisdictionByName(
  name: string
): Promise<JurisdictionRow | null> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('jurisdictions')
    .select('*')
    .ilike('name', name)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching jurisdiction:', error);
    throw new Error(`Failed to fetch jurisdiction: ${error.message}`);
  }
  
  return data;
}

// ============================================================================
// Hooks (for React components)
// ============================================================================

/**
 * React hook state type for async data
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Helper to create initial async state
 */
export function createInitialAsyncState<T>(): AsyncState<T> {
  return {
    data: null,
    loading: false,
    error: null
  };
}
