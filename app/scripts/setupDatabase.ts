// scripts/setupDatabase.ts
// Run this script to set up Prisma and migrate your existing data

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  try {
    // Step 1: Ensure Prisma schema is pushed to database
    console.log('📋 Pushing Prisma schema to database...');
    // You'll need to run: npx prisma db push
    
    // Step 2: Check if we have existing data in Supabase format
    console.log('🔍 Checking for existing data...');
    
    const { data: existingComponents } = await supabase
      .from('components')
      .select('*')
      .limit(1);

    if (existingComponents && existingComponents.length > 0) {
      console.log('📦 Found existing data, starting migration...');
      await migrateExistingData();
    } else {
      console.log('🌱 No existing data found, seeding with sample data...');
      await seedSampleData();
    }

    console.log('✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function migrateExistingData() {
  console.log('🔄 Migrating existing Supabase data to Prisma format...');

  // Migrate manufacturers
  const { data: supabaseManufacturers } = await supabase
    .from('manufacturers')
    .select('*');

  if (supabaseManufacturers) {
    for (const mfg of supabaseManufacturers) {
      await prisma.manufacturer.upsert({
        where: { id: mfg.id },
        update: {
          name: mfg.name,
          country: mfg.country,
          website: mfg.website
        },
        create: {
          id: mfg.id,
          name: mfg.name,
          country: mfg.country,
          website: mfg.website
        }
      });
    }
    console.log(`✅ Migrated ${supabaseManufacturers.length} manufacturers`);
  }

  // Migrate components
  const { data: supabaseComponents } = await supabase
    .from('components')
    .select(`
      *,
      details_crankset(*),
      details_cassette(*),
      details_rear_derailleur(*),
      details_chain(*)
    `);

  if (supabaseComponents) {
    for (const comp of supabaseComponents) {
      // Create main component
      await prisma.component.upsert({
        where: { id: comp.id },
        update: {
          component_type: comp.component_type,
          manufacturer_id: comp.manufacturer_id,
          model_name: comp.model_name,
          year: comp.year,
          weight_grams: comp.weight_grams,
          bike_type: comp.bike_type,
          msrp_usd: comp.msrp_usd
        },
        create: {
          id: comp.id,
          component_type: comp.component_type,
          manufacturer_id: comp.manufacturer_id,
          model_name: comp.model_name,
          year: comp.year,
          weight_grams: comp.weight_grams,
          bike_type: comp.bike_type,
          msrp_usd: comp.msrp_usd
        }
      });

      // Migrate specific details based on component type
      if (comp.component_type === 'crankset' && comp.details_crankset) {
        await prisma.detailsCrankset.upsert({
          where: { component_id: comp.id },
          update: {
            chainrings: comp.details_crankset.chainrings,
            chainline_mm: comp.details_crankset.chainline_mm,
            available_lengths_mm: comp.details_crankset.available_lengths_mm,
            bcd_major: comp.details_crankset.bcd_major,
            bcd_minor: comp.details_crankset.bcd_minor,
            bottom_bracket_standards: comp.details_crankset.bottom_bracket_standards
          },
          create: {
            component_id: comp.id,
            chainrings: comp.details_crankset.chainrings,
            chainline_mm: comp.details_crankset.chainline_mm,
            available_lengths_mm: comp.details_crankset.available_lengths_mm,
            bcd_major: comp.details_crankset.bcd_major,
            bcd_minor: comp.details_crankset.bcd_minor,
            bottom_bracket_standards: comp.details_crankset.bottom_bracket_standards
          }
        });
      }

      if (comp.component_type === 'cassette' && comp.details_cassette) {
        await prisma.detailsCassette.upsert({
          where: { component_id: comp.id },
          update: {
            speeds: comp.details_cassette.speeds,
            cog_range: comp.details_cassette.cog_range,
            cogs: comp.details_cassette.cogs,
            freehub_type: comp.details_cassette.freehub_type
          },
          create: {
            component_id: comp.id,
            speeds: comp.details_cassette.speeds,
            cog_range: comp.details_cassette.cog_range,
            cogs: comp.details_cassette.cogs,
            freehub_type: comp.details_cassette.freehub_type
          }
        });
      }

      if (comp.component_type === 'rear_derailleur' && comp.details_rear_derailleur) {
        await prisma.detailsRearDerailleur.upsert({
          where: { component_id: comp.id },
          update: {
            speeds: comp.details_rear_derailleur.speeds,
            max_cog_size: comp.details_rear_derailleur.max_cog_size,
            total_capacity: comp.details_rear_derailleur.total_capacity,
            cage_length_size: comp.details_rear_derailleur.cage_length_size,
            cage_length: comp.details_rear_derailleur.cage_length,
            cable_pull: comp.details_rear_derailleur.cable_pull,
            brand: comp.details_rear_derailleur.brand,
            is_wireless: comp.details_rear_derailleur.is_wireless
          },
          create: {
            component_id: comp.id,
            speeds: comp.details_rear_derailleur.speeds,
            max_cog_size: comp.details_rear_derailleur.max_cog_size,
            total_capacity: comp.details_rear_derailleur.total_capacity,
            cage_length_size: comp.details_rear_derailleur.cage_length_size,
            cage_length: comp.details_rear_derailleur.cage_length,
            cable_pull: comp.details_rear_derailleur.cable_pull,
            brand: comp.details_rear_derailleur.brand,
            is_wireless: comp.details_rear_derailleur.is_wireless
          }
        });
      }

      if (comp.component_type === 'chain' && comp.details_chain) {
        await prisma.detailsChain.upsert({
          where: { component_id: comp.id },
          update: {
            speeds: comp.details_chain.speeds,
            width_mm: comp.details_chain.width_mm,
            links: comp.details_chain.links,
            brand: comp.details_chain.brand
          },
          create: {
            component_id: comp.id,
            speeds: comp.details_chain.speeds,
            width_mm: comp.details_chain.width_mm,
            links: comp.details_chain.links,
            brand: comp.details_chain.brand
          }
        });
      }
    }
    console.log(`✅ Migrated ${supabaseComponents.length} components`);
  }
}

async function seedSampleData() {
  console.log('🌱 Seeding sample data...');
  
  // Create sample manufacturers
  const shimano = await prisma.manufacturer.upsert({
    where: { name: 'Shimano' },
    update: {},
    create: {
      name: 'Shimano',
      country: 'Japan',
      website: 'https://bike.shimano.com'
    }
  });

  const sram = await prisma.manufacturer.upsert({
    where: { name: 'SRAM' },
    update: {},
    create: {
      name: 'SRAM',
      country: 'USA',
      website: 'https://www.sram.com'
    }
  });

  // Create sample components (using your existing data structure)
  const sampleCassette = await prisma.component.create({
    data: {
      id: 'shimano-105-r7000-11-32',
      component_type: 'cassette',
      manufacturer_id: shimano.id,
      model_name: '105 R7000',
      year: 2018,
      weight_grams: 269,
      bike_type: 'road',
      msrp_usd: 65,
      details_cassette: {
        create: {
          speeds: 11,
          cog_range: [11, 32],
          cogs: [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32],
          freehub_type: 'shimano-11'
        }
      }
    }
  });

  console.log('✅ Sample data seeded');
}

// Run the setup
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}