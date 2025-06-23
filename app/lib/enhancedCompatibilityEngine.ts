// app/lib/enhancedCompatibilityEngine.ts
// Advanced compatibility analysis using real component data

import { MECHANIC_TRUSTED_COMPONENTS, ComponentData, checkBasicCompatibility } from '../data/mechanicTrustedComponents';

export interface DrivetrainAnalysis {
  // Core compatibility
  compatible: boolean;
  overallScore: number; // 0-100
  
  // Detailed checks
  checks: CompatibilityCheck[];
  
  // Performance metrics
  gearAnalysis: GearAnalysis;
  chainLineAnalysis: ChainLineAnalysis;
  efficiencyAnalysis: EfficiencyAnalysis;
  
  // Practical info
  costAnalysis: CostAnalysis;
  recommendations: string[];
  warnings: string[];
  
  // Technical details
  technicalSummary: TechnicalSummary;
}

export interface CompatibilityCheck {
  category: 'speed' | 'capacity' | 'compatibility' | 'physical' | 'performance';
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  technical: string;
  impact: 'low' | 'medium' | 'high';
}

export interface GearAnalysis {
  totalGears: number;
  gearRange: number;
  lowestRatio: number;
  highestRatio: number;
  avgStepSize: number;
  largestGap: number;
  duplicateGears: number;
  usableGears: number;
  gearTable: GearRatio[];
}

export interface GearRatio {
  chainring: number;
  cog: number;
  ratio: number;
  gearInches: number;
  developmentMeters: number;
  status: 'optimal' | 'good' | 'acceptable' | 'cross-chain' | 'avoid';
  efficiency: number;
  notes: string[];
}

export interface ChainLineAnalysis {
  frontChainLine: number;
  cogPositions: CogPosition[];
  straightChainRange: { min: number; max: number };
  crossChainGears: number[];
  avoidGears: number[];
  overallEfficiency: number;
}

export interface CogPosition {
  cog: number;
  position: number;
  offset: number;
  angle: number;
  efficiency: number;
  status: 'optimal' | 'good' | 'acceptable' | 'poor' | 'avoid';
}

export interface EfficiencyAnalysis {
  overallEfficiency: number;
  bestGears: GearRatio[];
  worstGears: GearRatio[];
  efficiencyByGear: number[];
  powerLoss: number; // watts at 250W input
}

export interface CostAnalysis {
  totalCost: number;
  componentCosts: { [key: string]: number };
  costPerGear: number;
  valueRating: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TechnicalSummary {
  speedCount: number;
  totalWeight: number;
  brands: string[];
  freehubType: string;
  chainWidth: number;
  bottomBracketStandards: string[];
}

export class EnhancedCompatibilityEngine {
  
  /**
   * Perform comprehensive drivetrain analysis
   */
  analyzeFullDrivetrain(
    cranksetId: string,
    cassetteId: string, 
    chainId: string,
    derailleurId: string
  ): DrivetrainAnalysis {
    
    // Get components
    const crankset = this.getComponent(cranksetId);
    const cassette = this.getComponent(cassetteId);
    const chain = this.getComponent(chainId);
    const derailleur = this.getComponent(derailleurId);
    
    if (!crankset || !cassette || !chain || !derailleur) {
      throw new Error('One or more components not found');
    }
    
    // Run basic compatibility
    const basicCheck = checkBasicCompatibility(crankset, cassette, chain, derailleur);
    
    // Detailed checks
    const checks = this.performDetailedChecks(crankset, cassette, chain, derailleur);
    
    // Gear analysis
    const gearAnalysis = this.analyzeGears(crankset, cassette);
    
    // Chain line analysis
    const chainLineAnalysis = this.analyzeChainLine(crankset, cassette);
    
    // Efficiency analysis
    const efficiencyAnalysis = this.analyzeEfficiency(gearAnalysis, chainLineAnalysis);
    
    // Cost analysis
    const costAnalysis = this.analyzeCost(crankset, cassette, chain, derailleur);
    
    // Technical summary
    const technicalSummary = this.createTechnicalSummary(crankset, cassette, chain, derailleur);
    
    // Overall score and recommendations
    const overallScore = this.calculateOverallScore(checks, gearAnalysis, chainLineAnalysis);
    const { recommendations, warnings } = this.generateRecommendations(
      checks, gearAnalysis, chainLineAnalysis, costAnalysis
    );
    
    return {
      compatible: basicCheck.compatible,
      overallScore,
      checks,
      gearAnalysis,
      chainLineAnalysis,
      efficiencyAnalysis,
      costAnalysis,
      recommendations,
      warnings,
      technicalSummary
    };
  }
  
  private getComponent(id: string): ComponentData | undefined {
    return MECHANIC_TRUSTED_COMPONENTS.find(comp => comp.id === id);
  }
  
  private performDetailedChecks(
    crankset: ComponentData,
    cassette: ComponentData,
    chain: ComponentData,
    derailleur: ComponentData
  ): CompatibilityCheck[] {
    
    const checks: CompatibilityCheck[] = [];
    
    // Speed compatibility
    const speeds = [cassette.details.speeds, chain.details.speeds, derailleur.details.speeds];
    const speedsMatch = speeds.every(s => s === speeds[0]);
    
    checks.push({
      category: 'speed',
      name: 'Speed Compatibility',
      status: speedsMatch ? 'pass' : 'fail',
      message: speedsMatch 
        ? `All components are ${speeds[0]}-speed`
        : `Speed mismatch: ${speeds.join('/')}-speed components`,
      technical: speedsMatch
        ? `Cassette, chain, and derailleur all designed for ${speeds[0]}-speed operation`
        : `Mixed speed components will not shift properly and may cause damage`,
      impact: speedsMatch ? 'low' : 'high'
    });
    
    // Derailleur capacity
    const cassetteRange = cassette.details.cog_range[1] - cassette.details.cog_range[0];
    const chainringRange = crankset.details.chainrings.length > 1 
      ? Math.max(...crankset.details.chainrings) - Math.min(...crankset.details.chainrings)
      : 0;
    const requiredCapacity = cassetteRange + chainringRange;
    const hasCapacity = requiredCapacity <= derailleur.details.capacity_teeth;
    
    checks.push({
      category: 'capacity',
      name: 'Derailleur Capacity',
      status: hasCapacity ? 'pass' : 'fail',
      message: `Required: ${requiredCapacity}T, Available: ${derailleur.details.capacity_teeth}T`,
      technical: `Derailleur must handle total tooth difference between largest and smallest chainrings plus largest and smallest cogs`,
      impact: hasCapacity ? 'low' : 'high'
    });
    
    // Max cog size
    const maxCog = Math.max(...cassette.details.cogs);
    const canHandleMaxCog = maxCog <= derailleur.details.max_cog_size;
    
    checks.push({
      category: 'physical',
      name: 'Maximum Cog Size',
      status: canHandleMaxCog ? 'pass' : 'fail',
      message: `${maxCog}T max cog, ${derailleur.details.max_cog_size}T derailleur limit`,
      technical: `Derailleur upper jockey wheel must clear largest cassette cog`,
      impact: canHandleMaxCog ? 'low' : 'high'
    });
    
    // Brand compatibility
    const brands = [cassette.manufacturer_name, chain.manufacturer_name, derailleur.manufacturer_name];
    const mixedBrands = new Set(brands).size > 1;
    
    checks.push({
      category: 'compatibility',
      name: 'Brand Mixing',
      status: mixedBrands ? 'warning' : 'pass',
      message: mixedBrands 
        ? `Mixed brands: ${Array.from(new Set(brands)).join(', ')}`
        : `Single brand system: ${brands[0]}`,
      technical: mixedBrands
        ? `Different manufacturers may have slight differences in cable pull ratios and shift timing`
        : `Single brand ensures optimal shift performance and warranty coverage`,
      impact: 'medium'
    });
    
    // Chain width compatibility
    const chainWidth = chain.details.width_mm;
    const expectedWidth = cassette.details.speeds === 11 ? 5.62 : 5.25;
    const widthMatch = Math.abs(chainWidth - expectedWidth) < 0.1;
    
    checks.push({
      category: 'physical',
      name: 'Chain Width',
      status: widthMatch ? 'pass' : 'warning',
      message: `${chainWidth}mm chain for ${cassette.details.speeds}-speed cassette`,
      technical: `${cassette.details.speeds}-speed cassettes require ${expectedWidth}mm chain width for proper fit`,
      impact: widthMatch ? 'low' : 'medium'
    });
    
    return checks;
  }
  
  private analyzeGears(crankset: ComponentData, cassette: ComponentData): GearAnalysis {
    const gearTable: GearRatio[] = [];
    
    // Calculate all gear combinations
    crankset.details.chainrings.forEach(chainring => {
      cassette.details.cogs.forEach(cog => {
        const ratio = chainring / cog;
        const gearInches = ratio * 27; // 700c wheel
        const developmentMeters = ratio * 2.096; // 700x25c circumference
        
        // Determine status based on position
        const chainringIndex = crankset.details.chainrings.indexOf(chainring);
        const cogIndex = cassette.details.cogs.indexOf(cog);
        const status = this.determineGearStatus(
          chainringIndex, cogIndex, 
          crankset.details.chainrings.length, 
          cassette.details.cogs.length
        );
        
        const efficiency = this.calculateGearEfficiency(chainringIndex, cogIndex, crankset.details.chainrings.length, cassette.details.cogs.length);
        
        gearTable.push({
          chainring,
          cog,
          ratio,
          gearInches,
          developmentMeters,
          status,
          efficiency,
          notes: this.getGearNotes(status, ratio)
        });
      });
    });
    
    // Sort by ratio
    gearTable.sort((a, b) => a.ratio - b.ratio);
    
    // Calculate metrics
    const ratios = gearTable.map(g => g.ratio);
    const stepSizes = [];
    for (let i = 1; i < ratios.length; i++) {
      stepSizes.push((ratios[i] - ratios[i-1]) / ratios[i-1] * 100);
    }
    
    const duplicates = this.findDuplicateGears(gearTable);
    const usableGears = gearTable.filter(g => g.status !== 'avoid').length;
    
    return {
      totalGears: gearTable.length,
      gearRange: ratios[ratios.length - 1] / ratios[0],
      lowestRatio: ratios[0],
      highestRatio: ratios[ratios.length - 1],
      avgStepSize: stepSizes.length > 0 ? stepSizes.reduce((a, b) => a + b) / stepSizes.length : 0,
      largestGap: stepSizes.length > 0 ? Math.max(...stepSizes) : 0,
      duplicateGears: duplicates,
      usableGears,
      gearTable
    };
  }
  
  private analyzeChainLine(crankset: ComponentData, cassette: ComponentData): ChainLineAnalysis {
    const frontChainLine = crankset.details.chainline_mm;
    const cogPositions: CogPosition[] = [];
    
    // Calculate rear chainline for each cog
    cassette.details.cogs.forEach((cog, index) => {
      const position = this.calculateCogPosition(index, cassette.details.cogs.length);
      const offset = Math.abs(frontChainLine - position);
      const angle = this.calculateChainAngle(frontChainLine, position, 405); // ~405mm chainstay
      const efficiency = this.calculateChainEfficiency(angle);
      const status = this.getChainLineStatus(angle, efficiency);
      
      cogPositions.push({
        cog,
        position,
        offset,
        angle,
        efficiency,
        status
      });
    });
    
    // Determine ranges
    const optimalCogs = cogPositions.filter(c => c.status === 'optimal' || c.status === 'good').map(c => c.cog);
    const crossChainGears = cogPositions.filter(c => c.status === 'poor').map(c => c.cog);
    const avoidGears = cogPositions.filter(c => c.status === 'avoid').map(c => c.cog);
    
    const straightChainRange = {
      min: optimalCogs.length > 0 ? Math.min(...optimalCogs) : 0,
      max: optimalCogs.length > 0 ? Math.max(...optimalCogs) : 0
    };
    
    const overallEfficiency = cogPositions.reduce((sum, cog) => sum + cog.efficiency, 0) / cogPositions.length;
    
    return {
      frontChainLine,
      cogPositions,
      straightChainRange,
      crossChainGears,
      avoidGears,
      overallEfficiency
    };
  }
  
  private analyzeEfficiency(gearAnalysis: GearAnalysis, chainLineAnalysis: ChainLineAnalysis): EfficiencyAnalysis {
    const gearEfficiencies = gearAnalysis.gearTable.map(gear => {
      // Find matching cog position
      const cogPos = chainLineAnalysis.cogPositions.find(c => c.cog === gear.cog);
      return cogPos ? cogPos.efficiency : 0.95; // fallback
    });
    
    const overallEfficiency = gearEfficiencies.reduce((sum, eff) => sum + eff) / gearEfficiencies.length;
    
    const bestGears = gearAnalysis.gearTable
      .filter(gear => gear.efficiency > 0.975)
      .slice(0, 5);
    
    const worstGears = gearAnalysis.gearTable
      .filter(gear => gear.efficiency < 0.96)
      .slice(-5);
    
    const powerLoss = (1 - overallEfficiency) * 250; // watts lost at 250W input
    
    return {
      overallEfficiency,
      bestGears,
      worstGears,
      efficiencyByGear: gearEfficiencies,
      powerLoss
    };
  }
  
  private analyzeCost(
    crankset: ComponentData,
    cassette: ComponentData,
    chain: ComponentData,
    derailleur: ComponentData
  ): CostAnalysis {
    
    const componentCosts = {
      crankset: crankset.msrp_usd,
      cassette: cassette.msrp_usd,
      chain: chain.msrp_usd,
      derailleur: derailleur.msrp_usd
    };
    
    const totalCost = Object.values(componentCosts).reduce((sum, cost) => sum + cost);
    const costPerGear = totalCost / (crankset.details.chainrings.length * cassette.details.cogs.length);
    
    let valueRating: 'excellent' | 'good' | 'fair' | 'poor';
    if (costPerGear < 15) valueRating = 'excellent';
    else if (costPerGear < 25) valueRating = 'good';
    else if (costPerGear < 40) valueRating = 'fair';
    else valueRating = 'poor';
    
    return {
      totalCost,
      componentCosts,
      costPerGear,
      valueRating
    };
  }
  
  private createTechnicalSummary(
    crankset: ComponentData,
    cassette: ComponentData,
    chain: ComponentData,
    derailleur: ComponentData
  ): TechnicalSummary {
    
    return {
      speedCount: cassette.details.speeds,
      totalWeight: crankset.weight_grams + cassette.weight_grams + chain.weight_grams + derailleur.weight_grams,
      brands: Array.from(new Set([
        crankset.manufacturer_name,
        cassette.manufacturer_name,
        chain.manufacturer_name,
        derailleur.manufacturer_name
      ])),
      freehubType: cassette.details.freehub_type,
      chainWidth: chain.details.width_mm,
      bottomBracketStandards: crankset.details.bottom_bracket_standards
    };
  }
  
  // Helper methods
  private determineGearStatus(
    chainringIndex: number, 
    cogIndex: number, 
    totalChainrings: number, 
    totalCogs: number
  ): 'optimal' | 'good' | 'acceptable' | 'cross-chain' | 'avoid' {
    
    // For 1x setups, just check cog position
    if (totalChainrings === 1) {
      const cogRatio = cogIndex / (totalCogs - 1);
      if (cogRatio >= 0.2 && cogRatio <= 0.8) return 'optimal';
      if (cogRatio >= 0.1 && cogRatio <= 0.9) return 'good';
      return 'acceptable';
    }
    
    // For 2x setups, check cross-chaining
    const isSmallRing = chainringIndex === 0;
    const isLargeRing = chainringIndex === 1;
    const isSmallCogs = cogIndex < totalCogs * 0.3;
    const isLargeCogs = cogIndex > totalCogs * 0.7;
    
    if ((isSmallRing && isSmallCogs) || (isLargeRing && isLargeCogs)) {
      return 'avoid'; // Cross-chaining
    }
    
    if ((isSmallRing && isLargeCogs) || (isLargeRing && isSmallCogs)) {
      return 'optimal'; // Good chainline
    }
    
    return 'good';
  }
  
  private calculateGearEfficiency(
    chainringIndex: number,
    cogIndex: number,
    totalChainrings: number,
    totalCogs: number
  ): number {
    
    const gearStatus = this.determineGearStatus(chainringIndex, cogIndex, totalChainrings, totalCogs);
    
    switch (gearStatus) {
      case 'optimal': return 0.98;
      case 'good': return 0.975;
      case 'acceptable': return 0.97;
      case 'cross-chain': return 0.95;
      case 'avoid': return 0.92;
      default: return 0.95;
    }
  }
  
  private calculateCogPosition(cogIndex: number, totalCogs: number): number {
    // Simplified rear chainline calculation
    const centerPosition = 43.5; // Standard road centerline
    const cogSpacing = totalCogs === 11 ? 3.95 : 3.35; // mm between cogs
    const centerIndex = (totalCogs - 1) / 2;
    const offset = (cogIndex - centerIndex) * cogSpacing;
    
    return centerPosition + offset;
  }
  
  private calculateChainAngle(frontChainLine: number, rearChainLine: number, chainstayLength: number): number {
    const offset = Math.abs(frontChainLine - rearChainLine);
    return Math.atan(offset / chainstayLength) * (180 / Math.PI);
  }
  
  private calculateChainEfficiency(angleDegrees: number): number {
    if (angleDegrees < 0.5) return 0.98;
    if (angleDegrees < 1.0) return 0.978;
    if (angleDegrees < 2.0) return 0.975;
    if (angleDegrees < 3.0) return 0.97;
    if (angleDegrees < 4.0) return 0.96;
    if (angleDegrees < 5.0) return 0.95;
    return 0.92;
  }
  
  private getChainLineStatus(angle: number, efficiency: number): 'optimal' | 'good' | 'acceptable' | 'poor' | 'avoid' {
    if (angle < 0.5 && efficiency > 0.975) return 'optimal';
    if (angle < 2.0 && efficiency > 0.97) return 'good';
    if (angle < 4.0 && efficiency > 0.95) return 'acceptable';
    if (angle < 6.0 && efficiency > 0.93) return 'poor';
    return 'avoid';
  }
  
  private findDuplicateGears(gearTable: GearRatio[]): number {
    let duplicates = 0;
    for (let i = 0; i < gearTable.length - 1; i++) {
      for (let j = i + 1; j < gearTable.length; j++) {
        if (Math.abs(gearTable[i].ratio - gearTable[j].ratio) < 0.05) {
          duplicates++;
          break;
        }
      }
    }
    return duplicates;
  }
  
  private getGearNotes(status: string, ratio: number): string[] {
    const notes: string[] = [];
    
    if (status === 'avoid') {
      notes.push('Avoid - severe cross-chaining');
    } else if (status === 'cross-chain') {
      notes.push('Cross-chain - use sparingly');
    } else if (status === 'optimal') {
      notes.push('Optimal chainline');
    }
    
    if (ratio < 1.2) {
      notes.push('Very low - steep climbing');
    } else if (ratio > 4.0) {
      notes.push('Very high - flat/downhill');
    }
    
    return notes;
  }
  
  private calculateOverallScore(
    checks: CompatibilityCheck[],
    gearAnalysis: GearAnalysis,
    chainLineAnalysis: ChainLineAnalysis
  ): number {
    
    let score = 100;
    
    // Deduct for failed checks
    checks.forEach(check => {
      if (check.status === 'fail') {
        score -= check.impact === 'high' ? 25 : check.impact === 'medium' ? 15 : 5;
      } else if (check.status === 'warning') {
        score -= check.impact === 'high' ? 10 : check.impact === 'medium' ? 5 : 2;
      }
    });
    
    // Deduct for poor gear distribution
    if (gearAnalysis.duplicateGears > 2) score -= 5;
    if (gearAnalysis.largestGap > 20) score -= 10;
    if (gearAnalysis.usableGears < gearAnalysis.totalGears * 0.8) score -= 10;
    
    // Deduct for poor chainline
    if (chainLineAnalysis.overallEfficiency < 0.95) score -= 15;
    if (chainLineAnalysis.avoidGears.length > 2) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private generateRecommendations(
    checks: CompatibilityCheck[],
    gearAnalysis: GearAnalysis,
    chainLineAnalysis: ChainLineAnalysis,
    costAnalysis: CostAnalysis
  ): { recommendations: string[]; warnings: string[] } {
    
    const recommendations: string[] = [];
    const warnings: string[] = [];
    
    // Check-based recommendations
    const failedChecks = checks.filter(c => c.status === 'fail');
    if (failedChecks.length > 0) {
      warnings.push(`${failedChecks.length} compatibility issue(s) must be resolved`);
    }
    
    // Gear recommendations
    if (gearAnalysis.gearRange > 5.0) {
      recommendations.push('Excellent gear range for varied terrain');
    } else if (gearAnalysis.gearRange < 3.0) {
      recommendations.push('Consider wider range cassette for more versatility');
    }
    
    if (gearAnalysis.duplicateGears > 3) {
      recommendations.push('Multiple duplicate ratios - consider different chainring/cassette combination');
    }
    
    // Chainline recommendations
    if (chainLineAnalysis.avoidGears.length > 0) {
      warnings.push(`Avoid using ${chainLineAnalysis.avoidGears.join('T, ')}T cogs to prevent excessive wear`);
    }
    
    if (chainLineAnalysis.overallEfficiency < 0.96) {
      recommendations.push('Chain line could be optimized for better efficiency');
    }
    
    // Cost recommendations
    if (costAnalysis.valueRating === 'excellent') {
      recommendations.push('Excellent value for performance level');
    } else if (costAnalysis.valueRating === 'poor') {
      recommendations.push('Consider more cost-effective component options');
    }
    
    return { recommendations, warnings };
  }
}