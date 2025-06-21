// app/page.tsx
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
            </div>
          </div>
        </header>
  
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Drivetrain Analysis
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              The most accurate gear ratio calculator with real compatibility checking
            </p>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Development Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Phase 1</div>
                  <div className="text-sm text-blue-800">Data Foundation</div>
                  <div className="text-xs text-gray-600 mt-1">Weeks 1-3</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">Phase 2</div>
                  <div className="text-sm text-gray-600">Core Calculations</div>
                  <div className="text-xs text-gray-600 mt-1">Weeks 4-6</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-400">Phase 3</div>
                  <div className="text-sm text-gray-600">User Interface</div>
                  <div className="text-xs text-gray-600 mt-1">Weeks 7-9</div>
                </div>
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-gray-900 mb-2">Component Database</h4>
                <p className="text-sm text-gray-600">200+ verified components with accurate specs</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-gray-900 mb-2">Tire Circumferences</h4>
                <p className="text-sm text-gray-600">500+ measured tire/rim combinations</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-gray-900 mb-2">Compatibility Engine</h4>
                <p className="text-sm text-gray-600">Real mechanical compatibility checking</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-gray-900 mb-2">Gain Ratios</h4>
                <p className="text-sm text-gray-600">Crank-length aware calculations</p>
              </div>
            </div>
  
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
                      This is a development build of CrankSmith 3.0. Features are being built according to the roadmap.
                    </p>
                  </div>
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
            </div>
          </div>
        </footer>
      </div>
    );
  }