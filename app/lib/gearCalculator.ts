// app/lib/gearCalculator.ts
import { DrivetrainSetup, GearCalculation } from '../types/components';
import { tireCalculator } from './tireCalculator';
import { WheelSetup } from '../types/tires';

export interface GearSetup extends DrivetrainSetup {
  wheelSetup: WheelSetup;
  crankLength: number; // selected crank length in mm
}

export interface SpeedCalculation {
  rpm60: number;
  rpm80: number;
  rpm90: number;
  rpm100: number;
  rpm120: number;
}

export class GearCalculator {
  
  /**
   * Calculate all gear combinations for a drivetrain setup
   */
  calculateAllGears(setup: GearSetup): GearCalculation[] {
    const gears: GearCalculation[] = [];
    
    // Get tire circumference
    const circumferenceResult = tireCalculator.getCircumference(setup.wheelSetup);
    const wheelCircumference = circumferenceResult.circumference; // in mm
    
    // Calculate for each chainring/cog combination
    setup.crankset.chainrings.forEach((chainring, frontIndex) => {
      setup.cassette.cogs.forEach((cog, rearIndex) => {
        const gear = this.calculateGear(
          chainring,
          cog,
          wheelCircumference,
          setup.crankLength,
          setup
        );
        
        // Add position information
        gear.frontIndex = frontIndex;
        gear.rearIndex = rearIndex;
        gear.gearNumber = frontIndex * setup.cassette.cogs.length + rearIndex + 1;
        
        gears.push(gear);
      });
    });
    
    return gears;
  }
  
  /**
   * Calculate a single gear combination
   */
  calculateGear(
    chainringTeeth: number,
    cogTeeth: number,
    wheelCircumference: number, // mm
    crankLength: number, // mm
    setup: GearSetup
  ): GearCalculation {
    
    // Basic gear ratio (unitless)
    const ratio = chainringTeeth / cogTeeth;
    
    // Gear inches (diameter in inches that would give same ratio with direct drive)
    const gearInches = ratio * (wheelCircumference / Math.PI / 25.4); // convert mm to inches
    
    // Gain ratio (Sheldon Brown's method - accounts for crank length)
    const wheelRadius = wheelCircumference / (2 * Math.PI); // mm
    const gainRatio = ratio * (wheelRadius / crankLength);
    
    // Development (distance traveled per pedal revolution)
    const developmentMeters = (wheelCircumference * ratio) / 1000; // convert mm to meters
    
    // Speed at various cadences
    const speedAtCadence = this.calculateSpeedsAtCadences(
      developmentMeters,
      [60, 80, 90, 100, 120]
    );
    
    // Chain line analysis
    const chainLineData = this.calculateChainLine(
      chainringTeeth,
      cogTeeth,
      setup
    );
    
    return {
      chainring: chainringTeeth,
      cog: cogTeeth,
      ratio,
      gearInches,
      gainRatio,
      developmentMeters,
      speedAtCadence: {
        rpm60: speedAtCadence[0],
        rpm80: speedAtCadence[1],
        rpm90: speedAtCadence[2],
        rpm100: speedAtCadence[3],
        rpm120: speedAtCadence[4]
      },
      chainLine: chainLineData.chainLine,
      crossChainAngle: chainLineData.crossChainAngle,
      efficiency: chainLineData.efficiency,
      wheelCircumference,
      crankLength
    };
  }
  
  /**
   * Calculate speed at various cadences
   */
  private calculateSpeedsAtCadences(
    developmentMeters: number,
    cadences: number[]
  ): number[] {
    return cadences.map(cadence => {
      // Speed = development × cadence × 60 (to get meters per hour)
      const metersPerHour = developmentMeters * cadence * 60;
      // Convert to km/h
      const kmh = metersPerHour / 1000;
      // Convert to mph  
      const mph = kmh * 0.621371;
      
      return Math.round(mph * 10) / 10; // Round to 1 decimal place
    });
  }
  
  /**
   * Calculate chain line geometry and efficiency
   */
  private calculateChainLine(
    chainringTeeth: number,
    cogTeeth: number,
    setup: GearSetup
  ): {
    chainLine: number;
    crossChainAngle: number;
    efficiency: number;
  } {
    
    // Front chain line (from crankset spec)
    const frontChainLine = setup.crankset.chainLine;
    
    // Estimate rear chain line based on cassette position
    const rearChainLine = this.estimateRearChainLine(cogTeeth, setup);
    
    // Calculate chain angle (simplified geometry)
    const chainStay = 420; // Typical chain stay length in mm
    const chainLineOffset = Math.abs(frontChainLine - rearChainLine);
    const crossChainAngle = Math.atan(chainLineOffset / chainStay) * (180 / Math.PI);
    
    // Calculate efficiency based on chain angle
    const efficiency = this.calculateChainEfficiency(crossChainAngle);
    
    return {
      chainLine: frontChainLine,
      crossChainAngle,
      efficiency
    };
  }
  
  /**
   * Estimate rear chain line based on cog position
   */
  private estimateRearChainLine(cogTeeth: number, setup: GearSetup): number {
    const standardRearChainLine = setup.bikeType === 'road' ? 43.5 : 52;
    const cogIndex = setup.cassette.cogs.indexOf(cogTeeth);
    const totalCogs = setup.cassette.cogs.length;
    
    // Estimate cog position offset from center
    const cogSpacing = setup.cassette.speeds === 11 ? 3.95 : 4.09; // mm between cogs
    const centerIndex = (totalCogs - 1) / 2;
    const cogOffset = (cogIndex - centerIndex) * cogSpacing;
    
    return standardRearChainLine + cogOffset;
  }
  
  /**
   * Calculate chain efficiency based on cross-chain angle
   */
  private calculateChainEfficiency(crossChainAngle: number): number {
    // Based on efficiency studies - straight chain is ~98% efficient
    const baseEfficiency = 0.98;
    
    // Efficiency drops with chain angle
    if (crossChainAngle < 1) return baseEfficiency;
    if (crossChainAngle < 2.5) return baseEfficiency - 0.005; // 97.5%
    if (crossChainAngle < 5) return baseEfficiency - 0.015; // 96.5%
    if (crossChainAngle < 7.5) return baseEfficiency - 0.03; // 95%
    
    return baseEfficiency - 0.05; // 93% for extreme cross-chaining
  }
  
  /**
   * Get the optimal (most efficient) gears
   */
  getOptimalGears(gears: GearCalculation[]): GearCalculation[] {
    return gears.filter(gear => gear.efficiency > 0.975); // 97.5% or better
  }
  
  /**
   * Get problematic gears to avoid
   */
  getProblematicGears(gears: GearCalculation[]): GearCalculation[] {
    return gears.filter(gear => 
      gear.efficiency < 0.96 || gear.crossChainAngle > 5
    );
  }
  
  /**
   * Find gear duplicates (similar ratios)
   */
  findGearDuplicates(gears: GearCalculation[], tolerance = 0.05): Array<{
    primary: GearCalculation;
    duplicates: GearCalculation[];
  }> {
    const duplicateGroups: Array<{
      primary: GearCalculation;
      duplicates: GearCalculation[];
    }> = [];
    
    const processed = new Set<number>();
    
    gears.forEach((gear, index) => {
      if (processed.has(index)) return;
      
      const duplicates = gears.filter((otherGear, otherIndex) => {
        if (otherIndex <= index) return false;
        return Math.abs(gear.ratio - otherGear.ratio) <= tolerance;
      });
      
      if (duplicates.length > 0) {
        duplicateGroups.push({
          primary: gear,
          duplicates
        });
        
        // Mark as processed
        processed.add(index);
        duplicates.forEach(dup => {
          const dupIndex = gears.indexOf(dup);
          if (dupIndex >= 0) processed.add(dupIndex);
        });
      }
    });
    
    return duplicateGroups;
  }
  
  /**
   * Calculate gear range (highest/lowest ratio)
   */
  calculateGearRange(gears: GearCalculation[]): {
    range: number;
    lowest: GearCalculation;
    highest: GearCalculation;
    lowestUsable: GearCalculation;
    highestUsable: GearCalculation;
  } {
    const usableGears = gears.filter(g => g.efficiency > 0.95);
    
    const allSorted = [...gears].sort((a, b) => a.ratio - b.ratio);
    const usableSorted = [...usableGears].sort((a, b) => a.ratio - b.ratio);
    
    return {
      range: allSorted[allSorted.length - 1].ratio / allSorted[0].ratio,
      lowest: allSorted[0],
      highest: allSorted[allSorted.length - 1],
      lowestUsable: usableSorted[0],
      highestUsable: usableSorted[usableSorted.length - 1]
    };
  }
  
  /**
   * Calculate gear steps (percentage jumps between adjacent gears)
   */
  calculateGearSteps(gears: GearCalculation[]): Array<{
    from: GearCalculation;
    to: GearCalculation;
    stepPercentage: number;
  }> {
    const sortedGears = [...gears].sort((a, b) => a.ratio - b.ratio);
    const steps: Array<{
      from: GearCalculation;
      to: GearCalculation;
      stepPercentage: number;
    }> = [];
    
    for (let i = 0; i < sortedGears.length - 1; i++) {
      const from = sortedGears[i];
      const to = sortedGears[i + 1];
      const stepPercentage = ((to.ratio - from.ratio) / from.ratio) * 100;
      
      steps.push({
        from,
        to,
        stepPercentage: Math.round(stepPercentage * 10) / 10
      });
    }
    
    return steps;
  }
  
  /**
   * Suggest optimal gear for a target speed and cadence
   */
  suggestGearForSpeed(
    gears: GearCalculation[],
    targetSpeedMph: number,
    targetCadence: number = 90
  ): GearCalculation | null {
    
    const cadenceKey = this.getCadenceKey(targetCadence);
    if (!cadenceKey) return null;
    
    const usableGears = this.getOptimalGears(gears);
    
    let bestGear: GearCalculation | null = null;
    let smallestDiff = Infinity;
    
    usableGears.forEach(gear => {
      const gearSpeed = gear.speedAtCadence[cadenceKey];
      const diff = Math.abs(gearSpeed - targetSpeedMph);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestGear = gear;
      }
    });
    
    return bestGear;
  }
  
  /**
   * Get the appropriate cadence key for speed calculations
   */
  private getCadenceKey(cadence: number): keyof SpeedCalculation | null {
    if (cadence <= 65) return 'rpm60';
    if (cadence <= 85) return 'rpm80';
    if (cadence <= 95) return 'rpm90';
    if (cadence <= 110) return 'rpm100';
    return 'rpm120';
  }
}

// Extend the GearCalculation interface to include position data
declare module '../types/components' {
  interface GearCalculation {
    chainring?: number;
    cog?: number;
    frontIndex?: number;
    rearIndex?: number;
    gearNumber?: number;
    wheelCircumference?: number;
    crankLength?: number;
  }
}

// Create singleton instance
export const gearCalculator = new GearCalculator();