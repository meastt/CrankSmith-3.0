'use client';

import { useState, useEffect } from 'react';
import { Crankset, Cassette, RearDerailleur, Chain } from '../types/components';
import { getCranksets, getCassettes, getRearDerailleurs, getChains } from '../actions/componentActions';

export default function DrivetrainCalculator() {
  const [cranksets, setCranksets] = useState<Crankset[]>([]);
  const [cassettes, setCassettes] = useState<Cassette[]>([]);
  const [rearDerailleurs, setRearDerailleurs] = useState<RearDerailleur[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrankset, setSelectedCrankset] = useState<Crankset | null>(null);
  const [selectedCassette, setSelectedCassette] = useState<Cassette | null>(null);
  const [selectedRearDerailleur, setSelectedRearDerailleur] = useState<RearDerailleur | null>(null);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);

  useEffect(() => {
    async function loadComponents() {
      try {
        const [cranksetsData, cassettesData, rearDerailleursData, chainsData] = await Promise.all([
          getCranksets(),
          getCassettes(),
          getRearDerailleurs(),
          getChains()
        ]);

        setCranksets(cranksetsData);
        setCassettes(cassettesData);
        setRearDerailleurs(rearDerailleursData);
        setChains(chainsData);
      } catch (error) {
        console.error('Error loading components:', error);
      } finally {
        setLoading(false);
      }
    }

    loadComponents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading components...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Drivetrain Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Crankset Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Crankset</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => {
              const crank = cranksets.find(c => c.id === e.target.value);
              setSelectedCrankset(crank || null);
            }}
            value={selectedCrankset?.id || ''}
          >
            <option value="">Select a crankset</option>
            {cranksets.map(crank => (
              <option key={crank.id} value={crank.id}>
                {crank.manufacturer} {crank.model} ({crank.chainrings.join(', ')}T)
              </option>
            ))}
          </select>
          {selectedCrankset && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p><strong>Chainrings:</strong> {selectedCrankset.chainrings.join(', ')}T</p>
              <p><strong>Chainline:</strong> {selectedCrankset.chainLine}mm</p>
              <p><strong>Weight:</strong> {selectedCrankset.weight}g</p>
            </div>
          )}
        </div>

        {/* Cassette Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Cassette</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => {
              const cassette = cassettes.find(c => c.id === e.target.value);
              setSelectedCassette(cassette || null);
            }}
            value={selectedCassette?.id || ''}
          >
            <option value="">Select a cassette</option>
            {cassettes.map(cassette => (
              <option key={cassette.id} value={cassette.id}>
                {cassette.manufacturer} {cassette.model} ({cassette.speeds}spd, {cassette.cogRange[0]}-{cassette.cogRange[1]}T)
              </option>
            ))}
          </select>
          {selectedCassette && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p><strong>Speeds:</strong> {selectedCassette.speeds}</p>
              <p><strong>Range:</strong> {selectedCassette.cogRange[0]}-{selectedCassette.cogRange[1]}T</p>
              <p><strong>Weight:</strong> {selectedCassette.weight}g</p>
            </div>
          )}
        </div>

        {/* Rear Derailleur Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Rear Derailleur</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => {
              const rd = rearDerailleurs.find(r => r.id === e.target.value);
              setSelectedRearDerailleur(rd || null);
            }}
            value={selectedRearDerailleur?.id || ''}
          >
            <option value="">Select a rear derailleur</option>
            {rearDerailleurs.map(rd => (
              <option key={rd.id} value={rd.id}>
                {rd.manufacturer} {rd.model} ({rd.speeds}spd, {rd.cageLength})
              </option>
            ))}
          </select>
          {selectedRearDerailleur && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p><strong>Speeds:</strong> {selectedRearDerailleur.speeds}</p>
              <p><strong>Max Cog:</strong> {selectedRearDerailleur.maxCogSize}T</p>
              <p><strong>Capacity:</strong> {selectedRearDerailleur.totalCapacity}T</p>
            </div>
          )}
        </div>

        {/* Chain Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Chain</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => {
              const chain = chains.find(c => c.id === e.target.value);
              setSelectedChain(chain || null);
            }}
            value={selectedChain?.id || ''}
          >
            <option value="">Select a chain</option>
            {chains.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.manufacturer} {chain.model} ({chain.speeds}spd)
              </option>
            ))}
          </select>
          {selectedChain && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p><strong>Speeds:</strong> {selectedChain.speeds}</p>
              <p><strong>Width:</strong> {selectedChain.width}mm</p>
              <p><strong>Links:</strong> {selectedChain.links}</p>
            </div>
          )}
        </div>
      </div>

      {/* Compatibility Check */}
      {selectedCrankset && selectedCassette && selectedRearDerailleur && selectedChain && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Compatibility Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800">✅ Compatible</h3>
              <ul className="mt-2 text-sm text-green-700">
                <li>Speed compatibility: {selectedCrankset.chainrings.length}x{selectedCassette.speeds}</li>
                <li>Chain compatibility: {selectedChain.speeds}-speed chain</li>
                <li>Derailleur capacity: {selectedRearDerailleur.totalCapacity}T</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800">📊 Specifications</h3>
              <ul className="mt-2 text-sm text-blue-700">
                <li>Total weight: {selectedCrankset.weight + selectedCassette.weight + selectedRearDerailleur.weight + selectedChain.weight}g</li>
                <li>Gear range: {selectedCrankset.chainrings[0]}/{selectedCassette.cogRange[1]} to {selectedCrankset.chainrings[selectedCrankset.chainrings.length - 1]}/{selectedCassette.cogRange[0]}</li>
                <li>Total cost: ${(selectedCrankset.msrp + selectedCassette.msrp + selectedRearDerailleur.msrp + selectedChain.msrp).toFixed(2)}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 