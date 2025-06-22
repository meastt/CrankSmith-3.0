'use server';

import { createClient } from '@supabase/supabase-js';
import { Crankset, Cassette, RearDerailleur, Chain } from '../types/components';

// Create Supabase client for server actions
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

export async function getCranksets(): Promise<Crankset[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('components')
    .select(`
      *,
      details_crankset (*)
    `)
    .eq('component_type', 'crankset');

  if (error) {
    console.error('Error fetching cranksets:', error);
    return [];
  }

  return data?.map(row => ({
    id: row.id,
    manufacturer: row.manufacturer_id, // You'll need to join with manufacturers table
    model: row.model_name,
    year: row.year,
    weight: row.weight_grams,
    bikeType: row.bike_type,
    discontinued: false,
    msrp: row.msrp_usd,
    type: 'crankset' as const,
    chainrings: row.details_crankset?.chainrings || [],
    chainLine: row.details_crankset?.chainline_mm || 0,
    crankLength: row.details_crankset?.available_lengths_mm || [],
    bcdMajor: row.details_crankset?.bcd_major,
    bcdMinor: row.details_crankset?.bcd_minor,
    bottomBracket: row.details_crankset?.bottom_bracket_standards || []
  })) || [];
}

export async function getCassettes(): Promise<Cassette[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('components')
    .select(`
      *,
      details_cassette (*)
    `)
    .eq('component_type', 'cassette');

  if (error) {
    console.error('Error fetching cassettes:', error);
    return [];
  }

  return data?.map(row => ({
    id: row.id,
    manufacturer: row.manufacturer_id,
    model: row.model_name,
    year: row.year,
    weight: row.weight_grams,
    bikeType: row.bike_type,
    discontinued: false,
    msrp: row.msrp_usd,
    type: 'cassette' as const,
    speeds: row.details_cassette?.speeds || 0,
    cogRange: row.details_cassette?.cog_range || [0, 0],
    cogs: row.details_cassette?.cogs || [],
    freehubType: row.details_cassette?.freehub_type || 'shimano-11'
  })) || [];
}

export async function getRearDerailleurs(): Promise<RearDerailleur[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('components')
    .select(`
      *,
      details_rear_derailleur (*)
    `)
    .eq('component_type', 'rear_derailleur');

  if (error) {
    console.error('Error fetching rear derailleurs:', error);
    return [];
  }

  return data?.map(row => ({
    id: row.id,
    manufacturer: row.manufacturer_id,
    model: row.model_name,
    year: row.year,
    weight: row.weight_grams,
    bikeType: row.bike_type,
    discontinued: false,
    msrp: row.msrp_usd,
    type: 'rear_derailleur' as const,
    speeds: row.details_rear_derailleur?.speeds || 0,
    maxCogSize: row.details_rear_derailleur?.max_cog_size || 0,
    totalCapacity: row.details_rear_derailleur?.total_capacity || 0,
    cageLengthSize: row.details_rear_derailleur?.cage_length_size || 'medium',
    cageLength: row.details_rear_derailleur?.cage_length || 'GS',
    cablePull: row.details_rear_derailleur?.cable_pull || 0,
    brand: row.details_rear_derailleur?.brand || 'shimano'
  })) || [];
}

export async function getChains(): Promise<Chain[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('components')
    .select(`
      *,
      details_chain (*)
    `)
    .eq('component_type', 'chain');

  if (error) {
    console.error('Error fetching chains:', error);
    return [];
  }

  return data?.map(row => ({
    id: row.id,
    manufacturer: row.manufacturer_id,
    model: row.model_name,
    year: row.year,
    weight: row.weight_grams,
    bikeType: row.bike_type,
    discontinued: false,
    msrp: row.msrp_usd,
    type: 'chain' as const,
    speeds: row.details_chain?.speeds || 0,
    width: row.details_chain?.width_mm || 0,
    links: row.details_chain?.links || 0,
    brand: row.details_chain?.brand || 'shimano'
  })) || [];
}