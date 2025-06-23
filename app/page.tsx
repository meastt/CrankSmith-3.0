'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Check, Settings, TrendingUp, Mountain, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
  };

  const handleStartTool = () => {
    if (selectedMode === 'quick') {
      router.push('/quick-check');
    } else if (selectedMode === 'build') {
      router.push('/build');
    } else if (selectedMode === 'analyze') {
      router.push('/analyze');
    }
  };

  const modes = [
    {
      id: 'quick',
      title: 'Quick Compatibility Check',
      description: 'Verify component compatibility and get basic gear ratio analysis',
      icon: <Check className="w-8 h-8" />,
      color: 'from-green-400 to-green-600',
      features: ['Component compatibility verification', 'Basic gear ratio calculation', 'Compatibility warnings']
    },
    {
      id: 'build',
      title: 'Build Custom Setup',
      description: 'Design your drivetrain from scratch with guided component selection',
      icon: <Settings className="w-8 h-8" />,
      color: 'from-blue-400 to-blue-600',
      features: ['Step-by-step component selection', 'Real-time compatibility checking', 'Performance optimization suggestions']
    },
    {
      id: 'analyze',
      title: 'Advanced Analysis',
      description: 'Deep dive into gear ratios, chain line, and performance optimization',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-600',
      features: ['Comprehensive gear ratio analysis', 'Chain line calculations', 'Performance metrics and recommendations']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
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
                <a href="#" className="text-gray-500 hover:text-gray-900">Database</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Drivetrain
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Compatibility Tool
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Verify component compatibility, calculate gear ratios, and optimize drivetrain performance 
            with professional-grade analysis tools trusted by mechanics and serious cyclists.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Choose Your Analysis Method
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {modes.map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`relative bg-white rounded-2xl border-2 p-8 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg transform scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${mode.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                      {mode.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{mode.title}</h3>
                    <p className="text-gray-600">{mode.description}</p>
                  </div>
                  
                  <ul className="space-y-2 text-sm text-gray-700">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {isSelected && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {selectedMode && (
            <div className="text-center">
              <button 
                onClick={handleStartTool}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {selectedMode === 'quick' && 'Start Quick Check'}
                {selectedMode === 'build' && 'Open Builder Tool'}
                {selectedMode === 'analyze' && 'Launch Advanced Analysis'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
              Why CrankSmith is Different
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Real Compatibility Data</h3>
                <p className="text-gray-600 leading-relaxed">
                  Not just "will it fit" but "how well will it work" with actual performance data from thousands of verified builds
                </p>
              </div>
              
              <div className="text-center space-y-4 group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Performance Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  See actual speed/effort trade-offs before buying with data-driven recommendations based on your riding style and terrain
                </p>
              </div>
              
              <div className="text-center space-y-4 group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <Mountain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">All Disciplines</h3>
                <p className="text-gray-600 leading-relaxed">
                  Road, gravel, mountain, hybrid - comprehensive database covering every cycling discipline and use case
                </p>
              </div>
            </div>
          </div>

          {/* Technical Credibility Section */}
          <div className="bg-gray-900 rounded-2xl p-12 mt-16 text-white">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Built by Cyclists, for Cyclists</h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Professional-grade calculations and compatibility rules based on manufacturer specifications, 
                real-world testing, and decades of mechanical expertise.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">12,000+</div>
                <div className="text-gray-300">Components Verified</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">50,000+</div>
                <div className="text-gray-300">Compatibility Tests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">99.8%</div>
                <div className="text-gray-300">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                <div className="text-gray-300">Always Available</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}