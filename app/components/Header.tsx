import { Gauge } from 'lucide-react';
import Link from 'next/link';

// Header Component
const Header = () => (
  <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <Link 
          href="/"
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">CrankSmith 3.0</span>
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Free
          </span>
        </Link>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Examples</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">API</a>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Sign In</a>
        </nav>
      </div>
    </div>
  </header>
);

export default Header;