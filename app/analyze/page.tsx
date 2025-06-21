// app/analyze/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { GearChart } from '../components/GearChart';
import { SpeedCalculator } from '../components/SpeedCalculator';
import { gearCalculator, GearSetup } from '../lib/gearCalculator';
import { GearCalculation } from '../types/components';

export default function GearAnalysisPage() {
  const [gears, setGears] = useState<GearCalculation[]>([]);
  const [selectedGear, setSelectedGear] = useState<GearCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState<GearSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCustomSetup, setIsCustomSetup] = useState(false);

  // Initialize with either custom setup from build page or sample setup
  useEffect(() => {
    loadSetup();
  }, []);

  const loadSetup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if there's a custom setup from the build page
      const storedSetup = sessionStorage.getItem('cranksmith_setup');
      
      if (storedSetup) {
        try {
          const customSetup = JSON.parse(storedSetup);
          console.log('Loading custom setup from build page:', customSetup);
          
          setSetup(customSetup);
          setIsCustomSetup(true);
          
          // Calculate gears for custom setup
          const calculatedGears = gearCalculator.calculateAllGears(customSetup);
          setGears(calculatedGears);
          
          // Select middle gear as default
          if (calculatedGears.length > 0) {
            setSelectedGear(calculatedGears[Math.floor(calculatedGears.length / 2)]);
          }
          
          setLoading(false);
          return;
        } catch (parseError) {
          console.warn('Failed to parse stored setup, falling back to sample setup');
          sessionStorage.removeItem('cranksmith_setup'); // Clear corrupted data
        }
      }
      
      // Fall back to sample setup if no custom setup
      await loadSampleSetup();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load gear analysis';
      setError(errorMessage);
      console.error('Error loading setup:', err);
      setLoading(false);
    }
  };

  const loadSampleSetup = async () => {
    try {
      // Import components dynamically
      const { getCranksets, getCassettes, getRearDerailleurs, getChains } = 
        await import('../data/components');
      
      const cranksets = getCranksets();
      const cassettes = getCassettes();
      const derailleurs = getRearDerailleurs();
      const chains = getChains();

      // Find components with proper error handling
      const crankset = cranksets.find(c => c.id === 'shimano-105-r7000-50-34');
      const cassette = cassettes.find(c => c.id === 'shimano-105-r7000-11-32');
      const derailleur = derailleurs.find(d => d.id === 'shimano-105-r7000-gs');
      const chain = chains.find(c => c.id === 'shimano-105-cn-hg601-11');

      if (!crankset || !cassette || !derailleur || !chain) {
        throw new Error('Could not find required components for sample setup');
      }

      // Create sample setup
      const sampleSetup: GearSetup = {
        bikeType: 'road',
        crankset,
        cassette,
        rearDerailleur: derailleur,
        chain,
        wheelSetup: {
          tireSize: '700x25c',
          rimWidth: 21
        },
        crankLength: 175
      };

      setSetup(sampleSetup);
      setIsCustomSetup(false);
      
      // Calculate gears
      const calculatedGears = gearCalculator.calculateAllGears(sampleSetup);
      setGears(calculatedGears);
      
      // Select first optimal gear as default
      const optimalGears = gearCalculator.getOptimalGears(calculatedGears);
      if (optimalGears.length > 0) {
        setSelectedGear(optimalGears[Math.floor(optimalGears.length / 2)]);
      } else if (calculatedGears.length > 0) {
        setSelectedGear(calculatedGears[Math.floor(calculatedGears.length / 2)]);
      }
      
      setLoading(false);
      
    } catch (err) {
      throw err; // Re-throw to be caught by parent try-catch
    }
  };

  const handleGearSelect = (gear: GearCalculation) => {
    setSelectedGear(gear);
  };

  const clearCustomSetup = () => {
    sessionStorage.removeItem('cranksmith_setup');
    loadSampleSetup();
  };

  // Calculate analysis summary
  const analysisData = React.useMemo(() => {
    if (gears.length === 0) return null;

    const optimalGears = gearCalculator.getOptimalGears(gears);
    const problematicGears = gearCalculator.getProblematicGears(gears);
    const gearRange = gearCalculator.calculateGearRange(gears);
    const gearSteps = gearCalculator.calculateGearSteps(gears);
    const duplicates = gearCalculator.findGearDuplicates(gears);

    return {
      total: gears.length,
      optimal: optimalGears.length,
      problematic: problematicGears.length,
      range: gearRange.range,
      averageStep: gearSteps.length > 0 ? 
        gearSteps.reduce((sum, step) => sum + step.stepPercentage, 0) / gearSteps.length : 0,
      largestStep: gearSteps.length > 0 ? Math.max(...gearSteps.map(s => s.stepPercentage)) : 0,
      duplicates: duplicates.length,
      lowestRatio: Math.min(...gears.map(g => g.ratio)),
      highestRatio: Math.max(...gears.map(g => g.ratio)),
      lowestUsable: gearRange.lowestUsable?.ratio || 0,
      highestUsable: gearRange.highestUsable?.ratio || 0
    };
  }, [gears]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating gear analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSetup}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                CrankSmith 3.0 - Gear Analysis
              </h1>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                isCustomSetup 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isCustomSetup ? 'Custom Setup' : 'Demo Setup'}
              </span>
            </div>
            <div className="flex space-x-4">
              {isCustomSetup && (
                <button
                  onClick={clearCustomSetup}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  🔄 Load Demo
                </button>
              )}
              <button
                onClick={loadSetup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                🔄 Reload
              </button>
              <a
                href="/build"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Build New Setup
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup Summary */}
        {setup && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Current Setup
              </h2>
              {isCustomSetup && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  ✓ Built by you
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Crankset</h3>
                <p className="text-sm text-gray-900">
                  {setup.crankset.manufacturer} {setup.crankset.model}
                </p>
                <p className="text-xs text-gray-600">
                  {setup.crankset.chainrings.join('/')}T, {setup.crankLength}mm
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Cassette</h3>
                <p className="text-sm text-gray-900">
                  {setup.cassette.manufacturer} {setup.cassette.model}
                </p>
                <p className="text-xs text-gray-600">
                  {setup.cassette.speeds}sp, {setup.cassette.cogRange[0]}-{setup.cassette.cogRange[1]}T
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Derailleur</h3>
                <p className="text-sm text-gray-900">
                  {setup.rearDerailleur.manufacturer} {setup.rearDerailleur.model}
                </p>
                <p className="text-xs text-gray-600">
                  {setup.rearDerailleur.cageLength}, Max {setup.rearDerailleur.maxCogSize}T
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Wheel/Tire</h3>
                <p className="text-sm text-gray-900">
                  {setup.wheelSetup.tireSize}
                </p>
                <p className="text-xs text-gray-600">
                  {setup.wheelSetup.rimWidth}mm rim
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Summary */}
        {analysisData && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Analysis Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysisData.total}</div>
                <div className="text-sm text-gray-600">Total Gears</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysisData.optimal}</div>
                <div className="text-sm text-gray-600">Optimal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analysisData.problematic}</div>
                <div className="text-sm text-gray-600">Problematic</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysisData.range.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{analysisData.averageStep.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Avg Step</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{analysisData.largestStep.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Max Gap</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analysisData.duplicates}</div>
                <div className="text-sm text-gray-600">Overlaps</div>
              </div>
            </div>
            
            {/* Ratio Range */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  <strong>Total Range:</strong> {analysisData.lowestRatio.toFixed(2)} - {analysisData.highestRatio.toFixed(2)}
                </span>
                <span>
                  <strong>Usable Range:</strong> {analysisData.lowestUsable.toFixed(2)} - {analysisData.highestUsable.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Gear Chart - takes 2/3 width */}
          <div className="xl:col-span-2">
            <GearChart
              gears={gears}
              crankLength={setup?.crankLength || 175}
              speedUnit="mph"
              highlightOptimal={true}
              showEfficiency={true}
              onGearSelect={handleGearSelect}
            />
          </div>

          {/* Speed Calculator - takes 1/3 width */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <SpeedCalculator
                selectedGear={selectedGear}
                allGears={gears}
                onGearChange={handleGearSelect}
              />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!isCustomSetup && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                🎉 Ready to Build Your Own Setup?
              </h3>
              <p className="text-blue-700 mb-4">
                This analysis used a sample Shimano 105 road setup. 
                Build your own drivetrain to get personalized gear analysis.
              </p>
              <a
                href="/build"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                🔧 Build Your Drivetrain
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Custom Setup Success Message */}
        {isCustomSetup && (
          <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                ✅ Custom Drivetrain Analysis Complete!
              </h3>
              <p className="text-green-700 mb-4">
                This analysis is based on your custom component selection from the drivetrain builder.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/build"
                  className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                >
                  🔧 Build Another Setup
                </a>
                <button
                  onClick={clearCustomSetup}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  📊 View Demo Setup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}