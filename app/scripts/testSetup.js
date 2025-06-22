// app/scripts/testSetup.js - JavaScript test script
const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🧪 Testing database setup...\n');

  try {
    // Test 1: Check manufacturers
    console.log('1. Testing manufacturers...');
    const { data: manufacturers, error: mfgError } = await supabase
      .from('manufacturers')
      .select('*');

    if (mfgError) {
      console.error('❌ Manufacturers error:', mfgError.message);
      return false;
    }
    console.log(`✅ Found ${manufacturers?.length || 0} manufacturers`);
    manufacturers?.forEach(m => console.log(`   - ${m.name}`));

    // Test 2: Check components with manufacturer join
    console.log('\n2. Testing components with manufacturer lookup...');
    const { data: components, error: compError } = await supabase
      .from('components')
      .select(`
        *,
        manufacturers (name),
        details_cassette (*),
        details_crankset (*),
        details_rear_derailleur (*),
        details_chain (*)
      `)
      .limit(5);

    if (compError) {
      console.error('❌ Components error:', compError.message);
      return false;
    }

    console.log(`✅ Found ${components?.length || 0} components (showing first 5):`);
    components?.forEach(c => {
      console.log(`   - ${c.manufacturers?.name || 'Unknown'} ${c.model_name} (${c.component_type})`);
    });

    // Test 3: Check specific component types
    console.log('\n3. Testing specific component queries...');
    
    const testQueries = [
      { type: 'cassette', table: 'details_cassette' },
      { type: 'crankset', table: 'details_crankset' },
      { type: 'rear_derailleur', table: 'details_rear_derailleur' },
      { type: 'chain', table: 'details_chain' }
    ];

    for (const query of testQueries) {
      const { data, error } = await supabase
        .from('components')
        .select(`*, manufacturers(name), ${query.table}(*)`)
        .eq('component_type', query.type)
        .limit(1);

      if (error) {
        console.error(`❌ ${query.type} query error:`, error.message);
        return false;
      }

      if (data && data.length > 0) {
        console.log(`✅ ${query.type}: ${data[0].manufacturers?.name || 'Unknown'} ${data[0].model_name}`);
      } else {
        console.log(`⚠️  No ${query.type} components found`);
      }
    }

    // Test 4: Test a complete drivetrain query (what the app will do)
    console.log('\n4. Testing complete drivetrain compatibility...');
    
    const mtbComponents = await supabase
      .from('components')
      .select(`
        *,
        manufacturers(name),
        details_cassette(*),
        details_crankset(*),
        details_rear_derailleur(*),
        details_chain(*)
      `)
      .eq('bike_type', 'mtb');

    if (mtbComponents.error) {
      console.error('❌ MTB components error:', mtbComponents.error.message);
      return false;
    }

    const cassettes = mtbComponents.data?.filter(c => c.component_type === 'cassette') || [];
    const cranksets = mtbComponents.data?.filter(c => c.component_type === 'crankset') || [];
    const derailleurs = mtbComponents.data?.filter(c => c.component_type === 'rear_derailleur') || [];
    const chains = mtbComponents.data?.filter(c => c.component_type === 'chain') || [];

    console.log(`✅ MTB Components available:`);
    console.log(`   - Cassettes: ${cassettes.length}`);
    console.log(`   - Cranksets: ${cranksets.length}`);
    console.log(`   - Derailleurs: ${derailleurs.length}`);
    console.log(`   - Chains: ${chains.length}`);

    // Test 5: Verify we have at least one complete drivetrain
    if (cassettes.length && cranksets.length && derailleurs.length && chains.length) {
      console.log('\n✅ Complete drivetrain available! App should work.');
      
      // Show one complete example
      console.log('\n📋 Example complete drivetrain:');
      console.log(`   Crankset: ${cranksets[0].manufacturers?.name || 'Unknown'} ${cranksets[0].model_name}`);
      console.log(`   Cassette: ${cassettes[0].manufacturers?.name || 'Unknown'} ${cassettes[0].model_name}`);
      console.log(`   Derailleur: ${derailleurs[0].manufacturers?.name || 'Unknown'} ${derailleurs[0].model_name}`);
      console.log(`   Chain: ${chains[0].manufacturers?.name || 'Unknown'} ${chains[0].model_name}`);
      
      return true;
    } else {
      console.log('\n❌ Incomplete drivetrain - missing component types');
      return false;
    }

  } catch (error) {
    console.error('💥 Test execution error:', error);
    return false;
  }
}

// Run the test
testDatabase()
  .then((success) => {
    if (success) {
      console.log('\n🎉 All tests passed! Your database is ready.');
      console.log('\n🚀 Next steps:');
      console.log('   1. Run: npm run dev');
      console.log('   2. Visit: http://localhost:3000/build');
      console.log('   3. Build a drivetrain!');
    } else {
      console.log('\n💥 Tests failed. Check the errors above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });