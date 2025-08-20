import React, { useState } from 'react';
import { User, Bell, CreditCard, Key, Shield, HelpCircle } from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'support', name: 'Support', icon: HelpCircle }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and configuration.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Sidebar */}
          <div className="w-full sm:w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="Sarah"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="Chen"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="sarah.chen@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Book Completion</h3>
                        <p className="text-sm text-gray-600">Get notified when your book generation is complete</p>
                      </div>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">New Trends</h3>
                        <p className="text-sm text-gray-600">Receive alerts about trending topics in your niches</p>
                      </div>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Sales Updates</h3>
                        <p className="text-sm text-gray-600">Daily summary of book sales and performance</p>
                      </div>
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Information</h2>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-2">Individual Plan</h3>
                    <p className="text-blue-100 mb-4">5 books/month • Advanced AI agents • Priority support</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">$199/month</span>
                      <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                    <p className="text-sm text-gray-600">•••• •••• •••• 4242 (Expires 12/25)</p>
                    <button className="text-blue-600 text-sm hover:text-blue-800 mt-2">Update payment method</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">API Keys</h2>
                  <p className="text-gray-600 mb-6">Use these keys to integrate BookGenius AI with your applications.</p>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Production API Key</h3>
                        <button className="text-blue-600 text-sm hover:text-blue-800">Regenerate</button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                        bg_live_sk_1234567890abcdef...
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Test API Key</h3>
                        <button className="text-blue-600 text-sm hover:text-blue-800">Regenerate</button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                        bg_test_sk_abcdef1234567890...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {['security', 'support'].includes(activeTab) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
                <p className="text-gray-600">This section is currently under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}