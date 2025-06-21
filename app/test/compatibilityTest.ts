// app/test/compatibilityTest.ts
import { compatibilityEngine } from '../lib/compatibilityEngine';
import { DrivetrainSetup } from '../types/components';
import { getCranksets, getCassettes, getRearDerailleurs, getChains } from '../data/components';

/**
 * Test the compatibility engine with real component combinations
 */

// Get test components
const cranksets = getCranksets();
const cassettes = getCassettes();
const derailleurs = getRearDerailleurs();
const chains = getChains();

console.log('🔧 Testing CrankSmith 3.0 Compatibility Engine\n');

// Test 1: Compatible Road Setup (Shimano 105)
console.log('TEST 1: Compatible Road Setup (Shimano 105)');
const roadSetup: DrivetrainSetup = {
  bikeType: 'road',
  crankset: cranksets.find(c => c.id === 'shimano-105-r7000-50-34')!,
  cassette: cassettes.find(c => c.id === 'shimano-105-r7000-11-32')!,
  rearDerailleur: derailleurs.find(d => d.id === 'shimano-105-r7000-gs')!,
  chain: chains.find(c => c.id === 'shimano-105-cn-hg601-11')!
};

const roadResult = compatibilityEngine.checkDrivetrainCompatibility(roadSetup);
console.log(`✅ Compatible: ${roadResult.compatible}`);
console.log(`⚠️  Warnings: ${roadResult.warnings.length}`);
roadResult.warnings.forEach(w => console.log(`   ${w.type}: ${w.issue}`));
console.log(`📝 Notes: ${roadResult.notes.length}`);
roadResult.notes.forEach(n => console.log(`   ${n}`));
console.log('');

// Test 2: Incompatible Setup (Speed Mismatch)
console.log('TEST 2: Speed Mismatch (11-speed cassette + 12-speed chain)');
const mismatchSetup: DrivetrainSetup = {
  bikeType: 'road',
  crankset: cranksets.find(c => c.id === 'shimano-105-r7000-50-34')!,
  cassette: cassettes.find(c => c.id === 'shimano-105-r7000-11-32')!, // 11-speed
  rearDerailleur: derailleurs.find(d => d.id === 'shimano-105-r7000-gs')!, // 11-speed
  chain: chains.find(c => c.id === 'sram-force-axs-12')! // 12-speed - MISMATCH
};

const mismatchResult = compatibilityEngine.checkDrivetrainCompatibility(mismatchSetup);
console.log(`❌ Compatible: ${mismatchResult.compatible}`);
console.log(`⚠️  Warnings: ${mismatchResult.warnings.length}`);
mismatchResult.warnings.forEach(w => console.log(`   ${w.type}: ${w.issue}`));
console.log('');

// Test 3: Capacity Issue (Small derailleur + big cassette)
console.log('TEST 3: Derailleur Capacity Issue');
const capacitySetup: DrivetrainSetup = {
  bikeType: 'road',
  crankset: cranksets.find(c => c.id === 'shimano-105-r7000-50-34')!, // 16T difference
  cassette: cassettes.find(c => c.id === 'shimano-xt-m8100-10-51')!, // 41T range - TOO BIG
  rearDerailleur: derailleurs.find(d => d.id === 'shimano-105-r7000-ss')!, // 33T capacity
  chain: chains.find(c => c.id === 'shimano-xt-cn-m8100-12')!
};

const capacityResult = compatibilityEngine.checkDrivetrainCompatibility(capacitySetup);
console.log(`❌ Compatible: ${capacityResult.compatible}`);
console.log(`⚠️  Warnings: ${capacityResult.warnings.length}`);
capacityResult.warnings.forEach(w => console.log(`   ${w.type}: ${w.issue} - ${w.suggestion}`));
console.log('');

// Test 4: MTB Setup (Should be compatible)
console.log('TEST 4: MTB Setup (Shimano XT)');
const mtbSetup: DrivetrainSetup = {
  bikeType: 'mtb',
  crankset: cranksets.find(c => c.id === 'shimano-xt-m8100-32t')!,
  cassette: cassettes.find(c => c.id === 'shimano-xt-m8100-10-51')!,
  rearDerailleur: derailleurs.find(d => d.id === 'shimano-xt-m8100-sgs')!,
  chain: chains.find(c => c.id === 'shimano-xt-cn-m8100-12')!
};

const mtbResult = compatibilityEngine.checkDrivetrainCompatibility(mtbSetup);
console.log(`✅ Compatible: ${mtbResult.compatible}`);
console.log(`⚠️  Warnings: ${mtbResult.warnings.length}`);
mtbResult.warnings.forEach(w => console.log(`   ${w.type}: ${w.issue}`));
console.log(`📝 Notes: ${mtbResult.notes.length}`);
mtbResult.notes.forEach(n => console.log(`   ${n}`));
console.log('');

// Test 5: Mixed Brands
console.log('TEST 5: Mixed Brands (SRAM + Shimano)');
const mixedSetup: DrivetrainSetup = {
  bikeType: 'road',
  crankset: cranksets.find(c => c.id === 'sram-force-axs-48-35')!, // SRAM
  cassette: cassettes.find(c => c.id === 'sram-force-xg-1270-10-33')!, // SRAM
  rearDerailleur: derailleurs.find(d => d.id === 'shimano-105-r7000-gs')!, // Shimano - MIXED
  chain: chains.find(c => c.id === 'sram-force-axs-12')! // SRAM
};

const mixedResult = compatibilityEngine.checkDrivetrainCompatibility(mixedSetup);
console.log(`❌ Compatible: ${mixedResult.compatible}`);
console.log(`⚠️  Warnings: ${mixedResult.warnings.length}`);
mixedResult.warnings.forEach(w => console.log(`   ${w.type}: ${w.issue}`));
console.log('');

// Test 6: Cross-chain analysis
console.log('TEST 6: Cross-chain Analysis');
const crossChainAnalysis = compatibilityEngine.getProblematicGears(roadSetup);
console.log(`Cross-chain gears: ${crossChainAnalysis.crossChain.length}`);
crossChainAnalysis.crossChain.forEach(gear => 
  console.log(`   ${gear.front}T × ${gear.rear}T (${gear.severity})`)
);
console.log(`Gears to avoid: ${crossChainAnalysis.avoid.length}`);
crossChainAnalysis.avoid.forEach(gear => 
  console.log(`   ${gear.front}T × ${gear.rear}T - ${gear.reason}`)
);
console.log('');

// Test 7: Bottom bracket compatibility
console.log('TEST 7: Bottom Bracket Compatibility');
const bbSetup: DrivetrainSetup = {
  ...roadSetup,
  bottomBracket: 'T47' // Not in Shimano 105 compatibility list
};

const bbResult = compatibilityEngine.checkDrivetrainCompatibility(bbSetup);
console.log(`❌ Compatible: ${bbResult.compatible}`);
console.log(`⚠️  Warnings: ${bbResult.warnings.length}`);
bbResult.warnings.forEach(w => console.log(`   ${w.type}: ${w.issue}`));
console.log('');

console.log('🏁 Compatibility Engine Tests Complete!');

// Export for browser testing
if (typeof window !== 'undefined') {
  (window as any).compatibilityTests = {
    roadSetup,
    roadResult,
    mismatchSetup, 
    mismatchResult,
    capacitySetup,
    capacityResult,
    mtbSetup,
    mtbResult,
    mixedSetup,
    mixedResult,
    crossChainAnalysis,
    bbSetup,
    bbResult
  };
  
  console.log('Test results available at window.compatibilityTests');
}