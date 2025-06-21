// app/types/tires.ts
export interface TireSize {
    diameter: number; // 700, 650, 26, 27.5, 29
    width: number; // 25, 28, 32, etc.
    unit: 'c' | 'mm'; // 700x25c or 26x2.1
  }
  
  export interface RimWidth {
    internal: number; // internal width in mm
    external?: number; // external width in mm
  }
  
  export interface TireMeasurement {
    tireSize: string; // "700x25c", "26x2.1", etc.
    rimWidth: number; // internal rim width in mm
    circumference: number; // measured circumference in mm
    pressure?: number; // tire pressure in PSI when measured
    source: string; // "BRR_2023", "jan_heine", "sheldon_brown"
    notes?: string;
  }
  
  export interface TireDatabase {
    [tireSize: string]: {
      [rimWidth: string]: TireMeasurement;
    };
  }
  
  export interface WheelSetup {
    tireSize: string;
    rimWidth: number;
    pressure?: number;
  }
  
  export interface CircumferenceResult {
    circumference: number;
    source: string;
    confidence: 'measured' | 'interpolated' | 'estimated';
    notes?: string;
  }