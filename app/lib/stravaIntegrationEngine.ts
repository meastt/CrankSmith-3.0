// app/lib/stravaIntegrationEngine.ts
import { GearCalculation } from '../types/components';
import { GearSetup } from './gearCalculator';

export interface StravaActivity {
  id: string;
  name: string;
  type: 'Ride' | 'VirtualRide';
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  average_speed: number; // m/s
  max_speed: number; // m/s
  average_cadence?: number; // rpm
  average_power?: number; // watts
  max_power?: number; // watts
  average_heartrate?: number; // bpm
  start_date: string; // ISO date
  gear_id?: string; // Strava gear ID
  device_name?: string;
  segments?: StravaSegment[];
}

export interface StravaSegment {
  id: string;
  name: string;
  distance: number; // meters
  average_grade: number; // percentage
  maximum_grade: number; // percentage
  elevation_high: number; // meters
  elevation_low: number; // meters
  elapsed_time: number; // seconds for this attempt
  average_speed: number; // m/s
  average_power?: number; // watts
  average_cadence?: number; // rpm
}

export interface GearUsageHeatmap {
  [gearRatio: string]: {
    ratio: number;
    timeUsed: number; // seconds
    distanceUsed: number; // meters
    frequency: number; // 0-1 percentage
    conditions: {
      averageGrade: number;
      averageSpeed: number; // km/h
      averagePower?: number;
      averageCadence?: number;
    };
  };
}

export interface StravaAnalysisResult {
  gearUsageHeatmap: GearUsageHeatmap;
  missingGears: Array<{
    targetRatio: number;
    frequency: number;
    conditions: string;
    suggestedGear: string;
  }>;
  overUnderGeared: {
    undergeared: Array<{
      activity: string;
      segment: string;
      issue: string;
      suggestedRatio: number;
    }>;
    overgeared: Array<{
      activity: string;
      segment: string;
      issue: string;
      suggestedRatio: number;
    }>;
  };
  optimalSetup: {
    recommendedChanges: string[];
    newSetupSuggestion?: GearSetup;
    reasoning: string[];
    expectedImprovement: string;
  };
  ridingProfile: {
    preferredCadence: number;
    powerZones: {
      endurance: { min: number; max: number };
      tempo: { min: number; max: number };
      threshold: { min: number; max: number };
    };
    terrainPreference: {
      flat: number; // percentage
      rolling: number;
      climbing: number;
    };
    speedProfile: {
      averageSpeed: number; // km/h
      maxSustainedSpeed: number;
      climbingSpeed: number;
    };
  };
}

export class StravaIntegrationEngine {
  
  /**
   * Main analysis function that processes Strava activities
   */
  static async analyzeStravaData(
    activities: StravaActivity[],
    currentSetup: GearSetup,
    currentGears: GearCalculation[]
  ): Promise<StravaAnalysisResult> {
    
    // Build riding profile from activities
    const ridingProfile = this.buildRidingProfile(activities);
    
    // Analyze gear usage patterns
    const gearUsageHeatmap = this.calculateGearFrequency(activities, currentGears);
    
    // Identify missing gears and problem areas
    const missingGears = this.identifyGapsInUsage(activities, currentGears, gearUsageHeatmap);
    const overUnderGeared = this.analyzeStrugglePoints(activities, currentGears);
    
    // Generate optimal setup recommendation
    const optimalSetup = this.recommendBasedOnHistory(
      activities,
      currentSetup,
      currentGears,
      ridingProfile
    );
    
    return {
      gearUsageHeatmap,
      missingGears,
      overUnderGeared,
      optimalSetup,
      ridingProfile
    };
  }
  
  /**
   * Calculate how frequently each gear is used
   */
  private static calculateGearFrequency(
    activities: StravaActivity[],
    availableGears: GearCalculation[]
  ): GearUsageHeatmap {
    const heatmap: GearUsageHeatmap = {};
    
    // Initialize heatmap with available gears
    availableGears.forEach(gear => {
      const key = `${gear.chainring}x${gear.cog}`;
      heatmap[key] = {
        ratio: gear.ratio,
        timeUsed: 0,
        distanceUsed: 0,
        frequency: 0,
        conditions: {
          averageGrade: 0,
          averageSpeed: 0,
          averagePower: 0,
          averageCadence: 0
        }
      };
    });
    
    let totalTime = 0;
    let totalDistance = 0;
    
    // Analyze each activity
    activities.forEach(activity => {
      if (!activity.average_cadence) return; // Skip activities without cadence data
      
      totalTime += activity.moving_time;
      totalDistance += activity.distance;
      
      // Estimate gear usage based on speed and cadence
      const estimatedGear = this.estimateGearFromSpeedCadence(
        activity.average_speed * 3.6, // Convert to km/h
        activity.average_cadence,
        availableGears
      );
      
      if (estimatedGear) {
        const key = `${estimatedGear.chainring}x${estimatedGear.cog}`;
        if (heatmap[key]) {
          heatmap[key].timeUsed += activity.moving_time;
          heatmap[key].distanceUsed += activity.distance;
          
          // Update running averages
          const existing = heatmap[key];
          const newWeight = activity.moving_time;
          const totalWeight = existing.timeUsed;
          
          existing.conditions.averageGrade = this.updateRunningAverage(
            existing.conditions.averageGrade,
            this.estimateAverageGrade(activity),
            totalWeight - newWeight,
            newWeight
          );
          
          existing.conditions.averageSpeed = this.updateRunningAverage(
            existing.conditions.averageSpeed,
            activity.average_speed * 3.6,
            totalWeight - newWeight,
            newWeight
          );
          
          if (activity.average_power) {
            existing.conditions.averagePower = this.updateRunningAverage(
              existing.conditions.averagePower || 0,
              activity.average_power,
              totalWeight - newWeight,
              newWeight
            );
          }
          
          existing.conditions.averageCadence = this.updateRunningAverage(
            existing.conditions.averageCadence,
            activity.average_cadence,
            totalWeight - newWeight,
            newWeight
          );
        }
      }
    });
    
    // Calculate frequencies
    Object.values(heatmap).forEach(gear => {
      gear.frequency = gear.timeUsed / totalTime;
    });
    
    return heatmap;
  }
  
  /**
   * Identify gaps in gear coverage
   */
  private static identifyGapsInUsage(
    activities: StravaActivity[],
    availableGears: GearCalculation[],
    heatmap: GearUsageHeatmap
  ): StravaAnalysisResult['missingGears'] {
    const missingGears: StravaAnalysisResult['missingGears'] = [];
    
    // Find speed/cadence combinations that don't map well to available gears
    const speedCadencePairs = this.extractSpeedCadencePairs(activities);
    
    speedCadencePairs.forEach(pair => {
      const idealRatio = this.calculateIdealRatio(pair.speed, pair.cadence);
      const closestGear = this.findClosestGear(idealRatio, availableGears);
      
      if (closestGear) {
        const ratioError = Math.abs(closestGear.ratio - idealRatio) / idealRatio;
        
        // If the error is significant and this speed/cadence is common
        if (ratioError > 0.1 && pair.frequency > 0.05) {
          missingGears.push({
            targetRatio: idealRatio,
            frequency: pair.frequency,
            conditions: `${pair.speed.toFixed(1)} km/h at ${pair.cadence} RPM`,
            suggestedGear: this.suggestGearForRatio(idealRatio)
          });
        }
      }
    });
    
    return missingGears.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  }
  
  /**
   * Analyze where rider struggles due to gearing
   */
  private static analyzeStrugglePoints(
    activities: StravaActivity[],
    availableGears: GearCalculation[]
  ): StravaAnalysisResult['overUnderGeared'] {
    const undergeared: StravaAnalysisResult['overUnderGeared']['undergeared'] = [];
    const overgeared: StravaAnalysisResult['overUnderGeared']['overgeared'] = [];
    
    activities.forEach(activity => {
      if (!activity.segments || !activity.average_cadence) return;
      
      activity.segments.forEach(segment => {
        const segmentSpeed = segment.average_speed * 3.6; // km/h
        const segmentCadence = segment.average_cadence || activity.average_cadence;
        
        // Check for spinning out (too easy gearing)
        if (segmentCadence > 110 && segment.average_grade < 2) {
          const suggestedRatio = this.calculateIdealRatio(segmentSpeed, 95); // Target 95 RPM
          overgeared.push({
            activity: activity.name,
            segment: segment.name,
            issue: `Spinning out at ${segmentCadence} RPM on ${segment.average_grade.toFixed(1)}% grade`,
            suggestedRatio
          });
        }
        
        // Check for grinding (too hard gearing)
        if (segmentCadence < 70 && segment.average_grade > 5) {
          const suggestedRatio = this.calculateIdealRatio(segmentSpeed, 85); // Target 85 RPM
          undergeared.push({
            activity: activity.name,
            segment: segment.name,
            issue: `Grinding at ${segmentCadence} RPM on ${segment.average_grade.toFixed(1)}% grade`,
            suggestedRatio
          });
        }
      });
    });
    
    return {
      undergeared: undergeared.slice(0, 10),
      overgeared: overgeared.slice(0, 10)
    };
  }
  
  /**
   * Recommend optimal setup based on riding history
   */
  private static recommendBasedOnHistory(
    activities: StravaActivity[],
    currentSetup: GearSetup,
    currentGears: GearCalculation[],
    ridingProfile: StravaAnalysisResult['ridingProfile']
  ): StravaAnalysisResult['optimalSetup'] {
    const recommendations: string[] = [];
    const reasoning: string[] = [];
    
    // Analyze terrain preference
    if (ridingProfile.terrainPreference.climbing > 30) {
      recommendations.push('Consider wider range cassette for climbing');
      reasoning.push('30%+ of riding involves significant climbing');
    }
    
    if (ridingProfile.terrainPreference.flat > 60) {
      recommendations.push('Consider closer ratio cassette for flat terrain');
      reasoning.push('Majority of riding is on flat terrain');
    }
    
    // Analyze cadence preference
    if (ridingProfile.preferredCadence > 95) {
      recommendations.push('Consider slightly easier gearing for preferred higher cadence');
      reasoning.push(`Preferred cadence of ${ridingProfile.preferredCadence} RPM is higher than average`);
    } else if (ridingProfile.preferredCadence < 80) {
      recommendations.push('Consider slightly harder gearing for preferred lower cadence');
      reasoning.push(`Preferred cadence of ${ridingProfile.preferredCadence} RPM is lower than average`);
    }
    
    // Speed analysis
    if (ridingProfile.speedProfile.maxSustainedSpeed > 45) {
      recommendations.push('Consider taller gearing for high-speed capability');
      reasoning.push(`Max sustained speed of ${ridingProfile.speedProfile.maxSustainedSpeed} km/h indicates strong rider`);
    }
    
    const expectedImprovement = this.calculateExpectedImprovement(recommendations);
    
    return {
      recommendedChanges: recommendations,
      reasoning,
      expectedImprovement
    };
  }
  
  /**
   * Build rider profile from activities
   */
  private static buildRidingProfile(activities: StravaActivity[]): StravaAnalysisResult['ridingProfile'] {
    let totalCadence = 0;
    let cadenceCount = 0;
    let totalPower = 0;
    let powerCount = 0;
    let totalTime = 0;
    let climbingTime = 0;
    let flatTime = 0;
    let rollingTime = 0;
    let totalSpeed = 0;
    let maxSustained = 0;
    let climbingSpeeds: number[] = [];
    
    activities.forEach(activity => {
      totalTime += activity.moving_time;
      totalSpeed += activity.average_speed * 3.6 * activity.moving_time;
      
      if (activity.average_cadence) {
        totalCadence += activity.average_cadence * activity.moving_time;
        cadenceCount += activity.moving_time;
      }
      
      if (activity.average_power) {
        totalPower += activity.average_power * activity.moving_time;
        powerCount += activity.moving_time;
      }
      
      // Categorize terrain
      const avgGrade = this.estimateAverageGrade(activity);
      if (avgGrade > 3) {
        climbingTime += activity.moving_time;
        climbingSpeeds.push(activity.average_speed * 3.6);
      } else if (avgGrade > 1) {
        rollingTime += activity.moving_time;
      } else {
        flatTime += activity.moving_time;
      }
      
      // Track max sustained speed (average speed for rides > 30 km)
      if (activity.distance > 30000) {
        maxSustained = Math.max(maxSustained, activity.average_speed * 3.6);
      }
    });
    
    const preferredCadence = cadenceCount > 0 ? totalCadence / cadenceCount : 90;
    const avgPower = powerCount > 0 ? totalPower / powerCount : 200;
    const averageSpeed = totalSpeed / totalTime;
    const climbingSpeed = climbingSpeeds.length > 0 ? 
      climbingSpeeds.reduce((sum, speed) => sum + speed, 0) / climbingSpeeds.length : 0;
    
    return {
      preferredCadence: Math.round(preferredCadence),
      powerZones: {
        endurance: { min: Math.round(avgPower * 0.6), max: Math.round(avgPower * 0.75) },
        tempo: { min: Math.round(avgPower * 0.76), max: Math.round(avgPower * 0.90) },
        threshold: { min: Math.round(avgPower * 0.91), max: Math.round(avgPower * 1.05) }
      },
      terrainPreference: {
        flat: Math.round(flatTime / totalTime * 100),
        rolling: Math.round(rollingTime / totalTime * 100),
        climbing: Math.round(climbingTime / totalTime * 100)
      },
      speedProfile: {
        averageSpeed: Math.round(averageSpeed * 10) / 10,
        maxSustainedSpeed: Math.round(maxSustained * 10) / 10,
        climbingSpeed: Math.round(climbingSpeed * 10) / 10
      }
    };
  }
  
  /**
   * Helper methods
   */
  private static estimateGearFromSpeedCadence(
    speedKmh: number,
    cadence: number,
    availableGears: GearCalculation[]
  ): GearCalculation | null {
    const idealRatio = this.calculateIdealRatio(speedKmh, cadence);
    return this.findClosestGear(idealRatio, availableGears);
  }
  
  private static calculateIdealRatio(speedKmh: number, cadence: number): number {
    // Assuming 700x25c wheel (2111mm circumference)
    const wheelCircumference = 2111; // mm
    const speedMs = speedKmh / 3.6;
    const wheelRpm = (speedMs * 60) / (wheelCircumference / 1000);
    return wheelRpm / cadence;
  }
  
  private static findClosestGear(targetRatio: number, gears: GearCalculation[]): GearCalculation | null {
    if (gears.length === 0) return null;
    
    return gears.reduce((closest, gear) => {
      const currentDiff = Math.abs(gear.ratio - targetRatio);
      const closestDiff = Math.abs(closest.ratio - targetRatio);
      return currentDiff < closestDiff ? gear : closest;
    });
  }
  
  private static estimateAverageGrade(activity: StravaActivity): number {
    // Rough estimate based on elevation gain and distance
    if (activity.distance === 0) return 0;
    return (activity.total_elevation_gain / activity.distance) * 100;
  }
  
  private static extractSpeedCadencePairs(activities: StravaActivity[]): Array<{
    speed: number;
    cadence: number;
    frequency: number;
  }> {
    const pairs = new Map<string, { speed: number; cadence: number; time: number }>();
    let totalTime = 0;
    
    activities.forEach(activity => {
      if (!activity.average_cadence) return;
      
      const speed = Math.round(activity.average_speed * 3.6);
      const cadence = Math.round(activity.average_cadence / 5) * 5; // Round to nearest 5
      const key = `${speed}-${cadence}`;
      
      if (pairs.has(key)) {
        pairs.get(key)!.time += activity.moving_time;
      } else {
        pairs.set(key, { speed, cadence, time: activity.moving_time });
      }
      
      totalTime += activity.moving_time;
    });
    
    return Array.from(pairs.values()).map(pair => ({
      speed: pair.speed,
      cadence: pair.cadence,
      frequency: pair.time / totalTime
    }));
  }
  
  private static suggestGearForRatio(targetRatio: number): string {
    // Common chainring/cog combinations
    const commonCombos = [
      { chainring: 50, cog: 11 }, { chainring: 50, cog: 12 }, { chainring: 50, cog: 13 },
      { chainring: 50, cog: 14 }, { chainring: 50, cog: 15 }, { chainring: 50, cog: 16 },
      { chainring: 34, cog: 11 }, { chainring: 34, cog: 12 }, { chainring: 34, cog: 13 },
      { chainring: 34, cog: 15 }, { chainring: 34, cog: 17 }, { chainring: 34, cog: 19 },
      { chainring: 34, cog: 21 }, { chainring: 34, cog: 24 }, { chainring: 34, cog: 28 },
      { chainring: 32, cog: 10 }, { chainring: 32, cog: 12 }, { chainring: 32, cog: 14 },
      { chainring: 32, cog: 16 }, { chainring: 32, cog: 18 }, { chainring: 32, cog: 21 },
      { chainring: 32, cog: 24 }, { chainring: 32, cog: 28 }, { chainring: 32, cog: 32 },
      { chainring: 32, cog: 36 }, { chainring: 32, cog: 42 }, { chainring: 32, cog: 50 }
    ];
    
    let closestCombo = commonCombos[0];
    let smallestDiff = Math.abs(closestCombo.chainring / closestCombo.cog - targetRatio);
    
    commonCombos.forEach(combo => {
      const ratio = combo.chainring / combo.cog;
      const diff = Math.abs(ratio - targetRatio);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestCombo = combo;
      }
    });
    
    return `${closestCombo.chainring}T × ${closestCombo.cog}T (${(closestCombo.chainring / closestCombo.cog).toFixed(2)} ratio)`;
  }
  
  private static updateRunningAverage(
    currentAvg: number,
    newValue: number,
    currentWeight: number,
    newWeight: number
  ): number {
    if (currentWeight === 0) return newValue;
    return (currentAvg * currentWeight + newValue * newWeight) / (currentWeight + newWeight);
  }
  
  private static calculateExpectedImprovement(recommendations: string[]): string {
    const improvements = [];
    
    if (recommendations.some(r => r.includes('range'))) {
      improvements.push('expanded gear range');
    }
    if (recommendations.some(r => r.includes('cadence'))) {
      improvements.push('better cadence optimization');
    }
    if (recommendations.some(r => r.includes('climbing'))) {
      improvements.push('improved climbing performance');
    }
    if (recommendations.some(r => r.includes('flat'))) {
      improvements.push('optimized flat terrain efficiency');
    }
    
    if (improvements.length === 0) {
      return 'Current setup appears well-matched to your riding style';
    }
    
    return `Expected improvements: ${improvements.join(', ')}`;
  }
}

/**
 * Strava API Integration Helper
 */
export class StravaAPIClient {
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  
  /**
   * Fetch recent activities from Strava
   */
  async getRecentActivities(limit: number = 30): Promise<StravaActivity[]> {
    try {
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${limit}&page=1`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`);
      }
      
      const activities = await response.json();
      return activities.filter((activity: any) => activity.type === 'Ride');
    } catch (error) {
      console.error('Error fetching Strava activities:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed activity with segments
   */
  async getActivityDetails(activityId: string): Promise<StravaActivity> {
    try {
      const response = await fetch(
        `https://www.strava.com/api/v3/activities/${activityId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching activity details:', error);
      throw error;
    }
  }
  
  /**
   * Get athlete profile information
   */
  async getAthleteProfile(): Promise<{
    id: number;
    firstname: string;
    lastname: string;
    weight?: number; // kg
    ftp?: number; // watts
  }> {
    try {
      const response = await fetch(
        'https://www.strava.com/api/v3/athlete',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching athlete profile:', error);
      throw error;
    }
  }
}

/**
 * Mock Strava data for testing
 */
export class MockStravaData {
  static generateMockActivities(): StravaActivity[] {
    return [
      {
        id: '1',
        name: 'Morning Ride',
        type: 'Ride',
        distance: 45000, // 45km
        moving_time: 5400, // 1.5 hours
        elapsed_time: 6000,
        total_elevation_gain: 600,
        average_speed: 8.33, // 30 km/h
        max_speed: 16.67, // 60 km/h
        average_cadence: 88,
        average_power: 220,
        max_power: 450,
        average_heartrate: 155,
        start_date: '2024-06-20T08:00:00Z',
        segments: [
          {
            id: 'seg1',
            name: 'Flat Section',
            distance: 20000,
            average_grade: 1.2,
            maximum_grade: 3.5,
            elevation_high: 150,
            elevation_low: 100,
            elapsed_time: 2400,
            average_speed: 8.33,
            average_power: 200,
            average_cadence: 95
          },
          {
            id: 'seg2',
            name: 'Climb',
            distance: 8000,
            average_grade: 6.8,
            maximum_grade: 12.0,
            elevation_high: 650,
            elevation_low: 150,
            elapsed_time: 1800,
            average_speed: 4.44,
            average_power: 280,
            average_cadence: 75
          }
        ]
      },
      {
        id: '2',
        name: 'Hill Intervals',
        type: 'Ride',
        distance: 32000,
        moving_time: 3600,
        elapsed_time: 4200,
        total_elevation_gain: 800,
        average_speed: 8.89,
        max_speed: 14.44,
        average_cadence: 85,
        average_power: 250,
        max_power: 380,
        average_heartrate: 165,
        start_date: '2024-06-18T17:00:00Z'
      },
      {
        id: '3',
        name: 'Recovery Ride',
        type: 'Ride',
        distance: 25000,
        moving_time: 3000,
        elapsed_time: 3300,
        total_elevation_gain: 200,
        average_speed: 8.33,
        max_speed: 11.11,
        average_cadence: 92,
        average_power: 150,
        max_power: 220,
        average_heartrate: 135,
        start_date: '2024-06-17T09:00:00Z'
      }
    ];
  }
}