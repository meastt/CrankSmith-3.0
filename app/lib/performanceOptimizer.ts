// app/lib/performanceOptimizer.ts
import { GearCalculation } from '../types/components';
import { GearSetup } from './gearCalculator';

interface CalculationCache {
  key: string;
  result: any;
  timestamp: number;
  hits: number;
}

export class PerformanceOptimizer {
  private static cache = new Map<string, CalculationCache>();
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private static readonly MAX_CACHE_SIZE = 100;

  /**
   * Memoized gear calculation with intelligent caching
   */
  static memoizedCalculation<T>(
    key: string,
    calculator: () => T,
    ttl: number = this.CACHE_TTL
  ): T {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached result if valid
    if (cached && (now - cached.timestamp) < ttl) {
      cached.hits++;
      return cached.result;
    }

    // Calculate new result
    const result = calculator();

    // Store in cache
    this.cache.set(key, {
      key,
      result,
      timestamp: now,
      hits: 1
    });

    // Clean up old entries if cache is too large
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.cleanupCache();
    }

    return result;
  }

  /**
   * Generate cache key for gear setup
   */
  static generateCacheKey(setup: GearSetup): string {
    const keyData = {
      crankset: setup.crankset.id,
      cassette: setup.cassette.id,
      derailleur: setup.rearDerailleur.id,
      chain: setup.chain.id,
      wheelSetup: setup.wheelSetup,
      crankLength: setup.crankLength
    };
    
    return btoa(JSON.stringify(keyData)).substring(0, 32);
  }

  /**
   * Batch calculation optimization for multiple setups
   */
  static batchCalculateGears(setups: GearSetup[]): Map<string, GearCalculation[]> {
    const results = new Map<string, GearCalculation[]>();
    
    // Group setups by similar characteristics to optimize calculations
    const groupedSetups = this.groupSimilarSetups(setups);
    
    groupedSetups.forEach((group, groupKey) => {
      // Calculate shared components once
      const sharedCalculations = this.calculateSharedComponents(group);
      
      group.forEach(setup => {
        const cacheKey = this.generateCacheKey(setup);
        
        const gears = this.memoizedCalculation(
          `gears_${cacheKey}`,
          () => this.optimizedGearCalculation(setup, sharedCalculations)
        );
        
        results.set(cacheKey, gears);
      });
    });
    
    return results;
  }

  /**
   * Group similar setups to optimize batch calculations
   */
  private static groupSimilarSetups(setups: GearSetup[]): Map<string, GearSetup[]> {
    const groups = new Map<string, GearSetup[]>();
    
    setups.forEach(setup => {
      // Group by wheel setup and crank length (most expensive calculations)
      const groupKey = `${setup.wheelSetup.tireSize}_${setup.wheelSetup.rimWidth}_${setup.crankLength}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(setup);
    });
    
    return groups;
  }

  /**
   * Calculate shared components for a group of similar setups
   */
  private static calculateSharedComponents(setups: GearSetup[]): {
    wheelCircumference: number;
    crankLength: number;
    tireSetup: any;
  } {
    // Assuming all setups in group have same wheel/crank characteristics
    const firstSetup = setups[0];
    
    return {
      wheelCircumference: this.calculateWheelCircumference(firstSetup.wheelSetup),
      crankLength: firstSetup.crankLength,
      tireSetup: firstSetup.wheelSetup
    };
  }

  /**
   * Optimized gear calculation using pre-computed shared values
   */
  private static optimizedGearCalculation(
    setup: GearSetup, 
    shared: any
  ): GearCalculation[] {
    const gears: GearCalculation[] = [];
    
    // Pre-calculate common values
    const wheelRadius = shared.wheelCircumference / (2 * Math.PI);
    const leverageRatio = wheelRadius / shared.crankLength;
    
    // Calculate each gear combination efficiently
    setup.crankset.chainrings.forEach((chainring, frontIndex) => {
      setup.cassette.cogs.forEach((cog, rearIndex) => {
        const ratio = chainring / cog;
        const gainRatio = ratio * leverageRatio;
        const developmentMeters = (shared.wheelCircumference * ratio) / 1000;
        
        // Optimized speed calculations using pre-computed values
        const speedAtCadence = this.calculateSpeedsOptimized(developmentMeters);
        
        // Simplified chain line calculation
        const chainLineData = this.calculateChainLineOptimized(
          chainring, 
          cog, 
          setup.crankset.chainLine,
          setup.cassette.speeds
        );
        
        gears.push({
          chainring,
          cog,
          ratio,
          gearInches: ratio * (shared.wheelCircumference / Math.PI / 25.4),
          gainRatio,
          developmentMeters,
          speedAtCadence,
          chainLine: chainLineData.chainLine,
          crossChainAngle: chainLineData.crossChainAngle,
          efficiency: chainLineData.efficiency,
          frontIndex,
          rearIndex,
          gearNumber: frontIndex * setup.cassette.cogs.length + rearIndex + 1,
          wheelCircumference: shared.wheelCircumference,
          crankLength: shared.crankLength
        });
      });
    });
    
    return gears;
  }

  /**
   * Optimized speed calculation using lookup tables
   */
  private static calculateSpeedsOptimized(developmentMeters: number) {
    // Pre-computed conversion factors
    const cadenceMultipliers = {
      rpm60: 60 * 60 / 1000 * 0.621371, // Convert to mph
      rpm80: 80 * 60 / 1000 * 0.621371,
      rpm90: 90 * 60 / 1000 * 0.621371,
      rpm100: 100 * 60 / 1000 * 0.621371,
      rpm120: 120 * 60 / 1000 * 0.621371
    };
    
    return {
      rpm60: Math.round(developmentMeters * cadenceMultipliers.rpm60 * 10) / 10,
      rpm80: Math.round(developmentMeters * cadenceMultipliers.rpm80 * 10) / 10,
      rpm90: Math.round(developmentMeters * cadenceMultipliers.rpm90 * 10) / 10,
      rpm100: Math.round(developmentMeters * cadenceMultipliers.rpm100 * 10) / 10,
      rpm120: Math.round(developmentMeters * cadenceMultipliers.rpm120 * 10) / 10
    };
  }

  /**
   * Optimized chain line calculation
   */
  private static calculateChainLineOptimized(
    chainring: number,
    cog: number,
    frontChainLine: number,
    cassetteSpeed: number
  ) {
    // Simplified chain line estimation
    const cogSpacing = cassetteSpeed === 11 ? 3.74 : 
                      cassetteSpeed === 12 ? 3.35 : 3.95;
    
    // Estimated rear chain line (simplified)
    const rearChainLine = 43.5; // Standard baseline
    
    // Simplified cross-chain angle
    const chainLineOffset = Math.abs(frontChainLine - rearChainLine);
    const crossChainAngle = Math.atan(chainLineOffset / 420) * (180 / Math.PI);
    
    // Efficiency lookup table
    let efficiency = 0.98; // Base efficiency
    if (crossChainAngle > 1) efficiency -= 0.005;
    if (crossChainAngle > 2.5) efficiency -= 0.01;
    if (crossChainAngle > 5) efficiency -= 0.02;
    if (crossChainAngle > 7.5) efficiency -= 0.03;
    
    return {
      chainLine: frontChainLine,
      crossChainAngle: Math.round(crossChainAngle * 10) / 10,
      efficiency: Math.round(efficiency * 1000) / 1000
    };
  }

  /**
   * Calculate wheel circumference with caching
   */
  private static calculateWheelCircumference(wheelSetup: any): number {
    const cacheKey = `circumference_${wheelSetup.tireSize}_${wheelSetup.rimWidth}`;
    
    return this.memoizedCalculation(cacheKey, () => {
      // Use tire calculator here - simplified for example
      // In real implementation, integrate with tireCalculator
      const baseSizes: { [key: string]: number } = {
        '700x23c': 2096,
        '700x25c': 2111,
        '700x28c': 2120,
        '700x32c': 2155,
        '29x2.1': 2300,
        '27.5x2.1': 2140,
        '26x1.9': 1970
      };
      
      return baseSizes[wheelSetup.tireSize] || 2111;
    });
  }

  /**
   * Cleanup old cache entries
   */
  private static cleanupCache(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    // Sort by last access time and hits to determine what to keep
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => {
        const aScore = a[1].hits * 1000 - (now - a[1].timestamp);
        const bScore = b[1].hits * 1000 - (now - b[1].timestamp);
        return bScore - aScore; // Higher score = keep longer
      });
    
    // Remove oldest/least used entries
    const toRemove = entries.slice(this.MAX_CACHE_SIZE * 0.8); // Remove 20% when cleanup occurs
    
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    hitRate: number;
    oldestEntry: number;
    totalHits: number;
  } {
    const now = Date.now();
    let totalHits = 0;
    let oldestTimestamp = now;
    
    this.cache.forEach(entry => {
      totalHits += entry.hits;
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    });
    
    const totalRequests = totalHits + this.cache.size; // Approximate
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    
    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      oldestEntry: Math.round((now - oldestTimestamp) / 1000 / 60), // minutes
      totalHits
    };
  }

  /**
   * Clear all cached data
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Preload commonly used calculations
   */
  static preloadCommonCalculations(): void {
    // Pre-calculate common tire circumferences
    const commonTires = [
      { tireSize: '700x25c', rimWidth: 21 },
      { tireSize: '700x28c', rimWidth: 21 },
      { tireSize: '700x32c', rimWidth: 23 },
      { tireSize: '29x2.1', rimWidth: 25 },
      { tireSize: '27.5x2.1', rimWidth: 25 }
    ];
    
    commonTires.forEach(tire => {
      this.calculateWheelCircumference(tire);
    });
    
    console.log('Preloaded common calculations');
  }
}

// Web Worker for heavy calculations (optional enhancement)
export const createCalculationWorker = () => {
  const workerCode = `
    self.onmessage = function(e) {
      const { setup, operation } = e.data;
      
      // Perform heavy calculations in worker thread
      let result;
      
      switch (operation) {
        case 'calculateGears':
          result = performGearCalculations(setup);
          break;
        case 'analyzePerformance':
          result = performPerformanceAnalysis(setup);
          break;
        default:
          result = { error: 'Unknown operation' };
      }
      
      self.postMessage({ result, operation });
    };
    
    function performGearCalculations(setup) {
      // Implement gear calculations here
      return { gears: [], completed: true };
    }
    
    function performPerformanceAnalysis(setup) {
      // Implement performance analysis here
      return { analysis: {}, completed: true };
    }
  `;
  
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

// Initialize performance optimization
export const initializePerformanceOptimization = () => {
  // Preload common calculations
  PerformanceOptimizer.preloadCommonCalculations();
  
  // Set up periodic cache cleanup
  setInterval(() => {
    const stats = PerformanceOptimizer.getCacheStats();
    if (stats.size > PerformanceOptimizer['MAX_CACHE_SIZE'] * 0.9) {
      PerformanceOptimizer['cleanupCache']();
    }
  }, 5 * 60 * 1000); // Every 5 minutes
  
  console.log('Performance optimization initialized');
};