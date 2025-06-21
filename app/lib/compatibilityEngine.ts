// app/lib/compatibilityEngine.ts
import {
    DrivetrainSetup,
    CompatibilityCheck,
    CompatibilityWarning,
    Crankset,
    Cassette,
    RearDerailleur,
    Chain,
    FrontDerailleur,
    FreehubType,
    BottomBracketStandard
  } from '../types/components';
  
  export class CompatibilityEngine {
    
    /**
     * Comprehensive compatibility check for a complete drivetrain setup
     */
    checkDrivetrainCompatibility(setup: DrivetrainSetup): CompatibilityCheck {
      const warnings: CompatibilityWarning[] = [];
      const notes: string[] = [];
  
      // Speed compatibility check
      this.checkSpeedCompatibility(setup, warnings);
      
      // Derailleur capacity check
      this.checkDerailleurCapacity(setup, warnings);
      
      // Maximum cog size check
      this.checkMaxCogSize(setup, warnings);
      
      // Freehub compatibility
      this.checkFreehubCompatibility(setup, warnings, notes);
      
      // Chain line compatibility
      this.checkChainLineCompatibility(setup, warnings, notes);
      
      // Cable pull compatibility
      this.checkCablePullCompatibility(setup, warnings);
      
      // Chain width compatibility
      this.checkChainWidthCompatibility(setup, warnings);
      
      // Bottom bracket compatibility
      this.checkBottomBracketCompatibility(setup, warnings, notes);
  
      // Front derailleur checks (if present)
      if (setup.frontDerailleur) {
        this.checkFrontDerailleurCompatibility(setup, warnings);
      }
  
      const compatible = warnings.filter(w => w.type === 'critical').length === 0;
  
      return {
        compatible,
        warnings,
        notes
      };
    }
  
    /**
     * Check if all components have matching speed counts
     */
    private checkSpeedCompatibility(setup: DrivetrainSetup, warnings: CompatibilityWarning[]) {
      const speeds = [
        setup.cassette.speeds,
        setup.chain.speeds,
        setup.rearDerailleur.speeds
      ];
  
      if (setup.frontDerailleur) {
        speeds.push(setup.frontDerailleur.speeds);
      }
  
      const uniqueSpeeds = [...new Set(speeds)];
      
      if (uniqueSpeeds.length > 1) {
        warnings.push({
          type: 'critical',
          component: 'drivetrain',
          issue: `Speed mismatch: Found ${uniqueSpeeds.join(', ')} speeds across components`,
          suggestion: 'All drivetrain components must have the same speed count'
        });
      }
    }
  
    /**
     * Check if rear derailleur has sufficient capacity
     */
    private checkDerailleurCapacity(setup: DrivetrainSetup, warnings: CompatibilityWarning[]) {
      const frontDiff = setup.crankset.chainrings.length > 1 ? 
        Math.max(...setup.crankset.chainrings) - Math.min(...setup.crankset.chainrings) : 0;
      const rearRange = setup.cassette.cogRange[1] - setup.cassette.cogRange[0];
      const totalCapacityNeeded = frontDiff + rearRange;
  
      if (totalCapacityNeeded > setup.rearDerailleur.totalCapacity) {
        warnings.push({
          type: 'critical',
          component: 'rear_derailleur',
          issue: `Insufficient capacity: Need ${totalCapacityNeeded}T, derailleur has ${setup.rearDerailleur.totalCapacity}T`,
          suggestion: 'Use a long cage derailleur (SGS/GS) or reduce gear range'
        });
      } else if (totalCapacityNeeded > setup.rearDerailleur.totalCapacity * 0.9) {
        warnings.push({
          type: 'warning',
          component: 'rear_derailleur',
          issue: `Near capacity limit: Using ${totalCapacityNeeded}T of ${setup.rearDerailleur.totalCapacity}T capacity`,
          suggestion: 'Consider a longer cage derailleur for better shifting performance'
        });
      }
    }
  
    /**
     * Check if derailleur can handle the largest cassette cog
     */
    private checkMaxCogSize(setup: DrivetrainSetup, warnings: CompatibilityWarning[]) {
      const largestCog = setup.cassette.cogRange[1];
      
      if (largestCog > setup.rearDerailleur.maxCogSize) {
        warnings.push({
          type: 'critical',
          component: 'rear_derailleur',
          issue: `Cassette largest cog (${largestCog}T) exceeds derailleur limit (${setup.rearDerailleur.maxCogSize}T)`,
          suggestion: 'Use a smaller cassette or different derailleur model'
        });
      }
    }
  
    /**
     * Check freehub and cassette compatibility
     */
    private checkFreehubCompatibility(setup: DrivetrainSetup, warnings: CompatibilityWarning[], notes: string[]) {
      const freehubType = setup.cassette.freehubType;
      notes.push(`Freehub type required: ${freehubType}`);
  
      // Check for common incompatibilities
      const incompatibilities = this.getFreehubIncompatibilities(freehubType, setup.cassette.speeds);
      
      if (incompatibilities.length > 0) {
        incompatibilities.forEach(issue => {
          warnings.push({
            type: 'warning',
            component: 'cassette',
            issue,
            suggestion: 'Verify wheel freehub compatibility before purchase'
          });
        });
      }
    }
  
    /**
     * Get freehub compatibility warnings
     */
    private getFreehubIncompatibilities(freehubType: FreehubType, speeds: number): string[] {
      const issues: string[] = [];
  
      switch (freehubType) {
        case 'shimano-12':
          issues.push('Requires Shimano Micro Spline freehub (not compatible with standard HG freehub)');
          break;
        case 'sram-xdr':
          issues.push('Requires SRAM XDR freehub (longer than standard HG freehub)');
          break;
        case 'sram-xd':
          issues.push('Requires SRAM XD freehub (different spline pattern than HG)');
          break;
        case 'campagnolo-11':
        case 'campagnolo-13':
          issues.push('Requires Campagnolo freehub (different spline pattern than Shimano/SRAM)');
          break;
      }
  
      return issues;
    }
  
    /**
     * Check chain line compatibility and warn about cross-chaining
     */
    private checkChainLineCompatibility(setup: DrivetrainSetup, warnings: CompatibilityWarning[], notes: string[]) {
      const standardChainLines = {
        road: 43.5,
        gravel: 46.0,
        mtb: 52.0,
        hybrid: 43.5,
        bmx: 42.0
      };
  
      const standardLine = standardChainLines[setup.bikeType];
      const actualLine = setup.crankset.chainLine;
  
      notes.push(`Chain line: ${actualLine}mm (standard: ${standardLine}mm)`);
  
      if (Math.abs(actualLine - standardLine) > 2) {
        warnings.push({
          type: 'warning',
          component: 'crankset',
          issue: `Non-standard chain line: ${actualLine}mm (standard is ${standardLine}mm)`,
          suggestion: 'May cause shifting issues, chain wear, or noise'
        });
      }
  
      // Warn about cross-chaining on 2x setups
      if (setup.crankset.chainrings.length > 1) {
        warnings.push({
          type: 'info',
          component: 'drivetrain',
          issue: 'Avoid cross-chaining (big ring + big cog, small ring + small cog)',
          suggestion: 'Use middle gears for best chain line and efficiency'
        });
      }
    }
  
    /**
     * Check cable pull compatibility between shifters and derailleurs
     */
    private checkCablePullCompatibility(setup: DrivetrainSetup, warnings: CompatibilityWarning[]) {
      // This would need shifter data to be complete, but we can check brand compatibility
      const rearBrand = setup.rearDerailleur.brand;
      
      if (setup.frontDerailleur && setup.frontDerailleur.brand !== rearBrand) {
        warnings.push({
          type: 'warning',
          component: 'front_derailleur',
          issue: `Mixed brands: ${setup.frontDerailleur.brand} front / ${rearBrand} rear`,
          suggestion: 'Verify shifter compatibility - may need different cable pull ratios'
        });
      }
  
      // Specific brand compatibility notes
      if (rearBrand === 'sram' && setup.rearDerailleur.cablePull === 0) {
        warnings.push({
          type: 'info',
          component: 'rear_derailleur',
          issue: 'Wireless derailleur requires compatible wireless shifters',
          suggestion: 'SRAM AXS requires AXS shifters and battery'
        });
      }
    }
  
    /**
     * Check chain width compatibility with cassette and chainrings
     */
    private checkChainWidthCompatibility(setup: DrivetrainSetup, warnings: CompatibilityWarning[]) {
      const expectedWidths = {
        8: 7.3,
        9: 6.7,
        10: 5.9,
        11: 5.5,
        12: 5.25,
        13: 5.25
      };
  
      const expectedWidth = expectedWidths[setup.cassette.speeds as keyof typeof expectedWidths];
      const actualWidth = setup.chain.width;
  
      if (expectedWidth && Math.abs(actualWidth - expectedWidth) > 0.3) {
        warnings.push({
          type: 'critical',
          component: 'chain',
          issue: `Chain width ${actualWidth}mm may not fit ${setup.cassette.speeds}-speed cassette (expected ~${expectedWidth}mm)`,
          suggestion: 'Use chain designed for the correct speed count'
        });
      }
    }
  
    /**
     * Check bottom bracket compatibility with crankset
     */
    private checkBottomBracketCompatibility(setup: DrivetrainSetup, warnings: CompatibilityWarning[], notes: string[]) {
      const supportedBBs = setup.crankset.bottomBracket;
      
      notes.push(`Compatible bottom brackets: ${supportedBBs.join(', ')}`);
  
      if (setup.bottomBracket && !supportedBBs.includes(setup.bottomBracket)) {
        warnings.push({
          type: 'critical',
          component: 'crankset',
          issue: `Crankset not compatible with ${setup.bottomBracket} bottom bracket`,
          suggestion: `Use one of: ${supportedBBs.join(', ')}`
        });
      }
  
      // Warn about press-fit vs threaded
      const pressfit = ['BB30', 'PF30', 'BB86', 'BB90', 'BB92', 'PF92', 'BB107'];
      const threaded = ['BSA', 'ITA', 'T47'];
  
      if (setup.bottomBracket) {
        if (pressfit.includes(setup.bottomBracket)) {
          notes.push('Press-fit bottom bracket - requires proper installation tools');
        } else if (threaded.includes(setup.bottomBracket)) {
          notes.push('Threaded bottom bracket - easier to install and maintain');
        }
      }
    }
  
    /**
     * Check front derailleur compatibility
     */
    private checkFrontDerailleurCompatibility(setup: DrivetrainSetup, warnings: CompatibilityWarning[]) {
      if (!setup.frontDerailleur) return;
  
      const chainringDiff = Math.max(...setup.crankset.chainrings) - Math.min(...setup.crankset.chainrings);
      
      if (chainringDiff > setup.frontDerailleur.maxChainringDiff) {
        warnings.push({
          type: 'critical',
          component: 'front_derailleur',
          issue: `Chainring difference (${chainringDiff}T) exceeds front derailleur limit (${setup.frontDerailleur.maxChainringDiff}T)`,
          suggestion: 'Use a front derailleur designed for larger chainring differences'
        });
      }
  
      // Check if 1x setup has front derailleur (unusual)
      if (setup.crankset.chainrings.length === 1) {
        warnings.push({
          type: 'warning',
          component: 'front_derailleur',
          issue: 'Front derailleur specified for 1x (single chainring) setup',
          suggestion: '1x setups typically do not use front derailleurs'
        });
      }
    }
  
    /**
     * Get suggested compatible components
     */
    getSuggestedComponents(setup: Partial<DrivetrainSetup>) {
      // This would integrate with the component database to suggest compatible parts
      // For now, return basic suggestions based on what's provided
      const suggestions = {
        cassettes: [] as string[],
        derailleurs: [] as string[],
        chains: [] as string[],
        cranksets: [] as string[]
      };
  
      if (setup.bikeType) {
        suggestions.cassettes.push(`Look for ${setup.bikeType} cassettes`);
        suggestions.derailleurs.push(`Look for ${setup.bikeType} derailleurs`);
      }
  
      return suggestions;
    }
  
    /**
     * Calculate chain line offset for cross-chain analysis
     */
    calculateChainLineOffset(frontChainring: number, rearCog: number, setup: DrivetrainSetup): number {
      // Simplified calculation - would need more complex geometry for accuracy
      const frontPosition = setup.crankset.chainLine;
      
      // Estimate rear cog position based on cassette spread
      const cogIndex = setup.cassette.cogs.indexOf(rearCog);
      const cassetteCenterline = 43.5; // Standard road centerline
      const cogSpacing = 4.5; // Approximate spacing between cogs
      const cogOffset = (cogIndex - (setup.cassette.cogs.length - 1) / 2) * cogSpacing;
      const rearPosition = cassetteCenterline + cogOffset;
  
      return Math.abs(frontPosition - rearPosition);
    }
  
    /**
     * Identify problematic gear combinations
     */
    getProblematicGears(setup: DrivetrainSetup): {
      crossChain: Array<{front: number, rear: number, severity: 'moderate' | 'severe'}>,
      avoid: Array<{front: number, rear: number, reason: string}>
    } {
      const crossChain: Array<{front: number, rear: number, severity: 'moderate' | 'severe'}> = [];
      const avoid: Array<{front: number, rear: number, reason: string}> = [];
  
      setup.crankset.chainrings.forEach(front => {
        setup.cassette.cogs.forEach(rear => {
          const offset = this.calculateChainLineOffset(front, rear, setup);
          
          // Cross-chain detection
          if (offset > 10) {
            crossChain.push({
              front,
              rear,
              severity: offset > 15 ? 'severe' : 'moderate'
            });
          }
  
          // Other problematic combinations
          if (setup.crankset.chainrings.length > 1) {
            const bigRing = Math.max(...setup.crankset.chainrings);
            const smallRing = Math.min(...setup.crankset.chainrings);
            const bigCog = Math.max(...setup.cassette.cogs);
            const smallCog = Math.min(...setup.cassette.cogs);
  
            if (front === bigRing && rear >= bigCog * 0.8) {
              avoid.push({
                front,
                rear,
                reason: 'Big ring + big cog causes excessive cross-chaining'
              });
            }
  
            if (front === smallRing && rear <= smallCog * 1.2) {
              avoid.push({
                front,
                rear,
                reason: 'Small ring + small cog causes excessive cross-chaining'
              });
            }
          }
        });
      });
  
      return { crossChain, avoid };
    }
  }
  
  // Create singleton instance
  export const compatibilityEngine = new CompatibilityEngine();