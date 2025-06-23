'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Info, ChevronLeft, Gauge, AlertTriangle, CheckCircle, Menu, X } from 'lucide-react';

interface PressureResult {
  frontPsi: number;
  rearPsi: number;
  frontBar: number;
  rearBar: number;
  recommendation: string;
  warnings: string[];
  notes: string[];
}

export default function MobileTirePressureCalculator() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    
    // Base pressure calculation
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

    // Front/rear distribution
    const frontPsi = Math.round(basePressure * 0.95);
    const rearPsi = Math.round(basePressure);

    // Convert to bar
    const frontBar = Math.round((frontPsi * 0.0689476) * 10) / 10;
    const rearBar = Math.round((rearPsi * 0.0689476) * 10) / 10;

    // Generate warnings and recommendations
    const warnings: string[] = [];
    const notes: string[] = [];
    let recommendation = '';

    if (frontPsi < 20) warnings.push('Front pressure very low - pinch flat risk');
    if (rearPsi < 20) warnings.push('Rear pressure very low - pinch flat risk');
    if (frontPsi > 120) warnings.push('Front pressure very high - may reduce grip');
    if (rearPsi > 120) warnings.push('Rear pressure very high - may reduce grip');

    if (bikeType === 'road') {
      recommendation = 'Road pressures for speed and comfort';
      notes.push('Check before every ride');
      notes.push('Lower for wet conditions');
    } else if (bikeType === 'gravel') {
      recommendation = 'Gravel pressures for traction balance';
      notes.push('Lower pressure = more comfort');
      notes.push('Consider tubeless setup');
    } else if (bikeType === 'mtb') {
      recommendation = 'MTB pressures for control';
      notes.push('Adjust for trail conditions');
      notes.push('Lower for technical terrain');
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
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <nav className="bg-white shadow-tool border-b border-neutral-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-neutral-900">CrankSmith</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-tool-orange text-white rounded-tool">
                Tire Calc
              </span>
            </div>
            
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
                <a href="#" className="px-4 py-3 text-neutral-600 touch-target">Quick Check</a>
                <a href="#" className="px-4 py-3 text-neutral-600 touch-target">Build Guide</a>
                <a href="#" className="px-4 py-3 text-tool-orange font-medium touch-target">Tire Calculator</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="px-4 py-6 pb-20">
        {/* Mobile header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-tool-orange rounded-tool flex items-center justify-center mx-auto mb-3">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Tire Pressure Calculator
          </h1>
          <p className="text-neutral-600 text-sm">
            Get optimal tire pressure for your setup
          </p>
        </div>

        {/* Mobile-first input form */}
        <div className="space-y-4">
          {/* Units Toggle */}
          <div className="bg-white rounded-tool border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-700">Units:</span>
              <div className="flex items-center space-x-3">
                <span className={`text-xs ${!useMetric ? 'font-semibold text-primary-600' : 'text-neutral-500'}`}>
                  Imperial
                </span>
                <button
                  onClick={() => setUseMetric(!useMetric)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors touch-target ${
                    useMetric ? 'bg-primary-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useMetric ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs ${useMetric ? 'font-semibold text-primary-600' : 'text-neutral-500'}`}>
                  Metric
                </span>
              </div>
            </div>
          </div>

          {/* Rider Weight */}
          <div className="bg-white rounded-tool border border-neutral-200 p-4">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Your Weight ({useMetric ? 'kg' : 'lbs'}) *
            </label>
            <input
              type="number"
              value={riderWeight}
              onChange={(e) => setRiderWeight(e.target.value)}
              placeholder={useMetric ? "70" : "155"}
              className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
            />
          </div>

          {/* Bike Weight */}
          <div className="bg-white rounded-tool border border-neutral-200 p-4">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Bike Weight ({useMetric ? 'kg' : 'lbs'}) <span className="text-neutral-500 text-xs">(optional)</span>
            </label>
            <input
              type="number"
              value={bikeWeight}
              onChange={(e) => setBikeWeight(e.target.value)}
              placeholder={useMetric ? "8" : "18"}
              className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
            />
          </div>

          {/* Tire Width */}
          <div className="bg-white rounded-tool border border-neutral-200 p-4">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Tire Width (mm) *
            </label>
            <input
              type="number"
              value={tireWidth}
              onChange={(e) => setTireWidth(e.target.value)}
              placeholder="25"
              className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
            />
            <p className="text-xs text-neutral-500 mt-2">
              Road: 23-32mm • Gravel: 35-50mm • MTB: 50-65mm
            </p>
          </div>

          {/* Bike Type */}
          <div className="bg-white rounded-tool border border-neutral-200 p-4">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Bike Type *
            </label>
            <select
              value={bikeType}
              onChange={(e) => setBikeType(e.target.value)}
              className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
            >
              <option value="">Choose bike type...</option>
              <option value="road">Road Bike</option>
              <option value="gravel">Gravel/Cyclocross</option>
              <option value="mtb">Mountain Bike</option>
              <option value="hybrid">Hybrid/Commuter</option>
            </select>
          </div>

          {/* Riding Style */}
          <div className="bg-white rounded-tool border border-neutral-200 p-4">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Priority *
            </label>
            <select
              value={ridingStyle}
              onChange={(e) => setRidingStyle(e.target.value)}
              className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
            >
              <option value="">Choose priority...</option>
              <option value="comfort">Maximum Comfort</option>
              <option value="balanced">Balanced</option>
              <option value="performance">Performance</option>
              <option value="racing">Racing/Speed</option>
            </select>
          </div>

          {/* Terrain */}
          <div className="bg-white rounded-tool border border-neutral-200 p-4">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Terrain *
            </label>
            <select
              value={terrainType}
              onChange={(e) => setTerrainType(e.target.value)}
              className="w-full border border-neutral-300 rounded-tool px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 touch-target"
            >
              <option value="">Choose terrain...</option>
              <option value="smooth">Smooth Roads</option>
              <option value="mixed">Mixed Surfaces</option>
              <option value="rough">Rough/Gravel</option>
            </select>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className="w-full bg-tool-orange text-white py-4 px-6 rounded-tool text-lg font-semibold hover:bg-orange-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors touch-target"
          >
            Calculate Pressure
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Pressure Results */}
            <div className="bg-white rounded-tool border border-neutral-200 p-4">
              <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-success-500" />
                Recommended Pressures
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-primary-50 rounded-tool">
                  <div className="text-xl font-bold text-primary-600">
                    {useMetric ? `${result.frontBar}` : result.frontPsi}
                  </div>
                  <div className="text-sm text-primary-700 font-medium">
                    Front {useMetric ? 'Bar' : 'PSI'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {useMetric ? `${result.frontPsi} PSI` : `${result.frontBar} Bar`}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-success-50 rounded-tool">
                  <div className="text-xl font-bold text-success-600">
                    {useMetric ? `${result.rearBar}` : result.rearPsi}
                  </div>
                  <div className="text-sm text-success-700 font-medium">
                    Rear {useMetric ? 'Bar' : 'PSI'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {useMetric ? `${result.rearPsi} PSI` : `${result.rearBar} Bar`}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-tool">
                {result.recommendation}
              </p>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-tool p-4">
                <h3 className="font-semibold text-yellow-800 mb-2 flex items-center text-sm">
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

            {/* Pro Tips */}
            {result.notes.length > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-tool p-4">
                <h3 className="font-semibold text-primary-800 mb-2 flex items-center text-sm">
                  <Info className="w-4 h-4 mr-2" />
                  Pro Tips
                </h3>
                <ul className="text-sm text-primary-700 space-y-1">
                  {result.notes.map((note, index) => (
                    <li key={index}>• {note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* New Calculation Button */}
            <button
              onClick={() => setResult(null)}
              className="w-full bg-neutral-600 text-white py-3 px-4 rounded-tool font-medium hover:bg-neutral-700 transition-colors touch-target"
            >
              Calculate Again
            </button>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-neutral-50 rounded-tool p-4">
          <h3 className="font-semibold text-neutral-900 mb-2 text-sm">How It Works</h3>
          <ul className="text-xs text-neutral-700 space-y-1">
            <li>• Based on Frank Berto's research</li>
            <li>• Accounts for rider + bike weight</li>
            <li>• Adjusts for terrain and style</li>
            <li>• Front gets 5% less pressure</li>
          </ul>
        </div>
      </main>
    </div>
  );
}