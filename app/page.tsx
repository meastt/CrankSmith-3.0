// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                CrankSmith 3.0
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Development
              </span>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/build" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Build Drivetrain
              </Link>
              <Link 
                href="/analyze" 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                View Analysis
              </Link>
              <Link 
                href="/test" 
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Tests
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Drivetrain Analysis
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            The most accurate gear ratio calculator with real compatibility checking
          </p>
          
          {/* Primary CTA */}
          <div className="flex justify-center space-x-4 mb-12">
            <Link 
              href="/build"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              🔧 Start Building
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link 
              href="/analyze"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              📊 View Analysis Demo
            </Link>
          </div>
        </div>
        
        {/* Development Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Development Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅ Phase 1</div>
              <div className="text-sm text-green-800">Data Foundation</div>
              <div className="text-xs text-gray-600 mt-1">Complete</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅ Phase 2</div>
              <div className="text-sm text-green-800">Core Calculations</div>
              <div className="text-xs text-gray-600 mt-1">Complete</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">🚧 Phase 3</div>
              <div className="text-sm text-blue-800">User Interface</div>
              <div className="text-xs text-gray-600 mt-1">In Progress</div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-3">🔧</div>
            <h4 className="font-semibold text-gray-900 mb-2">Component Database</h4>
            <p className="text-sm text-gray-600">200+ verified components with accurate specs from Shimano, SRAM, and more</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-3">🛞</div>
            <h4 className="font-semibold text-gray-900 mb-2">Real Tire Data</h4>
            <p className="text-sm text-gray-600">500+ measured tire/rim combinations for accurate calculations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-3">⚙️</div>
            <h4 className="font-semibold text-gray-900 mb-2">Compatibility Engine</h4>
            <p className="text-sm text-gray-600">Real mechanical compatibility checking with detailed warnings</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="font-semibold text-gray-900 mb-2">Gain Ratios</h4>
            <p className="text-sm text-gray-600">Crank-length aware calculations using Sheldon Brown's method</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              href="/build" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🏗️</span>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">
                    Drivetrain Builder
                  </div>
                  <div className="text-sm text-gray-600">
                    Build and analyze complete drivetrains
                  </div>
                </div>
              </div>
            </Link>
            
            <Link 
              href="/test" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🧪</span>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">
                    Compatibility Tests
                  </div>
                  <div className="text-sm text-gray-600">
                    View engine test results
                  </div>
                </div>
              </div>
            </Link>
            
            <Link 
              href="/analyze" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">
                    Gear Analysis Demo
                  </div>
                  <div className="text-sm text-gray-600">
                    See comprehensive gear analysis in action
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            🎯 What Makes CrankSmith 3.0 Different
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✅ Real Data Sources</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Jan Heine tire measurements</li>
                <li>• Bicycle Rolling Resistance database</li>
                <li>• Manufacturer service manuals</li>
                <li>• Community verified data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✅ Professional Features</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Crank-length aware gain ratios</li>
                <li>• Chain line efficiency analysis</li>
                <li>• Cross-chain detection</li>
                <li>• Real compatibility checking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Development Version
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This is a development build of CrankSmith 3.0. The component database, 
                  compatibility engine, and gear calculations are fully functional. 
                  UI components are being built according to the roadmap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>CrankSmith 3.0 - Professional Drivetrain Analysis</p>
            <p className="mt-1">Building the most accurate gear ratio calculator with real compatibility checking</p>
            <div className="mt-3 flex justify-center space-x-4">
              <Link href="/analyze" className="text-blue-600 hover:text-blue-800">
                Gear Analysis
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/build" className="text-blue-600 hover:text-blue-800">
                Drivetrain Builder
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/test" className="text-blue-600 hover:text-blue-800">
                Test Results
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}