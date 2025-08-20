import React from 'react';
import { StatsCard } from '../components/ui/StatsCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  BookOpen,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your AI book generation.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Create New Book</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Books Generated"
          value="24"
          change="+3 this week"
          changeType="positive"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Total Revenue"
          value="$12,450"
          change="+18% from last month"
          changeType="positive"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Active Trends"
          value="147"
          change="12 new today"
          changeType="positive"
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Avg. Rating"
          value="4.6"
          change="Across all books"
          changeType="neutral"
          icon={Users}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Agents Status */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">AI Agents Status</h2>
            <div className="flex items-center space-x-2 text-sm text-emerald-600">
              <Activity className="h-4 w-4" />
              <span>All systems operational</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {[
              { name: 'Research Agent', status: 'Active', progress: 85, task: 'Analyzing "Digital Minimalism" trends' },
              { name: 'Content Generation', status: 'Active', progress: 62, task: 'Writing Chapter 3 of "Remote Work Success"' },
              { name: 'Quality Review', status: 'Queued', progress: 100, task: 'Completed review of "Crypto for Beginners"' },
              { name: 'Publishing Agent', status: 'Active', progress: 40, task: 'Uploading to Amazon KDP and Apple Books' }
            ].map((agent, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{agent.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      agent.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{agent.task}</p>
                  <ProgressBar progress={agent.progress} color="blue" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { icon: CheckCircle, color: 'text-emerald-500', text: 'Book "AI in Business" published successfully', time: '2 hours ago' },
              { icon: Clock, color: 'text-blue-500', text: 'Research completed for "Sustainable Living"', time: '4 hours ago' },
              { icon: TrendingUp, color: 'text-purple-500', text: 'New trend detected: "Blockchain Gaming"', time: '6 hours ago' },
              { icon: AlertCircle, color: 'text-orange-500', text: 'Quality review needed for "Fitness After 40"', time: '8 hours ago' },
              { icon: CheckCircle, color: 'text-emerald-500', text: 'Book "Remote Work Tips" hit #1 in category', time: '1 day ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <activity.icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Books in Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Books in Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Digital Marketing Mastery', progress: 85, stage: 'Quality Review', eta: '2 hours' },
            { title: 'Cryptocurrency Explained', progress: 45, stage: 'Content Generation', eta: '18 hours' },
            { title: 'Remote Team Leadership', progress: 92, stage: 'Final Publishing', eta: '30 minutes' }
          ].map((book, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-3">Current stage: {book.stage}</p>
              <ProgressBar progress={book.progress} showPercentage={true} />
              <p className="text-xs text-gray-500 mt-2">ETA: {book.eta}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}