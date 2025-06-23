'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Settings, 
  TrendingUp,
  DollarSign,
  Zap,
  Target
} from 'lucide-react';
import { EnhancedCompatibilityEngine, DrivetrainAnalysis } from '../lib/enhancedCompatibilityEngine';

export default function RealisticAnalysisPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<DrivetrainAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'gears' | 'chainline' | 'technical'>('overview');

  useEffect(() => {
    // In real app, get component IDs from URL params or context
    // For demo, using XT MTB setup
    const engine = new EnhancedCompatibilityEngine();
    
    try {
      const result = engine.analyzeFullDrivetrain(
        'shimano-xt-fc-m8100-32',     // XT crankset
        'shimano-xt-cs-m8100-10-51',  // XT cassette
        'shimano-xt-cn-m8100',        // XT chain
        'shimano-xt-rd-m8100-sgs'     // XT derailleur
      );
      
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Analyzing drivetrain setup...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-accent-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Analysis Failed</h2>
          <p className="text-neutral-600 mb-4">Unable to analyze the selected components.</p>
          <button 
            onClick={() => router.push('/build')}
            className="bg-primary-600 text-white px-6 py-3 rounded-tool font-medium hover:bg-primary-700"
          >
            Build New Setup
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-accent-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600';
    if (score >= 75) return 'text-success-500';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-accent-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-success-100';
    if (score >= 75) return 'bg-success-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-accent-50';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'gears', name: 'Gear Analysis', icon: <Settings className="w-4 h-4" /> },
    { id: 'chainline', name: 'Chain Line', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'technical', name: 'Technical', icon: <Info className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-tool border-b border-neutral-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-neutral-900">CrankSmith</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-tool-orange text-white rounded-tool">
                Analysis
              </span>
            </div>
            
            <button 
              onClick={() => router.push('/build')}
              className="text-neutral-600 hover:text-neutral-900 flex items-center touch-target"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> New Build
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4 py-6 pb-20">
        {/* Header with Overall Score */}
        <div className="bg-white rounded-tool border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Drivetrain Analysis
              </h1>
              <p className="text-neutral-600">
                Shimano XT {analysis.technicalSummary.speedCount}-Speed MTB Setup
              </p>
            </div>
            
            <div className={`text-center p-4 rounded-tool ${getScoreBg(analysis.overallScore)}`}>
              <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className="text-sm text-neutral-600">Overall Score</div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {analysis.compatible ? (
                  <CheckCircle className="w-6 h-6 text-success-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-accent-500" />
                )}
              </div>
              <div className="text-sm font-medium text-neutral-900">
                {analysis.compatible ? 'Compatible' : 'Issues Found'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-primary-600">
                {analysis.gearAnalysis.totalGears}
              </div>
              <div className="text-sm text-neutral-600">Total Gears</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-success-600">
                {analysis.gearAnalysis.gearRange.toFixed(1)}
              </div>
              <div className="text-sm text-neutral-600">Gear Range</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-tool-orange">
                ${analysis.costAnalysis.totalCost}
              </div>
              <div className="text-sm text-neutral-600">Total Cost</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-tool border border-neutral-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Compatibility Checks */}
            <div className="bg-white rounded-tool border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Compatibility Checks
              </h2>
              
              <div className="space-y-3">
                {analysis.checks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-tool">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium text-neutral-900">{check.name}</div>
                        <div className="text-sm text-neutral-600">{check.message}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-tool text-xs font-medium ${
                      check.impact === 'high' ? 'bg-accent-100 text-accent-800' :
                      check.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-neutral-100 text-neutral-800'
                    }`}>
                      {check.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white rounded-tool border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Cost Breakdown
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(analysis.costAnalysis.componentCosts).map(([component, cost]) => (
                  <div key={component} className="flex justify-between p-3 bg-neutral-50 rounded-tool">
                    <span className="font-medium text-neutral-900 capitalize">{component}</span>
                    <span className="text-neutral-900">${cost}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-xl font-bold text-primary-600">
                  ${analysis.costAnalysis.totalCost}
                </span>
              </div>
              
              <div className="mt-3 text-sm text-neutral-600">
                ${analysis.costAnalysis.costPerGear.toFixed(2)} per gear • 
                <span className={`ml-1 font-medium ${
                  analysis.costAnalysis.valueRating === 'excellent' ? 'text-success-600' :
                  analysis.costAnalysis.valueRating === 'good' ? 'text-success-500' :
                  analysis.costAnalysis.valueRating === 'fair' ? 'text-yellow-600' :
                  'text-accent-600'
                }`}>
                  {analysis.costAnalysis.valueRating} value
                </span>
              </div>
            </div>

            {/* Recommendations */}
            {(analysis.recommendations.length > 0 || analysis.warnings.length > 0) && (
              <div className="space-y-4">
                {analysis.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-tool p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Warnings
                    </h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {analysis.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.recommendations.length > 0 && (
                  <div className="bg-primary-50 border border-primary-200 rounded-tool p-4">
                    <h3 className="font-semibold text-primary-800 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Recommendations
                    </h3>
                    <ul className="text-sm text-primary-700 space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'gears' && (
          <div className="space-y-6">
            {/* Gear Range Summary */}
            <div className="bg-white rounded-tool border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Gear Range Analysis
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {analysis.gearAnalysis.lowestRatio.toFixed(2)}
                  </div>
                  <div className="text-sm text-neutral-600">Lowest Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">
                    {analysis.gearAnalysis.highestRatio.toFixed(2)}
                  </div>
                  <div className="text-sm text-neutral-600">Highest Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tool-orange">
                    {analysis.gearAnalysis.avgStepSize.toFixed(1)}%
                  </div>
                  <div className="text-sm text-neutral-600">Avg Step</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-600">
                    {analysis.gearAnalysis.usableGears}/{analysis.gearAnalysis.totalGears}
                  </div>
                  <div className="text-sm text-neutral-600">Usable Gears</div>
                </div>
              </div>
            </div>

            {/* Gear Table */}
            <div className="bg-white rounded-tool border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Gear Combinations
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-2">Chainring</th>
                      <th className="text-left py-2">Cog</th>
                      <th className="text-left py-2">Ratio</th>
                      <th className="text-left py-2">Gear Inches</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.gearAnalysis.gearTable.slice(0, 12).map((gear, index) => (
                      <tr key={index} className="border-b border-neutral-100">
                        <td className="py-2 font-medium">{gear.chainring}T</td>
                        <td className="py-2">{gear.cog}T</td>
                        <td className="py-2">{gear.ratio.toFixed(2)}</td>
                        <td className="py-2">{gear.gearInches.toFixed(1)}"</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-tool text-xs font-medium ${
                            gear.status === 'optimal' ? 'bg-success-100 text-success-800' :
                            gear.status === 'good' ? 'bg-success-50 text-success-700' :
                            gear.status === 'acceptable' ? 'bg-neutral-100 text-neutral-700' :
                            gear.status === 'cross-chain' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-accent-100 text-accent-800'
                          }`}>
                            {gear.status}
                          </span>
                        </td>
                        <td className="py-2">{(gear.efficiency * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'chainline' && (
          <div className="space-y-6">
            {/* Chain Line Summary */}
            <div className="bg-white rounded-tool border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Chain Line Analysis
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {analysis.chainLineAnalysis.frontChainLine}mm
                  </div>
                  <div className="text-sm text-neutral-600">Front Chain Line</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">
                    {(analysis.chainLineAnalysis.overallEfficiency * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-neutral-600">Overall Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tool-orange">
                    {analysis.chainLineAnalysis.straightChainRange.min}-{analysis.chainLineAnalysis.straightChainRange.max}T
                  </div>
                  <div className="text-sm text-neutral-600">Sweet Spot</div>
                </div>
              </div>

              {/* Chain Line Status by Cog */}
              <div className="space-y-2">
                <h3 className="font-medium text-neutral-900 mb-3">Chain Line by Cog</h3>
                {analysis.chainLineAnalysis.cogPositions.map((cog, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                    <span className="font-medium">{cog.cog}T</span>
                    <span className="text-sm text-neutral-600">{cog.angle.toFixed(1)}° offset</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      cog.status === 'optimal' ? 'bg-success-100 text-success-800' :
                      cog.status === 'good' ? 'bg-success-50 text-success-700' :
                      cog.status === 'acceptable' ? 'bg-neutral-100 text-neutral-700' :
                      cog.status === 'poor' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-accent-100 text-accent-800'
                    }`}>
                      {cog.status}
                    </span>
                    <span className="text-sm">{(cog.efficiency * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'technical' && (
          <div className="space-y-6">
            {/* Technical Specifications */}
            <div className="bg-white rounded-tool border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Technical Specifications
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Speed Count</span>
                    <span className="font-medium">{analysis.technicalSummary.speedCount}-speed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Weight</span>
                    <span className="font-medium">{analysis.technicalSummary.totalWeight}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Brands</span>
                    <span className="font-medium">{analysis.technicalSummary.brands.join(', ')}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Freehub Type</span>
                    <span className="font-medium">{analysis.technicalSummary.freehubType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Chain Width</span>
                    <span className="font-medium">{analysis.technicalSummary.chainWidth}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Bottom Bracket</span>
                    <span className="font-medium">{analysis.technicalSummary.bottomBracketStandards.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Efficiency Analysis */}
            <div className="bg-white rounded-tool border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Efficiency Analysis
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">
                    {(analysis.efficiencyAnalysis.overallEfficiency * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-neutral-600">Average Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-600">
                    {analysis.efficiencyAnalysis.powerLoss.toFixed(1)}W
                  </div>
                  <div className="text-sm text-neutral-600">Power Loss</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {analysis.efficiencyAnalysis.bestGears.length}
                  </div>
                  <div className="text-sm text-neutral-600">Optimal Gears</div>
                </div>
              </div>

              <div className="text-sm text-neutral-600">
                <p className="mb-2">
                  <strong>Best Gears:</strong> {analysis.efficiencyAnalysis.bestGears.map(g => `${g.chainring}×${g.cog}`).join(', ')}
                </p>
                {analysis.efficiencyAnalysis.worstGears.length > 0 && (
                  <p>
                    <strong>Avoid:</strong> {analysis.efficiencyAnalysis.worstGears.map(g => `${g.chainring}×${g.cog}`).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={() => router.push('/build')}
            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-tool font-medium hover:bg-primary-700 transition-colors"
          >
            Build Another Setup
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-neutral-600 text-white py-3 px-4 rounded-tool font-medium hover:bg-neutral-700 transition-colors"
          >
            Print Analysis
          </button>
        </div>
      </main>
    </div>
  );
}