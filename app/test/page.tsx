'use client';

import { useEffect, useState } from 'react';
import { compatibilityEngine } from '../lib/compatibilityEngine';
import { DrivetrainSetup, CompatibilityCheck } from '../types/components';
import { getCranksets, getCassettes, getRearDerailleurs, getChains } from '../data/components';

interface TestResult {
  name: string;
  setup: DrivetrainSetup;
  result: CompatibilityCheck;
  expected: boolean;
}

export default function TestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = () => {
    try {
      const cranksets = getCranksets();
      const cassettes = getCassettes();
      const derailleurs = getRearDerailleurs();
      const chains = getChains();

      const tests: TestResult[] = [];

      // Test 1: Compatible Road Setup
      const roadSetup: DrivetrainSetup = {
        bikeType: 'road',
        crankset: cranksets.find(c => c.id === 'shimano-105-r7000-50-34')!,
        cassette: cassettes.find(c => c.id === 'shimano-105-r7000-11-32')!,
        rearDerailleur: derailleurs.find(d => d.id === 'shimano-105-r7000-gs')!,
        chain: chains.find(c => c.id === 'shimano-105-cn-hg601-11')!
      };

      tests.push({
        name: 'Compatible Road Setup (Shimano 105)',
        setup: roadSetup,
        result: compatibilityEngine.checkDrivetrainCompatibility(roadSetup),
        expected: true
      });

      // Test 2: Speed Mismatch
      const mismatchSetup: DrivetrainSetup = {
        bikeType: 'road',
        crankset: cranksets.find(c => c.id === 'shimano-105-r7000-50-34')!,
        cassette: cassettes.find(c => c.id === 'shimano-105-r7000-11-32')!, // 11-speed
        rearDerailleur: derailleurs.find(d => d.id === 'shimano-105-r7000-gs')!, // 11-speed
        chain: chains.find(c => c.id === 'sram-force-axs-12')! // 12-speed
      };

      tests.push({
        name: 'Speed Mismatch (11-speed + 12-speed)',
        setup: mismatchSetup,
        result: compatibilityEngine.checkDrivetrainCompatibility(mismatchSetup),
        expected: false
      });

      // Test 3: MTB Setup
      const mtbSetup: DrivetrainSetup = {
        bikeType: 'mtb',
        crankset: cranksets.find(c => c.id === 'shimano-xt-m8100-32t')!,
        cassette: cassettes.find(c => c.id === 'shimano-xt-m8100-10-51')!,
        rearDerailleur: derailleurs.find(d => d.id === 'shimano-xt-m8100-sgs')!,
        chain: chains.find(c => c.id === 'shimano-xt-cn-m8100-12')!
      };

      tests.push({
        name: 'MTB Setup (Shimano XT)',
        setup: mtbSetup,
        result: compatibilityEngine.checkDrivetrainCompatibility(mtbSetup),
        expected: true
      });

      setTestResults(tests);
      setLoading(false);
    } catch (error) {
      console.error('Error running tests:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Running compatibility tests...</p>
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
                CrankSmith 3.0 - Compatibility Tests
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Testing
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Compatibility Engine Test Results
          </h2>
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.length}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(t => t.result.compatible === t.expected).length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(t => t.result.compatible !== t.expected).length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {testResults.map((test, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {test.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      test.result.compatible === test.expected
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {test.result.compatible === test.expected ? 'PASS' : 'FAIL'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      test.result.compatible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {test.result.compatible ? 'Compatible' : 'Incompatible'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                {/* Components */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Components:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Crankset: {test.setup.crankset.manufacturer} {test.setup.crankset.model}</div>
                    <div>Cassette: {test.setup.cassette.manufacturer} {test.setup.cassette.model}</div>
                    <div>Derailleur: {test.setup.rearDerailleur.manufacturer} {test.setup.rearDerailleur.model}</div>
                    <div>Chain: {test.setup.chain.manufacturer} {test.setup.chain.model}</div>
                  </div>
                </div>

                {/* Warnings */}
                {test.result.warnings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Warnings ({test.result.warnings.length}):
                    </h4>
                    <div className="space-y-2">
                      {test.result.warnings.map((warning, wIndex) => (
                        <div key={wIndex} className={`p-3 rounded-md ${
                          warning.type === 'critical' ? 'bg-red-50 border border-red-200' :
                          warning.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                          'bg-blue-50 border border-blue-200'
                        }`}>
                          <div className="flex items-start">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${
                              warning.type === 'critical' ? 'bg-red-100 text-red-800' :
                              warning.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {warning.type.toUpperCase()}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{warning.issue}</p>
                              {warning.suggestion && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Suggestion: {warning.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {test.result.notes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Notes ({test.result.notes.length}):
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {test.result.notes.map((note, nIndex) => (
                        <li key={nIndex}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}