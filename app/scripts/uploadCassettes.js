const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Your cassette data
const cassetteData = [
  {
    id: 'shimano-xt-cs-m8100-12-10-51',
    manufacturer_name: 'Shimano',
    series_name: 'Deore XT M8100',
    model_name: 'CS-M8100-12',
    year: 2018,
    weight_grams: 470,
    bike_type: 'mtb',
    msrp_usd: 165,
    image_url: 'https://bike.shimano.com/content/dam/product-info/images/components/jev/CS-M8100-12_10-51T_C6_750x750.png',
    speeds: 12,
    cogs: '10-12-14-16-18-21-24-28-33-39-45-51',
    freehub_standard: 'Shimano Micro Spline',
    chain_compatibility: 'Shimano Hyperglide+'
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
    image_url: 'https://bike.shimano.com/content/dam/product-info/images/components/jev/CS-M7100-12_10-51T_C6_750x750.png',
    speeds: 12,
    cogs: '10-12-14-16-18-21-24-28-33-39-45-51',
    freehub_standard: 'Shimano Micro Spline',
    chain_compatibility: 'Shimano Hyperglide+'
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
    image_url: 'https://www.sram.com/globalassets/image-libraries/sram/mtb/drivetrain/cassettes/cs-xg-1275-a1/cs-xg-1275-a1-t-bolt-52-d1.jpg',
    speeds: 12,
    cogs: '10-12-14-16-18-21-24-28-32-36-42-52',
    freehub_standard: 'SRAM XD',
    chain_compatibility: 'SRAM Eagle'
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
    image_url: 'https://www.sram.com/globalassets/image-libraries/sram/mtb/drivetrain/cassettes/cs-xg-1295-a1/cs-xg-1295-a1-t-bolt-52-d1.jpg',
    speeds: 12,
    cogs: '10-12-14-16-18-21-24-28-32-36-42-52',
    freehub_standard: 'SRAM XD',
    chain_compatibility: 'SRAM Eagle'
  }
];

// Freehub type mapping
const FREEHUB_MAPPING = {
  'Shimano Micro Spline': 'shimano-12',
  'Shimano HG': 'shimano-11',
  'SRAM XD': 'sram-xd',
  'SRAM XDR': 'sram-xdr',
  'Campagnolo': 'campagnolo-11'
};

// Parse cogs string to array
function parseCogs(cogString) {
  try {
    return cogString.split('-').map(cog => parseInt(cog.trim(), 10)).filter(cog => !isNaN(cog));
  } catch {
    return [];
  }
}

// Validate cassette data
function validateCassette(data) {
  const errors = [];

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

  const cogArray = parseCogs(data.cogs);
  if (cogArray.length === 0) {
    errors.push('Invalid cogs format');
  } else if (cogArray.length !== data.speeds) {
    errors.push(`Cog count (${cogArray.length}) doesn't match speeds (${data.speeds})`);
  }

  if (!FREEHUB_MAPPING[data.freehub_standard]) {
    errors.push(`Unknown freehub standard: ${data.freehub_standard}`);
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

// Upload single cassette
async function uploadCassette(data) {
  try {
    // Validate data
    const validation = validateCassette(data);
    if (!validation.isValid) {
      return { success: false, error: `Validation failed: ${validation.errors.join(', ')}` };
    }

    // Ensure manufacturer exists
    const manufacturerId = await ensureManufacturer(data.manufacturer_name);
    if (!manufacturerId) {
      return { success: false, error: `Failed to create/find manufacturer: ${data.manufacturer_name}` };
    }

    // Parse cogs
    const cogArray = parseCogs(data.cogs);
    const cogRange = [Math.min(...cogArray), Math.max(...cogArray)];

    // Insert main component record
    const { error: componentError } = await supabaseAdmin.from('components').upsert({
      id: data.id,
      component_type: 'cassette',
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

    // Insert cassette-specific details
    const { error: detailsError } = await supabaseAdmin.from('details_cassette').upsert({
      component_id: data.id,
      speeds: data.speeds,
      cog_range: cogRange,
      cogs: cogArray,
      freehub_type: FREEHUB_MAPPING[data.freehub_standard]
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
async function uploadAllCassettes() {
  console.log('🚀 Starting cassette upload...\n');
  
  const results = {
    total: cassetteData.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const data of cassetteData) {
    console.log(`Processing: ${data.id}`);
    
    const result = await uploadCassette(data);
    
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
uploadAllCassettes()
  .then(results => {
    console.log('\n🎉 Upload completed!');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  }); 