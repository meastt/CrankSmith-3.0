'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Settings, CheckCircle, AlertTriangle, Info } from 'lucide-react';

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

export default function QuickCheckPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState({
    crankset: '',
    cassette: '',
    chain: '',
    derailleur: ''
  });
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  // Real component database (simplified for demo)
  const components = {
    cranksets: {
      'shimano-ultegra-fc-r8100': { 
        name: 'Shimano Ultegra FC-R8100', 
        chainrings: [50, 34], 
        speeds: 12, 
        type: 'road' 
      },
      'sram-force-axs': { 
        name: 'SRAM Force AXS', 
        chainrings: [48, 35], 
        speeds: 12, 
        type: 'road' 
      },
      'shimano-xt-fc-m8100': { 
        name: 'Shimano XT FC-M8100', 
        chainrings: [32], 
        speeds: 12, 
        type: 'mtb' 
      },
      'sram-gx-eagle': { 
        name: 'SRAM GX Eagle', 
        chainrings: [32], 
        speeds: 12, 
        type: 'mtb' 
      }
    },
    cassettes: {
      'shimano-ultegra-cs-r8100': { 
        name: 'Shimano Ultegra CS-R8100', 
        cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30], 
        speeds: 11, 
        brand: 'shimano',
        type: 'road'
      },
      'sram-force-xg-1270': { 
        name: 'SRAM Force XG-1270', 
        cogs: [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 33], 
        speeds: 12, 
        brand: 'sram',
        type: 'road'
      },
      'shimano-xt-cs-m8100': { 
        name: 'Shimano XT CS-M8100', 
        cogs: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51], 
        speeds: 12, 
        brand: 'shimano',
        type: 'mtb'
      },
      'sram-gx-eagle-xg-1275': { 
        name: 'SRAM GX Eagle XG-1275', 
        cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 50], 
        speeds: 12, 
        brand: 'sram',
        type: 'mtb'
      }
    },
    chains: {
      'shimano-ultegra-cn-hg701': { 
        name: 'Shimano Ultegra CN-HG701', 
        speeds: 11, 
        brand: 'shimano' 
      },
      'sram-force-cn-1271': { 
        name: 'SRAM Force CN-1271', 
        speeds: 12, 
        brand: 'sram' 
      },
      'shimano-xt-cn-m8100': { 
        name: 'Shimano XT CN-M8100', 
        speeds: 12, 
        brand: 'shimano' 
      },
      'sram-gx-eagle-cn-1275': { 
        name: 'SRAM GX Eagle CN-1275', 
        speeds: 12, 
        brand: 'sram' 
      }
    },
    derailleurs: {
      'shimano-ultegra-rd-r8150': { 
        name: 'Shimano Ultegra RD-R8150', 
        speeds: 11, 
        maxCog: 34, 
        capacity: 39, 
        brand: 'shimano',
        type: 'road'
      },
      'sram-force-axs-rd': { 
        name: 'SRAM Force AXS RD', 
        speeds: 12, 
        maxCog: 36, 
        capacity: 36, 
        brand: 'sram',
        type: 'road'
      },
      'shimano-xt-rd-m8100': { 
        name: 'Shimano XT RD-M8100', 
        speeds: 12, 
        maxCog: 51, 
        capacity: 47, 
        brand: 'shimano',
        type: 'mtb'
      },
      'sram-gx-eagle-rd': { 
        name: 'SRAM GX Eagle RD', 
        speeds: 12, 
        maxCog: 52, 
        capacity: 52, 
        brand: 'sram',
        type: 'mtb'
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
      name: 'Speed Compatibility',
      status: speedsMatch ? 'pass' : 'fail',
      details: speedsMatch 
        ? `All components are ${speeds[0]}-speed` 
        : `Speed mismatch: ${speeds.join('/')}-speed components`
    });
    if (!speedsMatch) compatible = false;

    // Brand compatibility check
    const crankBrand = selectedComponents.crankset.includes('shimano') ? 'shimano' : 'sram';
    const brandMismatch = (cassette?.brand !== chain?.brand) || (cassette?.brand !== derailleur?.brand);
    checks.push({
      name: 'Brand Compatibility',
      status: brandMismatch ? 'warning' : 'pass',
      details: brandMismatch 
        ? 'Mixed brands may require specific compatibility checks'
        : `${cassette?.brand.charAt(0).toUpperCase()}${cassette?.brand.slice(1)} drivetrain components`
    });

    // Derailleur capacity check
    if (cassette && derailleur && crankset) {
      const cassetteRange = Math.max(...cassette.cogs) - Math.min(...cassette.cogs);
      const chainringRange = crankset.chainrings.length > 1 
        ? Math.max(...crankset.chainrings) - Math.min(...crankset.chainrings) 
        : 0;
      const requiredCapacity = cassetteRange + chainringRange;
      
      checks.push({
        name: 'Derailleur Capacity',
        status: requiredCapacity <= derailleur.capacity ? 'pass' : 'fail',
        details: `Required: ${requiredCapacity}T, Available: ${derailleur.capacity}T`
      });
      if (requiredCapacity > derailleur.capacity) compatible = false;

      // Max cog size check
      const maxCog = Math.max(...cassette.cogs);
      checks.push({
        name: 'Maximum Cog Size',
        status: maxCog <= derailleur.maxCog ? 'pass' : 'fail',
        details: `Cassette: ${maxCog}T, Derailleur limit: ${derailleur.maxCog}T`
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
      recommendations.push('Fix compatibility issues before proceeding');
    } else {
      if (gearRange.range > 4.5) {
        recommendations.push('Wide gear range - excellent for varied terrain');
      }
      if (brandMismatch) {
        recommendations.push('Consider matching all components to same brand for optimal performance');
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
    // Short delay to show checking state, then calculate
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">CrankSmith</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-blue-600 font-medium">Quick Check</a>
                <a href="#" className="text-gray-500 hover:text-gray-900">Build Guide</a>
                <a href="#" className="text-gray-500 hover:text-gray-900">Database</a>
              </nav>
            </div>
            
            <button 
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Component Compatibility Check
                </h2>
                <p className="text-lg text-gray-600">
                  Select your drivetrain components to verify compatibility and calculate gear ratios
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Crankset Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Crankset
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedComponents.crankset}
                      onChange={(e) => handleComponentSelect('crankset', e.target.value)}
                    >
                      <option value="">Select a crankset...</option>
                      {Object.entries(components.cranksets).map(([key, crankset]) => (
                        <option key={key} value={key}>
                          {crankset.name} ({crankset.chainrings.join('/')}T)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cassette Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Cassette
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedComponents.cassette}
                      onChange={(e) => handleComponentSelect('cassette', e.target.value)}
                    >
                      <option value="">Select a cassette...</option>
                      {Object.entries(components.cassettes).map(([key, cassette]) => (
                        <option key={key} value={key}>
                          {cassette.name} ({Math.min(...cassette.cogs)}-{Math.max(...cassette.cogs)}T)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chain Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chain
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedComponents.chain}
                      onChange={(e) => handleComponentSelect('chain', e.target.value)}
                    >
                      <option value="">Select a chain...</option>
                      {Object.entries(components.chains).map(([key, chain]) => (
                        <option key={key} value={key}>
                          {chain.name} ({chain.speeds}-speed)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Derailleur Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Rear Derailleur
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedComponents.derailleur}
                      onChange={(e) => handleComponentSelect('derailleur', e.target.value)}
                    >
                      <option value="">Select a derailleur...</option>
                      {Object.entries(components.derailleurs).map(([key, derailleur]) => (
                        <option key={key} value={key}>
                          {derailleur.name} (Max {derailleur.maxCog}T)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={handleAnalyze}
                    disabled={!canProceed()}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    Check Compatibility <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}

          {isAnalyzing && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Checking Compatibility</h3>
              <p className="text-gray-600">Verifying component specifications...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Overall Result */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  {result.compatible ? (
                    <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {result.compatible ? 'Compatible Setup' : 'Compatibility Issues Found'}
                    </h2>
                    <p className="text-gray-600">
                      {result.compatible 
                        ? 'All components work together properly'
                        : 'Some components are not compatible'
                      }
                    </p>
                  </div>
                </div>

                {/* Compatibility Checks */}
                <div className="space-y-3">
                  {result.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {check.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
                        {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />}
                        {check.status === 'fail' && <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />}
                        <span className="font-medium text-gray-900">{check.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{check.details}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gear Range */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gear Range Analysis</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.gearRange.lowest.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Lowest Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.gearRange.highest.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Highest Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.gearRange.range.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Range</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Recommendations
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                    setIsAnalyzing(false);
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Check Another Setup
                </button>
                {result.compatible && (
                  <button 
                    onClick={() => router.push('/analyze')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Detailed Analysis
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}