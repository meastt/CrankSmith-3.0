// app/performance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { gearCalculator, GearSetup } from '../lib/gearCalculator';
import { PerformancePredictionEngine, RiderProfile, RideConditions, PerformancePrediction } from '../lib/performancePredictionEngine';
import { UpgradeROICalculator, UpgradeAnalysis } from '../lib/upgradeROICalculator';
import { StravaIntegrationEngine, MockStravaData, StravaAnalysisResult } from '../lib/stravaIntegrationEngine';
import { getCranksets, getCassettes, getRearDerailleurs, getChains } from '../actions/componentActions';
import { GearCalculation } from '../types/components';

export default function PerformanceAnalysisPage() {
  const [setup, setSetup] = useState<GearSetup | null>(null);
  const [gears, setGears] = useState<GearCalculation[]>([]);
  const [riderProfile, setRiderProfile] = useState<RiderProfile>({
    weight: 75,
    height: 180,
    ftp: 250,
    preferredCadence: 90,
    experienceLevel: 'intermediate'
  });
  const [conditions, setConditions] = useState<RideConditions>({
    grade: 0,
    windSpeed: 0,
    temperature: 20,
    altitude: 0,
    roadSurface: 'smooth'
  });
  const [performancePrediction, setPerformancePrediction] = useState<PerformancePrediction | null>(null);
  const [stravaAnalysis, setStravaAnalysis] = useState<StravaAnalysisResult | null>(null);
  const [upgradeAnalysis, setUpgradeAnalysis] = useState<UpgradeAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'prediction' | 'strava' | 'upgrade'>('prediction');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDefaultSetup();
  }, []);

  const loadDefaultSetup = async () => {
    try {
      const cranksets = await getCranksets();
      const cassettes = await getCassettes();
      const derailleurs = await getRearDerailleurs();
      const chains = await getChains();

      // Load Shimano 105 setup as default
      const defaultSetup: GearSetup = {
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

      setSetup(defaultSetup);
      
      // Calculate gears
      const calculatedGears = gearCalculator.calculateAllGears(defaultSetup);
      setGears(calculatedGears);
      
      // Run analysis
      await runAnalysis(defaultSetup, calculatedGears);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading setup:', error);
      setLoading(false);
    }
  };

  const runAnalysis = async (currentSetup: GearSetup, currentGears: GearCalculation[]) => {
    try {
      // Performance prediction
      const prediction = PerformancePredictionEngine.predictPerformance(
        currentSetup,
        currentGears,
        riderProfile,
        conditions
      );
      setPerformancePrediction(prediction);

      // Strava analysis (using mock data)
      const mockActivities = MockStravaData.generateMockActivities();
      const strava = await StravaIntegrationEngine.analyzeStravaData(
        mockActivities,
        currentSetup,
        currentGears
      );
      setStravaAnalysis(strava);

      // Upgrade analysis (compare with Ultegra)
      const cranksets = await getCranksets();
      const cassettes = await getCassettes();
      const derailleurs = await getRearDerailleurs();
      const chains = await getChains();

      const upgradeSetup: GearSetup = {
        ...currentSetup,
        crankset: cranksets.find(c => c.id === 'shimano-ultegra-r8000-50-34') || currentSetup.crankset,
        rearDerailleur: derailleurs.find(d => d.id === 'shimano-ultegra-r8000-gs') || currentSetup.rearDerailleur
      };

      const upgrade = UpgradeROICalculator.analyzeUpgrade(
        currentSetup,
        upgradeSetup,
        riderProfile,
        conditions
      );
      setUpgradeAnalysis(upgrade);

    } catch (error) {
      console.error('Error running analysis:', error);
    }
  };

  const updateRiderProfile = (updates: Partial<RiderProfile>) => {
    const newProfile = { ...riderProfile, ...updates };
    setRiderProfile(newProfile);
    
    if (setup && gears.length > 0) {
      runAnalysis(setup, gears);
    }
  };

  const updateConditions = (updates: Partial<RideConditions>) => {
    const newConditions = { ...conditions, ...updates };
    setConditions(newConditions);
    
    if (setup && gears.length > 0) {
      runAnalysis(setup, gears);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                CrankSmith Pro - Performance Analysis
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                Premium Features
              </span>
            </div>
            <div className="flex space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Export Report
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                Share Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Setup Summary */}
        {setup && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Drivetrain Setup</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Crankset</div>
                <div className="text-sm text-gray-900">{setup.crankset.manufacturer} {setup.crankset.model}</div>
                <div className="text-xs text-gray-600">{setup.crankset.chainrings.join('/')}T</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Cassette</div>
                <div className="text-sm text-gray-900">{setup.cassette.manufacturer} {setup.cassette.model}</div>
                <div className="text-xs text-gray-600">{setup.cassette.cogRange[0]}-{setup.cassette.cogRange[1]}T</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Derailleur</div>
                <div className="text-sm text-gray-900">{setup.rearDerailleur.manufacturer} {setup.rearDerailleur.model}</div>
                <div className="text-xs text-gray-600">{setup.rearDerailleur.cageLength}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Total Gears</div>
                <div className="text-sm text-gray-900">{gears.length} combinations</div>
                <div className="text-xs text-gray-600">{gears.filter(g => g.efficiency > 0.975).length} optimal</div>
              </div>
            </div>
          </div>
        )}

        {/* Rider Profile & Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rider Profile */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rider Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={riderProfile.weight}
                  onChange={(e) => updateRiderProfile({ weight: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={riderProfile.height}
                  onChange={(e) => updateRiderProfile({ height: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FTP (watts)</label>
                <input
                  type="number"
                  value={riderProfile.ftp}
                  onChange={(e) => updateRiderProfile({ ftp: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Cadence</label>
                <input
                  type="number"
                  value={riderProfile.preferredCadence}
                  onChange={(e) => updateRiderProfile({ preferredCadence: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={riderProfile.experienceLevel}
                  onChange={(e) => updateRiderProfile({ experienceLevel: e.target.value as RiderProfile['experienceLevel'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="pro">Professional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ride Conditions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ride Conditions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={conditions.grade}
                  onChange={(e) => updateConditions({ grade: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wind Speed (km/h)</label>
                <input
                  type="number"
                  value={conditions.windSpeed}
                  onChange={(e) => updateConditions({ windSpeed: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  value={conditions.temperature}
                  onChange={(e) => updateConditions({ temperature: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altitude (m)</label>
                <input
                  type="number"
                  value={conditions.altitude}
                  onChange={(e) => updateConditions({ altitude: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Road Surface</label>
                <select
                  value={conditions.roadSurface}
                  onChange={(e) => updateConditions({ roadSurface: e.target.value as RideConditions['roadSurface'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="smooth">Smooth Pavement</option>
                  <option value="rough">Rough Pavement</option>
                  <option value="gravel">Gravel</option>
                  <option value="dirt">Dirt/Trail</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Tabs */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'prediction', label: 'Performance Prediction', icon: '🎯' },
                { id: 'strava', label: 'Strava Analysis', icon: '📊' },
                { id: 'upgrade', label: 'Upgrade ROI', icon: '💰' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Performance Prediction Tab */}
            {activeTab === 'prediction' && performancePrediction && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Performance Prediction</h3>
                
                {/* Power Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900">Sustained Speed</div>
                    <div className="text-2xl font-bold text-blue-600">{performancePrediction.powerRequirements.sustainedSpeed.toFixed(1)} km/h</div>
                    <div className="text-xs text-blue-700">at {performancePrediction.powerRequirements.powerNeeded}W</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-900">Max Grade @ FTP</div>
                    <div className="text-2xl font-bold text-green-600">{performancePrediction.climbingAbility.gradeAtFTP}%</div>
                    <div className="text-xs text-green-700">sustainable climbing</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-900">Speed @ 10% Grade</div>
                    <div className="text-2xl font-bold text-purple-600">{performancePrediction.climbingAbility.speedAt10Percent.toFixed(1)} km/h</div>
                    <div className="text-xs text-purple-700">at 80% FTP</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-orange-900">1000m Climb Time</div>
                    <div className="text-2xl font-bold text-orange-600">{Math.floor(performancePrediction.climbingAbility.timeFor1000mClimb / 60)}:{String(performancePrediction.climbingAbility.timeFor1000mClimb % 60).padStart(2, '0')}</div>
                    <div className="text-xs text-orange-700">@ 8% average grade</div>
                  </div>
                </div>

                {/* Optimal Cadence Zones */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Optimal Cadence Zones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(performancePrediction.optimalCadenceZones).map(([zone, data]) => (
                      <div key={zone} className="border rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-900 capitalize">{zone}</div>
                        <div className="text-lg font-semibold text-gray-700">{data.min}-{data.max} RPM</div>
                        <div className="text-xs text-gray-600">{data.gear.chainring}T × {data.gear.cog}T</div>
                        <div className="text-xs text-gray-500">{(data.gear.efficiency * 100).toFixed(1)}% efficiency</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fatigue Analysis */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Fatigue Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{performancePrediction.fatigueAnalysis.gearEffortScore}/100</div>
                      <div className="text-sm text-gray-600">Gear Effort Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{performancePrediction.fatigueAnalysis.stepConsistency}/100</div>
                      <div className="text-sm text-gray-600">Step Consistency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{performancePrediction.fatigueAnalysis.crossChainPenalty}/100</div>
                      <div className="text-sm text-gray-600">Chain Line Score</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold capitalize ${
                        performancePrediction.fatigueAnalysis.muscularStrain === 'low' ? 'text-green-600' :
                        performancePrediction.fatigueAnalysis.muscularStrain === 'moderate' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {performancePrediction.fatigueAnalysis.muscularStrain}
                      </div>
                      <div className="text-sm text-gray-600">Muscular Strain</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strava Analysis Tab */}
            {activeTab === 'strava' && stravaAnalysis && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Strava Analysis</h3>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Demo Data</span>
                </div>

                {/* Riding Profile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Speed Profile</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Average Speed:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.speedProfile.averageSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Sustained:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.speedProfile.maxSustainedSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Climbing Speed:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.speedProfile.climbingSpeed} km/h</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Terrain Preference</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Flat:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.terrainPreference.flat}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rolling:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.terrainPreference.rolling}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Climbing:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.terrainPreference.climbing}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Power Zones</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Endurance:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.powerZones.endurance.min}-{stravaAnalysis.ridingProfile.powerZones.endurance.max}W</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.powerZones.tempo.min}-{stravaAnalysis.ridingProfile.powerZones.tempo.max}W</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Threshold:</span>
                        <span className="font-medium">{stravaAnalysis.ridingProfile.powerZones.threshold.min}-{stravaAnalysis.ridingProfile.powerZones.threshold.max}W</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Gears */}
                {stravaAnalysis.missingGears.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Suggested Gear Improvements</h4>
                    <div className="space-y-2">
                      {stravaAnalysis.missingGears.map((gear, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div>
                            <div className="text-sm font-medium text-yellow-900">{gear.conditions}</div>
                            <div className="text-xs text-yellow-700">Used {(gear.frequency * 100).toFixed(1)}% of the time</div>
                          </div>
                          <div className="text-sm font-medium text-yellow-800">{gear.suggestedGear}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-2">
                      {stravaAnalysis.optimalSetup.recommendedChanges.map((change, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-sm text-blue-900">{change}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-sm font-medium text-blue-900">Expected Improvement:</div>
                      <div className="text-sm text-blue-800">{stravaAnalysis.optimalSetup.expectedImprovement}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade ROI Tab */}
            {activeTab === 'upgrade' && upgradeAnalysis && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Upgrade ROI Analysis</h3>

                {/* Overall ROI Score */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-purple-900">Overall Assessment</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      upgradeAnalysis.roi.recommendation === 'highly_recommended' ? 'bg-green-100 text-green-800' :
                      upgradeAnalysis.roi.recommendation === 'recommended' ? 'bg-blue-100 text-blue-800' :
                      upgradeAnalysis.roi.recommendation === 'marginal' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {upgradeAnalysis.roi.recommendation.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{upgradeAnalysis.roi.performanceScore}/100</div>
                      <div className="text-sm text-purple-700">Performance Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{upgradeAnalysis.roi.valueScore}/100</div>
                      <div className="text-sm text-blue-700">Value Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{upgradeAnalysis.roi.overallRoi}/100</div>
                      <div className="text-sm text-green-700">Overall ROI</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Reasoning</h5>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {upgradeAnalysis.roi.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Performance Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-900">Weight Savings</div>
                    <div className="text-2xl font-bold text-green-600">{upgradeAnalysis.improvements.weightSavings.grams}g</div>
                    <div className="text-xs text-green-700">{upgradeAnalysis.improvements.weightSavings.climbingImpact}</div>
                    <div className="text-xs text-green-600">{upgradeAnalysis.improvements.weightSavings.accelerationBenefit}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900">Efficiency Gain</div>
                    <div className="text-2xl font-bold text-blue-600">{upgradeAnalysis.improvements.efficiencyGain.percent}%</div>
                    <div className="text-xs text-blue-700">{upgradeAnalysis.improvements.efficiencyGain.powerSavings}</div>
                    <div className="text-xs text-blue-600">{upgradeAnalysis.improvements.efficiencyGain.speedIncrease}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-900">Range Increase</div>
                    <div className="text-2xl font-bold text-purple-600">{upgradeAnalysis.improvements.rangeIncrease.percent}%</div>
                    <div className="text-xs text-purple-700">{upgradeAnalysis.improvements.rangeIncrease.newCapabilities}</div>
                    <div className="text-xs text-purple-600">{upgradeAnalysis.improvements.rangeIncrease.gearingAdvantage}</div>
                  </div>
                  {upgradeAnalysis.improvements.aerodynamicGain && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-orange-900">Aero Gain</div>
                      <div className="text-2xl font-bold text-orange-600">{upgradeAnalysis.improvements.aerodynamicGain.dragReduction}%</div>
                      <div className="text-xs text-orange-700">Drag reduction</div>
                      <div className="text-xs text-orange-600">{upgradeAnalysis.improvements.aerodynamicGain.powerSavingsAt40kmh}</div>
                    </div>
                  )}
                </div>

                {/* Cost Analysis */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Cost Analysis</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Cost</div>
                      <div className="text-lg font-semibold text-gray-900">${upgradeAnalysis.costAnalysis.totalCost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Cost per Gram</div>
                      <div className="text-lg font-semibold text-gray-900">${upgradeAnalysis.costAnalysis.costPerGramSaved.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Cost per Watt</div>
                      <div className="text-lg font-semibold text-gray-900">${upgradeAnalysis.costAnalysis.costPerWattSaved.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Cost per % Range</div>
                      <div className="text-lg font-semibold text-gray-900">${upgradeAnalysis.costAnalysis.costPerPercentRange.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Time to Recoup */}
                {upgradeAnalysis.timeToRecoup && (
                  <div className="bg-gray-50 border rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Time to Justify Investment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{upgradeAnalysis.timeToRecoup.racingSeconds.toFixed(1)}s</div>
                        <div className="text-sm text-gray-600">Time saved per race</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{upgradeAnalysis.timeToRecoup.trainingHours.toFixed(0)}h</div>
                        <div className="text-sm text-gray-600">Training hours to justify</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{upgradeAnalysis.timeToRecoup.longevityYears}y</div>
                        <div className="text-sm text-gray-600">Expected component life</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Component Comparison */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Component Comparison</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Current Setup</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crankset:</span>
                          <span className="font-medium">{upgradeAnalysis.currentSetup.crankset.manufacturer} {upgradeAnalysis.currentSetup.crankset.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cassette:</span>
                          <span className="font-medium">{upgradeAnalysis.currentSetup.cassette.manufacturer} {upgradeAnalysis.currentSetup.cassette.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Derailleur:</span>
                          <span className="font-medium">{upgradeAnalysis.currentSetup.rearDerailleur.manufacturer} {upgradeAnalysis.currentSetup.rearDerailleur.model}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Proposed Setup</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crankset:</span>
                          <span className="font-medium">{upgradeAnalysis.proposedSetup.crankset.manufacturer} {upgradeAnalysis.proposedSetup.crankset.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cassette:</span>
                          <span className="font-medium">{upgradeAnalysis.proposedSetup.cassette.manufacturer} {upgradeAnalysis.proposedSetup.cassette.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Derailleur:</span>
                          <span className="font-medium">{upgradeAnalysis.proposedSetup.rearDerailleur.manufacturer} {upgradeAnalysis.proposedSetup.rearDerailleur.model}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}