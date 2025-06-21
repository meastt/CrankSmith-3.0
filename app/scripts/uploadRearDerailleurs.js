const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Your rear derailleur data - sourced from manufacturer specifications
const derailleurData = [
  {
    id: 'shimano-xt-rd-m8100-sgs-12',
    manufacturer_name: 'Shimano',
    series_name: 'Deore XT M8100',
    model_name: 'RD-M8100-SGS',
    year: 2018,
    weight_grams: 284,
    bike_type: 'mtb',
    msrp_usd: 125,
    image_url: 'https://bike.shimano.com/content/dam/product-info/images/components/jev/RD-M8100-SGS_C6_750x750.png',
    speeds: 12,
    max_cog: 51,
    min_cog: 10,
    clutch_type: 'Shimano Shadow RD+',
    cage_length: 'SGS',
    actuation: 'Mechanical',
    mount_type: 'Standard Hanger'
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
    image_url: 'https://bike.shimano.com/content/dam/product-info/images/components/jev/RD-M7100-SGS_C6_750x750.png',
    speeds: 12,
    max_cog: 51,
    min_cog: 10,
    clutch_type: 'Shimano Shadow RD+',
    cage_length: 'SGS',
    actuation: 'Mechanical',
    mount_type: 'Standard Hanger'
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
    image_url: 'https://www.sram.com/globalassets/image-libraries/sram/mtb/drivetrain/rear-derailleurs/rd-gx-1-b2/rd-gx-1-b2-lunar-d1.jpg',
    speeds: 12,
    max_cog: 52,
    min_cog: 10,
    clutch_type: 'Roller Bearing Clutch',
    cage_length: 'Long',
    actuation: 'Mechanical',
    mount_type: 'Standard Hanger'
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
    image_url: 'https://www.sram.com/globalassets/image-libraries/sram/mtb/drivetrain/rear-derailleurs/rd-x0-1e-a1/rd-x0-1e-a1-black-d1.jpg',
    speeds: 12,
    max_cog: 52,
    min_cog: 10,
    clutch_type: 'Roller Bearing Clutch',
    cage_length: 'Long',
    actuation: 'Electronic',
    mount_type: 'Standard Hanger'
  }
];

// Clutch type mapping for standardization
const CLUTCH_MAPPING = {
  'Shimano Shadow RD+': 'shimano-shadow-rd-plus',
  'Shimano Shadow RD': 'shimano-shadow-rd',
  'SRAM Type 3': 'sram-type-3',
  'SRAM Type 2.1': 'sram-type-2-1',
  'Roller Bearing Clutch': 'sram-roller-bearing',
  'None': 'none'
};

// Cage length mapping
const CAGE_LENGTH_MAPPING = {
  'SS': 'short',
  'GS': 'medium', 
  'SGS': 'long',
  'Short': 'short',
  'Medium': 'medium',
  'Long': 'long'
};

// Actuation mapping
const ACTUATION_MAPPING = {
  'Mechanical': 'mechanical',
  'Electronic': 'electronic',
  'Wireless': 'electronic'
};

// Mount type mapping
const MOUNT_MAPPING = {
  'Standard Hanger': 'standard',
  'SRAM UDH': 'sram-udh',
  'Direct Mount': 'direct-mount'
};

// Parse cog range
function parseCogRange(minCog, maxCog) {
  return [parseInt(minCog), parseInt(maxCog)];
}

// Calculate total capacity (for compatibility checking)
function calculateTotalCapacity(minCog, maxCog) {
  return parseInt(maxCog) - parseInt(minCog);
}

// Validate derailleur data
function validateDerailleur(data) {
  const errors = [];

  // Required field validation
  if (!data.id || data.id.trim() === '') {
    errors.push('ID is required');
  }

  if (!data.manufacturer_name) {
    errors.push('Manufacturer name is required');
  }

  if (!data.model_name || data.model_name.trim() === '') {
    errors.push('Model name is required');
  }

  if (!['mtb', 'road', 'gravel', 'hybrid'].includes(data.bike_type)) {
    errors.push(`Invalid bike type: ${data.bike_type}`);
  }

  if (data.speeds < 7 || data.speeds > 13) {
    errors.push(`Invalid speeds: ${data.speeds}`);
  }

  if (data.weight_grams <= 0) {
    errors.push(`Invalid weight: ${data.weight_grams}`);
  }

  if (data.msrp_usd < 0) {
    errors.push(`Invalid MSRP: ${data.msrp_usd}`);
  }

  // Cog validation
  if (data.max_cog < data.min_cog) {
    errors.push(`Max cog (${data.max_cog}) cannot be less than min cog (${data.min_cog})`);
  }

  if (data.max_cog < 10 || data.max_cog > 55) {
    errors.push(`Max cog (${data.max_cog}) must be between 10 and 55`);
  }

  if (data.min_cog < 9 || data.min_cog > 15) {
    errors.push(`Min cog (${data.min_cog}) must be between 9 and 15`);
  }

  // Cage length validation
  if (!CAGE_LENGTH_MAPPING[data.cage_length]) {
    errors.push(`Unknown cage length: ${data.cage_length}`);
  }

  // Actuation validation
  if (!ACTUATION_MAPPING[data.actuation]) {
    errors.push(`Unknown actuation type: ${data.actuation}`);
  }

  // Mount type validation
  if (!MOUNT_MAPPING[data.mount_type]) {
    errors.push(`Unknown mount type: ${data.mount_type}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Ensure manufacturer exists
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
      country: getManufacturerCountry(manufacturerName),
      website: getManufacturerWebsite(manufacturerName)
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Error creating manufacturer ${manufacturerName}:`, error);
    return null;
  }

  return newManufacturer.id;
}

function getManufacturerCountry(manufacturer) {
  const countryMap = {
    'Shimano': 'Japan',
    'SRAM': 'USA',
    'Campagnolo': 'Italy',
    'Microshift': 'Taiwan'
  };
  return countryMap[manufacturer] || 'Unknown';
}

function getManufacturerWebsite(manufacturer) {
  const websiteMap = {
    'Shimano': 'https://bike.shimano.com',
    'SRAM': 'https://www.sram.com',
    'Campagnolo': 'https://www.campagnolo.com',
    'Microshift': 'https://www.microshift.com'
  };
  return websiteMap[manufacturer] || '';
}

// Upload single derailleur
async function uploadDerailleur(data) {
  try {
    // Validate data
    const validation = validateDerailleur(data);
    if (!validation.isValid) {
      return { success: false, error: `Validation failed: ${validation.errors.join(', ')}` };
    }

    // Ensure manufacturer exists
    const manufacturerId = await ensureManufacturer(data.manufacturer_name);
    if (!manufacturerId) {
      return { success: false, error: `Failed to create/find manufacturer: ${data.manufacturer_name}` };
    }

    // Calculate total capacity
    const totalCapacity = calculateTotalCapacity(data.min_cog, data.max_cog);

    // Insert main component record
    const { error: componentError } = await supabaseAdmin.from('components').upsert({
      id: data.id,
      component_type: 'rear_derailleur',
      manufacturer_id: manufacturerId,
      model_name: `${data.series_name} ${data.model_name}`.trim(),
      year: data.year,
      weight_grams: data.weight_grams,
      bike_type: data.bike_type,
      msrp_usd: data.msrp_usd
    });

    if (componentError) {
      return { success: false, error: `Component insert error: ${componentError.message}` };
    }

    // Insert derailleur-specific details
    const { error: detailsError } = await supabaseAdmin.from('details_rear_derailleur').upsert({
      component_id: data.id,
      speeds: data.speeds,
      max_cog_size: data.max_cog,
      total_capacity: totalCapacity,
      cage_length_size: CAGE_LENGTH_MAPPING[data.cage_length],
      cage_length: data.cage_length,
      cable_pull: data.actuation === 'Mechanical' ? 3.8 : 0, // Default for mechanical
      brand: data.manufacturer_name.toLowerCase(),
      is_wireless: ACTUATION_MAPPING[data.actuation] === 'electronic'
    });

    if (detailsError) {
      return { success: false, error: `Details insert error: ${detailsError.message}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
}

// Main upload function
async function uploadAllDerailleurs() {
  console.log('🚀 Starting rear derailleur upload...\n');
  
  const results = {
    total: derailleurData.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const data of derailleurData) {
    console.log(`Processing: ${data.id}`);
    console.log(`  Model: ${data.manufacturer_name} ${data.series_name} ${data.model_name}`);
    console.log(`  Capacity: ${data.min_cog}T - ${data.max_cog}T (${calculateTotalCapacity(data.min_cog, data.max_cog)}T total)`);
    console.log(`  Cage: ${data.cage_length}, Actuation: ${data.actuation}`);
    
    const result = await uploadDerailleur(data);
    
    if (result.success) {
      results.successful++;
      console.log(`✅ Successfully uploaded ${data.id}`);
      if (data.image_url) {
        console.log(`   📸 Image URL: ${data.image_url}`);
      }
    } else {
      results.failed++;
      results.errors.push({ id: data.id, error: result.error });
      console.log(`❌ Failed to upload ${data.id}: ${result.error}`);
    }
    console.log('');
  }

  console.log('=== Upload Summary ===');
  console.log(`Total: ${results.total}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n=== Errors ===');
    results.errors.forEach(({ id, error }) => {
      console.log(`${id}: ${error}`);
    });
  }

  return results;
}

// Run the upload
uploadAllDerailleurs()
  .then(results => {
    console.log('\n🎉 Upload completed!');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  }); 