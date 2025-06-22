'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Settings, Share2, Zap } from 'lucide-react';

export default function QuickCheckPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    bikeType: '',
    goal: '',
    currentSetup: {},
    targetSetup: {},
    result: null
  });

  const bikeTypes = [
    { id: 'road', name: 'Road Bike', icon: '🚴‍♂️', desc: 'Drop bars, skinny tires, speed focused' },
    { id: 'gravel', name: 'Gravel/Adventure', icon: '🌄', desc: 'Drop bars, wider tires, versatile' },
    { id: 'mtb', name: 'Mountain Bike', icon: '⛰️', desc: 'Flat bars, knobby tires, off-road' },
    { id: 'hybrid', name: 'Hybrid/Commuter', icon: '🚲', desc: 'Flat bars, mixed-use, practical' }
  ];

  const goals = [
    { id: 'upgrade', label: 'Upgrade existing components', desc: 'Make my current bike better', icon: '⬆️' },
    { id: 'build', label: 'Build new drivetrain', desc: 'Starting from scratch', icon: '🔧' },
    { id: 'check', label: 'Check compatibility', desc: 'Verify parts work together', icon: '✅' }
  ];

  const runCompatibilityCheck = () => {
    // Mock compatibility check
    const isCompatible = Math.random() > 0.3; // 70% compatible
    const result = {
      compatible: isCompatible,
      confidence: isCompatible ? 95 : 85,
      warnings: isCompatible ? [] : ['Speed mismatch between components'],
      improvements: isCompatible ? ['Consider 11-32T cassette for better climbing'] : [],
      cost: Math.round(Math.random() * 500 + 200),
      performance: {
        gearRange: 4.2,
        efficiency: isCompatible ? 97.8 : 94.2,
        weight: Math.round(Math.random() * 200 + 800)
      }
    };
    setData(prev => ({ ...prev, result }));
    setStep(4);
  };

  const StepIndicator = ({ current, total }: { current: number; total: number }) => (
    <div className="flex items-center justify-center space-x-3 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full transition-colors ${
          i + 1 <= current ? 'bg-blue-600' : 'bg-gray-300'
        }`} />
      ))}
    </div>
  );

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <button onClick={() => router.push('/')} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">CrankSmith 3.0</span>
                </button>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Home
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Compatibility Check</h2>
            <p className="text-gray-600">Get instant answers about your drivetrain in under 2 minutes</p>
          </div>
          
          <StepIndicator current={1} total={3} />
          
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">What type of bike?</h3>
            <p className="text-gray-600">This helps us show you the right components</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {bikeTypes.map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setData(prev => ({ ...prev, bikeType: type.id }));
                  setStep(2);
                }}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-gray-900 text-lg">{type.name}</div>
                  <div className="text-2xl">{type.icon}</div>
                </div>
                <div className="text-gray-600">{type.desc}</div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <button onClick={() => router.push('/')} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">CrankSmith 3.0</span>
                </button>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Home
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setStep(1)}
              className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>
          
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">What's your goal?</h3>
            <p className="text-gray-600">Help us understand what you're trying to achieve</p>
          </div>
          
          <div className="space-y-4 mb-8">
            {goals.map(goal => (
              <button
                key={goal.id}
                onClick={() => {
                  setData(prev => ({ ...prev, goal: goal.id }));
                  setStep(3);
                }}
                className="w-full flex items-center space-x-4 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl">{goal.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg">{goal.label}</div>
                  <div className="text-gray-600">{goal.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <button onClick={() => router.push('/')} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">CrankSmith 3.0</span>
                </button>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Home
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setStep(2)}
              className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Analyzing Compatibility</h3>
            <p className="text-gray-600">Our AI is checking your components...</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Analyzing compatibility matrix...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Calculating gear ratios...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Checking component compatibility...</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={runCompatibilityCheck}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Results
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <button onClick={() => router.push('/')} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">CrankSmith 3.0</span>
                </button>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Home
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Compatibility Results</h2>
            <p className="text-gray-600">Here's what we found about your setup</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              {data.result?.compatible ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
              
              <h3 className={`text-2xl font-bold mb-2 ${
                data.result?.compatible ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.result?.compatible ? 'Compatible!' : 'Compatibility Issues Found'}
              </h3>
              
              <p className="text-gray-600">
                Confidence: {data.result?.confidence}%
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gear Range:</span>
                    <span className="font-medium">{data.result?.performance.gearRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="font-medium">{data.result?.performance.efficiency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-medium">{data.result?.performance.weight}g</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Cost Estimate</h4>
                <div className="text-2xl font-bold text-blue-600">
                  ${data.result?.cost}
                </div>
                <p className="text-sm text-gray-600">Total component cost</p>
              </div>
            </div>
            
            {data.result?.warnings && data.result.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">Warnings</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {data.result.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.result?.improvements && data.result.improvements.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Suggestions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {data.result.improvements.map((improvement, index) => (
                    <li key={index}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => router.push('/build')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Build Custom Setup
            </button>
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}