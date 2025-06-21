import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Cassette } from '../types/components';

// Load environment variables
config({ path: '.env.local' });

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Interface for spreadsheet data
interface SpreadsheetCassette {
  id: string;
  manufacturer_name: string;
  series_name: string;
  model_name: string;
  year: number;
  weight_grams: number;
  bike_type: string;
  msrp_usd: number;
  image_url: string; // Note: This field is not in current DB schema
  speeds: number;
  cogs: string; // "10-12-14-16-18-21-24-28-33-39-45-51"
  freehub_standard: string;
  chain_compatibility: string;
}

// Data validation and transformation
class CassetteDataProcessor {
  private static readonly VALID_BIKE_TYPES = ['mtb', 'road', 'gravel', 'hybrid'];
  private static readonly VALID_MANUFACTURERS = ['Shimano', 'SRAM', 'Campagnolo', 'Microshift'];
  
  // Freehub type mapping
  private static readonly FREEHUB_MAPPING: Record<string, string> = {
    'Shimano Micro Spline': 'shimano-12',
    'Shimano HG': 'shimano-11',
    'SRAM XD': 'sram-xd',
    'SRAM XDR': 'sram-xdr',
    'Campagnolo': 'campagnolo-11'
  };

  static validateCassette(data: SpreadsheetCassette): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation
    if (!data.id || data.id.trim() === '') {
      errors.push('ID is required');
    }

    if (!data.manufacturer_name || !this.VALID_MANUFACTURERS.includes(data.manufacturer_name)) {
      errors.push(`Invalid manufacturer: ${data.manufacturer_name}. Must be one of: ${this.VALID_MANUFACTURERS.join(', ')}`);
    }

    if (!data.model_name || data.model_name.trim() === '') {
      errors.push('Model name is required');
    }

    if (!this.VALID_BIKE_TYPES.includes(data.bike_type)) {
      errors.push(`Invalid bike type: ${data.bike_type}. Must be one of: ${this.VALID_BIKE_TYPES.join(', ')}`);
    }

    if (data.speeds < 7 || data.speeds > 13) {
      errors.push(`Invalid speeds: ${data.speeds}. Must be between 7 and 13`);
    }

    if (data.weight_grams <= 0) {
      errors.push(`Invalid weight: ${data.weight_grams}. Must be positive`);
    }

    if (data.msrp_usd < 0) {
      errors.push(`Invalid MSRP: ${data.msrp_usd}. Must be non-negative`);
    }

    // Cog validation
    const cogArray = this.parseCogs(data.cogs);
    if (cogArray.length === 0) {
      errors.push('Invalid cogs format. Expected format: "10-12-14-16-18-21-24-28-33-39-45-51"');
    } else if (cogArray.length !== data.speeds) {
      errors.push(`Cog count (${cogArray.length}) doesn't match speeds (${data.speeds})`);
    }

    // Freehub validation
    if (!this.FREEHUB_MAPPING[data.freehub_standard]) {
      errors.push(`Unknown freehub standard: ${data.freehub_standard}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static parseCogs(cogString: string): number[] {
    try {
      return cogString.split('-').map(cog => parseInt(cog.trim(), 10)).filter(cog => !isNaN(cog));
    } catch {
      return [];
    }
  }

  static transformToCassette(data: SpreadsheetCassette): Cassette {
    const cogArray = this.parseCogs(data.cogs);
    const cogRange: [number, number] = [Math.min(...cogArray), Math.max(...cogArray)];
    
    return {
      id: data.id,
      type: 'cassette',
      manufacturer: data.manufacturer_name,
      model: `${data.series_name} ${data.model_name}`.trim(),
      year: data.year,
      weight: data.weight_grams,
      bikeType: data.bike_type as 'mtb' | 'road' | 'gravel' | 'hybrid',
      msrp: data.msrp_usd,
      speeds: data.speeds,
      cogRange,
      cogs: cogArray,
      freehubType: this.FREEHUB_MAPPING[data.freehub_standard] as any
    };
  }
}

// Database operations
class CassetteDatabaseManager {
  static async uploadCassette(cassette: Cassette, imageUrl?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, ensure manufacturer exists
      const manufacturerId = await this.ensureManufacturer(cassette.manufacturer);
      if (!manufacturerId) {
        return { success: false, error: `Failed to create/find manufacturer: ${cassette.manufacturer}` };
      }

      // Prepare component data - only include fields that exist in your DB schema
      const componentData: any = {
        id: cassette.id,
        component_type: 'cassette',
        manufacturer_id: manufacturerId,
        model_name: cassette.model,
        year: cassette.year,
        weight_grams: cassette.weight,
        bike_type: cassette.bikeType,
        msrp_usd: cassette.msrp
      };

      // Note: image_url is not in your current database schema
      // If you want to add it later, you can uncomment this line:
      // if (imageUrl) componentData.image_url = imageUrl;

      // Insert main component record
      const { error: componentError } = await supabaseAdmin.from('components').upsert(componentData);

      if (componentError) {
        return { success: false, error: `Component insert error: ${componentError.message}` };
      }

      // Insert cassette-specific details
      const { error: detailsError } = await supabaseAdmin.from('details_cassette').upsert({
        component_id: cassette.id,
        speeds: cassette.speeds,
        cog_range: cassette.cogRange,
        cogs: cassette.cogs,
        freehub_type: cassette.freehubType
      });

      if (detailsError) {
        return { success: false, error: `Details insert error: ${detailsError.message}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: `Unexpected error: ${error}` };
    }
  }

  private static async ensureManufacturer(manufacturerName: string): Promise<string | null> {
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
        country: this.getManufacturerCountry(manufacturerName),
        website: this.getManufacturerWebsite(manufacturerName)
      })
      .select('id')
      .single();

    if (error) {
      console.error(`Error creating manufacturer ${manufacturerName}:`, error);
      return null;
    }

    return newManufacturer.id;
  }

  private static getManufacturerCountry(manufacturer: string): string {
    const countryMap: Record<string, string> = {
      'Shimano': 'Japan',
      'SRAM': 'USA',
      'Campagnolo': 'Italy',
      'Microshift': 'Taiwan'
    };
    return countryMap[manufacturer] || 'Unknown';
  }

  private static getManufacturerWebsite(manufacturer: string): string {
    const websiteMap: Record<string, string> = {
      'Shimano': 'https://bike.shimano.com',
      'SRAM': 'https://www.sram.com',
      'Campagnolo': 'https://www.campagnolo.com',
      'Microshift': 'https://www.microshift.com'
    };
    return websiteMap[manufacturer] || '';
  }
}

// Main upload function
export async function uploadCassettesFromSpreadsheet(cassetteData: SpreadsheetCassette[]): Promise<{
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ id: string; errors: string[] }>;
}> {
  const results = {
    total: cassetteData.length,
    successful: 0,
    failed: 0,
    errors: [] as Array<{ id: string; errors: string[] }>
  };

  console.log(`Starting upload of ${cassetteData.length} cassettes...`);
  console.log('📝 Note: image_url fields will be stored separately (not in current DB schema)');

  for (const data of cassetteData) {
    console.log(`Processing cassette: ${data.id}`);

    // Validate data
    const validation = CassetteDataProcessor.validateCassette(data);
    if (!validation.isValid) {
      results.failed++;
      results.errors.push({ id: data.id, errors: validation.errors });
      console.error(`Validation failed for ${data.id}:`, validation.errors);
      continue;
    }

    // Transform data
    const cassette = CassetteDataProcessor.transformToCassette(data);

    // Upload to database (image_url stored separately for now)
    const uploadResult = await CassetteDatabaseManager.uploadCassette(cassette, data.image_url);
    
    if (uploadResult.success) {
      results.successful++;
      console.log(`✓ Successfully uploaded ${data.id}`);
      if (data.image_url) {
        console.log(`  📸 Image URL available: ${data.image_url}`);
      }
    } else {
      results.failed++;
      results.errors.push({ id: data.id, errors: [uploadResult.error!] });
      console.error(`✗ Failed to upload ${data.id}:`, uploadResult.error);
    }
  }

  console.log('\n=== Upload Summary ===');
  console.log(`Total: ${results.total}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n=== Errors ===');
    results.errors.forEach(({ id, errors }) => {
      console.log(`${id}: ${errors.join(', ')}`);
    });
  }

  return results;
}

// Example usage with your data
const exampleCassettes: SpreadsheetCassette[] = [
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

// Run the upload if this script is executed directly
if (require.main === module) {
  uploadCassettesFromSpreadsheet(exampleCassettes)
    .then(results => {
      console.log('Upload completed!');
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Upload failed:', error);
      process.exit(1);
    });
} 