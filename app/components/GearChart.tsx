// app/components/GearChart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { GearCalculation } from '../types/components';

interface GearChartProps {
  gears: GearCalculation[];
  crankLength: number;
  speedUnit?: 'mph' | 'kmh';
  highlightOptimal?: boolean;
  showEfficiency?: boolean;
  onGearSelect?: (gear: GearCalculation) => void;
}

export function GearChart({
  gears,
  crankLength,
  speedUnit = 'mph',
  highlightOptimal = true,
  showEfficiency = true,
  onGearSelect
}: GearChartProps) {
  const [sortBy, setSortBy] = useState<'ratio' | 'gainRatio' | 'development'>('ratio');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterProblematic, setFilterProblematic] = useState(false);
  const [selectedGear, setSelectedGear] = useState<GearCalculation | null>(null);
  const [currentSpeedUnit, setCurrentSpeedUnit] = useState<'mph' | 'kmh'>(speedUnit);

  // Sort and filter gears
  const processedGears = useMemo(() => {
    let filtered = [...gears];

    // Apply problematic filter
    if (filterProblematic) {
      filtered = filtered.filter(gear => gear.efficiency < 0.96 || gear.crossChainAngle > 5);
    }

    // Sort gears
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'ratio':
          aValue = a.ratio;
          bValue = b.ratio;
          break;
        case 'gainRatio':
          aValue = a.gainRatio;
          bValue = b.gainRatio;
          break;
        case 'development':
          aValue = a.developmentMeters;
          bValue = b.developmentMeters;
          break;
        default:
          aValue = a.ratio;
          bValue = b.ratio;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [gears, sortBy, sortDirection, filterProblematic]);

  // Convert speed units if needed
  const convertSpeed = (speedMph: number): number => {
    return currentSpeedUnit === 'kmh' ? speedMph * 1.60934 : speedMph;
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleGearClick = (gear: GearCalculation) => {
    setSelectedGear(gear);
    onGearSelect?.(gear);
  };

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency > 0.975) return 'text-green-600 bg-green-100';
    if (efficiency > 0.96) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCrossChainColor = (angle: number): string => {
    if (angle < 2.5) return 'text-green-600';
    if (angle < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const SortHeader = ({ column, children }: { column: typeof sortBy; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortBy === column && (
          <span className="text-blue-600">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header with controls */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Gear Analysis
          </h3>
          <div className="flex items-center space-x-4">
            {/* Speed unit toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Speed:</span>
              <button
                onClick={() => setCurrentSpeedUnit('mph')}
                className={`px-2 py-1 text-xs rounded ${
                  currentSpeedUnit === 'mph' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                MPH
              </button>
              <button
                onClick={() => setCurrentSpeedUnit('kmh')}
                className={`px-2 py-1 text-xs rounded ${
                  currentSpeedUnit === 'kmh' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                KM/H
              </button>
            </div>

            {/* Filter toggle */}
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={filterProblematic}
                onChange={(e) => setFilterProblematic(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Show only problematic gears</span>
            </label>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Gears:</span>
            <span className="ml-1 font-medium">{gears.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Optimal:</span>
            <span className="ml-1 font-medium text-green-600">
              {gears.filter(g => g.efficiency > 0.975).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Problematic:</span>
            <span className="ml-1 font-medium text-red-600">
              {gears.filter(g => g.efficiency < 0.96 || g.crossChainAngle > 5).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Range:</span>
            <span className="ml-1 font-medium">
              {Math.min(...gears.map(g => g.ratio)).toFixed(2)} - {Math.max(...gears.map(g => g.ratio)).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Crank Length:</span>
            <span className="ml-1 font-medium">{crankLength}mm</span>
          </div>
        </div>
      </div>

      {/* Gear table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Combination
              </th>
              <SortHeader column="ratio">Gear Ratio</SortHeader>
              <SortHeader column="gainRatio">Gain Ratio</SortHeader>
              <SortHeader column="development">Development</SortHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                @ 60 RPM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                @ 90 RPM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                @ 120 RPM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chain Angle
              </th>
              {showEfficiency && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedGears.map((gear, index) => (
              <tr
                key={`${gear.chainring}-${gear.cog}-${index}`}
                onClick={() => handleGearClick(gear)}
                className={`cursor-pointer transition-colors ${
                  selectedGear === gear ? 'bg-blue-50' : 'hover:bg-gray-50'
                } ${
                  highlightOptimal && gear.efficiency > 0.975 ? 'border-l-4 border-green-400' :
                  gear.efficiency < 0.96 || gear.crossChainAngle > 5 ? 'border-l-4 border-red-400' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {gear.chainring}T × {gear.cog}T
                  </div>
                  <div className="text-xs text-gray-500">
                    {gear.gearInches?.toFixed(1)}" gear inches
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {gear.ratio.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {gear.gainRatio.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {gear.developmentMeters.toFixed(2)}m
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {convertSpeed(gear.speedAtCadence.rpm60).toFixed(1)} {currentSpeedUnit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {convertSpeed(gear.speedAtCadence.rpm90).toFixed(1)} {currentSpeedUnit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {convertSpeed(gear.speedAtCadence.rpm120).toFixed(1)} {currentSpeedUnit}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getCrossChainColor(gear.crossChainAngle)}`}>
                  {gear.crossChainAngle.toFixed(1)}°
                </td>
                {showEfficiency && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEfficiencyColor(gear.efficiency)}`}>
                      {(gear.efficiency * 100).toFixed(1)}%
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {processedGears.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filterProblematic ? 'No problematic gears found' : 'No gears to display'}
          </div>
        )}
      </div>

      {/* Selected gear details */}
      {selectedGear && (
        <div className="border-t bg-blue-50 px-6 py-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Selected: {selectedGear.chainring}T × {selectedGear.cog}T
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
            <div>
              <span className="text-blue-600">Gear Ratio:</span> {selectedGear.ratio.toFixed(3)}
            </div>
            <div>
              <span className="text-blue-600">Gain Ratio:</span> {selectedGear.gainRatio.toFixed(3)}
            </div>
            <div>
              <span className="text-blue-600">Chain Line:</span> {selectedGear.chainLine?.toFixed(1)}mm
            </div>
            <div>
              <span className="text-blue-600">Wheel Circumference:</span> {selectedGear.wheelCircumference}mm
            </div>
          </div>
        </div>
      )}
    </div>
  );
}