// app/lib/tireCalculator.ts
import { 
    TireDatabase, 
    WheelSetup, 
    CircumferenceResult, 
    TireMeasurement 
  } from '../types/tires';
  import { TIRE_DATABASE, COMMON_TIRE_SIZES, COMMON_RIM_WIDTHS } from '../data/tires';
  
  export class TireCalculator {
    private database: TireDatabase = TIRE_DATABASE;
  
    /**
     * Get the circumference for a specific tire/rim combination
     */
    getCircumference(wheelSetup: WheelSetup): CircumferenceResult {
      const { tireSize, rimWidth, pressure } = wheelSetup;
      const rimKey = rimWidth.toString();
  
      // Check for exact match
      if (this.database[tireSize] && this.database[tireSize][rimKey]) {
        const measurement = this.database[tireSize][rimKey];
        let circumference = measurement.circumference;
  
        // Apply pressure adjustment if specified
        if (pressure && measurement.pressure) {
          circumference = this.adjustForPressure(circumference, measurement.pressure, pressure);
        }
  
        return {
          circumference,
          source: measurement.source,
          confidence: 'measured',
          notes: measurement.notes
        };
      }
  
      // Try to interpolate between rim widths
      const interpolated = this.interpolateRimWidth(tireSize, rimWidth);
      if (interpolated) {
        return interpolated;
      }
  
      // Fall back to estimation
      const estimated = this.estimateCircumference(tireSize, rimWidth);
      return estimated;
    }
  
    /**
     * Interpolate between different rim widths for the same tire
     */
    private interpolateRimWidth(tireSize: string, targetRimWidth: number): CircumferenceResult | null {
      const tireData = this.database[tireSize];
      if (!tireData) return null;
  
      const rimWidths = Object.keys(tireData).map(Number).sort((a, b) => a - b);
      
      // Find the two closest rim widths
      let lower = null;
      let upper = null;
  
      for (const width of rimWidths) {
        if (width <= targetRimWidth) {
          lower = width;
        }
        if (width >= targetRimWidth && upper === null) {
          upper = width;
        }
      }
  
      // If we have both bounds, interpolate
      if (lower !== null && upper !== null && lower !== upper) {
        const lowerMeasurement = tireData[lower.toString()];
        const upperMeasurement = tireData[upper.toString()];
        
        const ratio = (targetRimWidth - lower) / (upper - lower);
        const circumference = lowerMeasurement.circumference + 
          (ratio * (upperMeasurement.circumference - lowerMeasurement.circumference));
  
        return {
          circumference: Math.round(circumference),
          source: `interpolated_${lowerMeasurement.source}`,
          confidence: 'interpolated',
          notes: `Interpolated between ${lower}mm and ${upper}mm rim widths`
        };
      }
  
      return null;
    }
  
    /**
     * Estimate circumference for unknown tire/rim combinations
     */
    private estimateCircumference(tireSize: string, rimWidth: number): CircumferenceResult {
      // Parse tire size to get diameter and width
      const parsed = this.parseTireSize(tireSize);
      
      if (!parsed) {
        // Fallback to 700x25c equivalent
        return {
          circumference: 2110,
          source: 'estimated_fallback',
          confidence: 'estimated',
          notes: 'Unknown tire size, using 700x25c equivalent'
        };
      }
  
      // Base circumference calculations (simplified)
      let baseCircumference: number;
      
      if (parsed.diameter === 700) {
        baseCircumference = 2096 + (parsed.width - 23) * 2.5; // ~2.5mm per mm of width
      } else if (parsed.diameter === 650) {
        baseCircumference = 2070 + (parsed.width - 42) * 2;
      } else if (parsed.diameter === 29) {
        baseCircumference = 2300 + (parsed.width - 2.1) * 50; // MTB uses inches
      } else if (parsed.diameter === 27.5) {
        baseCircumference = 2140 + (parsed.width - 2.1) * 50;
      } else if (parsed.diameter === 26) {
        baseCircumference = 1970 + (parsed.width - 1.9) * 40;
      } else {
        baseCircumference = 2110; // fallback
      }
  
      // Adjust for rim width (wider rims = slightly larger circumference)
      const rimAdjustment = (rimWidth - 21) * 0.8; // ~0.8mm per mm of rim width difference
  
      return {
        circumference: Math.round(baseCircumference + rimAdjustment),
        source: 'estimated_formula',
        confidence: 'estimated',
        notes: `Estimated using diameter ${parsed.diameter} and width ${parsed.width}`
      };
    }
  
    /**
     * Parse tire size string into diameter and width
     */
    private parseTireSize(tireSize: string): { diameter: number; width: number } | null {
      // Handle 700c format (700x25c)
      const road700Match = tireSize.match(/^700x(\d+)c?$/);
      if (road700Match) {
        return { diameter: 700, width: parseInt(road700Match[1]) };
      }
  
      // Handle 650b format (650x47b)
      const gravel650Match = tireSize.match(/^650x(\d+)b?$/);
      if (gravel650Match) {
        return { diameter: 650, width: parseInt(gravel650Match[1]) };
      }
  
      // Handle MTB format (29x2.1, 27.5x2.25, 26x1.9)
      const mtbMatch = tireSize.match(/^(29|27\.5|26)x([\d.]+)$/);
      if (mtbMatch) {
        return { diameter: parseFloat(mtbMatch[1]), width: parseFloat(mtbMatch[2]) };
      }
  
      return null;
    }
  
    /**
     * Adjust circumference for tire pressure
     */
    private adjustForPressure(baseCircumference: number, basePressure: number, targetPressure: number): number {
      // Higher pressure = slightly smaller circumference (tire deforms less)
      // Approximate adjustment: -0.1% per 10 PSI increase
      const pressureDiff = targetPressure - basePressure;
      const adjustment = (pressureDiff / 10) * -0.001; // -0.1% per 10 PSI
      
      return Math.round(baseCircumference * (1 + adjustment));
    }
  
    /**
     * Get all available tire sizes for a bike type
     */
    getAvailableTireSizes(bikeType: keyof typeof COMMON_TIRE_SIZES): string[] {
      return COMMON_TIRE_SIZES[bikeType] || [];
    }
  
    /**
     * Get common rim widths for a bike type
     */
    getCommonRimWidths(bikeType: keyof typeof COMMON_RIM_WIDTHS): number[] {
      return COMMON_RIM_WIDTHS[bikeType] || [];
    }
  
    /**
     * Get all measurements for a specific tire size
     */
    getTireMeasurements(tireSize: string): TireMeasurement[] {
      const tireData = this.database[tireSize];
      if (!tireData) return [];
      
      return Object.values(tireData);
    }
  
    /**
     * Search for tire sizes matching a query
     */
    searchTireSizes(query: string): string[] {
      const searchTerm = query.toLowerCase();
      return Object.keys(this.database).filter(size => 
        size.toLowerCase().includes(searchTerm)
      );
    }
  
    /**
     * Get database statistics
     */
    getStats() {
      const totalMeasurements = Object.values(this.database)
        .reduce((count, tireData) => count + Object.keys(tireData).length, 0);
      
      const tireSizes = Object.keys(this.database).length;
      
      const sources = new Set();
      Object.values(this.database).forEach(tireData => {
        Object.values(tireData).forEach(measurement => {
          sources.add(measurement.source);
        });
      });
  
      return {
        totalMeasurements,
        tireSizes,
        sources: Array.from(sources)
      };
    }
  }
  
  // Create singleton instance
  export const tireCalculator = new TireCalculator();