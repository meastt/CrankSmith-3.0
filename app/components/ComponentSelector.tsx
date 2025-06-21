// app/components/ComponentSelector.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Component, Crankset, Cassette, RearDerailleur, Chain } from '../types/components';

interface ComponentSelectorProps {
  type: 'crankset' | 'cassette' | 'rear_derailleur' | 'chain';
  bikeType?: string;
  speeds?: number;
  selectedComponent?: Component;
  onSelect: (component: Component) => void;
  disabled?: boolean;
  components: Component[];
}

export function ComponentSelector({
  type,
  bikeType,
  speeds,
  selectedComponent,
  onSelect,
  disabled = false,
  components
}: ComponentSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Get filtered components
  const filteredComponents = useMemo(() => {
    let filtered: Component[] = components;
    
    // Filter by bike type
    if (bikeType) {
      filtered = filtered.filter(c => c.bikeType === bikeType);
    }
    
    // Filter by speeds for cassette, rear derailleur, and chain
    if (speeds && (type === 'cassette' || type === 'rear_derailleur' || type === 'chain')) {
      filtered = filtered.filter(c => {
        if (c.type === 'cassette' || c.type === 'rear_derailleur' || c.type === 'chain') {
          return c.speeds === speeds;
        }
        return false;
      });
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(component =>
        component.manufacturer.toLowerCase().includes(searchTerm) ||
        component.model.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [components, type, bikeType, speeds, search]);

  // Group components by manufacturer
  const groupedComponents = useMemo(() => {
    const groups: Record<string, Component[]> = {};
    filteredComponents.forEach(component => {
      if (!groups[component.manufacturer]) {
        groups[component.manufacturer] = [];
      }
      groups[component.manufacturer].push(component);
    });
    return groups;
  }, [filteredComponents]);

  const handleSelect = (component: Component) => {
    onSelect(component);
    setIsOpen(false);
    setSearch('');
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'crankset': return 'Crankset';
      case 'cassette': return 'Cassette';
      case 'rear_derailleur': return 'Rear Derailleur';
      case 'chain': return 'Chain';
      default: return type;
    }
  };

  const getComponentSummary = (component: Component): string => {
    switch (component.type) {
      case 'crankset':
        const crankset = component as Crankset;
        return `${crankset.chainrings.join('/')}T, ${crankset.crankLength.join('/')}mm`;
      case 'cassette':
        const cassette = component as Cassette;
        return `${cassette.speeds}sp, ${cassette.cogRange[0]}-${cassette.cogRange[1]}T`;
      case 'rear_derailleur':
        const derailleur = component as RearDerailleur;
        return `${derailleur.speeds}sp, ${derailleur.cageLength}, Max ${derailleur.maxCogSize}T`;
      case 'chain':
        const chain = component as Chain;
        return `${chain.speeds}sp, ${chain.width}mm`;
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {getTypeLabel(type)}
        {speeds && <span className="text-gray-500 ml-1">({speeds}-speed)</span>}
      </label>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
      >
        <span className="block truncate">
          {selectedComponent ? (
            <div>
              <span className="font-medium">
                {selectedComponent.manufacturer} {selectedComponent.model}
              </span>
              <span className="text-gray-500 ml-2">
                {getComponentSummary(selectedComponent)}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Select {getTypeLabel(type).toLowerCase()}...</span>
          )}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {/* Search input */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Component list */}
          {Object.keys(groupedComponents).length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No components found
            </div>
          ) : (
            Object.entries(groupedComponents).map(([manufacturer, manufacturerComponents]) => (
              <div key={manufacturer}>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  {manufacturer}
                </div>
                {manufacturerComponents.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => handleSelect(component)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-900 focus:outline-none focus:bg-blue-50 focus:text-blue-900"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {component.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getComponentSummary(component)}
                        </div>
                        {component.year && (
                          <div className="text-xs text-gray-400">
                            {component.year}
                          </div>
                        )}
                      </div>
                      {component.weight && (
                        <div className="text-xs text-gray-500 ml-2">
                          {component.weight}g
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}