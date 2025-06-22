// app/lib/performancePredictionEngine.ts
import { GearCalculation } from '../types/components';
import { GearSetup } from './gearCalculator';

export interface RiderProfile {
  weight: number; // kg
  height: number; // cm
  ftp: number; // watts
  preferredCadence: number; // rpm
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
}

export interface RideConditions {
  grade: number; // percentage
  windSpeed: number; // km/h (positive = headwind)
  temperature: number; // celsius
  altitude: number; // meters
  roadSurface: 'smooth' | 'rough' | 'gravel' | 'dirt';
}

export interface PerformancePrediction {
  powerRequirements: {
    sustainedSpeed: number; // km/h
    powerNeeded: number; // watts
    cadence: number; // rpm
    efficiency: number; // 0-1
  };
  climbingAbility: {
    gradeAtFTP: number; // max grade at FTP
    speedAt10Percent: number; // speed at 10% grade
    timeFor1000mClimb: number; // seconds
  };
  optimalCadenceZones: {
    endurance: { min: number; max: number; gear: GearCalculation };
    tempo: { min: number; max: number; gear: GearCalculation };
    threshold: { min: number; max: number; gear: GearCalculation };
    vo2max: { min: number; max: number; gear: GearCalculation };
  };
  fatigueAnalysis: {
    gearEffortScore: number; // 0-100
    stepConsistency: number; // 0-100
    crossChainPenalty: number; // 0-100
    muscularStrain: 'low' | 'moderate' | 'high';
  };
}

export class PerformancePredictionEngine {
  
  /**
   * Main prediction function that combines all performance metrics
   */
  static predictPerformance(
    setup: GearSetup,
    gears: GearCalculation[],
    rider: RiderProfile,
    conditions: RideConditions = this.getDefaultConditions()
  ): PerformancePrediction {
    
    const powerRequirements = this.calculatePowerRequirements(gears, rider, conditions);
    const climbingAbility = this.predictClimbingSpeed(gears, rider, conditions);
    const optimalCadenceZones = this.findEfficiencySweetSpots(gears, rider);
    const fatigueAnalysis = this.estimateEnduranceImpact(gears, setup);
    
    return {
      powerRequirements,
      climbingAbility,
      optimalCadenceZones,
      fatigueAnalysis
    };
  }
  
  /**
   * Calculate power requirements for sustained speeds
   */
  private static calculatePowerRequirements(
    gears: GearCalculation[],
    rider: RiderProfile,
    conditions: RideConditions
  ) {
    // Find optimal gear for rider's preferred cadence at threshold power
    const targetSpeed = this.calculateSpeedFromPower(rider.ftp, rider.weight, conditions);
    const optimalGear = this.findOptimalGearForSpeed(gears, targetSpeed, rider.preferredCadence);
    
    if (!optimalGear) {
      throw new Error('No suitable gear found for rider profile');
    }
    
    // Calculate actual power needed with this gear
    const actualSpeed = optimalGear.speedAtCadence.rpm90; // Use 90 RPM as base
    const powerNeeded = this.calculatePowerForSpeed(actualSpeed, rider.weight, conditions);
    
    // Adjust for gear efficiency
    const adjustedPower = powerNeeded / optimalGear.efficiency;
    
    return {
      sustainedSpeed: actualSpeed,
      powerNeeded: Math.round(adjustedPower),
      cadence: rider.preferredCadence,
      efficiency: optimalGear.efficiency
    };
  }
  
  /**
   * Predict climbing performance at various grades
   */
  private static predictClimbingSpeed(
    gears: GearCalculation[],
    rider: RiderProfile,
    conditions: RideConditions
  ) {
    // Find lowest gear for climbing
    const climbingGear = gears
      .filter(g => g.efficiency > 0.95) // Only efficient gears
      .sort((a, b) => a.ratio - b.ratio)[0]; // Lowest ratio = easiest gear
    
    if (!climbingGear) {
      throw new Error('No suitable climbing gear found');
    }
    
    // Calculate max grade at FTP
    const gradeAtFTP = this.calculateMaxGrade(rider.ftp, rider.weight, climbingGear);
    
    // Speed at 10% grade using 80% of FTP (sustainable climbing power)
    const climbingPower = rider.ftp * 0.8;
    const speedAt10Percent = this.calculateClimbingSpeed(climbingPower, rider.weight, 10, climbingGear);
    
    // Time for 1000m elevation gain (assuming 8% average grade)
    const avgClimbingSpeed = this.calculateClimbingSpeed(climbingPower, rider.weight, 8, climbingGear);
    const distanceFor1000m = 1000 / Math.sin(Math.atan(8/100)); // meters
    const timeFor1000mClimb = (distanceFor1000m / 1000) / avgClimbingSpeed * 3600; // seconds
    
    return {
      gradeAtFTP: Math.round(gradeAtFTP * 10) / 10,
      speedAt10Percent: Math.round(speedAt10Percent * 10) / 10,
      timeFor1000mClimb: Math.round(timeFor1000mClimb)
    };
  }
  
  /**
   * Find optimal cadence zones for different power levels
   */
  private static findEfficiencySweetSpots(
    gears: GearCalculation[],
    rider: RiderProfile
  ) {
    const powerZones = {
      endurance: rider.ftp * 0.7,   // 70% FTP
      tempo: rider.ftp * 0.85,      // 85% FTP  
      threshold: rider.ftp * 0.95,  // 95% FTP
      vo2max: rider.ftp * 1.15      // 115% FTP
    };
    
    const result: any = {};
    
    Object.entries(powerZones).forEach(([zone, power]) => {
      // Find speed range for this power level
      const targetSpeed = this.calculateSpeedFromPower(power, rider.weight);
      
      // Find best gear for this speed
      const optimalGear = this.findOptimalGearForSpeed(gears, targetSpeed, rider.preferredCadence);
      
      if (optimalGear) {
        // Calculate optimal cadence range for this gear/power
        const cadenceRange = this.calculateOptimalCadenceRange(optimalGear, power, rider);
        
        result[zone] = {
          min: cadenceRange.min,
          max: cadenceRange.max,
          gear: optimalGear
        };
      }
    });
    
    return result;
  }
  
  /**
   * Estimate fatigue and endurance impact of gear selection
   */
  private static estimateEnduranceImpact(gears: GearCalculation[], setup: GearSetup) {
    // Calculate gear effort score (based on step sizes)
    const steps = this.calculateGearSteps(gears);
    const avgStep = steps.reduce((sum, step) => sum + step, 0) / steps.length;
    const maxStep = Math.max(...steps);
    
    // Penalize large steps (harder to maintain rhythm)
    const gearEffortScore = Math.max(0, 100 - (avgStep - 12) * 5 - (maxStep - 18) * 3);
    
    // Step consistency (how even the steps are)
    const stepVariation = this.calculateStepVariation(steps);
    const stepConsistency = Math.max(0, 100 - stepVariation * 8);
    
    // Cross-chain penalty
    const crossChainGears = gears.filter(g => g.efficiency < 0.96);
    const crossChainPenalty = Math.max(0, 100 - (crossChainGears.length / gears.length) * 100);
    
    // Determine muscular strain
    let muscularStrain: 'low' | 'moderate' | 'high' = 'low';
    if (maxStep > 20 || avgStep > 16) muscularStrain = 'high';
    else if (maxStep > 15 || avgStep > 13) muscularStrain = 'moderate';
    
    return {
      gearEffortScore: Math.round(gearEffortScore),
      stepConsistency: Math.round(stepConsistency),
      crossChainPenalty: Math.round(crossChainPenalty),
      muscularStrain
    };
  }
  
  /**
   * Calculate power required for a given speed
   */
  private static calculatePowerForSpeed(
    speedKmh: number,
    weightKg: number,
    conditions: RideConditions = this.getDefaultConditions()
  ): number {
    const speedMs = speedKmh / 3.6;
    const gravity = 9.81;
    const crr = this.getRollingResistance(conditions.roadSurface);
    const dragArea = 0.4; // Typical CdA for road cyclist
    const airDensity = this.getAirDensity(conditions.temperature, conditions.altitude);
    const windSpeedMs = conditions.windSpeed / 3.6;
    
    // Power components
    const rollingPower = crr * weightKg * gravity * Math.cos(Math.atan(conditions.grade/100)) * speedMs;
    const climbingPower = weightKg * gravity * Math.sin(Math.atan(conditions.grade/100)) * speedMs;
    const airPower = 0.5 * airDensity * dragArea * Math.pow(speedMs + windSpeedMs, 3);
    
    return rollingPower + climbingPower + airPower;
  }
  
  /**
   * Calculate speed achievable with given power
   */
  private static calculateSpeedFromPower(
    powerWatts: number,
    weightKg: number,
    conditions: RideConditions = this.getDefaultConditions()
  ): number {
    // Iterative solution to find speed for given power
    let speed = 30; // Start with 30 km/h guess
    let iterations = 0;
    
    while (iterations < 20) {
      const calculatedPower = this.calculatePowerForSpeed(speed, weightKg, conditions);
      const error = calculatedPower - powerWatts;
      
      if (Math.abs(error) < 1) break; // Close enough
      
      // Adjust speed based on error
      speed -= error * 0.01; // Simple adjustment factor
      speed = Math.max(5, Math.min(80, speed)); // Keep reasonable bounds
      iterations++;
    }
    
    return speed;
  }
  
  /**
   * Find optimal gear for target speed and cadence
   */
  private static findOptimalGearForSpeed(
    gears: GearCalculation[],
    targetSpeedKmh: number,
    preferredCadence: number
  ): GearCalculation | null {
    const targetSpeedMph = targetSpeedKmh * 0.621371;
    
    // Find gear with speed closest to target at preferred cadence
    let bestGear: GearCalculation | null = null;
    let smallestDiff = Infinity;
    
    gears.forEach(gear => {
      if (gear.efficiency < 0.95) return; // Only consider efficient gears
      
      // Interpolate speed at preferred cadence
      const gearSpeed = this.interpolateSpeedAtCadence(gear, preferredCadence);
      const diff = Math.abs(gearSpeed - targetSpeedMph);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestGear = gear;
      }
    });
    
    return bestGear;
  }
  
  /**
   * Interpolate speed at any cadence
   */
  private static interpolateSpeedAtCadence(gear: GearCalculation, cadence: number): number {
    const speeds = gear.speedAtCadence;
    
    if (cadence <= 60) return speeds.rpm60;
    if (cadence <= 80) return this.linearInterpolate(60, 80, speeds.rpm60, speeds.rpm80, cadence);
    if (cadence <= 90) return this.linearInterpolate(80, 90, speeds.rpm80, speeds.rpm90, cadence);
    if (cadence <= 100) return this.linearInterpolate(90, 100, speeds.rpm90, speeds.rpm100, cadence);
    if (cadence <= 120) return this.linearInterpolate(100, 120, speeds.rpm100, speeds.rpm120, cadence);
    
    // Extrapolate beyond 120
    const slope = (speeds.rpm120 - speeds.rpm100) / 20;
    return speeds.rpm120 + slope * (cadence - 120);
  }
  
  /**
   * Helper functions
   */
  private static linearInterpolate(x1: number, x2: number, y1: number, y2: number, x: number): number {
    return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
  }
  
  private static calculateGearSteps(gears: GearCalculation[]): number[] {
    const sortedGears = [...gears].sort((a, b) => a.ratio - b.ratio);
    const steps: number[] = [];
    
    for (let i = 0; i < sortedGears.length - 1; i++) {
      const step = ((sortedGears[i + 1].ratio - sortedGears[i].ratio) / sortedGears[i].ratio) * 100;
      steps.push(step);
    }
    
    return steps;
  }
  
  private static calculateStepVariation(steps: number[]): number {
    const avg = steps.reduce((sum, step) => sum + step, 0) / steps.length;
    const variance = steps.reduce((sum, step) => sum + Math.pow(step - avg, 2), 0) / steps.length;
    return Math.sqrt(variance);
  }
  
  private static calculateMaxGrade(powerWatts: number, weightKg: number, gear: GearCalculation): number {
    // Simplified calculation for max sustainable grade
    const speedKmh = gear.speedAtCadence.rpm80 * 1.60934; // Convert mph to kmh
    const speedMs = speedKmh / 3.6;
    
    // At max grade, most power goes to climbing
    const availablePower = powerWatts * gear.efficiency;
    const gravity = 9.81;
    
    // Simplified: ignore air resistance at low climbing speeds
    const maxGradeRadians = Math.asin(Math.min(1, availablePower / (weightKg * gravity * speedMs)));
    return Math.tan(maxGradeRadians) * 100;
  }
  
  private static calculateClimbingSpeed(
    powerWatts: number,
    weightKg: number,
    gradePercent: number,
    gear: GearCalculation
  ): number {
    const gravity = 9.81;
    const availablePower = powerWatts * gear.efficiency;
    const gradeRadians = Math.atan(gradePercent / 100);
    
    // Simplified climbing speed (ignoring air resistance)
    const speedMs = availablePower / (weightKg * gravity * Math.sin(gradeRadians));
    return speedMs * 3.6; // Convert to km/h
  }
  
  private static calculateOptimalCadenceRange(
    gear: GearCalculation,
    powerWatts: number,
    rider: RiderProfile
  ): { min: number; max: number } {
    // Based on typical cadence efficiency curves
    const baseCadence = rider.preferredCadence;
    const powerFactor = powerWatts / rider.ftp;
    
    // Higher power = slightly higher optimal cadence
    const optimalCadence = baseCadence + (powerFactor - 1) * 5;
    
    return {
      min: Math.round(optimalCadence - 8),
      max: Math.round(optimalCadence + 8)
    };
  }
  
  private static getRollingResistance(surface: string): number {
    const coefficients = {
      smooth: 0.004,
      rough: 0.006,
      gravel: 0.012,
      dirt: 0.020
    };
    return coefficients[surface as keyof typeof coefficients] || 0.005;
  }
  
  private static getAirDensity(tempCelsius: number, altitudeMeters: number): number {
    const seaLevelDensity = 1.225; // kg/m³
    const tempKelvin = tempCelsius + 273.15;
    const pressureRatio = Math.pow(1 - 0.0065 * altitudeMeters / 288.15, 5.255);
    const tempRatio = 288.15 / tempKelvin;
    
    return seaLevelDensity * pressureRatio * tempRatio;
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