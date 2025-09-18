
import React from 'react';
import { View } from '../types';
import { 
  LayoutDashboard, BarChart3, Flame, Wind, Layers, SlidersHorizontal, ShieldAlert 
} from 'lucide-react';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems = [
  { view: View.OVERVIEW, icon: LayoutDashboard, label: 'Market Overview' },
  { view: View.POWER, icon: BarChart3, label: 'Power Markets' },
  { view: View.GAS, icon: Flame, label: 'Gas Markets' },
  { view: View.RENEWABLES, icon: Wind, label: 'Renewables' },
  { view: View.CAPACITY, icon: Layers, label: 'Capacity Markets' },
  { view: View.ANCILLARY, icon: SlidersHorizontal, label: 'Ancillary Services' },
  { view: View.RISK, icon: ShieldAlert, label: 'Risk Analytics' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="w-56 bg-gray-900 p-4 border-r border-gray-700">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.view}>
            <button
              onClick={() => setActiveView(item.view)}
              className={`w-full flex items-center space-x-3 p-2 rounded-md text-sm font-medium transition-colors ${
                activeView === item.view
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
