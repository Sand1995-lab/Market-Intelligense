import React from 'react';
import { Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center space-x-3">
        <Zap className="h-8 w-8 text-blue-400" />
        <h1 className="text-xl font-bold text-white">EnergyPulse AI</h1>
      </div>
      <div className="text-sm text-gray-400">
        Real-Time Energy Market Intelligence
      </div>
    </header>
  );
};

export default Header;
