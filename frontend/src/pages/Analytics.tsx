import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Eye, Users, Calendar } from 'lucide-react';

export function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');

  const metrics = [
    { title: 'Total Revenue', value: '$23,450', change: '+15.3%', changeType: 'positive' as const, icon: DollarSign },
    { title: 'Book Sales', value: '1,847', change: '+12.8%', changeType: 'positive' as const, icon: BarChart3 },
    { title: 'Page Views', value: '45.2K', change: '+8.1%', changeType: 'positive' as const, icon: Eye },
    { title: 'Conversion Rate', value: '3.2%', change: '-0.5%', changeType: 'negative' as const, icon: Users }
  ];

  const topBooks = [
    { title: 'AI-Powered Productivity for Remote Workers', sales: 847, revenue: 8470, rating: 4.6 },
    { title: 'Cryptocurrency Explained Simply', sales: 623, revenue: 6230, rating: 4.2 },
    { title: 'Digital Marketing Mastery 2025', sales: 377, revenue: 3770, rating: 4.8 },
    { title: 'Remote Team Leadership Guide', sales: 0, revenue: 0, rating: 0 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 1800 },
    { month: 'Mar', revenue: 2400 },
    { month: 'Apr', revenue: 3200 },
    { month: 'May', revenue: 2800 },
    { month: 'Jun', revenue: 4100 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your book performance and revenue across all platforms.</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <metric.icon className="h-8 w-8 text-blue-600" />
              <span className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
            <div className="flex items-center space-x-2 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+23.5% vs last period</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-600 rounded-t-sm transition-all duration-300 hover:bg-blue-700"
                  style={{ height: `${(data.revenue / 5000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Books */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Books</h2>
          <div className="space-y-4">
            {topBooks.map((book, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{book.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-600">{book.sales} sales</span>
                    {book.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-xs text-gray-600">{book.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-600">${book.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { platform: 'Amazon KDP', sales: 1247, revenue: 12470, share: 65 },
            { platform: 'Apple Books', sales: 423, revenue: 4230, share: 22 },
            { platform: 'Google Play Books', sales: 177, revenue: 1770, share: 13 }
          ].map((platform, index) => (
            <div key={index} className="text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {platform.share}%
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{platform.platform}</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{platform.sales} sales</p>
                <p className="text-lg font-bold text-emerald-600">${platform.revenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Peak Sales Time</h3>
            <p className="text-sm text-gray-600">Your books sell best on Tuesday-Thursday between 2-4 PM EST.</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Trending Categories</h3>
            <p className="text-sm text-gray-600">AI/Technology books are performing 34% better than average this month.</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Optimization Tip</h3>
            <p className="text-sm text-gray-600">Books with 80-120 pages have the highest completion and rating scores.</p>
          </div>
        </div>
      </div>
    </div>
  );
}