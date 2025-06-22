// app/page.tsx - Complete replacement with premium UI/UX
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Zap, Gauge, Users, CheckCircle, Mountain, ChevronRight, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  const router = useRouter();

  const userTypes = [
    {
      id: 'quick',
      title: 'Quick Compatibility Check',
      subtitle: 'Just want to know if parts work together?',
      icon: Check,
      users: 'Perfect for casual cyclists',
      color: 'bg-green-500',
      description: '2-minute compatibility check with simple yes/no answers',
      time: '2 mins',
      route: '/quick-check'
    },
    {
      id: 'build',
      title: 'Build & Optimize',
      subtitle: 'Planning a new drivetrain or upgrade?',
      icon: Zap,
      users: 'Great for hobbyists & enthusiasts',
      color: 'bg-blue-500',
      description: 'Guided setup with performance insights and recommendations',
      time: '10 mins',
      route: '/build'
    },
    {
      id: 'analyze',
      title: 'Deep Analysis',
      subtitle: 'Want every detail and technical spec?',
      icon: Gauge,
      users: 'For gear heads & professionals',
      color: 'bg-purple-500',
      description: 'Complete performance analysis with all technical data',
      time: '20+ mins',
      route: '/analyze'
    }
  ];

  const handleModeSelection = (modeId: string) => {
    setSelectedMode(modeId);
  };

  const handleStartTool = () => {
    const selectedUserType = userTypes.find(type => type.id === selectedMode);
    if (selectedUserType) {
      router.push(selectedUserType.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  CrankSmith
                </h1>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                  v3.0
                </span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Pricing
              </a>
              <button 
                onClick={() => setShowPricingModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                Try Premium
              </button>
            </nav>
            <div className="md:hidden">
              <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-gray-900">
              The Smart Way to Build Your Drivetrain
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From quick compatibility checks to deep performance analysis. 
              Choose your adventure level and get answers that actually matter.
            </p>
            
            {/* Social Proof */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">50K+ cyclists trust CrankSmith</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">99.8% compatibility accuracy</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Mountain className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">All bike types supported</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userTypes.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.id}
                  className={`relative group p-8 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    selectedMode === mode.id ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleModeSelection(mode.id)}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 ${mode.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                        {mode.time}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{mode.title}</h3>
                      <p className="text-gray-600">{mode.subtitle}</p>
                    </div>
                    
                    <div className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 inline-block font-medium">
                      {mode.users}
                    </div>
                    
                    <p className="text-sm text-gray-700 leading-relaxed">{mode.description}</p>
                    
                    <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                      Get Started <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  {selectedMode === mode.id && (
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
                {selectedMode === 'analyze' && 'Launch Pro Analysis'}
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
                <h3 className="text-xl font-bold text-gray-900">Real Compatibility</h3>
                <p className="text-gray-600 leading-relaxed">
                  Not just "will it fit" but "how well will it work" with actual performance data from thousands of real builds
                </p>
              </div>
              
              <div className="text-center space-y-4 group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Performance Prediction</h3>
                <p className="text-gray-600 leading-relaxed">
                  See actual speed/effort trade-offs before buying with AI-powered recommendations based on your riding style
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
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-bold">CrankSmith 3.0</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The professional drivetrain intelligence platform that's becoming indispensable for shops, fitters, and serious cyclists.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><button onClick={() => setShowPricingModal(true)} className="hover:text-white transition-colors">Pricing</button></li>
                <li><Link href="/build" className="hover:text-white transition-colors">Calculator</Link></li>
                <li><Link href="/analyze" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link href="/test" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 CrankSmith. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}