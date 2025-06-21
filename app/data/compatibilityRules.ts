// app/data/compatibilityRules.ts
import { FreehubType, BottomBracketStandard } from '../types/components';

/**
 * Mechanical compatibility rules based on publicly available service manuals
 */

// Cable pull ratios from service manuals (mm per shift click)
export const CABLE_PULL_RATIOS = {
  shimano: {
    road_11: 3.4,
    road_12: 3.4,
    mtb_11: 3.8,
    mtb_12: 3.8
  },
  sram: {
    road_11: 3.8,
    road_12: 3.8,
    mtb_11: 3.8,
    mtb_12: 3.8,
    axs: 0 // wireless
  },
  campagnolo: {
    road_11: 3.2,
    road_13: 3.2
  }
} as const;

// Standard chain lines by bike type (mm from bike centerline)
export const STANDARD_CHAIN_LINES = {
  road: 43.5,
  gravel: 46.0,
  mtb: 52.0,
  hybrid: 43.5,
  bmx: 42.0
} as const;

// Chain width specifications by speed count
export const CHAIN_WIDTHS = {
  8: { internal: 7.3, external: 7.8 },
  9: { internal: 6.7, external: 7.3 },
  10: { internal: 5.9, external: 6.5 },
  11: { internal: 5.5, external: 6.2 },
  12: { internal: 5.25, external: 6.0 },
  13: { internal: 5.25, external: 6.0 }
} as const;

// Bottom bracket standards and their specifications
export const BOTTOM_BRACKET_SPECS = {
  BSA: {
    name: 'BSA (English)',
    threading: 'threaded',
    shell_width: 68,
    thread: '1.37" x 24 TPI',
    notes: 'Most common threaded standard'
  },
  ITA: {
    name: 'ITA (Italian)',
    threading: 'threaded', 
    shell_width: 70,
    thread: 'M36 x 24 TPI',
    notes: 'Italian threaded standard'
  },
  BB30: {
    name: 'BB30',
    threading: 'press-fit',
    shell_width: 70,
    bearing_outer: 42,
    notes: 'Press-fit standard by Cannondale'
  },
  PF30: {
    name: 'PF30', 
    threading: 'press-fit',
    shell_width: 70,
    bearing_outer: 46,
    notes: 'Press-fit with cups'
  },
  BB86: {
    name: 'BB86/BB92',
    threading: 'press-fit',
    shell_width: 86.5,
    bearing_outer: 41,
    notes: 'Shimano press-fit standard'
  },
  BB92: {
    name: 'BB92',
    threading: 'press-fit', 
    shell_width: 92,
    bearing_outer: 41,
    notes: 'MTB version of BB86'
  },
  T47: {
    name: 'T47',
    threading: 'threaded',
    shell_width: 68,
    thread: 'M47 x 1.0',
    notes: 'Modern large-thread standard'
  }
} as const;

// Freehub compatibility matrix
export const FREEHUB_COMPATIBILITY = {
  'shimano-11': {
    name: 'Shimano HG 11-speed',
    spline_count: 'HG splines',
    max_speeds: 11,
    compatible_brands: ['Shimano', 'SRAM 11-speed'],
    notes: 'Standard HG freehub body'
  },
  'shimano-12': {
    name: 'Shimano Micro Spline',
    spline_count: 'Micro Spline',
    max_speeds: 12,
    compatible_brands: ['Shimano 12-speed'],
    notes: 'Requires Micro Spline freehub, not compatible with HG'
  },
  'sram-xdr': {
    name: 'SRAM XDR',
    spline_count: 'XD splines',
    max_speeds: 12,
    compatible_brands: ['SRAM XDR'],
    notes: 'XD splines with 1.85mm spacer for road'
  },
  'sram-xd': {
    name: 'SRAM XD',
    spline_count: 'XD splines', 
    max_speeds: 12,
    compatible_brands: ['SRAM XD'],
    notes: 'XD splines, allows 10T smallest cog'
  },
  'campagnolo-11': {
    name: 'Campagnolo 11-speed',
    spline_count: 'Campy splines',
    max_speeds: 11,
    compatible_brands: ['Campagnolo'],
    notes: 'Campagnolo proprietary splines'
  },
  'campagnolo-13': {
    name: 'Campagnolo 13-speed',
    spline_count: 'Campy splines',
    max_speeds: 13,
    compatible_brands: ['Campagnolo'],
    notes: 'Latest Campagnolo 13-speed'
  },
  'standard-8-10': {
    name: 'Standard 8-10 speed',
    spline_count: 'HG splines',
    max_speeds: 10,
    compatible_brands: ['Shimano', 'SRAM 8-10 speed'],
    notes: 'Legacy HG freehub'
  }
} as const;

// Derailleur capacity calculation rules
export const DERAILLEUR_CAPACITY_RULES = {
  calculation: 'front_difference + rear_range',
  front_difference: 'largest_chainring - smallest_chainring',
  rear_range: 'largest_cog - smallest_cog',
  safety_margin: 2, // Recommended extra teeth of capacity
  notes: 'Total capacity must be >= calculated need + safety margin'
} as const;

// Cross-chain angle thresholds (degrees from straight)
export const CROSS_CHAIN_THRESHOLDS = {
  acceptable: 0, // Straight chain line
  moderate: 2.5, // Slight angle, acceptable
  problematic: 5, // Noticeable angle, avoid under load  
  severe: 7.5, // Extreme angle, avoid completely
  notes: 'Based on chain line geometry and efficiency studies'
} as const;

// Brand compatibility matrix for mixed setups
export const BRAND_COMPATIBILITY = {
  shimano: {
    compatible_with: ['shimano'],
    partial_compatibility: {
      'sram': 'Cable pull may differ, check shifter compatibility',
      'campagnolo': 'Not compatible - different cable pull ratios'
    }
  },
  sram: {
    compatible_with: ['sram'],
    partial_compatibility: {
      'shimano': 'Cable pull may differ, check shifter compatibility', 
      'campagnolo': 'Not compatible - different cable pull ratios'
    }
  },
  campagnolo: {
    compatible_with: ['campagnolo'],
    partial_compatibility: {
      'shimano': 'Not compatible - different cable pull ratios',
      'sram': 'Not compatible - different cable pull ratios'
    }
  }
} as const;

// Speed count evolution and compatibility
export const SPEED_EVOLUTION = {
  8: { era: '1990s', status: 'legacy', chain_width: 7.3 },
  9: { era: 'early 2000s', status: 'legacy', chain_width: 6.7 },
  10: { era: '2000s-2010s', status: 'legacy', chain_width: 5.9 },
  11: { era: '2010s-present', status: 'current', chain_width: 5.5 },
  12: { era: '2016-present', status: 'current', chain_width: 5.25 },
  13: { era: '2023-present', status: 'latest', chain_width: 5.25 }
} as const;

// Tire clearance guidelines by bike type
export const TIRE_CLEARANCE_GUIDELINES = {
  road: {
    typical_range: '23-32mm',
    maximum_common: '35mm',
    notes: 'Limited by brake caliper and frame clearance'
  },
  gravel: {
    typical_range: '35-45mm', 
    maximum_common: '50mm',
    notes: 'Designed for wider tires and mixed terrain'
  },
  mtb: {
    typical_range: '2.1-2.6"',
    maximum_common: '3.0"',
    notes: 'Plus and fat bike tires available up to 5"'
  },
  hybrid: {
    typical_range: '32-42mm',
    maximum_common: '45mm', 
    notes: 'Balance of speed and comfort'
  }
} as const;

/**
 * Helper functions for compatibility checking
 */

export function isCompatibleFreehub(cassetteType: FreehubType, wheelFreehub: FreehubType): boolean {
  // Exact match
  if (cassetteType === wheelFreehub) return true;
  
  // XDR is compatible with XD + spacer
  if (cassetteType === 'sram-xd' && wheelFreehub === 'sram-xdr') return true;
  
  // 8-10 speed compatible with 11-speed HG
  if (cassetteType === 'standard-8-10' && wheelFreehub === 'shimano-11') return true;
  
  return false;
}

export function calculateRequiredCapacity(chainrings: number[], cogRange: [number, number]): number {
  const frontDiff = chainrings.length > 1 ? 
    Math.max(...chainrings) - Math.min(...chainrings) : 0;
  const rearRange = cogRange[1] - cogRange[0];
  
  return frontDiff + rearRange;
}

export function isCompatibleCablePull(brand1: string, brand2: string): boolean {
  return brand1 === brand2 || 
         (brand1 === 'shimano' && brand2 === 'sram') ||
         (brand1 === 'sram' && brand2 === 'shimano');
}

export function getChainWidthTolerance(speeds: number): { min: number, max: number } {
  const spec = CHAIN_WIDTHS[speeds as keyof typeof CHAIN_WIDTHS];
  if (!spec) return { min: 5.0, max: 8.0 }; // fallback
  
  return {
    min: spec.internal - 0.2,
    max: spec.internal + 0.2
  };
}