'use client';

import React, { useState, useEffect } from 'react';
import { ConfigurationManager, SavedConfiguration } from '../lib/configurationManager';
import { GearSetup } from '../lib/gearCalculator';

interface SaveLoadModalProps {
  currentSetup?: GearSetup;
  onLoad: (setup: GearSetup) => void;
  onClose: () => void;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ 
  currentSetup, 
  onLoad, 
  onClose 
}) => {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [saveName, setSaveName] = useState('');
  const [mode, setMode] = useState<'save' | 'load'>('load');

  useEffect(() => {
    setSavedConfigs(ConfigurationManager.getAll());
  }, []);

  const handleSave = () => {
    if (!currentSetup || !saveName.trim()) return;
    
    try {
      ConfigurationManager.save(saveName.trim(), currentSetup);
      setSavedConfigs(ConfigurationManager.getAll());
      setSaveName('');
      alert('Configuration saved successfully!');
    } catch (error) {
      alert('Failed to save configuration');
    }
  };

  const handleLoad = (config: SavedConfiguration) => {
    onLoad(config.setup);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this configuration?')) {
      ConfigurationManager.delete(id);
      setSavedConfigs(ConfigurationManager.getAll());
    }
  };

  const handleShare = (config: SavedConfiguration) => {
    try {
      const shareUrl = ConfigurationManager.generateShareURL(config);
      navigator.clipboard.writeText(shareUrl);
      alert('Share URL copied to clipboard!');
    } catch (error) {
      alert('Failed to generate share URL');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Save & Load Configurations</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setMode('load')}
            className={`px-4 py-2 rounded ${mode === 'load' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Load
          </button>
          <button
            onClick={() => setMode('save')}
            className={`px-4 py-2 rounded ${mode === 'save' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Save
          </button>
        </div>

        {mode === 'save' && currentSetup && (
          <div className="mb-6 p-4 border rounded">
            <h3 className="font-medium mb-2">Save Current Setup</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Configuration name..."
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">Saved Configurations ({savedConfigs.length})</h3>
          {savedConfigs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No saved configurations</p>
          ) : (
            savedConfigs.map(config => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{config.name}</div>
                  <div className="text-sm text-gray-500">
                    {config.setup.crankset.manufacturer} {config.setup.crankset.model} • 
                    {config.setup.cassette.manufacturer} {config.setup.cassette.model}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(config.created).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoad(config)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleShare(config)}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 