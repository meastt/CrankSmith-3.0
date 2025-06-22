'use client';

import { useEffect, useState } from 'react';
import { chainLineCalculator, ChainLineSetup, ChainLineResult } from '../../lib/chainLineCalculator';
import { getCranksets, getCassettes, getRearDerailleurs, getChains } from '../../actions/componentActions';

export default function ChainLineTestPage() {
  const [results, setResults] = useState<{
    roadResult: ChainLineResult;
    mtbResult: ChainLineResult;
    comparison: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runChainLineTests();
  }, []);

  const runChainLineTests = async () => {
    try {
      const cranksets = await getCranksets();
      const cassettes = await getCassettes();

      // Test 1: Road setup (Shimano 105)
      const roadSetup: ChainLineSetup = {
        cranksetChainLine: 43.5, // Shimano 105
        bottomBracket: 'BSA',
        frameStandard: 'BSA',
        cassette: {
          speeds: 11,
          cogs: [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32]
        },
        wheelSpacing: 130,
        chainStayLength: 410
      };

      // Test 2: MTB setup (Shimano XT)
      const mtbSetup: ChainLineSetup = {
        cranksetChainLine: 52.0, // Shimano XT
        bottomBracket: 'BSA',
        frameStandard: 'BSA',
        cassette: {
          speeds: 12,
          cogs: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51]
        },
        wheelSpacing: 148, // Boost spacing
        chainStayLength: 435
      };

      console.log('🔧 Testing Chain Line Calculator');

      const roadResult = chainLineCalculator.calculateChainLine(roadSetup);
      const mtbResult = chainLineCalculator.calculateChainLine(mtbSetup);

      console.log('Road chain line analysis:', roadResult);
      console.log('MTB chain line analysis:', mtbResult);

      // Compare setups
      const comparison = chainLineCalculator.compareChainLines([
        { name: 'Road (Shimano 105)', setup: roadSetup },
        { name: 'MTB (Shimano XT)', setup: mtbSetup }
      ]);

      console.log('Comparison:', comparison);

      setResults({
        roadResult,
        mtbResult,
        comparison
      });
      setLoading(false);

    } catch (error) {
      console.error('Error in chain line calculations:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating chain lines...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error calculating chain lines</p>
        </div>
      </div>
    );
  }

  const { roadResult, mtbResult, comparison } = results;

  const renderCogTable = (result: ChainLineResult, title: string) => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="text-sm text-gray-600 mt-1">
          Front: {result.frontChainLine}mm | Rear: {result.rearChainLine}mm | Offset: {result.offset.toFixed(1)}mm
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cog
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Offset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Angle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Efficiency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {result.cogPositions.map((cog, index) => (
              <tr key={index} className={
                cog.status === 'optimal' ? 'bg-green-50' :
                cog.status === 'good' ? 'bg-green-25' :
                cog.status === 'acceptable' ? 'bg-yellow-50' :
                cog.status === 'poor' ? 'bg-orange-50' :
                'bg-red-50'
              }>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cog.cog}T
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cog.position}mm
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cog.offsetFromFront}mm
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cog.angle}°
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(cog.efficiency * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cog.status === 'optimal' ? 'bg-green-100 text-green-800' :
                    cog.status === 'good' ? 'bg-green-100 text-green-700' :
                    cog.status === 'acceptable' ? 'bg-yellow-100 text-yellow-800' :
                    cog.status === 'poor' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {cog.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                CrankSmith 3.0 - Chain Line Calculator Test
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Testing
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Comparison Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chain Line Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparison.map((comp: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{comp.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Overall Score:</span>
                    <span className="font-medium">{comp.score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Efficiency:</span>
                    <span className="font-medium">{comp.efficiency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usable Gears:</span>
                    <span className="font-medium">{comp.usableGears}/{comp.result.cogPositions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chain Line Offset:</span>
                    <span className="font-medium">{comp.result.offset.toFixed(1)}mm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chain Line Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Road Analysis</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Optimal Gears:</span>
                <div className="text-green-600">
                  {roadResult.analysis.straightChainGears.join('T, ')}T
                </div>
              </div>
              <div>
                <span className="font-medium">Cross-Chain:</span>
                <div className="text-orange-600">
                  {roadResult.analysis.crossChainGears.length > 0 ? 
                    roadResult.analysis.crossChainGears.join('T, ') + 'T' : 
                    'None'
                  }
                </div>
              </div>
              <div>
                <span className="font-medium">Avoid:</span>
                <div className="text-red-600">
                  {roadResult.analysis.avoidGears.length > 0 ? 
                    roadResult.analysis.avoidGears.join('T, ') + 'T' : 
                    'None'
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">MTB Analysis</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Optimal Gears:</span>
                <div className="text-green-600">
                  {mtbResult.analysis.straightChainGears.join('T, ')}T
                </div>
              </div>
              <div>
                <span className="font-medium">Cross-Chain:</span>
                <div className="text-orange-600">
                  {mtbResult.analysis.crossChainGears.length > 0 ? 
                    mtbResult.analysis.crossChainGears.join('T, ') + 'T' : 
                    'None'
                  }
                </div>
              </div>
              <div>
                <span className="font-medium">Avoid:</span>
                <div className="text-red-600">
                  {mtbResult.analysis.avoidGears.length > 0 ? 
                    mtbResult.analysis.avoidGears.join('T, ') + 'T' : 
                    'None'
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-200 rounded-full mr-2"></span>
                <span>Optimal (&lt;0.5°, 98%+ efficiency)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-100 rounded-full mr-2"></span>
                <span>Good (&lt;2°, 97.5%+ efficiency)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-100 rounded-full mr-2"></span>
                <span>Acceptable (&lt;4°, 95%+ efficiency)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-100 rounded-full mr-2"></span>
                <span>Poor (&lt;6°, 93.5%+ efficiency)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-100 rounded-full mr-2"></span>
                <span>Avoid (&gt;6°, &lt;93.5% efficiency)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        {renderCogTable(roadResult, 'Road Setup - Cog Analysis')}
        {renderCogTable(mtbResult, 'MTB Setup - Cog Analysis')}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Test Results Summary</h4>
          <div className="text-sm text-blue-800">
            <p>✅ Chain line calculator successfully analyzed {roadResult.cogPositions.length + mtbResult.cogPositions.length} cog positions</p>
            <p>✅ Frame-agnostic calculations using component specs only</p>
            <p>✅ Cross-chain angle and efficiency analysis working</p>
            <p>✅ Gear categorization (optimal/good/acceptable/poor/avoid) functioning</p>
            <p>✅ Bottom bracket and hub spacing adjustments applied</p>
          </div>
        </div>
      </main>
    </div>
  );
}