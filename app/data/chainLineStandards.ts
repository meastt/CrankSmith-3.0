// app/data/chainLineStandards.ts
import { BottomBracketStandard } from '../types/components';

/**
 * Chain line standards and measurements from industry specifications
 */

// Standard chain lines by bike type (mm from bike centerline)
export const STANDARD_CHAIN_LINES = {
  road: 43.5,
  gravel: 46.0,
  mtb: 52.0,
  hybrid: 43.5,
  bmx: 42.0,
  track: 42.0
} as const;

// Bottom bracket shell widths and their impact on chain line
export const BOTTOM_BRACKET_DIMENSIONS = {
  BSA: {
    shellWidth: 68,
    threading: 'threaded',
    thread: '1.37" x 24 TPI',
    chainLineAdjustment: 0, // baseline
    commonUse: 'Road, older MTB'
  },
  ITA: {
    shellWidth: 70,
    threading: 'threaded',
    thread: 'M36 x 24 TPI',
    chainLineAdjustment: +1,
    commonUse: 'Italian road bikes'
  },
  BB30: {
    shellWidth: 70,
    threading: 'press-fit',
    bearingOD: 42,
    chainLineAdjustment: +1,
    commonUse: 'Road, CX, some MTB'
  },
  PF30: {
    shellWidth: 70,
    threading: 'press-fit',
    bearingOD: 46,
    chainLineAdjustment: +1,
    commonUse: 'Road, CX, gravel'
  },
  BB86: {
    shellWidth: 86.5,
    threading: 'press-fit',
    bearingOD: 41,
    chainLineAdjustment: 0, // Same effective spacing as BSA
    commonUse: 'Road, CX, gravel'
  },
  BB90: {
    shellWidth: 90,
    threading: 'press-fit',
    bearingOD: 37,
    chainLineAdjustment: +11,
    commonUse: 'Trek, some Specialized'
  },
  BB92: {
    shellWidth: 92,
    threading: 'press-fit',
    bearingOD: 41,
    chainLineAdjustment: +12,
    commonUse: 'MTB, some road'
  },
  PF92: {
    shellWidth: 92,
    threading: 'press-fit',
    bearingOD: 46,
    chainLineAdjustment: +12,
    commonUse: 'MTB'
  },
  T47: {
    shellWidth: 68,
    threading: 'threaded',
    thread: 'M47 x 1.0',
    chainLineAdjustment: 0,
    commonUse: 'Modern road, gravel'
  },
  BB107: {
    shellWidth: 107,
    threading: 'press-fit',
    bearingOD: 41,
    chainLineAdjustment: +19.5,
    commonUse: 'Cannondale Lefty'
  }
} as const;

// Hub spacing standards and their rear chain lines
export const HUB_SPACING_STANDARDS = {
  120: {
    name: 'Track/Fixed Gear',
    rearChainLine: 42.0,
    commonUse: 'Track bikes, single speed'
  },
  126: {
    name: 'Vintage Road',
    rearChainLine: 43.5,
    commonUse: 'Older road bikes'
  },
  130: {
    name: 'Modern Road',
    rearChainLine: 43.5,
    commonUse: 'Road, CX, gravel'
  },
  135: {
    name: 'MTB Standard',
    rearChainLine: 46.0,
    commonUse: 'Traditional MTB'
  },
  142: {
    name: '142mm Thru-Axle',
    rearChainLine: 46.0,
    commonUse: 'Modern MTB, some road'
  },
  148: {
    name: 'Boost 148',
    rearChainLine: 52.0,
    commonUse: 'Modern MTB'
  },
  150: {
    name: 'DH/Freeride',
    rearChainLine: 52.0,
    commonUse: 'Downhill MTB'
  },
  157: {
    name: 'Super Boost',
    rearChainLine: 56.5,
    commonUse: 'Fat bike, some MTB'
  }
} as const;

// Cassette spacing by speed count (mm between cogs)
export const CASSETTE_SPACING = {
  7: { spacing: 5.0, stackWidth: 30.0 },
  8: { spacing: 4.8, stackWidth: 33.6 },
  9: { spacing: 4.34, stackWidth: 34.7 },
  10: { spacing: 3.95, stackWidth: 35.5 },
  11: { spacing: 3.74, stackWidth: 37.4 },
  12: { spacing: 3.35, stackWidth: 36.8 }, // 12-speed can be narrower due to different stack
  13: { spacing: 3.15, stackWidth: 37.8 }
} as const;

// Chain stay lengths by bike type (affects chain angle calculations)
export const TYPICAL_CHAINSTAY_LENGTHS = {
  road: 410,        // 405-415mm typical
  gravel: 425,      // 420-430mm typical  
  mtb_hardtail: 435, // 430-440mm typical
  mtb_fs: 445,      // 440-450mm typical
  bmx: 365,         // 360-370mm typical
  track: 395,       // 390-400mm typical
  tt: 405          // 400-410mm typical
} as const;

// Cross-chain angle thresholds and their implications
export const CROSS_CHAIN_THRESHOLDS = {
  optimal: {
    maxAngle: 0.5,
    efficiency: 0.98,
    description: 'Perfect chain line',
    color: 'green'
  },
  good: {
    maxAngle: 2.0,
    efficiency: 0.975,
    description: 'Excellent efficiency',
    color: 'lightgreen'
  },
  acceptable: {
    maxAngle: 4.0,
    efficiency: 0.95,
    description: 'Good for general riding',
    color: 'yellow'
  },
  poor: {
    maxAngle: 6.0,
    efficiency: 0.935,
    description: 'Avoid under load',
    color: 'orange'
  },
  avoid: {
    maxAngle: Infinity,
    efficiency: 0.91,
    description: 'Extreme cross-chain',
    color: 'red'
  }
} as const;

// Frame-specific chain line adjustments
export const FRAME_CHAIN_LINE_VARIATIONS = {
  // Some frames have non-standard BB positions
  cannondale_bb30: +2.5,    // BB30 frames often +2.5mm
  specialized_osbb: +1.0,    // OS BB slight adjustment
  trek_bb90: +11.0,         // BB90 frames
  giant_overdrive: +1.5,    // Giant's BB standard
  cervelo_bb86: 0,          // Standard BB86
  factor_bb86: -1.0         // Some brands offset BB position
} as const;

// Common crankset chain line specifications
export const CRANKSET_CHAIN_LINES = {
  // Road cranksets
  shimano_road_standard: 43.5,
  shimano_road_bb30: 46.0,     // +2.5mm for BB30
  sram_road_standard: 43.5,
  sram_road_bb30: 46.0,
  campagnolo_road: 43.5,
  
  // MTB cranksets  
  shimano_mtb_standard: 52.0,
  shimano_mtb_boost: 52.0,     // Boost uses same chain line
  sram_mtb_standard: 52.0,
  sram_mtb_boost: 52.0,
  
  // Gravel specific
  shimano_grx: 46.0,           // GRX uses 46mm chain line
  sram_gravel: 46.0
} as const;

// Efficiency loss calculations
export const CHAIN_EFFICIENCY_MODEL = {
  // Base efficiency for straight chain
  baseEfficiency: 0.98,
  
  // Efficiency loss per degree of chain angle
  lossPerDegree: 0.003,
  
  // Additional losses for extreme angles
  extremeAnglePenalty: {
    threshold: 5.0,    // degrees
    additionalLoss: 0.02
  },
  
  // Chain wear factor (increases loss over time)
  wearFactor: {
    new: 1.0,
    moderate: 1.1,     // 10% more loss
    worn: 1.3          // 30% more loss
  }
} as const;

/**
 * Helper functions for chain line calculations
 */

export function getStandardChainLine(bikeType: keyof typeof STANDARD_CHAIN_LINES): number {
  return STANDARD_CHAIN_LINES[bikeType] || STANDARD_CHAIN_LINES.road;
}

export function getHubSpacingChainLine(spacing: keyof typeof HUB_SPACING_STANDARDS): number {
  return HUB_SPACING_STANDARDS[spacing]?.rearChainLine || 43.5;
}

export function getCassetteSpacing(speeds: keyof typeof CASSETTE_SPACING): number {
  return CASSETTE_SPACING[speeds]?.spacing || 3.74;
}

export function getChainStayLength(bikeType: keyof typeof TYPICAL_CHAINSTAY_LENGTHS): number {
  return TYPICAL_CHAINSTAY_LENGTHS[bikeType] || TYPICAL_CHAINSTAY_LENGTHS.road;
}

export function calculateChainAngle(
  frontChainLine: number,
  rearChainLine: number,
  chainStayLength: number
): number {
  const offset = Math.abs(frontChainLine - rearChainLine);
  return Math.atan(offset / chainStayLength) * (180 / Math.PI);
}

export function getEfficiencyFromAngle(angleDegrees: number): number {
  const { baseEfficiency, lossPerDegree, extremeAnglePenalty } = CHAIN_EFFICIENCY_MODEL;
  
  let efficiency = baseEfficiency - (angleDegrees * lossPerDegree);
  
  // Apply extreme angle penalty
  if (angleDegrees > extremeAnglePenalty.threshold) {
    efficiency -= extremeAnglePenalty.additionalLoss;
  }
  
  return Math.max(0.85, efficiency); // Minimum 85% efficiency
}