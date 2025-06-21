// data/components.ts
import { Component, Crankset, Cassette, RearDerailleur, Chain } from '../types/components';

// Most common road cranksets
const roadCranksets: Crankset[] = [
  {
    id: 'shimano-105-r7000-50-34',
    type: 'crankset',
    manufacturer: 'Shimano',
    model: '105 R7000',
    year: 2018,
    weight: 736,
    bikeType: 'road',
    chainrings: [50, 34],
    chainLine: 43.5,
    crankLength: [165, 170, 172.5, 175],
    bcdMajor: 110,
    bcdMinor: 110,
    bottomBracket: ['BSA', 'BB86'],
    maxChainringSize: 53,
    minChainringSize: 34,
    msrp: 180
  },
  {
    id: 'shimano-ultegra-r8000-50-34',
    type: 'crankset',
    manufacturer: 'Shimano',
    model: 'Ultegra R8000',
    year: 2017,
    weight: 683,
    bikeType: 'road',
    chainrings: [50, 34],
    chainLine: 43.5,
    crankLength: [165, 170, 172.5, 175],
    bcdMajor: 110,
    bcdMinor: 110,
    bottomBracket: ['BSA', 'BB86'],
    maxChainringSize: 53,
    minChainringSize: 34,
    msrp: 280
  },
  {
    id: 'sram-force-axs-48-35',
    type: 'crankset',
    manufacturer: 'SRAM',
    model: 'Force AXS',
    year: 2019,
    weight: 725,
    bikeType: 'road',
    chainrings: [48, 35],
    chainLine: 43.5,
    crankLength: [165, 170, 172.5, 175],
    bcdMajor: 107,
    bcdMinor: 107,
    bottomBracket: ['BSA', 'BB86', 'BB30'],
    maxChainringSize: 50,
    minChainringSize: 33,
    msrp: 400
  }
];

// Most common MTB cranksets  
const mtbCranksets: Crankset[] = [
  {
    id: 'shimano-xt-m8100-32t',
    type: 'crankset',
    manufacturer: 'Shimano',
    model: 'XT M8100',
    year: 2018,
    weight: 612,
    bikeType: 'mtb',
    chainrings: [32],
    chainLine: 52,
    crankLength: [165, 170, 175],
    bcdMajor: 96,
    bottomBracket: ['BSA', 'BB92'],
    maxChainringSize: 38,
    minChainringSize: 28,
    msrp: 160
  },
  {
    id: 'sram-gx-eagle-32t',
    type: 'crankset',
    manufacturer: 'SRAM',
    model: 'GX Eagle',
    year: 2017,
    weight: 650,
    bikeType: 'mtb',
    chainrings: [32],
    chainLine: 52,
    crankLength: [165, 170, 175],
    bcdMajor: 104,
    bottomBracket: ['BSA', 'BB92', 'BB30'],
    maxChainringSize: 38,
    minChainringSize: 28,
    msrp: 120
  },
  {
    id: 'shimano-slx-m7100-32t',
    type: 'crankset',
    manufacturer: 'Shimano',
    model: 'SLX M7100',
    year: 2019,
    weight: 680,
    bikeType: 'mtb',
    chainrings: [32],
    chainLine: 52,
    crankLength: [165, 170, 175],
    bcdMajor: 96,
    bottomBracket: ['BSA', 'BB92'],
    maxChainringSize: 36,
    minChainringSize: 30,
    msrp: 100
  }
];

// Most common cassettes
const cassettes: Cassette[] = [
  // Road 11-speed
  {
    id: 'shimano-105-r7000-11-32',
    type: 'cassette',
    manufacturer: 'Shimano',
    model: '105 R7000',
    year: 2018,
    weight: 269,
    bikeType: 'road',
    speeds: 11,
    cogRange: [11, 32],
    cogs: [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32],
    freehubType: 'shimano-11',
    msrp: 65
  },
  {
    id: 'sram-force-xg-1270-10-33',
    type: 'cassette',
    manufacturer: 'SRAM',
    model: 'Force XG-1270',
    year: 2019,
    weight: 232,
    bikeType: 'road',
    speeds: 12,
    cogRange: [10, 33],
    cogs: [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 33],
    freehubType: 'sram-xdr',
    msrp: 180
  },
  // MTB 12-speed
  {
    id: 'shimano-xt-m8100-10-51',
    type: 'cassette',
    manufacturer: 'Shimano',
    model: 'XT M8100',
    year: 2018,
    weight: 461,
    bikeType: 'mtb',
    speeds: 12,
    cogRange: [10, 51],
    cogs: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
    freehubType: 'shimano-12',
    msrp: 140
  },
  {
    id: 'sram-gx-eagle-xg-1275-10-52',
    type: 'cassette',
    manufacturer: 'SRAM',
    model: 'GX Eagle XG-1275',
    year: 2017,
    weight: 440,
    bikeType: 'mtb',
    speeds: 12,
    cogRange: [10, 52],
    cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 52],
    freehubType: 'sram-xd',
    msrp: 120
  }
];

// Most common rear derailleurs
const rearDerailleurs: RearDerailleur[] = [
  {
    id: 'shimano-105-r7000-ss',
    type: 'rear_derailleur',
    manufacturer: 'Shimano',
    model: '105 R7000 SS',
    year: 2018,
    weight: 251,
    bikeType: 'road',
    speeds: 11,
    maxCogSize: 30,
    totalCapacity: 33,
    cageLengthSize: 'short',
    cageLength: 'SS',
    cablePull: 3.4,
    brand: 'shimano',
    msrp: 65
  },
  {
    id: 'shimano-105-r7000-gs',
    type: 'rear_derailleur',
    manufacturer: 'Shimano',
    model: '105 R7000 GS',
    year: 2018,
    weight: 265,
    bikeType: 'road',
    speeds: 11,
    maxCogSize: 34,
    totalCapacity: 39,
    cageLengthSize: 'medium',
    cageLength: 'GS',
    cablePull: 3.4,
    brand: 'shimano',
    msrp: 70
  },
  {
    id: 'sram-force-axs',
    type: 'rear_derailleur',
    manufacturer: 'SRAM',
    model: 'Force AXS',
    year: 2019,
    weight: 303,
    bikeType: 'road',
    speeds: 12,
    maxCogSize: 36,
    totalCapacity: 33,
    cageLengthSize: 'medium',
    cageLength: 'GS',
    cablePull: 0, // wireless
    brand: 'sram',
    msrp: 350
  },
  {
    id: 'shimano-xt-m8100-sgs',
    type: 'rear_derailleur',
    manufacturer: 'Shimano',
    model: 'XT M8100 SGS',
    year: 2018,
    weight: 262,
    bikeType: 'mtb',
    speeds: 12,
    maxCogSize: 51,
    totalCapacity: 47,
    cageLengthSize: 'long',
    cageLength: 'SGS',
    cablePull: 3.8,
    brand: 'shimano',
    msrp: 90
  },
  {
    id: 'sram-gx-eagle',
    type: 'rear_derailleur',
    manufacturer: 'SRAM',
    model: 'GX Eagle',
    year: 2017,
    weight: 299,
    bikeType: 'mtb',
    speeds: 12,
    maxCogSize: 52,
    totalCapacity: 42,
    cageLengthSize: 'long',
    cageLength: 'SGS',
    cablePull: 3.8,
    brand: 'sram',
    msrp: 120
  }
];

// Common chains
const chains: Chain[] = [
  {
    id: 'shimano-105-cn-hg601-11',
    type: 'chain',
    manufacturer: 'Shimano',
    model: 'CN-HG601-11',
    year: 2017,
    weight: 257,
    bikeType: 'road',
    speeds: 11,
    width: 5.5,
    links: 118,
    brand: 'shimano',
    msrp: 35
  },
  {
    id: 'sram-force-axs-12',
    type: 'chain',
    manufacturer: 'SRAM',
    model: 'Force AXS',
    year: 2019,
    weight: 254,
    bikeType: 'road',
    speeds: 12,
    width: 5.25,
    links: 114,
    brand: 'sram',
    msrp: 45
  },
  {
    id: 'shimano-xt-cn-m8100-12',
    type: 'chain',
    manufacturer: 'Shimano',
    model: 'CN-M8100',
    year: 2018,
    weight: 259,
    bikeType: 'mtb',
    speeds: 12,
    width: 5.25,
    links: 126,
    brand: 'shimano',
    msrp: 35
  },
  {
    id: 'sram-gx-eagle-12',
    type: 'chain',
    manufacturer: 'SRAM',
    model: 'GX Eagle',
    year: 2017,
    weight: 268,
    bikeType: 'mtb',
    speeds: 12,
    width: 5.25,
    links: 126,
    brand: 'sram',
    msrp: 25
  }
];

// Export all components
export const SEED_COMPONENTS: Component[] = [
  ...roadCranksets,
  ...mtbCranksets,
  ...cassettes,
  ...rearDerailleurs,
  ...chains
];

// Helper functions to get components by type
export const getCranksets = (): Crankset[] => 
  SEED_COMPONENTS.filter(c => c.type === 'crankset') as Crankset[];

export const getCassettes = (): Cassette[] => 
  SEED_COMPONENTS.filter(c => c.type === 'cassette') as Cassette[];

export const getRearDerailleurs = (): RearDerailleur[] => 
  SEED_COMPONENTS.filter(c => c.type === 'rear_derailleur') as RearDerailleur[];

export const getChains = (): Chain[] => 
  SEED_COMPONENTS.filter(c => c.type === 'chain') as Chain[];

// Get components by bike type
export const getComponentsByBikeType = (bikeType: string): Component[] => 
  SEED_COMPONENTS.filter(c => c.bikeType === bikeType);

// Get component by ID
export const getComponentById = (id: string): Component | undefined => 
  SEED_COMPONENTS.find(c => c.id === id);