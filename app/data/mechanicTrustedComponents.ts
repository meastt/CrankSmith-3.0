// app/data/mechanicTrustedComponents.ts
// Curated list of 15 components that mechanics actually recommend
// Based on reliability, availability, and real-world performance

export interface ComponentData {
    // Core component info
    id: string;
    component_type: 'crankset' | 'cassette' | 'chain' | 'rear_derailleur';
    manufacturer_name: string;
    model_name: string;
    year: number;
    weight_grams: number;
    bike_type: 'road' | 'mtb' | 'gravel' | 'hybrid';
    msrp_usd: number;
    
    // Component-specific details
    details: any;
  }
  
  // THE MECHANIC'S DOZEN + 3
  // These are the components that shops actually stock and recommend
  export const MECHANIC_TRUSTED_COMPONENTS: ComponentData[] = [
    
    // === CRANKSETS (4 components) ===
    {
      id: 'shimano-ultegra-fc-r8100-50-34',
      component_type: 'crankset',
      manufacturer_name: 'Shimano',
      model_name: 'Ultegra FC-R8100',
      year: 2021,
      weight_grams: 685,
      bike_type: 'road',
      msrp_usd: 280,
      details: {
        chainrings: [50, 34],
        chainline_mm: 43.5,
        available_lengths_mm: [165, 170, 172.5, 175],
        bcd_major: 110,
        bcd_minor: null,
        bottom_bracket_standards: ['BSA', 'BB86', 'PF86']
      }
    },
    {
      id: 'sram-force-axs-48-35',
      component_type: 'crankset',
      manufacturer_name: 'SRAM',
      model_name: 'Force AXS',
      year: 2019,
      weight_grams: 730,
      bike_type: 'road',
      msrp_usd: 320,
      details: {
        chainrings: [48, 35],
        chainline_mm: 43.5,
        available_lengths_mm: [165, 170, 172.5, 175],
        bcd_major: 107,
        bcd_minor: null,
        bottom_bracket_standards: ['BSA', 'BB86', 'PF86', 'BB30']
      }
    },
    {
      id: 'shimano-xt-fc-m8100-32',
      component_type: 'crankset',
      manufacturer_name: 'Shimano',
      model_name: 'XT FC-M8100',
      year: 2018,
      weight_grams: 625,
      bike_type: 'mtb',
      msrp_usd: 180,
      details: {
        chainrings: [32],
        chainline_mm: 52,
        available_lengths_mm: [165, 170, 175],
        bcd_major: 96,
        bcd_minor: null,
        bottom_bracket_standards: ['BSA', 'BB92', 'PF92']
      }
    },
    {
      id: 'sram-gx-eagle-32',
      component_type: 'crankset',
      manufacturer_name: 'SRAM',
      model_name: 'GX Eagle',
      year: 2017,
      weight_grams: 650,
      bike_type: 'mtb',
      msrp_usd: 150,
      details: {
        chainrings: [32],
        chainline_mm: 52,
        available_lengths_mm: [165, 170, 175],
        bcd_major: 104,
        bcd_minor: null,
        bottom_bracket_standards: ['BSA', 'BB92', 'BB30']
      }
    },
  
    // === CASSETTES (4 components) ===
    {
      id: 'shimano-ultegra-cs-r8100-11-30',
      component_type: 'cassette',
      manufacturer_name: 'Shimano',
      model_name: 'Ultegra CS-R8100',
      year: 2021,
      weight_grams: 251,
      bike_type: 'road',
      msrp_usd: 120,
      details: {
        speeds: 11,
        cog_range: [11, 30],
        cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30],
        freehub_type: 'shimano-11'
      }
    },
    {
      id: 'sram-force-xg-1270-10-33',
      component_type: 'cassette',
      manufacturer_name: 'SRAM',
      model_name: 'Force XG-1270',
      year: 2019,
      weight_grams: 232,
      bike_type: 'road',
      msrp_usd: 150,
      details: {
        speeds: 12,
        cog_range: [10, 33],
        cogs: [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 33],
        freehub_type: 'sram-xdr'
      }
    },
    {
      id: 'shimano-xt-cs-m8100-10-51',
      component_type: 'cassette',
      manufacturer_name: 'Shimano',
      model_name: 'XT CS-M8100',
      year: 2018,
      weight_grams: 461,
      bike_type: 'mtb',
      msrp_usd: 200,
      details: {
        speeds: 12,
        cog_range: [10, 51],
        cogs: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
        freehub_type: 'shimano-12'
      }
    },
    {
      id: 'sram-gx-eagle-xg-1275-10-50',
      component_type: 'cassette',
      manufacturer_name: 'SRAM',
      model_name: 'GX Eagle XG-1275',
      year: 2017,
      weight_grams: 440,
      bike_type: 'mtb',
      msrp_usd: 180,
      details: {
        speeds: 12,
        cog_range: [10, 50],
        cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 50],
        freehub_type: 'sram-xd'
      }
    },
  
    // === CHAINS (4 components) ===
    {
      id: 'shimano-ultegra-cn-hg701',
      component_type: 'chain',
      manufacturer_name: 'Shimano',
      model_name: 'Ultegra CN-HG701',
      year: 2017,
      weight_grams: 257,
      bike_type: 'road',
      msrp_usd: 45,
      details: {
        speeds: 11,
        width_mm: 5.62,
        links: 116,
        brand: 'shimano'
      }
    },
    {
      id: 'sram-force-cn-1271',
      component_type: 'chain',
      manufacturer_name: 'SRAM',
      model_name: 'Force CN-1271',
      year: 2019,
      weight_grams: 242,
      bike_type: 'road',
      msrp_usd: 55,
      details: {
        speeds: 12,
        width_mm: 5.25,
        links: 114,
        brand: 'sram'
      }
    },
    {
      id: 'shimano-xt-cn-m8100',
      component_type: 'chain',
      manufacturer_name: 'Shimano',
      model_name: 'XT CN-M8100',
      year: 2018,
      weight_grams: 268,
      bike_type: 'mtb',
      msrp_usd: 55,
      details: {
        speeds: 12,
        width_mm: 5.25,
        links: 126,
        brand: 'shimano'
      }
    },
    {
      id: 'sram-gx-eagle-cn-1275',
      component_type: 'chain',
      manufacturer_name: 'SRAM',
      model_name: 'GX Eagle CN-1275',
      year: 2017,
      weight_grams: 280,
      bike_type: 'mtb',
      msrp_usd: 45,
      details: {
        speeds: 12,
        width_mm: 5.25,
        links: 126,
        brand: 'sram'
      }
    },
  
    // === REAR DERAILLEURS (3 components) ===
    {
      id: 'shimano-ultegra-rd-r8150',
      component_type: 'rear_derailleur',
      manufacturer_name: 'Shimano',
      model_name: 'Ultegra RD-R8150',
      year: 2021,
      weight_grams: 262,
      bike_type: 'road',
      msrp_usd: 250,
      details: {
        speeds: 11,
        max_cog_size: 34,
        capacity_teeth: 39,
        actuation_type: 'electronic',
        cage_length: 'GS',
        brand: 'shimano'
      }
    },
    {
      id: 'shimano-xt-rd-m8100-sgs',
      component_type: 'rear_derailleur',
      manufacturer_name: 'Shimano',
      model_name: 'XT RD-M8100',
      year: 2018,
      weight_grams: 300,
      bike_type: 'mtb',
      msrp_usd: 200,
      details: {
        speeds: 12,
        max_cog_size: 51,
        capacity_teeth: 47,
        actuation_type: 'mechanical',
        cage_length: 'SGS',
        brand: 'shimano'
      }
    },
    {
      id: 'sram-gx-eagle-rd',
      component_type: 'rear_derailleur',
      manufacturer_name: 'SRAM',
      model_name: 'GX Eagle RD',
      year: 2017,
      weight_grams: 320,
      bike_type: 'mtb',
      msrp_usd: 150,
      details: {
        speeds: 12,
        max_cog_size: 50,
        capacity_teeth: 50,
        actuation_type: 'mechanical',
        cage_length: 'long',
        brand: 'sram'
      }
    }
  ];
  
  // Helper functions for component retrieval
  export function getComponentsByType(type: ComponentData['component_type']) {
    return MECHANIC_TRUSTED_COMPONENTS.filter(comp => comp.component_type === type);
  }
  
  export function getComponentsByBikeType(bikeType: ComponentData['bike_type']) {
    return MECHANIC_TRUSTED_COMPONENTS.filter(comp => comp.bike_type === bikeType);
  }
  
  export function getCompatibleComponents(bikeType: ComponentData['bike_type'], speeds?: number) {
    let components = getComponentsByBikeType(bikeType);
    
    if (speeds) {
      components = components.filter(comp => {
        // For non-cassette components, check if they support the speed count
        if (comp.component_type === 'cassette') return comp.details.speeds === speeds;
        if (comp.component_type === 'chain') return comp.details.speeds === speeds;
        if (comp.component_type === 'rear_derailleur') return comp.details.speeds === speeds;
        // Cranksets work with multiple speeds
        return true;
      });
    }
    
    return components;
  }
  
  // Quick compatibility check
  export function checkBasicCompatibility(
    crankset: ComponentData,
    cassette: ComponentData, 
    chain: ComponentData,
    derailleur: ComponentData
  ): { compatible: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Speed compatibility
    const speeds = [cassette.details.speeds, chain.details.speeds, derailleur.details.speeds];
    if (!speeds.every(s => s === speeds[0])) {
      issues.push(`Speed mismatch: ${speeds.join('/')}-speed components`);
    }
    
    // Derailleur capacity
    const cassetteRange = cassette.details.cog_range[1] - cassette.details.cog_range[0];
    const chainringRange = crankset.details.chainrings.length > 1 
      ? Math.max(...crankset.details.chainrings) - Math.min(...crankset.details.chainrings)
      : 0;
    const requiredCapacity = cassetteRange + chainringRange;
    
    if (requiredCapacity > derailleur.details.capacity_teeth) {
      issues.push(`Derailleur capacity insufficient: ${requiredCapacity}T required, ${derailleur.details.capacity_teeth}T available`);
    }
    
    // Max cog size
    const maxCog = Math.max(...cassette.details.cogs);
    if (maxCog > derailleur.details.max_cog_size) {
      issues.push(`Max cog too large: ${maxCog}T cassette, ${derailleur.details.max_cog_size}T derailleur limit`);
    }
    
    return {
      compatible: issues.length === 0,
      issues
    };
  }
  
  // Component summary for debugging
  export function getComponentSummary() {
    const summary = {
      total: MECHANIC_TRUSTED_COMPONENTS.length,
      by_type: {} as Record<string, number>,
      by_bike_type: {} as Record<string, number>
    };
    
    MECHANIC_TRUSTED_COMPONENTS.forEach(comp => {
      summary.by_type[comp.component_type] = (summary.by_type[comp.component_type] || 0) + 1;
      summary.by_bike_type[comp.bike_type] = (summary.by_bike_type[comp.bike_type] || 0) + 1;
    });
    
    return summary;
  }