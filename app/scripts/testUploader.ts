import { uploadCassettesFromSpreadsheet } from './smartUploader';

// Your provided cassette data
const testCassettes = [
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

async function testUpload() {
  console.log('🧪 Testing Smart Uploader with your cassette data...\n');
  
  try {
    const results = await uploadCassettesFromSpreadsheet(testCassettes);
    
    console.log('\n🎯 Test Results:');
    console.log(`✅ Successfully processed: ${results.successful}/${results.total}`);
    
    if (results.failed > 0) {
      console.log(`❌ Failed: ${results.failed}`);
      console.log('\n📋 Error Details:');
      results.errors.forEach(({ id, errors }) => {
        console.log(`  ${id}: ${errors.join(', ')}`);
      });
    } else {
      console.log('🎉 All cassettes uploaded successfully!');
    }
    
    return results.failed === 0;
  } catch (error) {
    console.error('💥 Test failed with error:', error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testUpload()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
} 