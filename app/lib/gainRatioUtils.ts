// app/lib/gainRatioUtils.ts

/**
 * Gain Ratio calculations based on Sheldon Brown's method
 * This accounts for crank length in gear calculations, providing a more accurate
 * representation of mechanical advantage than simple gear ratios.
 */

export interface GainRatioResult {
    gainRatio: number;
    gearRatio: number;
    mechanicalAdvantage: number;
    description: string;
  }
  
  export class GainRatioCalculator {
    
    /**
     * Calculate gain ratio using Sheldon Brown's method
     * Gain Ratio = (Chainring Teeth / Cog Teeth) × (Wheel Radius / Crank Length)
     */
    static calculateGainRatio(
      chainringTeeth: number,
      cogTeeth: number,
      wheelRadius: number, // in mm
      crankLength: number   // in mm
    ): number {
      const gearRatio = chainringTeeth / cogTeeth;
      const leverageRatio = wheelRadius / crankLength;
      return gearRatio * leverageRatio;
    }
    
    /**
     * Calculate gain ratio from wheel circumference
     */
    static calculateGainRatioFromCircumference(
      chainringTeeth: number,
      cogTeeth: number,
      wheelCircumference: number, // in mm
      crankLength: number         // in mm
    ): number {
      const wheelRadius = wheelCircumference / (2 * Math.PI);
      return this.calculateGainRatio(chainringTeeth, cogTeeth, wheelRadius, crankLength);
    }
    
    /**
     * Compare gain ratios with different crank lengths
     */
    static compareGainRatiosWithCrankLengths(
      chainringTeeth: number,
      cogTeeth: number,
      wheelRadius: number,
      crankLengths: number[]
    ): Array<{
      crankLength: number;
      gainRatio: number;
      relativeDifference: number; // percentage difference from baseline (175mm)
    }> {
      const baseline = 175; // Standard crank length
      const baselineGainRatio = this.calculateGainRatio(
        chainringTeeth, 
        cogTeeth, 
        wheelRadius, 
        baseline
      );
      
      return crankLengths.map(crankLength => {
        const gainRatio = this.calculateGainRatio(
          chainringTeeth, 
          cogTeeth, 
          wheelRadius, 
          crankLength
        );
        
        const relativeDifference = ((gainRatio - baselineGainRatio) / baselineGainRatio) * 100;
        
        return {
          crankLength,
          gainRatio,
          relativeDifference: Math.round(relativeDifference * 100) / 100
        };
      });
    }
    
    /**
     * Get descriptive interpretation of gain ratio
     */
    static interpretGainRatio(gainRatio: number): string {
      if (gainRatio < 2.5) return 'Very Low (steep climbing)';
      if (gainRatio < 3.5) return 'Low (climbing)';
      if (gainRatio < 4.5) return 'Medium-Low (rolling terrain)';
      if (gainRatio < 5.5) return 'Medium (general riding)';
      if (gainRatio < 6.5) return 'Medium-High (fast riding)';
      if (gainRatio < 7.5) return 'High (racing/sprinting)';
      return 'Very High (time trial/sprinting)';
    }
    
    /**
     * Calculate equivalent gear ratios for different wheel sizes
     */
    static calculateEquivalentGears(
      referenceChainring: number,
      referenceCog: number,
      referenceWheelRadius: number,
      targetWheelRadius: number
    ): {
      targetGearRatio: number;
      suggestedChainring: number;
      suggestedCog: number;
    } {
      const referenceGearRatio = referenceChainring / referenceCog;
      const wheelRatioAdjustment = referenceWheelRadius / targetWheelRadius;
      const targetGearRatio = referenceGearRatio * wheelRatioAdjustment;
      
      // Find closest practical gear combination
      const commonChainrings = [50, 52, 53, 34, 36, 39, 32, 30, 28];
      const commonCogs = [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 25, 28, 32, 36, 42, 50];
      
      let bestMatch = { chainring: 50, cog: 12, ratio: 50/12, difference: Infinity };
      
      commonChainrings.forEach(chainring => {
        commonCogs.forEach(cog => {
          const ratio = chainring / cog;
          const difference = Math.abs(ratio - targetGearRatio);
          
          if (difference < bestMatch.difference) {
            bestMatch = { chainring, cog, ratio, difference };
          }
        });
      });
      
      return {
        targetGearRatio,
        suggestedChainring: bestMatch.chainring,
        suggestedCog: bestMatch.cog
      };
    }
    
    /**
     * Calculate power requirements at different gain ratios
     */
    static calculatePowerRequirements(
      gainRatio: number,
      speedMph: number,
      riderWeightLbs: number = 165,
      bikeWeightLbs: number = 20,
      grade: number = 0, // percentage grade
      windSpeedMph: number = 0,
      crr: number = 0.005 // coefficient of rolling resistance
    ): {
      powerWatts: number;
      breakdown: {
        rollingResistance: number;
        airResistance: number;
        climbing: number;
        acceleration: number;
      };
    } {
      // Convert units
      const speedMs = speedMph * 0.44704; // mph to m/s
      const totalWeightKg = (riderWeightLbs + bikeWeightLbs) * 0.453592; // lbs to kg
      const gradeRadians = Math.atan(grade / 100);
      const windSpeedMs = windSpeedMph * 0.44704;
      const apparentWindSpeed = speedMs + windSpeedMs;
      
      // Power calculations (simplified)
      const gravity = 9.81; // m/s²
      const airDensity = 1.225; // kg/m³
      const dragArea = 0.4; // m² (typical cyclist CdA)
      
      // Rolling resistance power
      const rollingPower = crr * totalWeightKg * gravity * Math.cos(gradeRadians) * speedMs;
      
      // Air resistance power  
      const airPower = 0.5 * airDensity * dragArea * Math.pow(apparentWindSpeed, 3);
      
      // Climbing power
      const climbingPower = totalWeightKg * gravity * Math.sin(gradeRadians) * speedMs;
      
      // Total power (ignoring acceleration and drivetrain efficiency for simplicity)
      const totalPower = rollingPower + airPower + climbingPower;
      
      return {
        powerWatts: Math.round(totalPower),
        breakdown: {
          rollingResistance: Math.round(rollingPower),
          airResistance: Math.round(airPower),
          climbing: Math.round(climbingPower),
          acceleration: 0 // Simplified - would need acceleration data
        }
      };
    }
    
    /**
     * Calculate optimal cadence for a given gain ratio and target power
     */
    static calculateOptimalCadence(
      gainRatio: number,
      targetPowerWatts: number,
      riderEfficiency: number = 0.23 // 23% typical cycling efficiency
    ): {
      optimalCadence: number;
      powerAtCadences: Array<{
        cadence: number;
        power: number;
        efficiency: number;
      }>;
    } {
      // Simplified model - in reality this would need rider-specific power curves
      const testCadences = [60, 70, 80, 90, 100, 110, 120];
      
      const powerAtCadences = testCadences.map(cadence => {
        // Efficiency curve (peaks around 90 RPM for most riders)
        const cadenceEfficiency = riderEfficiency * (1 - Math.pow((cadence - 90) / 60, 2) * 0.1);
        const adjustedEfficiency = Math.max(cadenceEfficiency, riderEfficiency * 0.8);
        
        // Power varies with cadence (simplified)
        const power = targetPowerWatts * (adjustedEfficiency / riderEfficiency);
        
        return {
          cadence,
          power: Math.round(power),
          efficiency: Math.round(adjustedEfficiency * 1000) / 10 // percentage
        };
      });
      
      // Find cadence with highest efficiency
      const optimal = powerAtCadences.reduce((best, current) => 
        current.efficiency > best.efficiency ? current : best
      );
      
      return {
        optimalCadence: optimal.cadence,
        powerAtCadences
      };
    }
    
    /**
     * Generate gain ratio table for analysis
     */
    static generateGainRatioTable(
      chainrings: number[],
      cogs: number[],
      wheelRadius: number,
      crankLength: number
    ): Array<{
      chainring: number;
      cog: number;
      gearRatio: number;
      gainRatio: number;
      development: number; // meters per pedal revolution
      interpretation: string;
    }> {
      const table: Array<{
        chainring: number;
        cog: number;
        gearRatio: number;
        gainRatio: number;
        development: number;
        interpretation: string;
      }> = [];
      
      chainrings.forEach(chainring => {
        cogs.forEach(cog => {
          const gearRatio = chainring / cog;
          const gainRatio = this.calculateGainRatio(chainring, cog, wheelRadius, crankLength);
          const development = (2 * Math.PI * wheelRadius * gearRatio) / 1000; // meters
          const interpretation = this.interpretGainRatio(gainRatio);
          
          table.push({
            chainring,
            cog,
            gearRatio: Math.round(gearRatio * 100) / 100,
            gainRatio: Math.round(gainRatio * 100) / 100,
            development: Math.round(development * 100) / 100,
            interpretation
          });
        });
      });
      
      return table.sort((a, b) => a.gainRatio - b.gainRatio);
    }
  }
  
  /**
   * Common wheel sizes and their typical radii (mm)
   */
  export const WHEEL_SIZES = {
    '700c': {
      '700x23c': 334,
      '700x25c': 335,
      '700x28c': 338,
      '700x32c': 344,
      '700x35c': 347,
      '700x38c': 349,
      '700x40c': 352
    },
    '650b': {
      '650x42b': 330,
      '650x47b': 332
    },
    '26inch': {
      '26x1.9': 314,
      '26x2.1': 318,
      '26x2.25': 322
    },
    '27.5inch': {
      '27.5x2.1': 340,
      '27.5x2.25': 343,
      '27.5x2.4': 347
    },
    '29inch': {
      '29x2.1': 366,
      '29x2.25': 369,
      '29x2.4': 374
    }
  } as const;
  
  /**
   * Common crank lengths (mm)
   */
  export const CRANK_LENGTHS = [160, 165, 170, 172.5, 175, 177.5, 180] as const;