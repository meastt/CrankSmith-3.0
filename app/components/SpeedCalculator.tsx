// app/components/SpeedCalculator.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { GearCalculation } from '../types/components';

interface SpeedCalculatorProps {
  selectedGear: GearCalculation | null;
  allGears?: GearCalculation[];
  onGearChange?: (gear: GearCalculation) => void;
}

export function SpeedCalculator({ 
  selectedGear, 
  allGears = [], 
  onGearChange 
}: SpeedCalculatorProps) {
  const [cadence, setCadence] = useState(90);
  const [targetSpeed, setTargetSpeed] = useState(20);
  const [speedUnit, setSpeedUnit] = useState<'mph' | 'kmh'>('mph');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced parameters
  const [riderWeight, setRiderWeight] = useState(165); // lbs
  const [bikeWeight, setBikeWeight] = useState(20); // lbs
  const [grade, setGrade] = useState(0); // percentage
  const [windSpeed, setWindSpeed] = useState(0); // mph

  // Calculate current speed based on cadence
  const currentSpeed = useMemo(() => {
    if (!selectedGear) return 0;
    
    // Linear interpolation between cadence points
    const { speedAtCadence } = selectedGear;
    
    if (cadence <= 60) return speedAtCadence.rpm60;
    if (cadence <= 80) {
      const ratio = (cadence - 60) / (80 - 60);
      return speedAtCadence.rpm60 + ratio * (speedAtCadence.rpm80 - speedAtCadence.rpm60);
    }
    if (cadence <= 90) {
      const ratio = (cadence - 80) / (90 - 80);
      return speedAtCadence.rpm80 + ratio * (speedAtCadence.rpm90 - speedAtCadence.rpm80);
    }
    if (cadence <= 100) {
      const ratio = (cadence - 90) / (100 - 90);
      return speedAtCadence.rpm90 + ratio * (speedAtCadence.rpm100 - speedAtCadence.rpm90);
    }
    if (cadence <= 120) {
      const ratio = (cadence - 100) / (120 - 100);
      return speedAtCadence.rpm100 + ratio * (speedAtCadence.rpm120 - speedAtCadence.rpm100);
    }
    
    // Extrapolate beyond 120 RPM
    const ratio = (cadence - 120) / 20; // Assume linear beyond 120
    const speed120Plus = speedAtCadence.rpm120 + ratio * (speedAtCadence.rpm120 - speedAtCadence.rpm100);
    return Math.max(0, speed120Plus);
  }, [selectedGear, cadence]);

  // Find best gear for target speed
  const suggestedGear = useMemo(() => {
    if (allGears.length === 0) return null;
    
    const efficiencyThreshold = 0.96; // Only consider reasonably efficient gears
    const efficientGears = allGears.filter(gear => gear.efficiency > efficiencyThreshold);
    
    if (efficientGears.length === 0) return null;
    
    let bestGear = efficientGears[0];
    let smallestDiff = Infinity;
    
    efficientGears.forEach(gear => {
      // Calculate speed at current cadence for this gear
      const gearSpeed = calculateSpeedAtCadence(gear, cadence);
      const diff = Math.abs(gearSpeed - targetSpeed);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestGear = gear;
      }
    });
    
    return bestGear;
  }, [allGears, targetSpeed, cadence]);

  // Helper function to calculate speed at specific cadence for any gear
  const calculateSpeedAtCadence = (gear: GearCalculation, rpm: number): number => {
    // Simple calculation: development * cadence * 60 / 1000 * 0.621371 (m/h to mph)
    return gear.developmentMeters * rpm * 60 / 1000 * 0.621371;
  };

  // Convert between mph and kmh
  const convertSpeed = (speedMph: number): number => {
    return speedUnit === 'kmh' ? speedMph * 1.60934 : speedMph;
  };

  const convertSpeedInput = (input: number): number => {
    return speedUnit === 'kmh' ? input / 1.60934 : input;
  };

  // Calculate power estimation (simplified)
  const estimatedPower = useMemo(() => {
    if (!selectedGear || !showAdvanced) return null;
    
    const speedMs = (currentSpeed * 0.44704); // mph to m/s
    const totalWeightKg = (riderWeight + bikeWeight) * 0.453592; // lbs to kg
    const gradeRadians = Math.atan(grade / 100);
    const windSpeedMs = windSpeed * 0.44704;
    
    // Simplified power calculation
    const crr = 0.005; // rolling resistance coefficient
    const gravity = 9.81;
    const airDensity = 1.225;
    const dragArea = 0.4; // typical CdA
    
    const rollingPower = crr * totalWeightKg * gravity * Math.cos(gradeRadians) * speedMs;
    const climbingPower = totalWeightKg * gravity * Math.sin(gradeRadians) * speedMs;
    const airPower = 0.5 * airDensity * dragArea * Math.pow(speedMs + windSpeedMs, 3);
    
    return Math.round(rollingPower + climbingPower + airPower);
  }, [selectedGear, currentSpeed, riderWeight, bikeWeight, grade, windSpeed, showAdvanced]);

  const getCadenceColor = (cadence: number): string => {
    if (cadence < 70 || cadence > 110) return 'text-yellow-600';
    if (cadence < 80 || cadence > 100) return 'text-blue-600';
    return 'text-green-600'; // Sweet spot 80-100
  };

  const getCadenceLabel = (cadence: number): string => {
    if (cadence < 60) return 'Very Low - Grinding';
    if (cadence < 70) return 'Low - Steady climbing';
    if (cadence < 80) return 'Moderate - Endurance pace';
    if (cadence < 90) return 'Good - General riding';
    if (cadence < 100) return 'High - Racing pace';
    if (cadence < 110) return 'Very High - Sprint';
    return 'Extreme - Maximum effort';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">
          Speed & Cadence Calculator
        </h3>
        {selectedGear && (
          <p className="text-sm text-gray-600 mt-1">
            Current gear: {selectedGear.chainring}T × {selectedGear.cog}T 
            (Ratio: {selectedGear.ratio.toFixed(2)}, Gain: {selectedGear.gainRatio.toFixed(2)})
          </p>
        )}
      </div>

      <div className="p-6">
        {!selectedGear ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">⚙️</div>
            <p className="text-gray-500">Select a gear to calculate speeds and analyze performance</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Speed Unit Toggle */}
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">Units</h4>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setSpeedUnit('mph')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                    speedUnit === 'mph'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  MPH
                </button>
                <button
                  onClick={() => setSpeedUnit('kmh')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    speedUnit === 'kmh'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  KM/H
                </button>
              </div>
            </div>

            {/* Cadence Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cadence (RPM)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={cadence}
                  onChange={(e) => setCadence(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="40"
                  max="140"
                  value={cadence}
                  onChange={(e) => setCadence(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className={getCadenceColor(cadence)}>
                  {getCadenceLabel(cadence)}
                </span>
                <span className="text-gray-500">
                  Sweet spot: 80-100 RPM
                </span>
              </div>
            </div>

            {/* Current Speed Display */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {convertSpeed(currentSpeed).toFixed(1)} {speedUnit.toUpperCase()}
                </div>
                <div className="text-sm text-blue-700">
                  at {cadence} RPM
                </div>
                {selectedGear.efficiency && (
                  <div className="text-xs text-blue-600 mt-1">
                    Chain efficiency: {(selectedGear.efficiency * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* Target Speed Analysis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Speed ({speedUnit.toUpperCase()})
              </label>
              <input
                type="number"
                min="1"
                max="60"
                step="0.1"
                value={convertSpeed(targetSpeed).toFixed(1)}
                onChange={(e) => setTargetSpeed(convertSpeedInput(Number(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              
              {suggestedGear && suggestedGear !== selectedGear && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-800">
                        💡 Better gear for {convertSpeed(targetSpeed).toFixed(1)} {speedUnit.toUpperCase()}: 
                        <span className="font-medium ml-1">
                          {suggestedGear.chainring}T × {suggestedGear.cog}T
                        </span>
                      </p>
                      <p className="text-xs text-yellow-700">
                        Efficiency: {(suggestedGear.efficiency * 100).toFixed(1)}%
                      </p>
                    </div>
                    {onGearChange && (
                      <button
                        onClick={() => onGearChange(suggestedGear)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        Use This Gear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Speed at Common Cadences */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Speed at Common Cadences</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[60, 80, 90, 100, 120].map(rpm => (
                  <div key={rpm} className="text-center p-3 bg-gray-50 rounded-md">
                    <div className="text-lg font-medium text-gray-900">
                      {convertSpeed(selectedGear.speedAtCadence[`rpm${rpm}` as keyof typeof selectedGear.speedAtCadence]).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">@ {rpm} RPM</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Analysis Toggle */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <span>{showAdvanced ? '▼' : '▶'}</span>
                <span className="ml-1">Advanced Power Analysis</span>
              </button>
            </div>

            {/* Advanced Parameters */}
            {showAdvanced && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rider Weight (lbs)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="300"
                      value={riderWeight}
                      onChange={(e) => setRiderWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bike Weight (lbs)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="50"
                      value={bikeWeight}
                      onChange={(e) => setBikeWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade (%)
                    </label>
                    <input
                      type="number"
                      min="-10"
                      max="20"
                      step="0.1"
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wind Speed (mph)
                    </label>
                    <input
                      type="number"
                      min="-20"
                      max="30"
                      step="0.1"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* Power Estimation */}
                {estimatedPower && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-purple-900 mb-2">
                      Estimated Power Required
                    </h5>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {estimatedPower} watts
                      </div>
                      <div className="text-xs text-purple-700 mt-1">
                        at {convertSpeed(currentSpeed).toFixed(1)} {speedUnit.toUpperCase()} 
                        {grade !== 0 && <span>, {grade > 0 ? '+' : ''}{grade}% grade</span>}
                        {windSpeed !== 0 && <span>, {windSpeed > 0 ? 'head' : 'tail'}wind {Math.abs(windSpeed)} mph</span>}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-purple-600">
                      <p>⚠️ Simplified estimation for comparison only</p>
                      <p>Actual power varies with rider position, equipment, and conditions</p>
                    </div>
                  </div>
                )}

                {/* Power Zone Reference */}
                <div className="bg-gray-50 rounded-md p-3">
                  <h6 className="text-xs font-medium text-gray-700 mb-2">Power Zone Reference</h6>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-600">Recovery: &lt;120W</div>
                    <div className="text-gray-600">Endurance: 120-180W</div>
                    <div className="text-gray-600">Tempo: 180-240W</div>
                    <div className="text-gray-600">Threshold: 240-300W</div>
                    <div className="text-gray-600">VO2: 300-400W</div>
                    <div className="text-gray-600">Anaerobic: &gt;400W</div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Technical Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <div className="flex justify-between">
                    <span>Development:</span>
                    <span className="font-medium">{selectedGear.developmentMeters.toFixed(2)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gear Inches:</span>
                    <span className="font-medium">{selectedGear.gearInches?.toFixed(1)}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gain Ratio:</span>
                    <span className="font-medium">{selectedGear.gainRatio.toFixed(3)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Chain Line:</span>
                    <span className="font-medium">{selectedGear.chainLine?.toFixed(1)}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cross-Chain Angle:</span>
                    <span className={`font-medium ${
                      selectedGear.crossChainAngle > 5 ? 'text-red-600' :
                      selectedGear.crossChainAngle > 2.5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {selectedGear.crossChainAngle.toFixed(1)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wheel Circumference:</span>
                    <span className="font-medium">{selectedGear.wheelCircumference}mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}