import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Library,
  Upload,
  BarChart3,
  Settings,
  Sparkles
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Trend Analysis', href: '/trends', icon: TrendingUp },
  { name: 'Create Book', href: '/create', icon: BookOpen },
  { name: 'My Books', href: '/books', icon: Library },
  { name: 'Publishing', href: '/publishing', icon: Upload },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BookGenius</h1>
            <p className="text-sm text-gray-500">AI Publishing</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
          <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
          <p className="text-xs text-blue-100 mb-3">Unlimited books & advanced features</p>
          <button className="w-full bg-white text-blue-600 text-sm font-medium py-2 rounded-md hover:bg-gray-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}