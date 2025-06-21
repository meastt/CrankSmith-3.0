// types/components.ts
export interface ComponentBase {
    id: string;
    manufacturer: string;
    model: string;
    year?: number;
    weight?: number; // grams
    bikeType: 'road' | 'mtb' | 'gravel' | 'bmx' | 'hybrid';
    discontinued?: boolean;
    msrp?: number; // USD
  }
  
  export interface Crankset extends ComponentBase {
    type: 'crankset';
    chainrings: number[]; // teeth count [big, small] or [single]
    chainLine: number; // mm from bike centerline
    crankLength: number[]; // available lengths in mm
    bcdMajor?: number; // bolt circle diameter for outer ring
    bcdMinor?: number; // bolt circle diameter for inner ring
    bottomBracket: BottomBracketStandard[];
    maxChainringSize?: number;
    minChainringSize?: number;
  }
  
  export interface Cassette extends ComponentBase {
    type: 'cassette';
    speeds: number;
    cogRange: [number, number]; // [smallest, largest] teeth
    cogs: number[]; // all cog sizes
    freehubType: FreehubType;
    stackHeight?: number; // mm
  }
  
  export interface ChainRing extends ComponentBase {
    type: 'chainring';
    teeth: number;
    bcd: number; // bolt circle diameter
    position: 'outer' | 'inner' | 'middle' | 'single';
    boltCount: number;
    thickness?: number; // mm
  }
  
  export interface RearDerailleur extends ComponentBase {
    type: 'rear_derailleur';
    speeds: number;
    maxCogSize: number; // largest cog it can handle
    totalCapacity: number; // max difference it can handle
    cageLengthSize: 'short' | 'medium' | 'long';
    cageLength: 'SS' | 'GS' | 'SGS' | 'max';
    cablePull: number; // mm per shift click
    brand: 'shimano' | 'sram' | 'campagnolo' | 'microshift' | 'other';
  }
  
  export interface FrontDerailleur extends ComponentBase {
    type: 'front_derailleur';
    speeds: number;
    maxChainringDiff: number; // max difference between chainrings
    clampType: 'braze-on' | 'clamp' | 'direct-mount';
    cablePull: number;
    brand: 'shimano' | 'sram' | 'campagnolo' | 'microshift' | 'other';
  }
  
  export interface Chain extends ComponentBase {
    type: 'chain';
    speeds: number;
    width: number; // internal width in mm
    links: number; // number of links
    brand: 'shimano' | 'sram' | 'campagnolo' | 'kmc' | 'connex' | 'other';
  }
  
  export type Component = Crankset | Cassette | ChainRing | RearDerailleur | FrontDerailleur | Chain;
  
  // Supporting types
  export type BottomBracketStandard = 
    | 'BSA' // 68mm threaded
    | 'ITA' // 70mm threaded  
    | 'BB30' // 70mm press-fit
    | 'PF30' // 70mm press-fit
    | 'BB86' // 86.5mm press-fit
    | 'BB90' // 90mm press-fit
    | 'BB92' // 92mm press-fit
    | 'PF92' // 92mm press-fit
    | 'T47' // 47mm threaded
    | 'BB107' // 107mm press-fit
    | 'Other';
  
  export type FreehubType = 
    | 'shimano-11' // HG 11-speed
    | 'shimano-12' // Micro Spline 12-speed
    | 'sram-xdr' // XDR 12-speed
    | 'sram-xd' // XD 11/12-speed
    | 'campagnolo-11' // Campy 11-speed
    | 'campagnolo-13' // Campy 13-speed (latest)
    | 'standard-8-10'; // Standard 8-10 speed
  
  // Compatibility checking interfaces
  export interface CompatibilityCheck {
    compatible: boolean;
    warnings: CompatibilityWarning[];
    notes: string[];
  }
  
  export interface CompatibilityWarning {
    type: 'critical' | 'warning' | 'info';
    component: string;
    issue: string;
    suggestion?: string;
  }
  
  // Drivetrain setup interface
  export interface DrivetrainSetup {
    id?: string;
    name?: string;
    crankset: Crankset;
    cassette: Cassette;
    chain: Chain;
    rearDerailleur: RearDerailleur;
    frontDerailleur?: FrontDerailleur; // optional for 1x setups
    chainrings?: ChainRing[]; // if using aftermarket rings
    bottomBracket?: BottomBracketStandard;
    bikeType: 'road' | 'mtb' | 'gravel' | 'bmx' | 'hybrid';
  }
  
  // Calculation results
  export interface GearCalculation {
    ratio: number;
    gearInches: number;
    gainRatio: number;
    developmentMeters: number;
    speedAtCadence: {
      rpm60: number;
      rpm80: number;
      rpm90: number;
      rpm100: number;
      rpm120: number;
    };
    chainLine: number;
    crossChainAngle: number;
    efficiency: number; // 0-1 scale
  }
  
  export interface DrivetrainAnalysis {
    setup: DrivetrainSetup;
    compatibility: CompatibilityCheck;
    gears: GearCalculation[];
    totalGears: number;
    uniqueRatios: number;
    gearRange: number; // highest ratio / lowest ratio
    averageStep: number; // average % step between gears
    largestGap: number; // largest % gap between adjacent gears
    recommendedGears: number[]; // indices of recommended gear combinations
    chainLineAnalysis: {
      straightChainGears: number[];
      crossChainGears: number[];
      avoidGears: number[];
    };
  }