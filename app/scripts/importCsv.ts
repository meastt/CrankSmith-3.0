import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

interface CsvComponent {
  id: string;
  type: 'crankset' | 'cassette' | 'rear_derailleur' | 'chain';
  manufacturer: string;
  model: string;
  year: number;
  weight: number;
  bikeType: 'road' | 'mtb' | 'gravel' | 'hybrid';
  msrp: number;
  // Crankset specific
  chainrings?: string; // "50,34"
  chainLine?: number;
  crankLength?: string; // "165,170,175"
  bcdMajor?: number;
  bcdMinor?: number;
  bottomBracket?: string; // "BSA,BB86"
  // Cassette specific
  speeds?: number;
  cogRange?: string; // "11,32"
  cogs?: string; // "11,12,13,14,16,18,20,22,25,28,32"
  freehubType?: string;
  // Rear derailleur specific
  maxCogSize?: number;
  totalCapacity?: number;
  cageLengthSize?: string;
  cageLength?: string;
  cablePull?: number;
  brand?: string;
  // Chain specific
  width?: number;
  links?: number;
}

async function importFromCsv(csvFilePath: string) {
  console.log(`Importing from ${csvFilePath}...`);
  
  // Read and parse CSV
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  }) as CsvComponent[];

  // Get or create manufacturers
  const manufacturers = Array.from(new Set(records.map(r => r.manufacturer)));
  const { data: mfgData, error: mfgError } = await supabaseAdmin
    .from('manufacturers')
    .upsert(manufacturers.map(name => ({ name })), { onConflict: 'name' })
    .select();

  if (mfgError) {
    console.error('Error seeding manufacturers:', mfgError);
    return;
  }

  const manufacturerMap = new Map(mfgData.map(m => [m.name, m.id]));

  // Process each record
  for (const record of records) {
    const manufacturerId = manufacturerMap.get(record.manufacturer);
    if (!manufacturerId) {
      console.warn(`Could not find manufacturer ID for ${record.manufacturer}`);
      continue;
    }

    // Insert main component
    const { error: componentError } = await supabaseAdmin.from('components').upsert({
      id: record.id,
      component_type: record.type,
      manufacturer_id: manufacturerId,
      model_name: record.model,
      year: record.year,
      weight_grams: record.weight,
      bike_type: record.bikeType,
      msrp_usd: record.msrp
    });

    if (componentError) {
      console.error(`Error inserting component ${record.id}:`, componentError.message);
      continue;
    }

    // Insert details based on type
    let detailsError;
    switch (record.type) {
      case 'crankset':
        ({ error: detailsError } = await supabaseAdmin.from('details_crankset').upsert({
          component_id: record.id,
          chainrings: record.chainrings?.split(',').map(Number) || [],
          chainline_mm: record.chainLine || 0,
          available_lengths_mm: record.crankLength?.split(',').map(Number) || [],
          bcd_major: record.bcdMajor,
          bcd_minor: record.bcdMinor,
          bottom_bracket_standards: record.bottomBracket?.split(',') || []
        }));
        break;

      case 'cassette':
        ({ error: detailsError } = await supabaseAdmin.from('details_cassette').upsert({
          component_id: record.id,
          speeds: record.speeds || 0,
          cog_range: record.cogRange?.split(',').map(Number) as [number, number] || [0, 0],
          cogs: record.cogs?.split(',').map(Number) || [],
          freehub_type: record.freehubType || 'shimano-11'
        }));
        break;

      case 'rear_derailleur':
        ({ error: detailsError } = await supabaseAdmin.from('details_rear_derailleur').upsert({
          component_id: record.id,
          speeds: record.speeds || 0,
          max_cog_size: record.maxCogSize || 0,
          total_capacity: record.totalCapacity || 0,
          cage_length_size: record.cageLengthSize || 'medium',
          cage_length: record.cageLength || 'GS',
          cable_pull: record.cablePull || 0,
          brand: record.brand || 'shimano',
          is_wireless: record.cablePull === 0
        }));
        break;

      case 'chain':
        ({ error: detailsError } = await supabaseAdmin.from('details_chain').upsert({
          component_id: record.id,
          speeds: record.speeds || 0,
          width_mm: record.width || 0,
          links: record.links || 0,
          brand: record.brand || 'shimano'
        }));
        break;
    }

    if (detailsError) {
      console.error(`Error inserting details for ${record.id}:`, detailsError.message);
    } else {
      console.log(`Successfully imported ${record.id}`);
    }
  }

  console.log(`Import complete! Processed ${records.length} components.`);
}

// Usage examples
async function main() {
  const csvDir = path.join(__dirname, '../data/csv');
  
  // Import different component types
  const files = [
    'cranksets.csv',
    'cassettes.csv', 
    'rear_derailleurs.csv',
    'chains.csv'
  ];

  for (const file of files) {
    const filePath = path.join(csvDir, file);
    if (fs.existsSync(filePath)) {
      await importFromCsv(filePath);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
} 