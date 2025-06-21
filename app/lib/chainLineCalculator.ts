// app/lib/chainLineCalculator.ts
import { DrivetrainSetup, BottomBracketStandard } from '../types/components';

export interface ChainLineSetup {
  cranksetChainLine: number; // mm from bike centerline
  bottomBracket: BottomBracketStandard;
  frameStandard: BottomBracketStandard;
  cassette: {
    speeds: number;
    cogs: number[];
    stackHeight?: number;
  };
  wheelSpacing: number; // 130mm road, 135mm MTB, 142mm thru-axle
  chainStayLength?: number; // for angle calculations
}

export interface ChainLineResult {
  frontChainLine: number;
  rearChainLine: number;
  offset: number;
  cogPositions: Array<{
    cog: number;
    position: number; // mm from bike centerline
    offsetFromFront: number;
    angle: number; // degrees
    efficiency: number; // 0-1 scale
    status: 'optimal' | 'good' | 'acceptable' | 'poor' | 'avoid';
  }>;
  analysis: {
    straightChainGears: number[];
    crossChainGears: number[];
    avoidGears: number[];
    optimalRange: { min: number; max: number };
  };
}

export class ChainLineCalculator {
  
  /**
   * Calculate complete chain line analysis for a drivetrain setup
   */
  calculateChainLine(setup: ChainLineSetup): ChainLineResult {
    // Calculate front chain line with bottom bracket adjustments
    const frontChainLine = this.calculateFrontChainLine(
      setup.cranksetChainLine,
      setup.bottomBracket,
      setup.frameStandard
    );
    
    // Calculate rear chain line (cassette centerline)
    const rearChainLine = this.calculateRearChainLine(
      setup.wheelSpacing,
      setup.cassette.speeds
    );
    
    // Calculate individual cog positions
    const cogPositions = this.calculateCogPositions(
      setup.cassette.cogs,
      setup.cassette.speeds,
      rearChainLine,
      frontChainLine,
      setup.chainStayLength || 420
    );
    
    // Analyze gear combinations
    const analysis = this.analyzeChainLineGears(cogPositions);
    
    return {
      frontChainLine,
      rearChainLine,
      offset: Math.abs(frontChainLine - rearChainLine),
      cogPositions,
      analysis
    };
  }
  
  /**
   * Calculate front chain line with bottom bracket adjustments
   */
  private calculateFrontChainLine(
    cranksetChainLine: number,
    bottomBracket: BottomBracketStandard,
    frameStandard: BottomBracketStandard
  ): number {
    
    // Bottom bracket spacing adjustments from 68mm BSA baseline
    const bbAdjustments: Record<BottomBracketStandard, number> = {
      'BSA': 0,        // 68mm threaded baseline
      'ITA': +1,       // 70mm threaded
      'BB30': +1,      // 70mm press-fit
      'PF30': +1,      // 70mm press-fit
      'BB86': 0,       // 68mm press-fit (86.5mm shell but same spacing)
      'BB90': +11,     // 90mm press-fit
      'BB92': +12,     // 92mm press-fit
      'PF92': +12,     // 92mm press-fit
      'T47': 0,        // 68mm threaded with large threads
      'BB107': +19.5,  // 107mm press-fit
      'Other': 0
    };
    
    // Apply frame standard adjustment
    const frameAdjustment = bbAdjustments[frameStandard] || 0;
    
    // Some cranksets have different chain lines for different BB standards
    const cranksetAdjustment = this.getCranksetBBAdjustment(bottomBracket);
    
    return cranksetChainLine + frameAdjustment + cranksetAdjustment;
  }
  
  /**
   * Get crankset-specific adjustments for different bottom bracket standards
   */
  private getCranksetBBAdjustment(bottomBracket: BottomBracketStandard): number {
    // Some cranksets have different chain lines depending on BB
    // This would be specific to each crankset model
    const adjustments: Record<BottomBracketStandard, number> = {
      'BSA': 0,
      'ITA': 0,
      'BB30': +2.5,    // BB30 cranksets often have +2.5mm chain line
      'PF30': +2.5,
      'BB86': 0,
      'BB90': 0,
      'BB92': 0,
      'PF92': 0,
      'T47': 0,
      'BB107': 0,
      'Other': 0
    };
    
    return adjustments[bottomBracket] || 0;
  }
  
  /**
   * Calculate rear chain line (cassette centerline)
   */
  private calculateRearChainLine(wheelSpacing: number, speeds: number): number {
    // Standard rear chain line calculations
    // Based on hub spacing and cassette stack
    
    const standardSpacings: Record<number, number> = {
      130: 43.5,  // Road 130mm spacing
      135: 46.0,  // MTB 135mm spacing  
      142: 46.0,  // 142mm thru-axle
      148: 52.0,  // Boost 148mm spacing
      150: 52.0   // DH 150mm spacing
    };
    
    const baseChainLine = standardSpacings[wheelSpacing] || 43.5;
    
    // Adjust for cassette stack height differences
    const stackAdjustments: Record<number, number> = {
      8: -1,      // 8-speed cassettes are narrower
      9: -0.5,    // 9-speed slightly narrower
      10: 0,      // 10-speed baseline
      11: +0.5,   // 11-speed slightly wider
      12: +1,     // 12-speed wider
      13: +1.5    // 13-speed widest
    };
    
    const stackAdjustment = stackAdjustments[speeds] || 0;
    
    return baseChainLine + stackAdjustment;
  }
  
  /**
   * Calculate individual cog positions and chain angles
   */
  private calculateCogPositions(
    cogs: number[],
    speeds: number,
    rearChainLine: number,
    frontChainLine: number,
    chainStayLength: number
  ): ChainLineResult['cogPositions'] {
    
    // Cog spacing by speed count
    const cogSpacing: Record<number, number> = {
      8: 4.8,   // 8-speed spacing
      9: 4.34,  // 9-speed spacing
      10: 3.95, // 10-speed spacing
      11: 3.74, // 11-speed spacing
      12: 3.35, // 12-speed spacing
      13: 3.15  // 13-speed spacing
    };
    
    const spacing = cogSpacing[speeds] || 3.74;
    const totalStackWidth = (cogs.length - 1) * spacing;
    
    return cogs.map((cog, index) => {
      // Calculate cog position from bike centerline
      const cogOffset = (index * spacing) - (totalStackWidth / 2);
      const cogPosition = rearChainLine + cogOffset;
      
      // Calculate chain line offset and angle
      const offsetFromFront = Math.abs(cogPosition - frontChainLine);
      const angle = Math.atan(offsetFromFront / chainStayLength) * (180 / Math.PI);
      
      // Calculate efficiency based on chain angle
      const efficiency = this.calculateChainEfficiency(angle);
      
      // Determine status
      const status = this.getChainLineStatus(angle, efficiency);
      
      return {
        cog,
        position: Math.round(cogPosition * 10) / 10,
        offsetFromFront: Math.round(offsetFromFront * 10) / 10,
        angle: Math.round(angle * 10) / 10,
        efficiency: Math.round(efficiency * 1000) / 1000,
        status
      };
    });
  }
  
  /**
   * Calculate chain efficiency based on angle
   */
  private calculateChainEfficiency(angleDegrees: number): number {
    // Based on efficiency studies and real-world testing
    const baseEfficiency = 0.98; // Straight chain efficiency
    
    if (angleDegrees < 0.5) return baseEfficiency;
    if (angleDegrees < 1.0) return baseEfficiency - 0.002; // 97.8%
    if (angleDegrees < 2.0) return baseEfficiency - 0.005; // 97.5%
    if (angleDegrees < 3.0) return baseEfficiency - 0.01;  // 97.0%
    if (angleDegrees < 4.0) return baseEfficiency - 0.02;  // 96.0%
    if (angleDegrees < 5.0) return baseEfficiency - 0.03;  // 95.0%
    if (angleDegrees < 6.0) return baseEfficiency - 0.045; // 93.5%
    
    return baseEfficiency - 0.07; // 91% for extreme angles
  }
  
  /**
   * Get chain line status based on angle and efficiency
   */
  private getChainLineStatus(
    angle: number, 
    efficiency: number
  ): 'optimal' | 'good' | 'acceptable' | 'poor' | 'avoid' {
    if (angle < 0.5 && efficiency > 0.975) return 'optimal';
    if (angle < 2.0 && efficiency > 0.97) return 'good';
    if (angle < 4.0 && efficiency > 0.95) return 'acceptable';
    if (angle < 6.0 && efficiency > 0.93) return 'poor';
    return 'avoid';
  }
  
  /**
   * Analyze gear combinations and categorize them
   */
  private analyzeChainLineGears(cogPositions: ChainLineResult['cogPositions']) {
    const straightChainGears: number[] = [];
    const crossChainGears: number[] = [];
    const avoidGears: number[] = [];
    
    let minOptimal = Infinity;
    let maxOptimal = -Infinity;
    
    cogPositions.forEach((cog, index) => {
      switch (cog.status) {
        case 'optimal':
        case 'good':
          straightChainGears.push(cog.cog);
          minOptimal = Math.min(minOptimal, cog.cog);
          maxOptimal = Math.max(maxOptimal, cog.cog);
          break;
        case 'acceptable':
          // Don't add to any special category
          break;
        case 'poor':
          crossChainGears.push(cog.cog);
          break;
        case 'avoid':
          avoidGears.push(cog.cog);
          break;
      }
    });
    
    return {
      straightChainGears,
      crossChainGears,
      avoidGears,
      optimalRange: {
        min: minOptimal === Infinity ? 0 : minOptimal,
        max: maxOptimal === -Infinity ? 0 : maxOptimal
      }
    };
  }
  
  /**
   * Get chain line recommendations for a setup
   */
  getChainLineRecommendations(setup: ChainLineSetup): {
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
  } {
    const result = this.calculateChainLine(setup);
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const optimizations: string[] = [];
    
    // Check overall chain line alignment
    if (result.offset > 5) {
      warnings.push(`Large chain line offset: ${result.offset.toFixed(1)}mm`);
      recommendations.push('Consider different bottom bracket or crankset');
    }
    
    // Check for usable gear range
    const usableGears = result.cogPositions.filter(c => 
      c.status === 'optimal' || c.status === 'good'
    );
    
    if (usableGears.length < result.cogPositions.length * 0.6) {
      warnings.push('Limited usable gear range due to chain line issues');
      recommendations.push('Consider adjusting chain line or cassette choice');
    }
    
    // Optimization suggestions
    if (result.analysis.straightChainGears.length > 0) {
      const range = result.analysis.optimalRange;
      optimizations.push(
        `Focus on ${range.min}T-${range.max}T cogs for best efficiency`
      );
    }
    
    if (result.analysis.avoidGears.length > 0) {
      optimizations.push(
        `Avoid ${result.analysis.avoidGears.join(', ')}T cogs due to extreme chain line`
      );
    }
    
    return {
      recommendations,
      warnings,
      optimizations
    };
  }
  
  /**
   * Compare chain lines between different setups
   */
  compareChainLines(setups: Array<{
    name: string;
    setup: ChainLineSetup;
  }>): Array<{
    name: string;
    result: ChainLineResult;
    efficiency: number;
    usableGears: number;
    score: number;
  }> {
    
    return setups.map(({ name, setup }) => {
      const result = this.calculateChainLine(setup);
      
      // Calculate overall efficiency score
      const avgEfficiency = result.cogPositions.reduce((sum, cog) => 
        sum + cog.efficiency, 0) / result.cogPositions.length;
      
      // Count usable gears
      const usableGears = result.cogPositions.filter(c => 
        c.status === 'optimal' || c.status === 'good' || c.status === 'acceptable'
      ).length;
      
      // Calculate overall score (0-100)
      const efficiencyScore = (avgEfficiency - 0.9) * 1000; // 0-80
      const usabilityScore = (usableGears / result.cogPositions.length) * 20; // 0-20
      const score = Math.max(0, Math.min(100, efficiencyScore + usabilityScore));
      
      return {
        name,
        result,
        efficiency: Math.round(avgEfficiency * 1000) / 10, // percentage
        usableGears,
        score: Math.round(score)
      };
    }).sort((a, b) => b.score - a.score);
  }
  
  /**
   * Calculate ideal chain line for a specific cassette
   */
  calculateIdealChainLine(cassette: {
    speeds: number;
    cogs: number[];
  }, wheelSpacing: number = 130): {
    idealFrontChainLine: number;
    rearChainLine: number;
    reasoning: string;
  } {
    
    const rearChainLine = this.calculateRearChainLine(wheelSpacing, cassette.speeds);
    
    // For optimal chain line, front should match rear centerline
    const idealFrontChainLine = rearChainLine;
    
    const reasoning = `For best chain line with ${cassette.speeds}-speed cassette, ` +
      `front chain line should be ${idealFrontChainLine}mm to match rear centerline`;
    
    return {
      idealFrontChainLine,
      rearChainLine,
      reasoning
    };
  }
}

// Create singleton instance
export const chainLineCalculator = new ChainLineCalculator();