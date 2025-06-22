'use client';

import { useEffect, useState } from 'react';
import { performanceAnalyzer, PerformanceMetrics, USAGE_PROFILES } from '../../lib/performanceAnalyzer';
import { GearSetup } from '../../lib/gearCalculator';
import { DrivetrainAnalysis } from '../../types/components';
import { getCranksets, getCassettes, getRearDerailleurs, getChains } from '../actions/componentActions';

export default function PerformanceTestPage() {
  const [analysis, setAnalysis] = useState<{
    roadAnalysis: DrivetrainAnalysis;
    mtbAnalysis: DrivetrainAnalysis;
    roadMetrics: PerformanceMetrics;
    mtbMetrics: PerformanceMetrics;
    comparison: any[];
    usageEvaluations: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runPerformanceTests();
  }, []);

  const runPerformanceTests = () => {
    try {
      const cranksets = getCranksets();
      const cassettes = getCassettes();
      const derailleurs = getRearDerailleurs();
      const chains = getChains();

      // Road setup (Shimano 105)
      const roadSetup: GearSetup = {
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

      // MTB setup (Shimano XT)
      const mtbSetup: GearSetup = {
        bikeType: 'mtb',
        crankset: cranksets.find(c => c.id === 'shimano-xt-m8100-32t')!,
        cassette: cassettes.find(c => c.id === 'shimano-xt-m8100-10-51')!,
        rearDerailleur: derailleurs.find(d => d.id === 'shimano-xt-m8100-sgs')!,
        chain: chains.find(c => c.id === 'shimano-xt-cn-m8100-12')!,
        wheelSetup: {
          tireSize: '29x2.25',
          rimWidth: 25
        },
        crankLength: 175
      };

      console.log('🔧 Testing Performance Analyzer');

      // Full drivetrain analysis
      const roadAnalysis = performanceAnalyzer.analyzeDrivetrain(roadSetup);
      const mtbAnalysis = performanceAnalyzer.analyzeDrivetrain(mtbSetup);

      // Detailed performance metrics
      const roadMetrics = performanceAnalyzer.calculatePerformanceMetrics(roadAnalysis.gears);
      const mtbMetrics = performanceAnalyzer.calculatePerformanceMetrics(mtbAnalysis.gears);

      // Setup comparison
      const comparison = performanceAnalyzer.compareSetups([
        { name: 'Road (Shimano 105)', setup: roadSetup },
        { name: 'MTB (Shimano XT)', setup: mtbSetup }
      ]);

      // Usage profile evaluations for road setup
      const usageEvaluations = USAGE_PROFILES.map(profile => ({
        profile,
        evaluation: performanceAnalyzer.evaluateForUsage(roadAnalysis.gears, profile)
      }));

      setAnalysis({
        roadAnalysis,
        mtbAnalysis,
        roadMetrics,
        mtbMetrics,
        comparison,
        usageEvaluations
      });
      setLoading(false);

    } catch (error) {
      console.error('Error in performance analysis:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing performance...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error analyzing performance</p>
        </div>
      </div>
    );
  }

  const { roadAnalysis, mtbAnalysis, roadMetrics, mtbMetrics, comparison, usageEvaluations } = analysis;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                CrankSmith 3.0 - Performance Analysis Test
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Testing
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup Comparison */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Drivetrain Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparison.map((comp, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{comp.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Overall Score:</span>
                    <span className="font-medium">{comp.score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Gears:</span>
                    <span className="font-medium">{comp.analysis.totalGears}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gear Range:</span>
                    <span className="font-medium">{comp.analysis.gearRange.toFixed(1)}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Step:</span>
                    <span className="font-medium">{comp.analysis.averageStep.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-medium text-green-700 mb-1">Strengths:</div>
                  <ul className="text-xs text-green-600 space-y-1">
                    {comp.strengths.map((strength: string, i: number) => (
                      <li key={i}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                {comp.weaknesses.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-orange-700 mb-1">Areas for improvement:</div>
                    <ul className="text-xs text-orange-600 space-y-1">
                      {comp.weaknesses.map((weakness: string, i: number) => (
                        <li key={i}>• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Road Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Road Performance Metrics</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Efficiency Distribution</h4>
                <div className="space-y-1">
                  {roadMetrics.efficiency.efficiencyDistribution.map((dist, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{dist.range}:</span>
                      <span>{dist.count} gears ({dist.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Speed Analysis @ 90 RPM</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Speed Range:</span>
                    <span>{roadMetrics.speedAnalysis.speedRange.min.toFixed(1)} - {roadMetrics.speedAnalysis.speedRange.max.toFixed(1)} mph</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Practical Range:</span>
                    <span>{roadMetrics.speedAnalysis.practicalRange.min.toFixed(1)} - {roadMetrics.speedAnalysis.practicalRange.max.toFixed(1)} mph</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Gear Steps</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Average Step:</span>
                    <span>{roadMetrics.gearSteps.averageStep.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Largest Gap:</span>
                    <span>{roadMetrics.gearSteps.largestGap.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cadence Consistency:</span>
                    <span>{roadMetrics.gearSteps.cadenceConsistency.toFixed(0)}/100</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Duplicates</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Unique Ratios:</span>
                    <span>{roadMetrics.duplicateAnalysis.uniqueRatios}/{roadAnalysis.totalGears}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redundancy:</span>
                    <span>{roadMetrics.duplicateAnalysis.redundancy}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MTB Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">MTB Performance Metrics</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Efficiency Distribution</h4>
                <div className="space-y-1">
                  {mtbMetrics.efficiency.efficiencyDistribution.map((dist, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{dist.range}:</span>
                      <span>{dist.count} gears ({dist.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Speed Analysis @ 90 RPM</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Speed Range:</span>
                    <span>{mtbMetrics.speedAnalysis.speedRange.min.toFixed(1)} - {mtbMetrics.speedAnalysis.speedRange.max.toFixed(1)} mph</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Practical Range:</span>
                    <span>{mtbMetrics.speedAnalysis.practicalRange.min.toFixed(1)} - {mtbMetrics.speedAnalysis.practicalRange.max.toFixed(1)} mph</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Gear Steps</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Average Step:</span>
                    <span>{mtbMetrics.gearSteps.averageStep.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Largest Gap:</span>
                    <span>{mtbMetrics.gearSteps.largestGap.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cadence Consistency:</span>
                    <span>{mtbMetrics.gearSteps.cadenceConsistency.toFixed(0)}/100</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Duplicates</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Unique Ratios:</span>
                    <span>{mtbMetrics.duplicateAnalysis.uniqueRatios}/{mtbAnalysis.totalGears}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redundancy:</span>
                    <span>{mtbMetrics.duplicateAnalysis.redundancy}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Profile Evaluations */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Road Setup - Usage Profile Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usable Gears
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Speed Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageEvaluations.map((evaluation, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{evaluation.profile.name}</div>
                        <div className="text-sm text-gray-500">{evaluation.profile.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        evaluation.evaluation.score >= 80 ? 'bg-green-100 text-green-800' :
                        evaluation.evaluation.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {evaluation.evaluation.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.evaluation.usableGears.length}/{roadAnalysis.totalGears}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.profile.speedRange.min}-{evaluation.profile.speedRange.max} mph
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {evaluation.evaluation.strengths.length > 0 && (
                        <div className="text-green-600 mb-1">
                          + {evaluation.evaluation.strengths[0]}
                        </div>
                      )}
                      {evaluation.evaluation.weaknesses.length > 0 && (
                        <div className="text-orange-600">
                          - {evaluation.evaluation.weaknesses[0]}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Target Speed Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Target Speed Gear Selection</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roadMetrics.speedAnalysis.targetSpeeds.map((target, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-gray-900">{target.speed} mph</div>
                <div className="text-sm text-gray-600">{target.gear.chainring}T × {target.gear.cog}T</div>
                <div className="text-xs text-gray-500">{(target.efficiency * 100).toFixed(1)}% efficiency</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Performance Analysis Complete</h4>
          <div className="text-sm text-blue-800">
            <p>✅ Comprehensive drivetrain analysis including {roadAnalysis.totalGears + mtbAnalysis.totalGears} gear combinations</p>
            <p>✅ Real-world performance metrics (efficiency, speed range, gear steps)</p>
            <p>✅ Usage profile evaluations for {usageEvaluations.length} different riding styles</p>
            <p>✅ Chain line analysis and gear recommendations</p>
            <p>✅ Setup comparison and optimization suggestions</p>
          </div>
        </div>
      </main>
    </div>
  );
}