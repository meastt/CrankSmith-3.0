// app/lib/performanceAnalyzer.ts
import { DrivetrainAnalysis, GearCalculation, DrivetrainSetup } from '../types/components';
import { gearCalculator, GearSetup } from './gearCalculator';
import { chainLineCalculator, ChainLineSetup } from './chainLineCalculator';
import { compatibilityEngine } from './compatibilityEngine';

export interface PerformanceMetrics {
  gearRange: {
    lowest: GearCalculation;
    highest: GearCalculation;
    ratio: number;
    usableRatio: number;
  };
  efficiency: {
    averageEfficiency: number;
    optimalGears: number;
    problematicGears: number;
    efficiencyDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  };
  gearSteps: {
    averageStep: number;
    largestGap: number;
    smallestGap: number;
    stepDistribution: number[];
    cadenceConsistency: number;
  };
  speedAnalysis: {
    speeds90rpm: number[];
    speedRange: { min: number; max: number };
    practicalRange: { min: number; max: number };
    targetSpeeds: Array<{
      speed: number;
      gear: GearCalculation;
      efficiency: number;
    }>;
  };
  chainLineAnalysis: {
    straightChainGears: GearCalculation[];
    crossChainGears: GearCalculation[];
    avoidGears: GearCalculation[];
    chainLineScore: number;
  };
  duplicateAnalysis: {
    duplicateGroups: Array<{
      primary: GearCalculation;
      duplicates: GearCalculation[];
      bestOption: GearCalculation;
    }>;
    uniqueRatios: number;
    redundancy: number;
  };
}

export interface BikeUsageProfile {
  name: string;
  speedRange: { min: number; max: number }; // mph
  cadenceRange: { min: number; max: number }; // rpm
  terrain: 'flat' | 'rolling' | 'hilly' | 'mountainous';
  priority: 'efficiency' | 'range' | 'top_speed' | 'climbing';
  description: string;
}

export const USAGE_PROFILES: BikeUsageProfile[] = [
  {
    name: 'Commuting',
    speedRange: { min: 12, max: 20 },
    cadenceRange: { min: 80, max: 100 },
    terrain: 'flat',
    priority: 'efficiency',
    description: 'Daily commuting, consistent speeds'
  },
  {
    name: 'Recreational Road',
    speedRange: { min: 15, max: 25 },
    cadenceRange: { min: 85, max: 95 },
    terrain: 'rolling',
    priority: 'range',
    description: 'Weekend rides, varied terrain'
  },
  {
    name: 'Racing/Training',
    speedRange: { min: 20, max: 35 },
    cadenceRange: { min: 90, max: 110 },
    terrain: 'rolling',
    priority: 'top_speed',
    description: 'Competitive riding, high speeds'
  },
  {
    name: 'Climbing/Touring',
    speedRange: { min: 8, max: 18 },
    cadenceRange: { min: 70, max: 90 },
    terrain: 'mountainous',
    priority: 'climbing',
    description: 'Long climbs with loaded bike'
  },
  {
    name: 'Mountain Biking',
    speedRange: { min: 5, max: 25 },
    cadenceRange: { min: 70, max: 100 },
    terrain: 'mountainous',
    priority: 'range',
    description: 'Technical terrain, wide speed range'
  },
  {
    name: 'Gravel/Adventure',
    speedRange: { min: 10, max: 22 },
    cadenceRange: { min: 75, max: 95 },
    terrain: 'rolling',
    priority: 'range',
    description: 'Mixed surfaces, long distances'
  }
];

export class PerformanceAnalyzer {
  
  /**
   * Comprehensive drivetrain performance analysis
   */
  analyzeDrivetrain(setup: GearSetup): DrivetrainAnalysis {
    // Calculate all gears
    const gears = gearCalculator.calculateAllGears(setup);
    
    // Compatibility check
    const compatibility = compatibilityEngine.checkDrivetrainCompatibility(setup);
    
    // Chain line analysis
    const chainLineSetup: ChainLineSetup = {
      cranksetChainLine: setup.crankset.chainLine,
      bottomBracket: setup.bottomBracket || 'BSA',
      frameStandard: setup.bottomBracket || 'BSA',
      cassette: {
        speeds: setup.cassette.speeds,
        cogs: setup.cassette.cogs
      },
      wheelSpacing: setup.bikeType === 'mtb' ? 148 : 130
    };
    
    const chainLineResult = chainLineCalculator.calculateChainLine(chainLineSetup);
    
    // Basic gear analysis
    const sortedGears = [...gears].sort((a, b) => a.ratio - b.ratio);
    const gearRange = sortedGears[sortedGears.length - 1].ratio / sortedGears[0].ratio;
    
    // Calculate gear steps
    const steps: number[] = [];
    for (let i = 0; i < sortedGears.length - 1; i++) {
      const step = ((sortedGears[i + 1].ratio - sortedGears[i].ratio) / sortedGears[i].ratio) * 100;
      steps.push(step);
    }
    const averageStep = steps.reduce((sum, step) => sum + step, 0) / steps.length;
    const largestGap = Math.max(...steps);
    
    // Find recommended gears (high efficiency)
    const recommendedGears = gears
      .map((gear, index) => ({ gear, index }))
      .filter(({ gear }) => gear.efficiency > 0.975)
      .map(({ index }) => index);
    
    return {
      setup,
      compatibility,
      gears,
      totalGears: gears.length,
      uniqueRatios: new Set(gears.map(g => Math.round(g.ratio * 100))).size,
      gearRange,
      averageStep,
      largestGap,
      recommendedGears,
      chainLineAnalysis: {
        straightChainGears: gears.filter(g => g.efficiency > 0.975).map(g => gears.indexOf(g)),
        crossChainGears: gears.filter(g => g.efficiency >= 0.95 && g.efficiency <= 0.975).map(g => gears.indexOf(g)),
        avoidGears: gears.filter(g => g.efficiency < 0.95).map(g => gears.indexOf(g))
      }
    };
  }
  
  /**
   * Calculate comprehensive performance metrics
   */
  calculatePerformanceMetrics(gears: GearCalculation[], chainLineResult?: any): PerformanceMetrics {
    const gearRange = this.calculateGearRange(gears);
    const efficiency = this.analyzeEfficiency(gears);
    const gearSteps = this.analyzeGearSteps(gears);
    const speedAnalysis = this.analyzeSpeedRange(gears);
    const chainLineAnalysis = this.analyzeChainLinePerformance(gears);
    const duplicateAnalysis = this.analyzeDuplicates(gears);
    
    return {
      gearRange,
      efficiency,
      gearSteps,
      speedAnalysis,
      chainLineAnalysis,
      duplicateAnalysis
    };
  }
  
  /**
   * Calculate gear range metrics
   */
  private calculateGearRange(gears: GearCalculation[]): PerformanceMetrics['gearRange'] {
    const sortedGears = [...gears].sort((a, b) => a.ratio - b.ratio);
    const usableGears = gears.filter(g => g.efficiency > 0.95);
    const sortedUsable = [...usableGears].sort((a, b) => a.ratio - b.ratio);
    
    return {
      lowest: sortedGears[0],
      highest: sortedGears[sortedGears.length - 1],
      ratio: sortedGears[sortedGears.length - 1].ratio / sortedGears[0].ratio,
      usableRatio: sortedUsable.length > 0 ? 
        sortedUsable[sortedUsable.length - 1].ratio / sortedUsable[0].ratio : 0
    };
  }
  
  /**
   * Analyze gear efficiency distribution
   */
  private analyzeEfficiency(gears: GearCalculation[]): PerformanceMetrics['efficiency'] {
    const averageEfficiency = gears.reduce((sum, g) => sum + g.efficiency, 0) / gears.length;
    const optimalGears = gears.filter(g => g.efficiency > 0.975).length;
    const problematicGears = gears.filter(g => g.efficiency < 0.95).length;
    
    const distribution = [
      { range: '98%+', count: 0, percentage: 0 },
      { range: '97-98%', count: 0, percentage: 0 },
      { range: '95-97%', count: 0, percentage: 0 },
      { range: '<95%', count: 0, percentage: 0 }
    ];
    
    gears.forEach(gear => {
      if (gear.efficiency >= 0.98) distribution[0].count++;
      else if (gear.efficiency >= 0.97) distribution[1].count++;
      else if (gear.efficiency >= 0.95) distribution[2].count++;
      else distribution[3].count++;
    });
    
    distribution.forEach(d => {
      d.percentage = Math.round((d.count / gears.length) * 100);
    });
    
    return {
      averageEfficiency,
      optimalGears,
      problematicGears,
      efficiencyDistribution: distribution
    };
  }
  
  /**
   * Analyze gear step consistency
   */
  private analyzeGearSteps(gears: GearCalculation[]): PerformanceMetrics['gearSteps'] {
    const sortedGears = [...gears].sort((a, b) => a.ratio - b.ratio);
    const steps: number[] = [];
    
    for (let i = 0; i < sortedGears.length - 1; i++) {
      const step = ((sortedGears[i + 1].ratio - sortedGears[i].ratio) / sortedGears[i].ratio) * 100;
      steps.push(step);
    }
    
    const averageStep = steps.reduce((sum, step) => sum + step, 0) / steps.length;
    const largestGap = Math.max(...steps);
    const smallestGap = Math.min(...steps);
    
    // Calculate cadence consistency (how consistent speeds are at different cadences)
    const cadenceConsistency = this.calculateCadenceConsistency(sortedGears);
    
    return {
      averageStep,
      largestGap,
      smallestGap,
      stepDistribution: steps,
      cadenceConsistency
    };
  }
  
  /**
   * Calculate cadence consistency score
   */
  private calculateCadenceConsistency(gears: GearCalculation[]): number {
    // Measure how consistently spaced the gears are at different cadences
    const cadences = [80, 90, 100];
    let totalVariation = 0;
    
    cadences.forEach(cadence => {
      const speeds = gears.map(g => {
        const key = cadence <= 85 ? 'rpm80' : cadence <= 95 ? 'rpm90' : 'rpm100';
        return g.speedAtCadence[key];
      });
      
      const steps = [];
      for (let i = 0; i < speeds.length - 1; i++) {
        steps.push(speeds[i + 1] - speeds[i]);
      }
      
      const avgStep = steps.reduce((sum, s) => sum + s, 0) / steps.length;
      const variation = steps.reduce((sum, s) => sum + Math.abs(s - avgStep), 0) / steps.length;
      totalVariation += variation;
    });
    
    // Lower variation = higher consistency (0-100 scale)
    return Math.max(0, 100 - (totalVariation / cadences.length));
  }
  
  /**
   * Analyze speed range and practical usage
   */
  private analyzeSpeedRange(gears: GearCalculation[]): PerformanceMetrics['speedAnalysis'] {
    const speeds90rpm = gears.map(g => g.speedAtCadence.rpm90);
    const minSpeed = Math.min(...speeds90rpm);
    const maxSpeed = Math.max(...speeds90rpm);
    
    // Practical range excludes extreme gears with poor efficiency
    const practicalGears = gears.filter(g => g.efficiency > 0.95);
    const practicalSpeeds = practicalGears.map(g => g.speedAtCadence.rpm90);
    const practicalMin = Math.min(...practicalSpeeds);
    const practicalMax = Math.max(...practicalSpeeds);
    
    // Target speeds for common scenarios
    const targetSpeeds = [15, 20, 25, 30].map(targetSpeed => {
      let bestGear = gears[0];
      let smallestDiff = Infinity;
      
      gears.forEach(gear => {
        const diff = Math.abs(gear.speedAtCadence.rpm90 - targetSpeed);
        if (diff < smallestDiff && gear.efficiency > 0.95) {
          smallestDiff = diff;
          bestGear = gear;
        }
      });
      
      return {
        speed: targetSpeed,
        gear: bestGear,
        efficiency: bestGear.efficiency
      };
    });
    
    return {
      speeds90rpm,
      speedRange: { min: minSpeed, max: maxSpeed },
      practicalRange: { min: practicalMin, max: practicalMax },
      targetSpeeds
    };
  }
  
  /**
   * Analyze chain line performance
   */
  private analyzeChainLinePerformance(gears: GearCalculation[]): PerformanceMetrics['chainLineAnalysis'] {
    const straightChainGears = gears.filter(g => g.efficiency > 0.975);
    const crossChainGears = gears.filter(g => g.efficiency >= 0.95 && g.efficiency <= 0.975);
    const avoidGears = gears.filter(g => g.efficiency < 0.95);
    
    // Calculate overall chain line score (0-100)
    const avgEfficiency = gears.reduce((sum, g) => sum + g.efficiency, 0) / gears.length;
    const chainLineScore = Math.round((avgEfficiency - 0.9) * 1000);
    
    return {
      straightChainGears,
      crossChainGears,
      avoidGears,
      chainLineScore: Math.max(0, Math.min(100, chainLineScore))
    };
  }
  
  /**
   * Analyze duplicate gears and redundancy
   */
  private analyzeDuplicates(gears: GearCalculation[]): PerformanceMetrics['duplicateAnalysis'] {
    const duplicateGroups = this.findDuplicateGears(gears);
    const uniqueRatios = new Set(gears.map(g => Math.round(g.ratio * 100))).size;
    const redundancy = Math.round(((gears.length - uniqueRatios) / gears.length) * 100);
    
    return {
      duplicateGroups,
      uniqueRatios,
      redundancy
    };
  }
  
  /**
   * Find duplicate gear ratios
   */
  private findDuplicateGears(gears: GearCalculation[], tolerance = 0.05): Array<{
    primary: GearCalculation;
    duplicates: GearCalculation[];
    bestOption: GearCalculation;
  }> {
    const groups: Array<{
      primary: GearCalculation;
      duplicates: GearCalculation[];
      bestOption: GearCalculation;
    }> = [];
    
    const processed = new Set<number>();
    
    gears.forEach((gear, index) => {
      if (processed.has(index)) return;
      
      const duplicates = gears.filter((other, otherIndex) => {
        if (otherIndex <= index) return false;
        return Math.abs(gear.ratio - other.ratio) <= tolerance;
      });
      
      if (duplicates.length > 0) {
        const allGears = [gear, ...duplicates];
        const bestOption = allGears.reduce((best, current) => 
          current.efficiency > best.efficiency ? current : best
        );
        
        groups.push({
          primary: gear,
          duplicates,
          bestOption
        });
        
        processed.add(index);
        duplicates.forEach(dup => {
          const dupIndex = gears.indexOf(dup);
          if (dupIndex >= 0) processed.add(dupIndex);
        });
      }
    });
    
    return groups;
  }
  
  /**
   * Get recommended gears for optimal performance
   */
  private getRecommendedGears(gears: GearCalculation[]): number[] {
    return gears
      .map((gear, index) => ({ gear, index }))
      .filter(({ gear }) => gear.efficiency > 0.975)
      .map(({ index }) => index);
  }
  
  /**
   * Evaluate drivetrain for specific usage profile
   */
  evaluateForUsage(gears: GearCalculation[], profile: BikeUsageProfile): {
    score: number;
    usableGears: GearCalculation[];
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  } {
    const usableGears = gears.filter(gear => {
      const speed90 = gear.speedAtCadence.rpm90;
      return speed90 >= profile.speedRange.min && 
             speed90 <= profile.speedRange.max &&
             gear.efficiency > 0.95;
    });
    
    const coverageScore = (usableGears.length / gears.length) * 100;
    const efficiencyScore = usableGears.length > 0 ? 
      (usableGears.reduce((sum, g) => sum + g.efficiency, 0) / usableGears.length - 0.95) * 2000 : 0;
    
    const score = Math.round(Math.min(100, (coverageScore + efficiencyScore) / 2));
    
    const recommendations: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // Analyze based on profile priority
    switch (profile.priority) {
      case 'efficiency':
        if (usableGears.filter(g => g.efficiency > 0.975).length > usableGears.length * 0.7) {
          strengths.push('Excellent efficiency in target speed range');
        } else {
          weaknesses.push('Some efficiency loss in target speed range');
          recommendations.push('Consider optimizing chain line for better efficiency');
        }
        break;
        
      case 'range':
        const speedRange = usableGears.length > 0 ? 
          Math.max(...usableGears.map(g => g.speedAtCadence.rpm90)) - 
          Math.min(...usableGears.map(g => g.speedAtCadence.rpm90)) : 0;
        
        if (speedRange > profile.speedRange.max - profile.speedRange.min) {
          strengths.push('Wide usable speed range');
        } else {
          weaknesses.push('Limited speed range coverage');
          recommendations.push('Consider wider cassette range');
        }
        break;
        
      case 'climbing':
        const lowGears = gears.filter(g => g.speedAtCadence.rpm90 < 12);
        if (lowGears.length > 2 && lowGears.some(g => g.efficiency > 0.95)) {
          strengths.push('Good climbing gear selection');
        } else {
          weaknesses.push('Limited low-speed climbing options');
          recommendations.push('Consider larger cassette or smaller chainring');
        }
        break;
        
      case 'top_speed':
        const highGears = gears.filter(g => g.speedAtCadence.rpm90 > 30);
        if (highGears.length > 1 && highGears.some(g => g.efficiency > 0.975)) {
          strengths.push('Good high-speed capability');
        } else {
          weaknesses.push('Limited top-end speed');
          recommendations.push('Consider larger chainring or smaller cassette');
        }
        break;
    }
    
    return {
      score,
      usableGears,
      recommendations,
      strengths,
      weaknesses
    };
  }
  
  /**
   * Compare multiple drivetrain setups
   */
  compareSetups(setups: Array<{ name: string; setup: GearSetup }>): Array<{
    name: string;
    analysis: DrivetrainAnalysis;
    score: number;
    strengths: string[];
    weaknesses: string[];
  }> {
    return setups.map(({ name, setup }) => {
      const analysis = this.analyzeDrivetrain(setup);
      const metrics = this.calculatePerformanceMetrics(analysis.gears);
      
      // Calculate overall score
      const efficiencyScore = metrics.efficiency.averageEfficiency * 100;
      const rangeScore = Math.min(100, metrics.gearRange.ratio * 10);
      const stepScore = Math.max(0, 100 - metrics.gearSteps.averageStep * 5);
      const chainLineScore = metrics.chainLineAnalysis.chainLineScore;
      
      const score = Math.round((efficiencyScore + rangeScore + stepScore + chainLineScore) / 4);
      
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      
      if (metrics.efficiency.averageEfficiency > 0.975) {
        strengths.push('Excellent overall efficiency');
      }
      if (metrics.gearRange.ratio > 4) {
        strengths.push('Wide gear range');
      }
      if (metrics.gearSteps.averageStep < 15) {
        strengths.push('Consistent gear steps');
      }
      if (metrics.efficiency.problematicGears === 0) {
        strengths.push('No problematic gears');
      }
      
      if (metrics.efficiency.averageEfficiency < 0.96) {
        weaknesses.push('Below-average efficiency');
      }
      if (metrics.gearSteps.largestGap > 20) {
        weaknesses.push('Large gaps between some gears');
      }
      if (metrics.duplicateAnalysis.redundancy > 15) {
        weaknesses.push('Significant gear overlap');
      }
      
      return {
        name,
        analysis,
        score,
        strengths,
        weaknesses
      };
    }).sort((a, b) => b.score - a.score);
  }
}

// Create singleton instance
export const performanceAnalyzer = new PerformanceAnalyzer();