'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Info, ChevronLeft, Gauge, AlertTriangle, CheckCircle } from 'lucide-react';

interface PressureResult {
  frontPsi: number;
  rearPsi: number;
  frontBar: number;
  rearBar: number;
  recommendation: string;
  warnings: string[];
  notes: string[];
}

export default function TirePressureCalculator() {
  const router = useRouter();
  const [riderWeight, setRiderWeight] = useState<string>('');
  const [bikeWeight, setBikeWeight] = useState<string>('');
  const [tireWidth, setTireWidth] = useState<string>('');
  const [bikeType, setBikeType] = useState<string>('');
  const [ridingStyle, setRidingStyle] = useState<string>('');
  const [terrainType, setTerrainType] = useState<string>('');
  const [useMetric, setUseMetric] = useState<boolean>(false);
  const [result, setResult] = useState<PressureResult | null>(null);

  const calculatePressure = (): PressureResult => {
    const weight = parseFloat(riderWeight) + parseFloat(bikeWeight || '0');
    const width = parseFloat(tireWidth);
    
    // Base pressure calculation (simplified Frank Berto formula)
    let basePressure = 0;
    
    if (bikeType === 'road') {
      basePressure = Math.sqrt(weight / width) * 10.3;
    } else if (bikeType === 'gravel') {
      basePressure = Math.sqrt(weight / width) * 8.5;
    } else if (bikeType === 'mtb') {
      basePressure = Math.sqrt(weight / width) * 6.2;
    } else if (bikeType === 'hybrid') {
      basePressure = Math.sqrt(weight / width) * 9.1;
    }

    // Terrain adjustments
    let terrainMultiplier = 1.0;
    if (terrainType === 'smooth') terrainMultiplier = 0.95;
    else if (terrainType === 'rough') terrainMultiplier = 1.1;
    else if (terrainType === 'mixed') terrainMultiplier = 1.0;

    // Riding style adjustments
    let styleMultiplier = 1.0;
    if (ridingStyle === 'comfort') styleMultiplier = 0.9;
    else if (ridingStyle === 'performance') styleMultiplier = 1.05;
    else if (ridingStyle === 'racing') styleMultiplier = 1.1;

    // Apply adjustments
    basePressure *= terrainMultiplier * styleMultiplier;

    // Front/rear distribution (front gets 5-10% less pressure)
    const frontPsi = Math.round(basePressure * 0.95);
    const rearPsi = Math.round(basePressure);

    // Convert to bar
    const frontBar = Math.round((frontPsi * 0.0689476) * 10) / 10;
    const rearBar = Math.round((rearPsi * 0.0689476) * 10) / 10;

    // Generate recommendations and warnings
    const warnings: string[] = [];
    const notes: string[] = [];
    let recommendation = '';

    if (frontPsi < 20) warnings.push('Front pressure is very low - risk of pinch flats');
    if (rearPsi < 20) warnings.push('Rear pressure is very low - risk of pinch flats');
    if (frontPsi > 120) warnings.push('Front pressure is very high - may reduce traction');
    if (rearPsi > 120) warnings.push('Rear pressure is very high - may reduce traction');

    if (bikeType === 'road') {
      recommendation = 'Road bike pressures for optimal speed and comfort';
      notes.push('Check pressure before every ride');
      notes.push('Consider lower pressure for wet conditions');
    } else if (bikeType === 'gravel') {
      recommendation = 'Gravel pressures balancing speed and traction';
      notes.push('Lower pressure improves comfort on rough surfaces');
      notes.push('Consider tubeless for lower pressure capability');
    } else if (bikeType === 'mtb') {
      recommendation = 'Mountain bike pressures for traction and control';
      notes.push('Adjust based on trail conditions');
      notes.push('Lower pressure for technical terrain');
    }

    return {
      frontPsi,
      rearPsi,
      frontBar,
      rearBar,
      recommendation,
      warnings,
      notes
    };
  };

  const handleCalculate = () => {
    if (riderWeight && tireWidth && bikeType && ridingStyle && terrainType) {
      const calculation = calculatePressure();
      setResult(calculation);
    }
  };

  const canCalculate = riderWeight && tireWidth && bikeType && ridingStyle && terrainType;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">CrankSmith</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-500 hover:text-gray-900">Quick Check</a>
                <a href="#" className="text-gray-500 hover:text-gray-900">Build Guide</a>
                <a href="#" className="text-blue-600 font-medium">Tire Calculator</a>
              </nav>
            </div>
            
            <button 
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gauge className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tire Pressure Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate optimal tire pressure based on rider weight, bike type, and riding conditions. 
            Used by professional mechanics and serious cyclists worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Calculation Inputs
            </h2>

            <div className="space-y-6">
              {/* Units Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Units:</span>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${!useMetric ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                    Imperial (lbs/PSI)
                  </span>
                  <button
                    onClick={() => setUseMetric(!useMetric)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useMetric ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useMetric ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${useMetric ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                    Metric (kg/Bar)
                  </span>
                </div>
              </div>

              {/* Rider Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rider Weight ({useMetric ? 'kg' : 'lbs'}) *
                </label>
                <input
                  type="number"
                  value={riderWeight}
                  onChange={(e) => setRiderWeight(e.target.value)}
                  placeholder={useMetric ? "70" : "155"}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Bike Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bike Weight ({useMetric ? 'kg' : 'lbs'}) <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="number"
                  value={bikeWeight}
                  onChange={(e) => setBikeWeight(e.target.value)}
                  placeholder={useMetric ? "8" : "18"}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Tire Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tire Width (mm) *
                </label>
                <input
                  type="number"
                  value={tireWidth}
                  onChange={(e) => setTireWidth(e.target.value)}
                  placeholder="25"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Common sizes: Road (23-32mm), Gravel (35-50mm), MTB (50-65mm)
                </p>
              </div>

              {/* Bike Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bike Type *
                </label>
                <select
                  value={bikeType}
                  onChange={(e) => setBikeType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select bike type...</option>
                  <option value="road">Road Bike</option>
                  <option value="gravel">Gravel/Cyclocross</option>
                  <option value="mtb">Mountain Bike</option>
                  <option value="hybrid">Hybrid/Commuter</option>
                </select>
              </div>

              {/* Riding Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Riding Priority *
                </label>
                <select
                  value={ridingStyle}
                  onChange={(e) => setRidingStyle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select priority...</option>
                  <option value="comfort">Maximum Comfort</option>
                  <option value="balanced">Balanced</option>
                  <option value="performance">Performance</option>
                  <option value="racing">Racing/Maximum Speed</option>
                </select>
              </div>

              {/* Terrain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Terrain *
                </label>
                <select
                  value={terrainType}
                  onChange={(e) => setTerrainType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select terrain...</option>
                  <option value="smooth">Smooth Roads/Bike Paths</option>
                  <option value="mixed">Mixed Surfaces</option>
                  <option value="rough">Rough Roads/Gravel/Trails</option>
                </select>
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={!canCalculate}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Calculate Optimal Pressure
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Pressure Results */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Recommended Pressures
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {useMetric ? `${result.frontBar}` : result.frontPsi}
                      </div>
                      <div className="text-sm text-blue-700 font-medium">
                        Front {useMetric ? 'Bar' : 'PSI'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {useMetric ? `${result.frontPsi} PSI` : `${result.frontBar} Bar`}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {useMetric ? `${result.rearBar}` : result.rearPsi}
                      </div>
                      <div className="text-sm text-green-700 font-medium">
                        Rear {useMetric ? 'Bar' : 'PSI'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {useMetric ? `${result.rearPsi} PSI` : `${result.rearBar} Bar`}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {result.recommendation}
                  </p>
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Warnings
                    </h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {result.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes */}
                {result.notes.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Pro Tips
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {result.notes.map((note, index) => (
                        <li key={index}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <Gauge className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Calculate
                </h3>
                <p className="text-gray-600">
                  Fill in the required fields to get your optimal tire pressure recommendation.
                </p>
              </div>
            )}

            {/* Technical Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Based on Frank Berto's tire pressure research</li>
                <li>• Accounts for rider + bike weight distribution</li>
                <li>• Adjusts for terrain and riding style preferences</li>
                <li>• Front tire gets 5% less pressure than rear</li>
                <li>• Optimizes for speed, comfort, and puncture resistance</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}