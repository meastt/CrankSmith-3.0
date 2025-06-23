// scripts/populateTrustedComponents.ts
// Populate database with mechanic-trusted components

import { createClient } from '@supabase/supabase-js';
import { MECHANIC_TRUSTED_COMPONENTS, getComponentSummary } from '../app/data/mechanicTrustedComponents';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureManufacturer(manufacturerName: string): Promise<string> {
  // Check if manufacturer exists
  const { data: existing } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('name', manufacturerName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create manufacturer
  const manufacturerId = manufacturerName.toLowerCase().replace(/\s+/g, '-');
  const { error } = await supabase
    .from('manufacturers')
    .insert({
      id: manufacturerId,
      name: manufacturerName,
      website: `https://www.${manufacturerName.toLowerCase()}.com`,
      country: manufacturerName === 'Shimano' ? 'Japan' : 'USA'
    });

  if (error) {
    console.error(`❌ Error creating manufacturer ${manufacturerName}:`, error.message);
    throw error;
  }

  console.log(`✅ Created manufacturer: ${manufacturerName}`);
  return manufacturerId;
}

async function populateComponents() {
  try {
    console.log('🚀 Starting trusted component population...\n');
    
    // Show summary
    const summary = getComponentSummary();
    console.log('📊 Component Summary:');
    console.log(`   Total: ${summary.total} components`);
    console.log('   By type:', summary.by_type);
    console.log('   By bike type:', summary.by_bike_type);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (const component of MECHANIC_TRUSTED_COMPONENTS) {
      try {
        console.log(`⚙️  Processing: ${component.manufacturer_name} ${component.model_name}`);

        // Ensure manufacturer exists
        const manufacturerId = await ensureManufacturer(component.manufacturer_name);

        // Insert component
        const { error: componentError } = await supabase
          .from('components')
          .upsert({
            id: component.id,
            component_type: component.component_type,
            manufacturer_id: manufacturerId,
            model_name: component.model_name,
            year: component.year,
            weight_grams: component.weight_grams,
            bike_type: component.bike_type,
            msrp_usd: component.msrp_usd
          });

        if (componentError) {
          console.error(`❌ Component error:`, componentError.message);
          errorCount++;
          continue;
        }

        // Insert component-specific details
        let detailsError = null;

        switch (component.component_type) {
          case 'crankset':
            const { error: cranksetError } = await supabase
              .from('details_crankset')
              .upsert({
                component_id: component.id,
                chainrings: component.details.chainrings,
                chainline_mm: component.details.chainline_mm,
                available_lengths_mm: component.details.available_lengths_mm,
                bcd_major: component.details.bcd_major,
                bcd_minor: component.details.bcd_minor,
                bottom_bracket_standards: component.details.bottom_bracket_standards
              });
            detailsError = cranksetError;
            break;

          case 'cassette':
            const { error: cassetteError } = await supabase
              .from('details_cassette')
              .upsert({
                component_id: component.id,
                speeds: component.details.speeds,
                cog_range: component.details.cog_range,
                cogs: component.details.cogs,
                freehub_type: component.details.freehub_type
              });
            detailsError = cassetteError;
            break;

          case 'chain':
            const { error: chainError } = await supabase
              .from('details_chain')
              .upsert({
                component_id: component.id,
                speeds: component.details.speeds,
                width_mm: component.details.width_mm,
                links: component.details.links,
                brand: component.details.brand
              });
            detailsError = chainError;
            break;

          case 'rear_derailleur':
            const { error: derailleurError } = await supabase
              .from('details_rear_derailleur')
              .upsert({
                component_id: component.id,
                speeds: component.details.speeds,
                max_cog_size: component.details.max_cog_size,
                capacity_teeth: component.details.capacity_teeth,
                actuation_type: component.details.actuation_type,
                cage_length: component.details.cage_length,
                brand: component.details.brand
              });
            detailsError = derailleurError;
            break;
        }

        if (detailsError) {
          console.error(`❌ Details error:`, detailsError.message);
          errorCount++;
        } else {
          console.log(`✅ Success: ${component.id}`);
          successCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing ${component.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 Population complete!');
    console.log(`✅ Success: ${successCount} components`);
    console.log(`❌ Errors: ${errorCount} components`);

    if (successCount > 0) {
      console.log('\n🚀 Your app now has real component data!');
      console.log('Next steps:');
      console.log('  1. Run: npm run dev');
      console.log('  2. Visit: /quick-check or /build');
      console.log('  3. Test with real components!');
    }

  } catch (error) {
    console.error('💥 Population failed:', error);
    throw error;
  }
}

// Verification function
async function verifyPopulation() {
  console.log('\n🔍 Verifying database...');
  
  const { data: components, error } = await supabase
    .from('components')
    .select('*');

  if (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }

  console.log(`✅ Found ${components?.length || 0} total components in database`);
  
  // Check by type
  const byType = (components || []).reduce((acc, comp) => {
    acc[comp.component_type] = (acc[comp.component_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('   By type:', byType);
  
  // Check for complete drivetrains
  const hasCompleteRoad = byType.crankset >= 1 && byType.cassette >= 1 && byType.chain >= 1 && byType.rear_derailleur >= 1;
  const hasCompleteMTB = byType.crankset >= 1 && byType.cassette >= 1 && byType.chain >= 1 && byType.rear_derailleur >= 1;
  
  console.log(`✅ Complete drivetrains available: ${hasCompleteRoad && hasCompleteMTB ? 'Yes' : 'Partial'}`);
  
  return components && components.length > 0;
}

// Run the population
async function main() {
  try {
    await populateComponents();
    await verifyPopulation();
    console.log('\n🎊 All done! Your mechanic-trusted database is ready.');
  } catch (error) {
    console.error('💥 Failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { populateComponents, verifyPopulation };