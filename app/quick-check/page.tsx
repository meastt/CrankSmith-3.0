'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Settings, CheckCircle, AlertTriangle, Info, Menu, X } from 'lucide-react';

interface CompatibilityResult {
  compatible: boolean;
  checks: {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    details: string;
  }[];
  gearRange: {
    lowest: number;
    highest: number;
    range: number;
  };
  recommendations: string[];
}

export default function MobileQuickCheckPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState({
    crankset: '',
    cassette: '',
    chain: '',
    derailleur: ''
  });
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  // Simplified component database for mobile
  const components = {
    cranksets: {
      'shimano-ultegra-fc-r8100': { 
        name: 'Shimano Ultegra FC-R8100', 
        chainrings: [50, 34], 
        speeds: 12, 
        type: 'road',
        shortName: 'Ultegra 50/34T'
      },
      'sram-force-axs': { 
        name: 'SRAM Force AXS', 
        chainrings: [48, 35], 
        speeds: 12, 
        type: 'road',
        shortName: 'Force 48/35T'
      },
      'shimano-xt-fc-m8100': { 
        name: 'Shimano XT FC-M8100', 
        chainrings: [32], 
        speeds: 12, 
        type: 'mtb',
        shortName: 'XT 32T'
      },
      'sram-gx-eagle': { 
        name: 'SRAM GX Eagle', 
        chainrings: [32], 
        speeds: 12, 
        type: 'mtb',
        shortName: 'GX Eagle 32T'
      }
    },
    cassettes: {
      'shimano-ultegra-cs-r8100': { 
        name: 'Shimano Ultegra CS-R8100', 
        cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30], 
        speeds: 11, 
        brand: 'shimano',
        type: 'road',
        shortName: '11-30T'
      },
      'sram-force-xg-1270': { 
        name: 'SRAM Force XG-1270', 
        cogs: [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 33], 
        speeds: 12, 
        brand: 'sram',
        type: 'road',
        shortName: '10-33T'
      },
      'shimano-xt-cs-m8100': { 
        name: 'Shimano XT CS-M8100', 
        cogs: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51], 
        speeds: 12, 
        brand: 'shimano',
        type: 'mtb',
        shortName: '10-51T'
      },
      'sram-gx-eagle-xg-1275': { 
        name: 'SRAM GX Eagle XG-1275', 
        cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 50], 
        speeds: 12, 
        brand: 'sram',
        type: 'mtb',
        shortName: '10-50T'
      }
    },
    chains: {
      'shimano-ultegra-cn-hg701': { 
        name: 'Shimano Ultegra CN-HG701', 
        speeds: 11, 
        brand: 'shimano',
        shortName: 'Ultegra 11sp'
      },
      'sram-force-cn-1271': { 
        name: 'SRAM Force CN-1271', 
        speeds: 12, 
        brand: 'sram',
        shortName: 'Force 12sp'
      },
      'shimano-xt-cn-m8100': { 
        name: 'Shimano XT CN-M8100', 
        speeds: 12, 
        brand: 'shimano',
        shortName: 'XT 12sp'
      },
      'sram-gx-eagle-cn-1275': { 
        name: 'SRAM GX Eagle CN-1275', 
        speeds: 12, 
        brand: 'sram',
        shortName: 'GX Eagle 12sp'
      }
    },
    derailleurs: {
      'shimano-ultegra-rd-r8150': { 
        name: 'Shimano Ultegra RD-R8150', 
        speeds: 11, 
        maxCog: 34, 
        capacity: 39, 
        brand: 'shimano',
        type: 'road',
        shortName: 'Ultegra Di2'
      },
      'sram-force-axs-rd': { 
        name: 'SRAM Force AXS RD', 
        speeds: 12, 
        maxCog: 36, 
        capacity: 36, 
        brand: 'sram',
        type: 'road',
        shortName: 'Force AXS'
      },
      'shimano-xt-rd-m8100': { 
        name: 'Shimano XT RD-M8100', 
        speeds: 12, 
        maxCog: 51, 
        capacity: 47, 
        brand: 'shimano',
        type: 'mtb',
        shortName: 'XT SGS'
      },
      'sram-gx-eagle-rd': { 
        name: 'SRAM GX Eagle RD', 
        speeds: 12, 
        maxCog: 52, 
        capacity: 52, 
        brand: 'sram',
        type: 'mtb',
        shortName: 'GX Eagle'
      }
    }
  };

  const handleComponentSelect = (component: string, value: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [component]: value
    }));
  };

  const runRealCompatibilityCheck = (): CompatibilityResult => {
    const crankset = components.cranksets[selectedComponents.crankset as keyof typeof components.cranksets];
    const cassette = components.cassettes[selectedComponents.cassette as keyof typeof components.cassettes];
    const chain = components.chains[selectedComponents.chain as keyof typeof components.chains];
    const derailleur = components.derailleurs[selectedComponents.derailleur as keyof typeof components.derailleurs];

    const checks = [];
    let compatible = true;

    // Speed compatibility check
    const speeds = [crankset?.speeds, cassette?.speeds, chain?.speeds, derailleur?.speeds];
    const speedsMatch = speeds.every(s => s === speeds[0]);
    checks.push({
      name: 'Speed Match',
      status: speedsMatch ? 'pass' : 'fail',
      details: speedsMatch 
        ? `${speeds[0]}-speed setup` 
        : `Mixed speeds: ${speeds.join('/')}`
    });
    if (!speedsMatch) compatible = false;

    // Brand compatibility check
    const brandMismatch = (cassette?.brand !== chain?.brand) || (cassette?.brand !== derailleur?.brand);
    checks.push({
      name: 'Brand Mix',
      status: brandMismatch ? 'warning' : 'pass',
      details: brandMismatch 
        ? 'Mixed brands - verify compatibility'
        : `${cassette?.brand.charAt(0).toUpperCase()}${cassette?.brand.slice(1)} system`
    });

    // Derailleur capacity check
    if (cassette && derailleur && crankset) {
      const cassetteRange = Math.max(...cassette.cogs) - Math.min(...cassette.cogs);
      const chainringRange = crankset.chainrings.length > 1 
        ? Math.max(...crankset.chainrings) - Math.min(...crankset.chainrings) 
        : 0;
      const requiredCapacity = cassetteRange + chainringRange;
      
      checks.push({
        name: 'Capacity',
        status: requiredCapacity <= derailleur.capacity ? 'pass' : 'fail',
        details: `${requiredCapacity}T req / ${derailleur.capacity}T max`
      });
      if (requiredCapacity > derailleur.capacity) compatible = false;

      // Max cog size check
      const maxCog = Math.max(...cassette.cogs);
      checks.push({
        name: 'Max Cog',
        status: maxCog <= derailleur.maxCog ? 'pass' : 'fail',
        details: `${maxCog}T / ${derailleur.maxCog}T limit`
      });
      if (maxCog > derailleur.maxCog) compatible = false;
    }

    // Calculate gear range
    let gearRange = { lowest: 0, highest: 0, range: 0 };
    if (crankset && cassette) {
      const ratios = [];
      for (const chainring of crankset.chainrings) {
        for (const cog of cassette.cogs) {
          ratios.push(chainring / cog);
        }
      }
      gearRange = {
        lowest: Math.min(...ratios),
        highest: Math.max(...ratios),
        range: Math.max(...ratios) / Math.min(...ratios)
      };
    }

    // Generate recommendations
    const recommendations = [];
    if (!compatible) {
      recommendations.push('Fix compatibility issues first');
    } else {
      if (gearRange.range > 4.5) {
        recommendations.push('Wide range - great for varied terrain');
      }
      if (brandMismatch) {
        recommendations.push('Consider matching brands for best performance');
      }
    }

    return {
      compatible,
      checks,
      gearRange,
      recommendations
    };
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const analysisResult = runRealCompatibilityCheck();
      setResult(analysisResult);
      setIsAnalyzing(false);
    }, 1500);
  };

  const canProceed = () => {
    return Object.values(selectedComponents).every(component => component !== '');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Navigation */}
      <nav className="bg-white shadow-tool border-b border-neutral-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-neutral-900">CrankSmith</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-tool">
                Quick Check
              </span>
            </div>
            
            {/* Mobile menu button and back */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push('/')}
                className="p-2 text-neutral-600 hover:text-neutral-900 touch-target"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-neutral-600 hover:text-neutral-900 touch-target md:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="border-t border-neutral-200 py-2 md:hidden">
              <div className="flex flex-col space-y-1">
                <a href="#" className="px-4 py-3 text-primary-600 font-medium touch-target">Quick Check</a>
                <a href="#" className="px-4 py-3 text-neutral-600 touch-target">Build Guide</a>
                <a href="#" className="px-4 py-3 text-neutral-600 touch-target">Tire Calculator</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="px-4 py-6 pb-20">
        {step === 1 && (
          <>
            {/* Mobile-optimized header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                Component Check
              </h2>
              <p className="text-neutral-600 text-base">
                Select components to verify compatibility
              </p>
            </div>

            {/* Mobile-first component selection */}
            <div className="space-y-4">
              {/* Crankset - Mobile optimized */}
              <div className="bg-white rounded-tool border border-neutral-200 p-4">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  Crankset
                </label>
                <select 
                  className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
                  value={selectedComponents.crankset}
                  onChange={(e) => handleComponentSelect('crankset', e.target.value)}
                >
                  <option value="">Choose crankset...</option>
                  {Object.entries(components.cranksets).map(([key, crankset]) => (
                    <option key={key} value={key}>
                      {crankset.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cassette */}
              <div className="bg-white rounded-tool border border-neutral-200 p-4">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  Cassette
                </label>
                <select 
                  className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
                  value={selectedComponents.cassette}
                  onChange={(e) => handleComponentSelect('cassette', e.target.value)}
                >
                  <option value="">Choose cassette...</option>
                  {Object.entries(components.cassettes).map(([key, cassette]) => (
                    <option key={key} value={key}>
                      {cassette.brand.charAt(0).toUpperCase() + cassette.brand.slice(1)} {cassette.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chain */}
              <div className="bg-white rounded-tool border border-neutral-200 p-4">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  Chain
                </label>
                <select 
                  className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
                  value={selectedComponents.chain}
                  onChange={(e) => handleComponentSelect('chain', e.target.value)}
                >
                  <option value="">Choose chain...</option>
                  {Object.entries(components.chains).map(([key, chain]) => (
                    <option key={key} value={key}>
                      {chain.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Derailleur */}
              <div className="bg-white rounded-tool border border-neutral-200 p-4">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  Rear Derailleur
                </label>
                <select 
                  className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
                  value={selectedComponents.derailleur}
                  onChange={(e) => handleComponentSelect('derailleur', e.target.value)}
                >
                  <option value="">Choose derailleur...</option>
                  {Object.entries(components.derailleurs).map(([key, derailleur]) => (
                    <option key={key} value={key}>
                      {derailleur.shortName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile-optimized action button */}
            <div className="mt-8">
              <button 
                onClick={handleAnalyze}
                disabled={!canProceed()}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-tool text-lg font-semibold hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors touch-target flex items-center justify-center"
              >
                Check Compatibility
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </>
        )}

        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-tool flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Checking Compatibility</h3>
            <p className="text-neutral-600">Verifying specifications...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Mobile-optimized results header */}
            <div className="bg-white rounded-tool border border-neutral-200 p-4">
              <div className="flex items-center mb-3">
                {result.compatible ? (
                  <CheckCircle className="w-6 h-6 text-success-500 mr-3 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {result.compatible ? 'Compatible' : 'Issues Found'}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    {result.compatible 
                      ? 'Components work together'
                      : 'Some parts not compatible'
                    }
                  </p>
                </div>
              </div>

              {/* Mobile-optimized compatibility checks */}
              <div className="space-y-2">
                {result.checks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded-tool">
                    <div className="flex items-center">
                      {check.status === 'pass' && <CheckCircle className="w-4 h-4 text-success-500 mr-2 flex-shrink-0" />}
                      {check.status === 'warning' && <AlertTriangle className="w-4 h-4 text-tool-safety mr-2 flex-shrink-0" />}
                      {check.status === 'fail' && <AlertTriangle className="w-4 h-4 text-accent-500 mr-2 flex-shrink-0" />}
                      <span className="text-sm font-medium text-neutral-900">{check.name}</span>
                    </div>
                    <span className="text-xs text-neutral-600">{check.details}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile gear range display */}
            <div className="bg-white rounded-tool border border-neutral-200 p-4">
              <h3 className="text-base font-semibold text-neutral-900 mb-3">Gear Range</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-primary-600">{result.gearRange.lowest.toFixed(2)}</div>
                  <div className="text-xs text-neutral-600">Low</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-success-500">{result.gearRange.highest.toFixed(2)}</div>
                  <div className="text-xs text-neutral-600">High</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-tool-orange">{result.gearRange.range.toFixed(1)}</div>
                  <div className="text-xs text-neutral-600">Range</div>
                </div>
              </div>
            </div>

            {/* Mobile recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-tool p-4">
                <h3 className="font-semibold text-primary-800 mb-2 flex items-center text-sm">
                  <Info className="w-4 h-4 mr-2" />
                  Tips
                </h3>
                <ul className="text-sm text-primary-700 space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mobile action buttons */}
            <div className="space-y-3 pt-4">
              <button 
                onClick={() => {
                  setStep(1);
                  setResult(null);
                  setIsAnalyzing(false);
                }}
                className="w-full bg-neutral-600 text-white py-3 px-4 rounded-tool font-medium hover:bg-neutral-700 transition-colors touch-target"
              >
                Check Another Setup
              </button>
              {result.compatible && (
                <button 
                  onClick={() => router.push('/analyze')}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-tool font-medium hover:bg-primary-700 transition-colors touch-target"
                >
                  Detailed Analysis
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}