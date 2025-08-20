import React from 'react';
import { Upload, Check, Clock, AlertCircle, ExternalLink } from 'lucide-react';

export function Publishing() {
  const platforms = [
    {
      name: 'Amazon KDP',
      status: 'connected',
      books: 8,
      revenue: 12450,
      logo: '📚',
      connected: true
    },
    {
      name: 'Apple Books',
      status: 'connected',
      books: 6,
      revenue: 8320,
      logo: '🍎',
      connected: true
    },
    {
      name: 'Google Play Books',
      status: 'pending',
      books: 3,
      revenue: 2140,
      logo: '📖',
      connected: false
    },
    {
      name: 'Kobo',
      status: 'not_connected',
      books: 0,
      revenue: 0,
      logo: '📝',
      connected: false
    }
  ];

  const recentPublications = [
    {
      title: 'AI-Powered Productivity for Remote Workers',
      platforms: ['Amazon KDP', 'Apple Books'],
      status: 'Published',
      publishedAt: '2024-01-15T10:30:00Z',
      sales: 247
    },
    {
      title: 'Cryptocurrency Explained Simply',
      platforms: ['Amazon KDP', 'Apple Books', 'Google Play Books'],
      status: 'Published',
      publishedAt: '2024-01-08T14:20:00Z',
      sales: 189
    },
    {
      title: 'Digital Marketing Mastery 2025',
      platforms: ['Amazon KDP'],
      status: 'Processing',
      publishedAt: null,
      sales: 0
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="h-5 w-5 text-emerald-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'not_connected':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-100 text-emerald-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Publishing</h1>
          <p className="text-gray-600 mt-1">Manage your book distribution across multiple platforms.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Publish New Book</span>
        </button>
      </div>

      {/* Platform Connections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Connections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{platform.logo}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(platform.status)}
                      <span className="text-sm text-gray-600 capitalize">{platform.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {platform.connected && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Books:</span>
                    <span className="font-medium">{platform.books}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium text-emerald-600">${platform.revenue.toLocaleString()}</span>
                  </div>
                </div>
              )}
              
              <button className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                platform.connected
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {platform.connected ? 'Manage' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Publications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Publications</h2>
        <div className="space-y-4">
          {recentPublications.map((publication, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{publication.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(publication.status)}`}>
                      {publication.status}
                    </span>
                    {publication.publishedAt && (
                      <span className="text-sm text-gray-500">
                        Published {new Date(publication.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{publication.sales} sales</div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1 mt-1">
                    <span>View Details</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Published on:</span>
                {publication.platforms.map((platform, platformIndex) => (
                  <span key={platformIndex} className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publishing Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Publishing Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Automatic Publishing</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">Auto-publish to connected platforms</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Require manual approval for each publication</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700">Send notification emails on publication</span>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Default Pricing</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Short Guide (30-50 pages)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" defaultValue="4.99" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Standard Book (80-120 pages)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" defaultValue="9.99" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Comprehensive (150+ pages)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" defaultValue="14.99" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}