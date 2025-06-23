'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Check, Settings, TrendingUp, Mountain } from 'lucide-react';

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
      color: 'bg-success-500',
      hoverColor: 'hover:bg-success-600',
      borderColor: 'border-success-200',
      textColor: 'text-success-700',
      features: ['Component compatibility verification', 'Basic gear ratio calculation', 'Compatibility warnings']
    },
    {
      id: 'build',
      title: 'Build Custom Setup',
      description: 'Design your drivetrain from scratch with guided component selection',
      icon: <Settings className="w-8 h-8" />,
      color: 'bg-primary-600',
      hoverColor: 'hover:bg-primary-700',
      borderColor: 'border-primary-200',
      textColor: 'text-primary-700',
      features: ['Step-by-step component selection', 'Real-time compatibility checking', 'Performance optimization suggestions']
    },
    {
      id: 'analyze',
      title: 'Advanced Analysis',
      description: 'Deep dive into gear ratios, chain line, and performance optimization',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-tool-orange',
      hoverColor: 'hover:bg-orange-600',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      features: ['Comprehensive gear ratio analysis', 'Chain line calculations', 'Performance metrics and recommendations']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-tool border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-neutral-900">CrankSmith</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-neutral-600 hover:text-neutral-900 font-medium">Quick Check</a>
                <a href="#" className="text-neutral-600 hover:text-neutral-900 font-medium">Build Guide</a>
                <a href="#" className="text-neutral-600 hover:text-neutral-900 font-medium">Database</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <button className="bg-primary-600 text-white px-4 py-2 rounded-tool text-sm font-medium hover:bg-primary-700 transition-colors">
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
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Professional Drivetrain
            <span className="text-primary-600 block">
              Compatibility Tool
            </span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Verify component compatibility, calculate gear ratios, and optimize drivetrain performance 
            with professional-grade analysis tools trusted by mechanics and serious cyclists.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-neutral-900 mb-8">
            Choose Your Analysis Method
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {modes.map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`relative bg-white rounded-tool border-2 p-8 cursor-pointer transition-all duration-200 hover:shadow-tool-lg ${
                    isSelected 
                      ? `${mode.borderColor} shadow-tool-lg transform scale-105 border-2` 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 ${mode.color} rounded-tool flex items-center justify-center mx-auto mb-4 text-white shadow-tool ${mode.hoverColor} transition-colors`}>
                      {mode.icon}
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{mode.title}</h3>
                    <p className="text-neutral-600">{mode.description}</p>
                  </div>
                  
                  <ul className="space-y-2 text-sm text-neutral-700">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {isSelected && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-tool">
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
            <div className="text-center mt-8">
              <button 
                onClick={handleStartTool}
                className="bg-primary-600 text-white px-10 py-4 rounded-tool text-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center shadow-tool hover:shadow-tool-lg"
              >
                {selectedMode === 'quick' && 'Start Quick Check'}
                {selectedMode === 'build' && 'Open Builder Tool'}
                {selectedMode === 'analyze' && 'Launch Advanced Analysis'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="border-t border-neutral-200 pt-12">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-10">
            Why CrankSmith is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 group">
              <div className="w-20 h-20 bg-success-500 rounded-tool flex items-center justify-center mx-auto shadow-tool group-hover:shadow-tool-lg transition-shadow">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Real Compatibility Data</h3>
              <p className="text-neutral-600 leading-relaxed">
                Not just "will it fit" but "how well will it work" with actual performance data from thousands of verified builds
              </p>
            </div>
            
            <div className="text-center space-y-4 group">
              <div className="w-20 h-20 bg-tool-orange rounded-tool flex items-center justify-center mx-auto shadow-tool group-hover:shadow-tool-lg transition-shadow">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Performance Analysis</h3>
              <p className="text-neutral-600 leading-relaxed">
                See actual speed/effort trade-offs before buying with data-driven recommendations based on your riding style and terrain
              </p>
            </div>
            
            <div className="text-center space-y-4 group">
              <div className="w-20 h-20 bg-primary-600 rounded-tool flex items-center justify-center mx-auto shadow-tool group-hover:shadow-tool-lg transition-shadow">
                <Mountain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">All Disciplines</h3>
              <p className="text-neutral-600 leading-relaxed">
                Road, gravel, mountain, hybrid - comprehensive database covering every cycling discipline and use case
              </p>
            </div>
          </div>
        </div>

        {/* Technical Credibility Section */}
        <div className="bg-neutral-900 rounded-tool p-12 mt-16 text-white">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Built by Cyclists, for Cyclists</h2>
            <p className="text-neutral-300 text-lg max-w-3xl mx-auto">
              Professional-grade calculations and compatibility rules based on manufacturer specifications, 
              real-world testing, and decades of mechanical expertise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">12,000+</div>
              <div className="text-neutral-300">Components Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-400 mb-2">50,000+</div>
              <div className="text-neutral-300">Compatibility Tests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-tool-orange mb-2">99.8%</div>
              <div className="text-neutral-300">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-tool-safety mb-2">24/7</div>
              <div className="text-neutral-300">Always Available</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}