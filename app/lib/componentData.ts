// lib/componentData.ts
import { 
  Component, 
  Crankset, 
  Cassette, 
  RearDerailleur, 
  Chain,
  DrivetrainSetup,
  CompatibilityCheck,
  CompatibilityWarning
} from '../types/components';
import { 
  SEED_COMPONENTS,
  getCranksets,
  getCassettes,
  getRearDerailleurs,
  getChains,
  getComponentsByBikeType,
  getComponentById
} from '../data/components';

export class ComponentDatabase {
  private components: Component[] = SEED_COMPONENTS;

  // Basic component retrieval
  getAllComponents(): Component[] {
    return this.components;
  }

  getComponentById(id: string): Component | undefined {
    return getComponentById(id);
  }

  // Get components by type
  getCranksets(bikeType?: string): Crankset[] {
    const cranksets = getCranksets();
    return bikeType ? cranksets.filter(c => c.bikeType === bikeType) : cranksets;
  }

  getCassettes(bikeType?: string, speeds?: number): Cassette[] {
    let cassettes = getCassettes();
    if (bikeType) cassettes = cassettes.filter(c => c.bikeType === bikeType);
    if (speeds) cassettes = cassettes.filter(c => c.speeds === speeds);
    return cassettes;
  }

  getRearDerailleurs(bikeType?: string, speeds?: number): RearDerailleur[] {
    let derailleurs = getRearDerailleurs();
    if (bikeType) derailleurs = derailleurs.filter(c => c.bikeType === bikeType);
    if (speeds) derailleurs = derailleurs.filter(c => c.speeds === speeds);
    return derailleurs;
  }

  getChains(bikeType?: string, speeds?: number): Chain[] {
    let chains = getChains();
    if (bikeType) chains = chains.filter(c => c.bikeType === bikeType);
    if (speeds) chains = chains.filter(c => c.speeds === speeds);
    return chains;
  }

  // Search functionality
  searchComponents(query: string, type?: string): Component[] {
    const searchTerm = query.toLowerCase();
    let filtered = this.components;

    if (type) {
      filtered = filtered.filter(c => c.type === type);
    }

    return filtered.filter(component => 
      component.manufacturer.toLowerCase().includes(searchTerm) ||
      component.model.toLowerCase().includes(searchTerm) ||
      component.id.toLowerCase().includes(searchTerm)
    );
  }

  // Compatibility checking
  checkCompatibility(setup: DrivetrainSetup): CompatibilityCheck {
    const warnings: CompatibilityWarning[] = [];
    const notes: string[] = [];

    // Check speed compatibility - Fix: Handle cases where crankset may not have speeds property
    const speeds = [
      setup.cassette.speeds, 
      setup.chain.speeds, 
      setup.rearDerailleur.speeds
    ].filter(s => s !== undefined); // Filter out undefined values
    
    const uniqueSpeeds = [...new Set(speeds)];
    
    if (uniqueSpeeds.length > 1) {
      warnings.push({
        type: 'critical',
        component: 'drivetrain',
        issue: `Speed mismatch: Found ${uniqueSpeeds.join(', ')} speeds across components`,
        suggestion: 'All components should have the same speed count'
      });
    }

    // Check derailleur capacity
    const frontDiff = setup.crankset.chainrings.length > 1 ? 
      Math.max(...setup.crankset.chainrings) - Math.min(...setup.crankset.chainrings) : 0;
    const rearRange = setup.cassette.cogRange[1] - setup.cassette.cogRange[0];
    const totalCapacityNeeded = frontDiff + rearRange;

    if (totalCapacityNeeded > setup.rearDerailleur.totalCapacity) {
      warnings.push({
        type: 'critical',
        component: 'rear_derailleur',
        issue: `Insufficient capacity: Need ${totalCapacityNeeded}T, derailleur has ${setup.rearDerailleur.totalCapacity}T`,
        suggestion: 'Use a long cage derailleur or reduce gear range'
      });
    }

    // Check maximum cog size
    if (setup.cassette.cogRange[1] > setup.rearDerailleur.maxCogSize) {
      warnings.push({
        type: 'critical',
        component: 'rear_derailleur',
        issue: `Cassette largest cog (${setup.cassette.cogRange[1]}T) exceeds derailleur limit (${setup.rearDerailleur.maxCogSize}T)`,
        suggestion: 'Use a smaller cassette or different derailleur'
      });
    }

    // Check freehub compatibility
    notes.push(`Freehub type: ${setup.cassette.freehubType}`);

    // Check chain line (basic check)
    const standardChainLines = {
      road: 43.5,
      gravel: 46.0,
      mtb: 52.0,
      hybrid: 43.5,
      bmx: 42.0
    };

    const expectedChainLine = standardChainLines[setup.bikeType];
    if (expectedChainLine && Math.abs(setup.crankset.chainLine - expectedChainLine) > 2) {
      warnings.push({
        type: 'warning',
        component: 'crankset',
        issue: `Non-standard chain line: ${setup.crankset.chainLine}mm (standard is ${expectedChainLine}mm)`,
        suggestion: 'May cause shifting issues or chain wear'
      });
    }

    const compatible = warnings.filter(w => w.type === 'critical').length === 0;

    return {
      compatible,
      warnings,
      notes
    };
  }

  // Get compatible components for a given setup
  getCompatibleCassettes(crankset: Crankset, derailleur: RearDerailleur): Cassette[] {
    return this.getCassettes(crankset.bikeType, derailleur.speeds)
      .filter(cassette => {
        // Check if derailleur can handle the largest cog
        if (cassette.cogRange[1] > derailleur.maxCogSize) return false;
        
        // Check total capacity if we know front difference
        const frontDiff = crankset.chainrings.length > 1 ? 
          Math.max(...crankset.chainrings) - Math.min(...crankset.chainrings) : 0;
        const rearRange = cassette.cogRange[1] - cassette.cogRange[0];
        
        return (frontDiff + rearRange) <= derailleur.totalCapacity;
      });
  }

  getCompatibleDerailleurs(crankset: Crankset, cassette: Cassette): RearDerailleur[] {
    const frontDiff = crankset.chainrings.length > 1 ? 
      Math.max(...crankset.chainrings) - Math.min(...crankset.chainrings) : 0;
    const rearRange = cassette.cogRange[1] - cassette.cogRange[0];
    const totalCapacityNeeded = frontDiff + rearRange;

    return this.getRearDerailleurs(crankset.bikeType, cassette.speeds)
      .filter(derailleur => 
        derailleur.maxCogSize >= cassette.cogRange[1] &&
        derailleur.totalCapacity >= totalCapacityNeeded
      );
  }

  // Statistics
  getStats() {
    const stats = {
      totalComponents: this.components.length,
      byType: {} as Record<string, number>,
      byManufacturer: {} as Record<string, number>,
      byBikeType: {} as Record<string, number>
    };

    this.components.forEach(component => {
      // Count by type
      stats.byType[component.type] = (stats.byType[component.type] || 0) + 1;
      
      // Count by manufacturer
      stats.byManufacturer[component.manufacturer] = (stats.byManufacturer[component.manufacturer] || 0) + 1;
      
      // Count by bike type
      stats.byBikeType[component.bikeType] = (stats.byBikeType[component.bikeType] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
export const componentDB = new ComponentDatabase();

// Convenience exports
export {
  getCranksets,
  getCassettes,
  getRearDerailleurs,
  getChains,
  getComponentsByBikeType,
  getComponentById
};