// scripts/seed.ts
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { SEED_COMPONENTS } from '../data/components';
import { Crankset, Cassette, RearDerailleur, Chain } from '../types/components';

// Load environment variables from .env.local
config({ path: '.env.local' });

// This automatically loads the variables from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Service Role Key is missing from .env.local');
}

// Create a special "admin" client that can write to the database
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

console.log('Script started. Connecting to Supabase...');

async function seedDatabase() {
  // --- Step 1: Seed Manufacturers ---
  console.log('Seeding manufacturers...');
  const manufacturers = Array.from(new Set(SEED_COMPONENTS.map(c => c.manufacturer)));
  const { data: mfgData, error: mfgError } = await supabaseAdmin
    .from('manufacturers')
    .upsert(manufacturers.map(name => ({ name })), { onConflict: 'name' })
    .select();

  if (mfgError) {
    console.error('Error seeding manufacturers:', mfgError);
    return;
  }
  // Create a quick lookup map of manufacturer name to its new ID
  const manufacturerMap = new Map(mfgData.map(m => [m.name, m.id]));
  console.log('Manufacturers seeded.');

  // --- Step 2: Seed Product Series (if we can) ---
  // We'll keep this simple for now and just use the model name
  // In the future, you could parse '105 R7000' into a series.
  
  // --- Step 3: Seed Components ---
  console.log('Seeding components...');
  for (const component of SEED_COMPONENTS) {
    const manufacturerId = manufacturerMap.get(component.manufacturer);
    if (!manufacturerId) {
      console.warn(`Could not find manufacturer ID for ${component.manufacturer}`);
      continue;
    }

    // Insert into the main 'components' table first
    const { error: componentError } = await supabaseAdmin.from('components').upsert({
      id: component.id,
      component_type: component.type,
      manufacturer_id: manufacturerId,
      model_name: component.model,
      year: component.year,
      weight_grams: component.weight,
      bike_type: component.bikeType,
      msrp_usd: component.msrp
    });

    if (componentError) {
      console.error(`Error inserting component ${component.id}:`, componentError.message);
      continue; // Skip to next component if the main insert fails
    }
    
    // Now, insert into the specific 'details' table based on the component type
    let detailsError;
    switch (component.type) {
      case 'crankset':
        const crank = component as Crankset;
        ({ error: detailsError } = await supabaseAdmin.from('details_crankset').upsert({
          component_id: crank.id,
          chainrings: crank.chainrings,
          chainline_mm: crank.chainLine,
          available_lengths_mm: crank.crankLength,
          bcd_major: crank.bcdMajor,
          bcd_minor: crank.bcdMinor,
          bottom_bracket_standards: crank.bottomBracket
        }));
        break;

      case 'cassette':
        const cassette = component as Cassette;
        ({ error: detailsError } = await supabaseAdmin.from('details_cassette').upsert({
          component_id: cassette.id,
          speeds: cassette.speeds,
          cog_range: cassette.cogRange,
          cogs: cassette.cogs,
          freehub_type: cassette.freehubType
        }));
        break;

      case 'rear_derailleur':
        const rd = component as RearDerailleur;
        ({ error: detailsError } = await supabaseAdmin.from('details_rear_derailleur').upsert({
          component_id: rd.id,
          speeds: rd.speeds,
          max_cog_size: rd.maxCogSize,
          total_capacity: rd.totalCapacity,
          cage_length_size: rd.cageLengthSize,
          cage_length: rd.cageLength,
          cable_pull: rd.cablePull,
          brand: rd.brand,
          is_wireless: rd.cablePull === 0
        }));
        break;

      case 'chain':
        const chain = component as Chain;
        ({ error: detailsError } = await supabaseAdmin.from('details_chain').upsert({
          component_id: chain.id,
          speeds: chain.speeds,
          width_mm: chain.width,
          links: chain.links,
          brand: chain.brand
        }));
        break;
    }
    if (detailsError) {
        console.error(`Error inserting details for ${component.id}:`, detailsError.message);
    } else {
        console.log(`Successfully seeded ${component.id}`);
    }
  }
  console.log('Seeding complete!');
}

seedDatabase();