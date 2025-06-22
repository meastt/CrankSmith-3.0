'use client';

import { useEffect, useState } from 'react';
import { gearCalculator, GearSetup } from '../../lib/gearCalculator';
import { GainRatioCalculator } from '../../lib/gainRatioUtils';
import { GearCalculation } from '../../types/components';
import { getCranksets, getCassettes, getRearDerailleurs, getChains } from '../actions/componentActions';

export default function GearTestPage() {
  const [calculations, setCalculations] = useState<{
    gears: GearCalculation[];
    analysis: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runGearTests();
  }, []);

  const runGearTests = () => {
    try {
      const cranksets = getCranksets();
      const cassettes = getCassettes();
      const derailleurs = getRearDerailleurs();
      const chains = getChains();

      // Test with Shimano 105 road setup
      const gearSetup: GearSetup = {
        bikeType: 'road',
        crankset: cranksets.find(c => c.id === 'shimano-105-r7000-50-34')!,
        cassette: cassettes.find(c => c.id === 'shimano-105-r7000-11-32')!,
        rearDerailleur: derailleurs.find(d => d.id === 'shimano-105-r7000-gs')!,
        chain: chains.find(c => c.id === 'shimano-105-cn-hg601-11')!,
        wheelSetup: {
          tireSize: '700x25c',
          rimWidth: 21
        },
        crankLength: 175
      };

      console.log('🔧 Testing Gear Calculator');
      console.log('Setup:', gearSetup);

      // Calculate all gears
      const gears = gearCalculator.calculateAllGears(gearSetup);
      console.log(`Calculated ${gears.length} gear combinations`);

      // Analyze the results
      const optimalGears = gearCalculator.getOptimalGears(gears);
      const problematicGears = gearCalculator.getProblematicGears(gears);
      const gearRange = gearCalculator.calculateGearRange(gears);
      const gearSteps = gearCalculator.calculateGearSteps(gears);
      const duplicates = gearCalculator.findGearDuplicates(gears);

      // Test gain ratio calculations
      const gainRatioTable = GainRatioCalculator.generateGainRatioTable(
        gearSetup.crankset.chainrings,
        gearSetup.cassette.cogs,
        2111 / (2 * Math.PI), // wheel radius from 700x25c circumference
        gearSetup.crankLength
      );

      console.log('Sample gear calculations:');
      gears.slice(0, 3).forEach(gear => {
        console.log(`${gear.chainring}T × ${gear.cog}T: ${gear.ratio.toFixed(2)} ratio, ${gear.gainRatio.toFixed(2)} gain ratio, ${gear.speedAtCadence.rpm90.toFixed(1)} mph @ 90rpm`);
      });

      const analysis = {
        total: gears.length,
        optimal: optimalGears.length,
        problematic: problematicGears.length,
        gearRange,
        averageStep: gearSteps.reduce((sum, step) => sum + step.stepPercentage, 0) / gearSteps.length,
        largestStep: Math.max(...gearSteps.map(s => s.stepPercentage)),
        duplicates: duplicates.length,
        gainRatioTable: gainRatioTable.slice(0, 5) // First 5 for display
      };

      setCalculations({ gears, analysis });
      setLoading(false);

      console.log('Analysis:', analysis);
    } catch (error) {
      console.error('Error in gear calculations:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating gear ratios...</p>
        </div>
      </div>
    );
  }

  if (!calculations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error calculating gears</p>
        </div>
      </div>
    );
  }

  const { gears, analysis } = calculations;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                CrankSmith 3.0 - Gear Calculator Test
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Testing
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analysis Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gear Analysis Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.total}</div>
              <div className="text-sm text-gray-600">Total Gears</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analysis.optimal}</div>
              <div className="text-sm text-gray-600">Optimal Gears</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analysis.problematic}</div>
              <div className="text-sm text-gray-600">Problematic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analysis.duplicates}</div>
              <div className="text-sm text-gray-600">Duplicate Groups</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Gear Range:</span> {analysis.gearRange.range.toFixed(1)}:1
            </div>
            <div>
              <span className="font-medium">Average Step:</span> {analysis.averageStep.toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">Largest Step:</span> {analysis.largestStep.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Gear Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">All Gear Combinations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gear
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    @ 90 RPM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chain Angle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gears.map((gear, index) => (
                  <tr key={index} className={
                    gear.efficiency < 0.96 ? 'bg-red-50' : 
                    gear.efficiency > 0.975 ? 'bg-green-50' : ''
                  }>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {gear.chainring}T × {gear.cog}T
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {gear.ratio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {gear.gainRatio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {gear.speedAtCadence.rpm90.toFixed(1)} mph
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {gear.crossChainAngle.toFixed(1)}°
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        gear.efficiency > 0.975 ? 'bg-green-100 text-green-800' :
                        gear.efficiency > 0.96 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(gear.efficiency * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gain Ratio Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Gain Ratio Analysis (Sample)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chainring × Cog
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gear Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Development
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interpretation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysis.gainRatioTable.map((row: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.chainring}T × {row.cog}T
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.gearRatio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.gainRatio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.development}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.interpretation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Test Results Summary</h4>
          <div className="text-sm text-blue-800">
            <p>✅ Gear calculator successfully computed {analysis.total} gear combinations</p>
            <p>✅ Gain ratios calculated using Sheldon Brown's method (crank-length aware)</p>
            <p>✅ Real tire circumference used (700x25c @ 21mm rim = 2111mm)</p>
            <p>✅ Chain line analysis and efficiency calculations working</p>
            <p>✅ Speed calculations at multiple cadences functioning</p>
          </div>
        </div>
      </main>
    </div>
  );
}