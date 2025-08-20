import React, { useState } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, Search, Filter } from 'lucide-react';

export function TrendAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  const categories = ['all', 'business', 'self-help', 'technology', 'health', 'education'];
  
  const trends = [
    {
      topic: 'AI-Powered Productivity',
      category: 'technology',
      score: 94,
      change: +12,
      volume: '45K',
      opportunity: 'High',
      competition: 'Medium',
      description: 'Growing interest in AI tools for workplace efficiency and personal productivity.'
    },
    {
      topic: 'Remote Work Mental Health',
      category: 'self-help',
      score: 89,
      change: +8,
      volume: '32K',
      opportunity: 'High',
      competition: 'Low',
      description: 'Increasing awareness of mental health challenges in remote work environments.'
    },
    {
      topic: 'Sustainable Investment',
      category: 'business',
      score: 87,
      change: +15,
      volume: '28K',
      opportunity: 'Medium',
      competition: 'High',
      description: 'ESG investing and sustainable finance gaining mainstream adoption.'
    },
    {
      topic: 'Digital Minimalism',
      category: 'self-help',
      score: 82,
      change: -3,
      volume: '24K',
      opportunity: 'Medium',
      competition: 'Medium',
      description: 'Movement towards reducing digital consumption and screen time.'
    },
    {
      topic: 'No-Code Development',
      category: 'technology',
      score: 79,
      change: +22,
      volume: '19K',
      opportunity: 'High',
      competition: 'Low',
      description: 'Non-technical professionals building applications without coding.'
    },
    {
      topic: 'Plant-Based Nutrition',
      category: 'health',
      score: 76,
      change: +6,
      volume: '31K',
      opportunity: 'Medium',
      competition: 'High',
      description: 'Continued growth in plant-based diet adoption and nutritional science.'
    }
  ];

  const filteredTrends = trends.filter(trend => 
    selectedCategory === 'all' || trend.category === selectedCategory
  );

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'High': return 'bg-emerald-100 text-emerald-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trend Analysis</h1>
          <p className="text-gray-600 mt-1">Discover trending topics and market opportunities for your next book.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trends..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trending Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrends.map((trend, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{trend.topic}</h3>
                <span className="text-sm text-gray-500 capitalize">{trend.category}</span>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold text-gray-900">{trend.score}</span>
                  <div className="flex items-center text-sm">
                    {trend.change > 0 ? (
                      <ArrowUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={trend.change > 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {Math.abs(trend.change)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{trend.description}</p>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Search Volume:</span>
                <span className="font-medium">{trend.volume}/month</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Opportunity:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOpportunityColor(trend.opportunity)}`}>
                  {trend.opportunity}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Competition:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompetitionColor(trend.competition)}`}>
                  {trend.competition}
                </span>
              </div>
            </div>

            <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Create Book on This Topic
            </button>
          </div>
        ))}
      </div>

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">AI Market Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Seasonal Opportunity</h3>
            <p className="text-sm text-gray-600">Tax preparation guides will spike in 8 weeks. Perfect timing to create content.</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Emerging Niche</h3>
            <p className="text-sm text-gray-600">AI ethics discussions are gaining traction but lack accessible resources.</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Content Gap</h3>
            <p className="text-sm text-gray-600">Remote team management books focus on tools, not psychological aspects.</p>
          </div>
        </div>
      </div>
    </div>
  );
}