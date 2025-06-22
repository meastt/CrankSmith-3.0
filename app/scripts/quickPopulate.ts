// app/scripts/quickPopulate.js - JavaScript version
const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Your existing cassette data from the upload scripts
const cassettes = [
  {
    id: 'shimano-xt-cs-m8100-12-10-51',
    manufacturer_name: 'Shimano',
    series_name: 'Deore XT M8100',
    model_name: 'CS-M8100-12',
    year: 2018,
    weight_grams: 470,
    bike_type: 'mtb',
    msrp_usd: 165,
    speeds: 12,
    cogs: '10-12-14-16-18-21-24-28-33-39-45-51',
    freehub_standard: 'Shimano Micro Spline'
  },
  {
    id: 'shimano-slx-cs-m7100-12-10-51',
    manufacturer_name: 'Shimano',
    series_name: 'SLX M7100',
    model_name: 'CS-M7100-12',
    year: 2019,
    weight_grams: 534,
    bike_type: 'mtb',
    msrp_usd: 118,
    speeds: 12,
    cogs: '10-12-14-16-18-21-24-28-33-39-45-51',
    freehub_standard: 'Shimano Micro Spline'
  },
  {
    id: 'sram-gx-eagle-xg-1275-12-10-52',
    manufacturer_name: 'SRAM',
    series_name: 'GX Eagle',
    model_name: 'XG-1275',
    year: 2020,
    weight_grams: 455,
    bike_type: 'mtb',
    msrp_usd: 226,
    speeds: 12,
    cogs: '10-12-14-16-18-21-24-28-32-36-42-52',
    freehub_standard: 'SRAM XD'
  },
  {
    id: 'sram-x01-eagle-xg-1295-12-10-52',
    manufacturer_name: 'SRAM',
    series_name: 'X01 Eagle',
    model_name: 'XG-1295',
    year: 2020,
    weight_grams: 372,
    bike_type: 'mtb',
    msrp_usd: 408,
    speeds: 12,
    cogs: '10-12-14-16-18-21-24-28-32-36-42-52',
    freehub_standard: 'SRAM XD'
  }
];

// Your rear derailleur data
const derailleurs = [
  {
    id: 'shimano-xt-rd-m8100-sgs-12',
    manufacturer_name: 'Shimano',
    series_name: 'Deore XT M8100',
    model_name: 'RD-M8100-SGS',
    year: 2018,
    weight_grams: 284,
    bike_type: 'mtb',
    msrp_usd: 125,
    speeds: 12,
    max_cog: 51,
    min_cog: 10,
    cage_length: 'SGS',
    actuation: 'Mechanical'
  },
  {
    id: 'shimano-slx-rd-m7100-sgs-12',
    manufacturer_name: 'Shimano',
    series_name: 'SLX M7100',
    model_name: 'RD-M7100-SGS',
    year: 2019,
    weight_grams: 313,
    bike_type: 'mtb',
    msrp_usd: 90,
    speeds: 12,
    max_cog: 51,
    min_cog: 10,
    cage_length: 'SGS',
    actuation: 'Mechanical'
  },
  {
    id: 'sram-gx-eagle-rd-gx-1-b2-12',
    manufacturer_name: 'SRAM',
    series_name: 'GX Eagle',
    model_name: 'RD-GX-1-B2',
    year: 2020,
    weight_grams: 299,
    bike_type: 'mtb',
    msrp_usd: 132,
    speeds: 12,
    max_cog: 52,
    min_cog: 10,
    cage_length: 'Long',
    actuation: 'Mechanical'
  },
  {
    id: 'sram-x01-eagle-axs-rd-x0-1e-a1-12',
    manufacturer_name: 'SRAM',
    series_name: 'X01 Eagle AXS',
    model_name: 'RD-X0-1E-A1',
    year: 2019,
    weight_grams: 365,
    bike_type: 'mtb',
    msrp_usd: 450,
    speeds: 12,
    max_cog: 52,
    min_cog: 10,
    cage_length: 'Long',
    actuation: 'Electronic'
  }
];

// Add some cranksets and chains for complete drivetrains
const cranksets = [
  {
    id: 'shimano-xt-fc-m8100-32t',
    manufacturer_name: 'Shimano',
    series_name: 'Deore XT M8100',
    model_name: 'FC-M8100-1',
    year: 2018,
    weight_grams: 612,
    bike_type: 'mtb',
    msrp_usd: 160,
    chainrings: [32],
    chainline_mm: 52,
    available_lengths_mm: [165, 170, 175],
    bcd_major: 96,
    bottom_bracket_standards: ['BSA', 'BB92']
  },
  {
    id: 'sram-gx-eagle-fc-gx-1000-32t',
    manufacturer_name: 'SRAM',
    series_name: 'GX Eagle',
    model_name: 'FC-GX-1000-1',
    year: 2020,
    weight_grams: 650,
    bike_type: 'mtb',
    msrp_usd: 120,
    chainrings: [32],
    chainline_mm: 52,
    available_lengths_mm: [165, 170, 175],
    bcd_major: 104,
    bottom_bracket_standards: ['BSA', 'BB92', 'BB30']
  }
];

const chains = [
  {
    id: 'shimano-xt-cn-m8100-12',
    manufacturer_name: 'Shimano',
    series_name: 'XT M8100',
    model_name: 'CN-M8100',
    year: 2018,
    weight_grams: 259,
    bike_type: 'mtb',
    msrp_usd: 35,
    speeds: 12,
    width_mm: 5.25,
    links: 126,
    brand: 'shimano'
  },
  {
    id: 'sram-gx-eagle-cn-gx-12',
    manufacturer_name: 'SRAM',
    series_name: 'GX Eagle',
    model_name: 'CN-GX-12',
    year: 2020,
    weight_grams: 268,
    bike_type: 'mtb',
    msrp_usd: 25,
    speeds: 12,
    width_mm: 5.25,
    links: 126,
    brand: 'sram'
  }
];

// Freehub mapping
const FREEHUB_MAPPING = {
  'Shimano Micro Spline': 'shimano-12',
  'SRAM XD': 'sram-xd'
};

// Cage length mapping
const CAGE_LENGTH_MAPPING = {
  'SGS': 'long',
  'Long': 'long'
};

async function ensureManufacturer(manufacturerName) {
  // Check if manufacturer exists
  const { data: existing } = await supabaseAdmin
    .from('manufacturers')
    .select('id')
    .eq('name', manufacturerName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new manufacturer
  const { data: newManufacturer, error } = await supabaseAdmin
    .from('manufacturers')
    .insert({
      name: manufacturerName,
      country: manufacturerName === 'Shimano' ? 'Japan' : 'USA',
      website: manufacturerName === 'Shimano' ? 'https://bike.shimano.com' : 'https://www.sram.com'
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create manufacturer ${manufacturerName}: ${error.message}`);
  }

  return newManufacturer.id;
}

async function populateComponents() {
  console.log('🚀 Starting database population...\n');

  try {
    // 1. Populate Cassettes
    console.log('📦 Populating cassettes...');
    for (const cassette of cassettes) {
      const manufacturerId = await ensureManufacturer(cassette.manufacturer_name);
      const cogArray = cassette.cogs.split('-').map(Number);
      const cogRange = [Math.min(...cogArray), Math.max(...cogArray)];

      // Insert component
      const { error: componentError } = await supabaseAdmin.from('components').upsert({
        id: cassette.id,
        component_type: 'cassette',
        manufacturer_id: manufacturerId,
        model_name: `${cassette.series_name} ${cassette.model_name}`.trim(),
        year: cassette.year,
        weight_grams: cassette.weight_grams,
        bike_type: cassette.bike_type,
        msrp_usd: cassette.msrp_usd
      });

      if (componentError) {
        console.error(`❌ Error inserting cassette ${cassette.id}:`, componentError.message);
        continue;
      }

      // Insert details
      const { error: detailsError } = await supabaseAdmin.from('details_cassette').upsert({
        component_id: cassette.id,
        speeds: cassette.speeds,
        cog_range: cogRange,
        cogs: cogArray,
        freehub_type: FREEHUB_MAPPING[cassette.freehub_standard]
      });

      if (detailsError) {
        console.error(`❌ Error inserting cassette details ${cassette.id}:`, detailsError.message);
      } else {
        console.log(`✅ Inserted cassette: ${cassette.id}`);
      }
    }

    // 2. Populate Rear Derailleurs
    console.log('\n🔧 Populating rear derailleurs...');
    for (const derailleur of derailleurs) {
      const manufacturerId = await ensureManufacturer(derailleur.manufacturer_name);
      const totalCapacity = derailleur.max_cog - derailleur.min_cog;

      // Insert component
      const { error: componentError } = await supabaseAdmin.from('components').upsert({
        id: derailleur.id,
        component_type: 'rear_derailleur',
        manufacturer_id: manufacturerId,
        model_name: `${derailleur.series_name} ${derailleur.model_name}`.trim(),
        year: derailleur.year,
        weight_grams: derailleur.weight_grams,
        bike_type: derailleur.bike_type,
        msrp_usd: derailleur.msrp_usd
      });

      if (componentError) {
        console.error(`❌ Error inserting derailleur ${derailleur.id}:`, componentError.message);
        continue;
      }

      // Insert details
      const { error: detailsError } = await supabaseAdmin.from('details_rear_derailleur').upsert({
        component_id: derailleur.id,
        speeds: derailleur.speeds,
        max_cog_size: derailleur.max_cog,
        total_capacity: totalCapacity,
        cage_length_size: CAGE_LENGTH_MAPPING[derailleur.cage_length],
        cage_length: derailleur.cage_length,
        cable_pull: derailleur.actuation === 'Mechanical' ? 3.8 : 0,
        brand: derailleur.manufacturer_name.toLowerCase(),
        is_wireless: derailleur.actuation === 'Electronic'
      });

      if (detailsError) {
        console.error(`❌ Error inserting derailleur details ${derailleur.id}:`, detailsError.message);
      } else {
        console.log(`✅ Inserted derailleur: ${derailleur.id}`);
      }
    }

    // 3. Populate Cranksets
    console.log('\n⚙️ Populating cranksets...');
    for (const crankset of cranksets) {
      const manufacturerId = await ensureManufacturer(crankset.manufacturer_name);

      // Insert component
      const { error: componentError } = await supabaseAdmin.from('components').upsert({
        id: crankset.id,
        component_type: 'crankset',
        manufacturer_id: manufacturerId,
        model_name: `${crankset.series_name} ${crankset.model_name}`.trim(),
        year: crankset.year,
        weight_grams: crankset.weight_grams,
        bike_type: crankset.bike_type,
        msrp_usd: crankset.msrp_usd
      });

      if (componentError) {
        console.error(`❌ Error inserting crankset ${crankset.id}:`, componentError.message);
        continue;
      }

      // Insert details
      const { error: detailsError } = await supabaseAdmin.from('details_crankset').upsert({
        component_id: crankset.id,
        chainrings: crankset.chainrings,
        chainline_mm: crankset.chainline_mm,
        available_lengths_mm: crankset.available_lengths_mm,
        bcd_major: crankset.bcd_major,
        bcd_minor: crankset.bcd_major,
        bottom_bracket_standards: crankset.bottom_bracket_standards
      });

      if (detailsError) {
        console.error(`❌ Error inserting crankset details ${crankset.id}:`, detailsError.message);
      } else {
        console.log(`✅ Inserted crankset: ${crankset.id}`);
      }
    }

    // 4. Populate Chains
    console.log('\n🔗 Populating chains...');
    for (const chain of chains) {
      const manufacturerId = await ensureManufacturer(chain.manufacturer_name);

      // Insert component
      const { error: componentError } = await supabaseAdmin.from('components').upsert({
        id: chain.id,
        component_type: 'chain',
        manufacturer_id: manufacturerId,
        model_name: `${chain.series_name} ${chain.model_name}`.trim(),
        year: chain.year,
        weight_grams: chain.weight_grams,
        bike_type: chain.bike_type,
        msrp_usd: chain.msrp_usd
      });

      if (componentError) {
        console.error(`❌ Error inserting chain ${chain.id}:`, componentError.message);
        continue;
      }

      // Insert details
      const { error: detailsError } = await supabaseAdmin.from('details_chain').upsert({
        component_id: chain.id,
        speeds: chain.speeds,
        width_mm: chain.width_mm,
        links: chain.links,
        brand: chain.brand
      });

      if (detailsError) {
        console.error(`❌ Error inserting chain details ${chain.id}:`, detailsError.message);
      } else {
        console.log(`✅ Inserted chain: ${chain.id}`);
      }
    }

    console.log('\n🎉 Database population complete!');
    console.log(`✅ Cassettes: ${cassettes.length}`);
    console.log(`✅ Derailleurs: ${derailleurs.length}`);
    console.log(`✅ Cranksets: ${cranksets.length}`);
    console.log(`✅ Chains: ${chains.length}`);

  } catch (error) {
    console.error('💥 Population failed:', error);
    throw error;
  }
}

// Run the population
populateComponents()
  .then(() => {
    console.log('🎊 All done! Your database is ready.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Population failed:', error);
    process.exit(1);
  });