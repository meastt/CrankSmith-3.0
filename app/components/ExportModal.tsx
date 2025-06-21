// app/components/ExportModal.tsx
'use client';

import React, { useState } from 'react';
import { GearSetup } from '../lib/gearCalculator';
import { DrivetrainAnalysis } from '../types/components';
import { ConfigurationManager } from '../lib/configurationManager';

interface ExportModalProps {
  setup: GearSetup;
  analysis?: DrivetrainAnalysis;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ setup, analysis, onClose }) => {
  const [activeTab, setActiveTab] = useState<'share' | 'export' | 'save'>('share');
  const [saveName, setSaveName] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const generateShareUrl = async () => {
    try {
      const config = {
        id: Date.now().toString(),
        name: saveName || 'Shared Setup',
        setup,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        analysis
      };
      
      const url = ConfigurationManager.generateShareURL(config);
      setShareUrl(url);
    } catch (error) {
      alert('Failed to generate share URL');
    }
  };

  const saveConfiguration = async () => {
    if (!saveName.trim()) {
      alert('Please enter a name for your configuration');
      return;
    }
    
    setIsSaving(true);
    try {
      ConfigurationManager.save(saveName.trim(), setup, analysis);
      alert('Configuration saved successfully!');
      setSaveName('');
    } catch (error) {
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const exportJSON = () => {
    const config = {
      id: Date.now().toString(),
      name: saveName || 'Exported Setup',
      setup,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      analysis
    };
    
    const jsonString = ConfigurationManager.exportAsJSON(config);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cranksmith-setup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    try {
      const config = {
        id: Date.now().toString(),
        name: saveName || 'PDF Report',
        setup,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        analysis
      };
      
      const blob = await ConfigurationManager.exportAsPDF(config);
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `cranksmith-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to generate PDF report');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Save & Share Setup</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Setup Summary */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-2">Current Setup</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div><strong>Bike:</strong> {setup.bikeType}</div>
            <div><strong>Crankset:</strong> {setup.crankset.manufacturer} {setup.crankset.model}</div>
            <div><strong>Cassette:</strong> {setup.cassette.manufacturer} {setup.cassette.model}</div>
            <div><strong>Derailleur:</strong> {setup.rearDerailleur.manufacturer} {setup.rearDerailleur.model}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'share', label: 'Share URL', icon: '🔗' },
            { id: 'save', label: 'Save Locally', icon: '💾' },
            { id: 'export', label: 'Export Files', icon: '📁' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setup Name (Optional)
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="My Custom Drivetrain"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={generateShareUrl}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate Share URL
              </button>
              
              {shareUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Anyone with this URL can load your drivetrain setup
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'save' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="My Custom Drivetrain"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={saveConfiguration}
                disabled={isSaving || !saveName.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
              
              <div className="text-sm text-gray-600">
                <p>• Saved configurations are stored locally in your browser</p>
                <p>• You can load them later from the Build page</p>
                <p>• Data persists until you clear browser storage</p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name (Optional)
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="My Setup"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={exportJSON}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
                >
                  <span className="mr-2">📄</span>
                  Export as JSON
                </button>
                
                <button
                  onClick={exportPDF}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                >
                  <span className="mr-2">📋</span>
                  Export PDF Report
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>JSON:</strong> Complete setup data for importing later</p>
                <p><strong>PDF:</strong> Formatted report with analysis and recommendations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};