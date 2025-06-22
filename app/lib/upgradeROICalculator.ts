// app/lib/upgradeROICalculator.ts
import { GearSetup } from './gearCalculator';
import { PerformancePredictionEngine, RiderProfile, RideConditions } from './performancePredictionEngine';

export interface UpgradeAnalysis {
  currentSetup: GearSetup;
  proposedSetup: GearSetup;
  improvements: {
    weightSavings: {
      grams: number;
      climbingImpact: string;
      accelerationBenefit: string;
    };
    efficiencyGain: {
      percent: number;
      powerSavings: string;
      speedIncrease: string;
    };
    rangeIncrease: {
      percent: number;
      newCapabilities: string;
      gearingAdvantage: string;
    };
    aerodynamicGain?: {
      dragReduction: number;
      powerSavingsAt40kmh: string;
    };
  };
  costAnalysis: {
    totalCost: number;
    costPerGramSaved: number;
    costPerWattSaved: number;
    costPerPercentRange: number;
  };
  roi: {
    performanceScore: number; // 0-100
    valueScore: number; // 0-100
    overallRoi: number; // 0-100
    recommendation: 'highly_recommended' | 'recommended' | 'marginal' | 'not_recommended';
    reasoning: string[];
  };
  timeToRecoup?: {
    racingSeconds: number; // Time saved per race
    trainingHours: number; // Hours to justify cost
    longevityYears: number; // Expected component life
  };
}

export interface ComponentPricing {
  msrp: number;
  streetPrice?: number;
  expectedLife: number; // years
  maintenanceCostPerYear?: number;
}

export class UpgradeROICalculator {
  
  /**
   * Comprehensive upgrade analysis with ROI calculation
   */
  static analyzeUpgrade(
    currentSetup: GearSetup,
    proposedSetup: GearSetup,
    rider: RiderProfile,
    conditions: RideConditions = this.getDefaultConditions(),
    pricing?: Partial<ComponentPricing>
  ): UpgradeAnalysis {
    
    const improvements = this.calculateImprovements(currentSetup, proposedSetup, rider, conditions);
    const costAnalysis = this.calculateCostAnalysis(currentSetup, proposedSetup, improvements, pricing);
    const roi = this.calculateROI(improvements, costAnalysis, rider);
    const timeToRecoup = this.calculateTimeToRecoup(improvements, costAnalysis, rider);
    
    return {
      currentSetup,
      proposedSetup,
      improvements,
      costAnalysis,
      roi,
      timeToRecoup
    };
  }
  
  /**
   * Calculate all performance improvements
   */
  private static calculateImprovements(
    currentSetup: GearSetup,
    proposedSetup: GearSetup,
    rider: RiderProfile,
    conditions: RideConditions
  ) {
    // Get performance predictions for both setups
    const currentGears = this.getMockGears(currentSetup);
    const proposedGears = this.getMockGears(proposedSetup);
    
    const currentPerf = PerformancePredictionEngine.predictPerformance(currentSetup, currentGears, rider, conditions);
    const proposedPerf = PerformancePredictionEngine.predictPerformance(proposedSetup, proposedGears, rider, conditions);
    
    // Weight savings
    const weightSavings = this.calculateWeightSavings(currentSetup, proposedSetup);
    
    // Efficiency improvements
    const efficiencyGain = this.calculateEfficiencyGain(currentGears, proposedGears, rider);
    
    // Range improvements
    const rangeIncrease = this.calculateRangeIncrease(currentGears, proposedGears);
    
    // Aerodynamic improvements (if applicable)
    const aerodynamicGain = this.calculateAerodynamicGain(currentSetup, proposedSetup);
    
    return {
      weightSavings,
      efficiencyGain,
      rangeIncrease,
      ...(aerodynamicGain && { aerodynamicGain })
    };
  }
  
  /**
   * Calculate weight savings and impact
   */
  private static calculateWeightSavings(current: GearSetup, proposed: GearSetup) {
    const currentWeight = this.getTotalWeight(current);
    const proposedWeight = this.getTotalWeight(proposed);
    const grams = currentWeight - proposedWeight;
    
    // Calculate climbing impact (time saved on climbs)
    const climbingTimeSaved = this.calculateClimbingTimeSaved(grams);
    const accelerationBenefit = this.calculateAccelerationBenefit(grams);
    
    return {
      grams: Math.round(grams),
      climbingImpact: climbingTimeSaved,
      accelerationBenefit
    };
  }
  
  /**
   * Calculate efficiency improvements
   */
  private static calculateEfficiencyGain(currentGears: any[], proposedGears: any[], rider: RiderProfile) {
    const currentAvgEff = currentGears.reduce((sum, g) => sum + g.efficiency, 0) / currentGears.length;
    const proposedAvgEff = proposedGears.reduce((sum, g) => sum + g.efficiency, 0) / proposedGears.length;
    
    const efficiencyGain = ((proposedAvgEff - currentAvgEff) / currentAvgEff) * 100;
    const powerSavings = Math.round(rider.ftp * (efficiencyGain / 100));
    
    // Calculate speed increase at same power
    const speedIncrease = this.calculateSpeedIncrease(efficiencyGain);
    
    return {
      percent: Math.round(efficiencyGain * 100) / 100,
      powerSavings: `${powerSavings} watts at threshold`,
      speedIncrease: `${speedIncrease} km/h at same effort`
    };
  }
  
  /**
   * Calculate gear range improvements
   */
  private static calculateRangeIncrease(currentGears: any[], proposedGears: any[]) {
    const currentRange = this.calculateGearRange(currentGears);
    const proposedRange = this.calculateGearRange(proposedGears);
    
    const rangeIncrease = ((proposedRange - currentRange) / currentRange) * 100;
    
    // Analyze new capabilities
    const newCapabilities = this.analyzeNewCapabilities(currentGears, proposedGears);
    const gearingAdvantage = this.analyzeGearingAdvantage(currentGears, proposedGears);
    
    return {
      percent: Math.round(rangeIncrease * 10) / 10,
      newCapabilities,
      gearingAdvantage
    };
  }
  
  /**
   * Calculate aerodynamic improvements (for aero components)
   */
  private static calculateAerodynamicGain(current: GearSetup, proposed: GearSetup) {
    // Check if upgrade includes aero components
    const hasAeroUpgrade = this.hasAeroComponents(proposed) && !this.hasAeroComponents(current);
    
    if (!hasAeroUpgrade) return null;
    
    const dragReduction = 0.05; // 5% typical aero improvement
    const powerSavingsAt40kmh = Math.round(250 * dragReduction); // Estimated power savings
    
    return {
      dragReduction: Math.round(dragReduction * 100),
      powerSavingsAt40kmh: `${powerSavingsAt40kmh} watts at 40 km/h`
    };
  }
  
  /**
   * Calculate cost analysis
   */
  private static calculateCostAnalysis(
    current: GearSetup,
    proposed: GearSetup,
    improvements: any,
    pricing?: Partial<ComponentPricing>
  ) {
    const totalCost = this.calculateUpgradeCost(current, proposed, pricing);
    
    const costPerGramSaved = improvements.weightSavings.grams > 0 ? 
      totalCost / improvements.weightSavings.grams : Infinity;
    
    const costPerWattSaved = improvements.efficiencyGain.powerSavings ? 
      totalCost / parseInt(improvements.efficiencyGain.powerSavings) : Infinity;
    
    const costPerPercentRange = improvements.rangeIncrease.percent > 0 ? 
      totalCost / improvements.rangeIncrease.percent : Infinity;
    
    return {
      totalCost: Math.round(totalCost),
      costPerGramSaved: Math.round(costPerGramSaved * 100) / 100,
      costPerWattSaved: Math.round(costPerWattSaved * 100) / 100,
      costPerPercentRange: Math.round(costPerPercentRange * 100) / 100
    };
  }
  
  /**
   * Calculate overall ROI
   */
  private static calculateROI(improvements: any, costAnalysis: any, rider: RiderProfile) {
    // Performance score (0-100)
    let performanceScore = 0;
    
    // Weight savings contribution
    if (improvements.weightSavings.grams > 0) {
      performanceScore += Math.min(30, improvements.weightSavings.grams / 10);
    }
    
    // Efficiency contribution
    if (improvements.efficiencyGain.percent > 0) {
      performanceScore += Math.min(40, improvements.efficiencyGain.percent * 10);
    }
    
    // Range contribution
    if (improvements.rangeIncrease.percent > 0) {
      performanceScore += Math.min(20, improvements.rangeIncrease.percent / 2);
    }
    
    // Aerodynamic contribution
    if (improvements.aerodynamicGain) {
      performanceScore += Math.min(10, improvements.aerodynamicGain.dragReduction);
    }
    
    // Value score (0-100) - lower cost per benefit = higher score
    let valueScore = 100;
    
    // Penalize high cost per gram
    if (costAnalysis.costPerGramSaved > 50) {
      valueScore -= Math.min(40, (costAnalysis.costPerGramSaved - 50) / 5);
    }
    
    // Penalize high total cost relative to rider level
    const maxReasonableCost = this.getMaxReasonableCost(rider);
    if (costAnalysis.totalCost > maxReasonableCost) {
      valueScore -= Math.min(30, (costAnalysis.totalCost - maxReasonableCost) / maxReasonableCost * 100);
    }
    
    // Overall ROI
    const overallRoi = (performanceScore * 0.7 + valueScore * 0.3);
    
    // Recommendation
    let recommendation: 'highly_recommended' | 'recommended' | 'marginal' | 'not_recommended';
    let reasoning: string[] = [];
    
    if (overallRoi >= 80) {
      recommendation = 'highly_recommended';
      reasoning.push('Excellent performance gains for the cost');
    } else if (overallRoi >= 60) {
      recommendation = 'recommended';
      reasoning.push('Good value upgrade with meaningful improvements');
    } else if (overallRoi >= 40) {
      recommendation = 'marginal';
      reasoning.push('Moderate improvements but high cost-to-benefit ratio');
    } else {
      recommendation = 'not_recommended';
      reasoning.push('Poor value - minimal gains for high cost');
    }
    
    // Add specific reasoning
    if (improvements.weightSavings.grams > 200) {
      reasoning.push('Significant weight savings will improve climbing performance');
    }
    if (improvements.efficiencyGain.percent > 2) {
      reasoning.push('Meaningful efficiency gains reduce power requirements');
    }
    if (costAnalysis.costPerGramSaved > 100) {
      reasoning.push('High cost per gram saved - consider alternatives');
    }
    if (improvements.rangeIncrease.percent > 15) {
      reasoning.push('Expanded gear range opens new riding possibilities');
    }
    
    return {
      performanceScore: Math.round(performanceScore),
      valueScore: Math.round(valueScore),
      overallRoi: Math.round(overallRoi),
      recommendation,
      reasoning
    };
  }
  
  /**
   * Calculate time to recoup investment
   */
  private static calculateTimeToRecoup(improvements: any, costAnalysis: any, rider: RiderProfile) {
    // Racing time savings (seconds saved per race due to improvements)
    const racingSeconds = this.calculateRacingTimeSavings(improvements, rider);
    
    // Training hours needed to justify cost (subjective value)
    const trainingHours = costAnalysis.totalCost / 10; // $10 per hour of improved training
    
    // Component longevity
    const longevityYears = this.estimateComponentLife(costAnalysis.totalCost);
    
    return {
      racingSeconds: Math.round(racingSeconds),
      trainingHours: Math.round(trainingHours),
      longevityYears: Math.round(longevityYears * 10) / 10
    };
  }
  
  /**
   * Helper methods
   */
  private static getTotalWeight(setup: GearSetup): number {
    return (setup.crankset.weight || 0) +
           (setup.cassette.weight || 0) +
           (setup.rearDerailleur.weight || 0) +
           (setup.chain.weight || 0);
  }
  
  private static calculateClimbingTimeSaved(gramsSaved: number): string {
    // Rough calculation: 100g = ~1 second per km on 8% grade
    const secondsPerKm = gramsSaved / 100;
    return `${Math.round(secondsPerKm * 10) / 10} seconds per km on 8% climbs`;
  }
  
  private static calculateAccelerationBenefit(gramsSaved: number): string {
    // Weight savings help most in accelerations
    const accelerationImprovement = gramsSaved / 1000 * 0.5; // 0.5% per kg
    return `${Math.round(accelerationImprovement * 100) / 100}% faster acceleration`;
  }
  
  private static calculateSpeedIncrease(efficiencyGainPercent: number): string {
    // Efficiency gains translate roughly to speed increases at same power
    const speedIncrease = efficiencyGainPercent * 0.3; // Conservative estimate
    return Math.round(speedIncrease * 100) / 100;
  }
  
  private static calculateGearRange(gears: any[]): number {
    const ratios = gears.map(g => g.ratio).sort((a, b) => a - b);
    return ratios[ratios.length - 1] / ratios[0];
  }
  
  private static analyzeNewCapabilities(currentGears: any[], proposedGears: any[]): string {
    const currentMin = Math.min(...currentGears.map(g => g.ratio));
    const currentMax = Math.max(...currentGears.map(g => g.ratio));
    const proposedMin = Math.min(...proposedGears.map(g => g.ratio));
    const proposedMax = Math.max(...proposedGears.map(g => g.ratio));
    
    const capabilities = [];
    
    if (proposedMin < currentMin * 0.9) {
      const gradeImprovement = Math.round((currentMin / proposedMin - 1) * 20); // Rough grade calculation
      capabilities.push(`${gradeImprovement}% steeper climbs possible`);
    }
    
    if (proposedMax > currentMax * 1.1) {
      const speedImprovement = Math.round((proposedMax / currentMax - 1) * 50); // Rough speed calculation
      capabilities.push(`${speedImprovement} km/h higher top speed`);
    }
    
    return capabilities.length > 0 ? capabilities.join(', ') : 'Maintains current capabilities';
  }
  
  private static analyzeGearingAdvantage(currentGears: any[], proposedGears: any[]): string {
    const currentSteps = this.calculateAverageStep(currentGears);
    const proposedSteps = this.calculateAverageStep(proposedGears);
    
    if (proposedSteps < currentSteps * 0.9) {
      return 'Smoother gear progression for better rhythm';
    } else if (proposedSteps > currentSteps * 1.1) {
      return 'Larger steps may require cadence adjustments';
    } else {
      return 'Similar gear progression maintained';
    }
  }
  
  private static calculateAverageStep(gears: any[]): number {
    const sortedRatios = gears.map(g => g.ratio).sort((a, b) => a - b);
    const steps = [];
    
    for (let i = 0; i < sortedRatios.length - 1; i++) {
      steps.push((sortedRatios[i + 1] - sortedRatios[i]) / sortedRatios[i] * 100);
    }
    
    return steps.reduce((sum, step) => sum + step, 0) / steps.length;
  }
  
  private static hasAeroComponents(setup: GearSetup): boolean {
    // Check for aero components (would need component database flags)
    return setup.crankset.model.toLowerCase().includes('aero') ||
           setup.rearDerailleur.model.toLowerCase().includes('aero');
  }
  
  private static calculateUpgradeCost(
    current: GearSetup,
    proposed: GearSetup,
    pricing?: Partial<ComponentPricing>
  ): number {
    let totalCost = 0;
    
    // Check each component for differences
    if (current.crankset.id !== proposed.crankset.id) {
      totalCost += pricing?.msrp || proposed.crankset.msrp || 0;
    }
    if (current.cassette.id !== proposed.cassette.id) {
      totalCost += pricing?.msrp || proposed.cassette.msrp || 0;
    }
    if (current.rearDerailleur.id !== proposed.rearDerailleur.id) {
      totalCost += pricing?.msrp || proposed.rearDerailleur.msrp || 0;
    }
    if (current.chain.id !== proposed.chain.id) {
      totalCost += pricing?.msrp || proposed.chain.msrp || 0;
    }
    
    return totalCost;
  }
  
  private static getMaxReasonableCost(rider: RiderProfile): number {
    // Suggested max cost based on rider level
    const maxCosts = {
      beginner: 500,
      intermediate: 1500,
      advanced: 3000,
      pro: 8000
    };
    
    return maxCosts[rider.experienceLevel];
  }
  
  private static calculateRacingTimeSavings(improvements: any, rider: RiderProfile): number {
    // Estimate time savings in a typical race/ride
    let timeSavings = 0;
    
    // Weight savings (mainly on climbs - assume 20% of race is climbing)
    if (improvements.weightSavings.grams > 0) {
      timeSavings += improvements.weightSavings.grams / 100 * 0.2 * 60; // seconds per hour
    }
    
    // Efficiency gains (throughout entire race)
    if (improvements.efficiencyGain.percent > 0) {
      timeSavings += improvements.efficiencyGain.percent * 3.6; // seconds per hour
    }
    
    // Aerodynamic gains (assume 60% of race at speed)
    if (improvements.aerodynamicGain) {
      timeSavings += improvements.aerodynamicGain.dragReduction * 0.6 * 18; // seconds per hour
    }
    
    return timeSavings;
  }
  
  private static estimateComponentLife(totalCost: number): number {
    // Higher cost components typically last longer
    const basLife = 3; // years
    const costFactor = Math.log(totalCost / 500 + 1) * 0.5; // Logarithmic relationship
    return Math.min(8, basLife + costFactor);
  }
  
  private static getMockGears(setup: GearSetup): any[] {
    // Mock implementation - in real app, use actual gear calculator
    const gears = [];
    setup.crankset.chainrings.forEach(chainring => {
      setup.cassette.cogs.forEach(cog => {
        gears.push({
          chainring,
          cog,
          ratio: chainring / cog,
          efficiency: 0.97 - Math.abs(chainring - 40) * 0.001 - Math.abs(cog - 16) * 0.001
        });
      });
    });
    return gears;
  }
  
  private static getDefaultConditions(): RideConditions {
    return {
      grade: 0,
      windSpeed: 0,
      temperature: 20,
      altitude: 0,
      roadSurface: 'smooth'
    };
  }
}

/**
 * Quick ROI comparison for multiple upgrade options
 */
export class UpgradeComparator {
  
  static compareUpgrades(
    currentSetup: GearSetup,
    upgradeOptions: Array<{ name: string; setup: GearSetup; cost?: number }>,
    rider: RiderProfile
  ) {
    const comparisons = upgradeOptions.map(option => {
      const analysis = UpgradeROICalculator.analyzeUpgrade(
        currentSetup,
        option.setup,
        rider
      );
      
      return {
        name: option.name,
        analysis,
        summary: {
          cost: analysis.costAnalysis.totalCost,
          performanceGain: analysis.roi.performanceScore,
          roi: analysis.roi.overallRoi,
          recommendation: analysis.roi.recommendation
        }
      };
    });
    
    // Sort by ROI score
    return comparisons.sort((a, b) => b.summary.roi - a.summary.roi);
  }
  
  /**
   * Find the best value upgrade within a budget
   */
  static findBestValueUpgrade(
    currentSetup: GearSetup,
    upgradeOptions: Array<{ name: string; setup: GearSetup }>,
    rider: RiderProfile,
    maxBudget: number
  ) {
    const comparisons = this.compareUpgrades(currentSetup, upgradeOptions, rider);
    
    const affordableOptions = comparisons.filter(comp => 
      comp.summary.cost <= maxBudget
    );
    
    if (affordableOptions.length === 0) {
      return null;
    }
    
    // Return highest ROI within budget
    return affordableOptions[0];
  }
}

// Export types for use in components
export type { ComponentPricing, UpgradeAnalysis };