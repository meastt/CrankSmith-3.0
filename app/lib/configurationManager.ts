// app/lib/configurationManager.ts
import { GearSetup } from './gearCalculator';
import { DrivetrainAnalysis } from '../types/components';

interface SavedConfiguration {
  id: string;
  name: string;
  setup: GearSetup;
  created: string;
  lastModified: string;
  analysis?: DrivetrainAnalysis;
}

export class ConfigurationManager {
  private static readonly STORAGE_KEY = 'cranksmith_configurations';
  private static readonly MAX_CONFIGS = 20; // Limit to prevent storage bloat

  /**
   * Save a configuration to localStorage
   */
  static save(name: string, setup: GearSetup, analysis?: DrivetrainAnalysis): string {
    const configurations = this.getAll();
    const id = this.generateId();
    const now = new Date().toISOString();

    const newConfig: SavedConfiguration = {
      id,
      name,
      setup,
      created: now,
      lastModified: now,
      analysis
    };

    // Add to beginning of array
    configurations.unshift(newConfig);

    // Limit number of saved configurations
    if (configurations.length > this.MAX_CONFIGS) {
      configurations.splice(this.MAX_CONFIGS);
    }

    // Save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configurations));
      return id;
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw new Error('Failed to save configuration. Storage may be full.');
    }
  }

  /**
   * Update an existing configuration
   */
  static update(id: string, updates: Partial<Omit<SavedConfiguration, 'id' | 'created'>>): boolean {
    const configurations = this.getAll();
    const index = configurations.findIndex(config => config.id === id);

    if (index === -1) {
      return false;
    }

    configurations[index] = {
      ...configurations[index],
      ...updates,
      lastModified: new Date().toISOString()
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configurations));
      return true;
    } catch (error) {
      console.error('Failed to update configuration:', error);
      return false;
    }
  }

  /**
   * Get all saved configurations
   */
  static getAll(): SavedConfiguration[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load configurations:', error);
      return [];
    }
  }

  /**
   * Get a specific configuration by ID
   */
  static getById(id: string): SavedConfiguration | null {
    const configurations = this.getAll();
    return configurations.find(config => config.id === id) || null;
  }

  /**
   * Delete a configuration
   */
  static delete(id: string): boolean {
    const configurations = this.getAll();
    const filtered = configurations.filter(config => config.id !== id);

    if (filtered.length === configurations.length) {
      return false; // Configuration not found
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete configuration:', error);
      return false;
    }
  }

  /**
   * Export configuration as JSON
   */
  static exportAsJSON(config: SavedConfiguration): string {
    const exportData = {
      ...config,
      exportedAt: new Date().toISOString(),
      version: "3.0",
      application: "CrankSmith"
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  static importFromJSON(jsonString: string): SavedConfiguration {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate required fields
      if (!data.setup || !data.name) {
        throw new Error('Invalid configuration format');
      }

      // Create new configuration with fresh ID
      const imported: SavedConfiguration = {
        id: this.generateId(),
        name: `${data.name} (Imported)`,
        setup: data.setup,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        analysis: data.analysis
      };

      return imported;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Generate shareable URL for configuration
   */
  static generateShareURL(config: SavedConfiguration): string {
    try {
      // Compress the setup data
      const shareData = {
        name: config.name,
        setup: config.setup
      };

      const compressed = btoa(JSON.stringify(shareData));
      const baseUrl = window.location.origin;
      
      return `${baseUrl}/build?share=${compressed}`;
    } catch (error) {
      console.error('Failed to generate share URL:', error);
      throw new Error('Failed to generate share URL');
    }
  }

  /**
   * Load configuration from share URL
   */
  static loadFromShareURL(shareParam: string): SavedConfiguration {
    try {
      const decompressed = atob(shareParam);
      const data = JSON.parse(decompressed);

      return {
        id: this.generateId(),
        name: `${data.name} (Shared)`,
        setup: data.setup,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Invalid share URL');
    }
  }

  /**
   * Export configuration as PDF report
   */
  static async exportAsPDF(config: SavedConfiguration): Promise<Blob> {
    // This would integrate with jsPDF
    // For now, return a simple text blob
    const reportText = this.generateTextReport(config);
    return new Blob([reportText], { type: 'text/plain' });
  }

  /**
   * Generate text report for configuration
   */
  private static generateTextReport(config: SavedConfiguration): string {
    const { setup, analysis, name, created } = config;
    
    let report = `CrankSmith 3.0 Drivetrain Analysis Report\n`;
    report += `Configuration: ${name}\n`;
    report += `Generated: ${new Date(created).toLocaleDateString()}\n`;
    report += `\n`;
    
    report += `COMPONENTS:\n`;
    report += `Bike Type: ${setup.bikeType}\n`;
    report += `Crankset: ${setup.crankset.manufacturer} ${setup.crankset.model}\n`;
    report += `Cassette: ${setup.cassette.manufacturer} ${setup.cassette.model}\n`;
    report += `Derailleur: ${setup.rearDerailleur.manufacturer} ${setup.rearDerailleur.model}\n`;
    report += `Chain: ${setup.chain.manufacturer} ${setup.chain.model}\n`;
    report += `Wheels: ${setup.wheelSetup.tireSize} on ${setup.wheelSetup.rimWidth}mm rim\n`;
    report += `Crank Length: ${setup.crankLength}mm\n`;
    report += `\n`;

    if (analysis) {
      report += `ANALYSIS SUMMARY:\n`;
      report += `Total Gears: ${analysis.totalGears}\n`;
      report += `Gear Range: ${analysis.gearRange.toFixed(1)}:1\n`;
      report += `Average Step: ${analysis.averageStep.toFixed(1)}%\n`;
      report += `Compatibility: ${analysis.compatibility.compatible ? 'Compatible' : 'Issues Found'}\n`;
      
      if (analysis.compatibility.warnings.length > 0) {
        report += `\nCOMPATIBILITY WARNINGS:\n`;
        analysis.compatibility.warnings.forEach(warning => {
          report += `- ${warning.issue}\n`;
        });
      }
    }

    return report;
  }

  /**
   * Generate unique ID for configuration
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): {
    configurations: number;
    storageUsed: number;
    storageLimit: number;
    canSaveMore: boolean;
  } {
    const configurations = this.getAll();
    const storageUsed = new Blob([localStorage.getItem(this.STORAGE_KEY) || '']).size;
    const storageLimit = 5 * 1024 * 1024; // 5MB typical localStorage limit
    
    return {
      configurations: configurations.length,
      storageUsed,
      storageLimit,
      canSaveMore: configurations.length < this.MAX_CONFIGS && storageUsed < storageLimit * 0.8
    };
  }

  /**
   * Clear all saved configurations
   */
  static clearAll(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear configurations:', error);
      return false;
    }
  }
}

export type { SavedConfiguration };