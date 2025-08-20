import React, { useState } from 'react';
import { ProgressBar } from '../components/ui/ProgressBar';
import { BookOpen, Search, Lightbulb, Edit, Eye, Upload } from 'lucide-react';

export function BookCreation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookTopic, setBookTopic] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [bookLength, setBookLength] = useState('medium');

  const steps = [
    { id: 1, title: 'Topic Selection', icon: Lightbulb },
    { id: 2, title: 'Research Phase', icon: Search },
    { id: 3, title: 'Content Generation', icon: Edit },
    { id: 4, title: 'Quality Review', icon: Eye },
    { id: 5, title: 'Publishing', icon: Upload }
  ];

  const audiences = [
    { id: 'beginners', name: 'Beginners', description: 'New to the topic, need foundational knowledge' },
    { id: 'intermediate', name: 'Intermediate', description: 'Some experience, looking to deepen understanding' },
    { id: 'advanced', name: 'Advanced', description: 'Experts seeking cutting-edge insights' },
    { id: 'business', name: 'Business Professionals', description: 'Practical applications for workplace' }
  ];

  const suggestedTopics = [
    'AI-Powered Productivity for Remote Workers',
    'Sustainable Investment Strategies for 2025',
    'Mental Health in the Digital Age',
    'No-Code Development for Entrepreneurs',
    'Cryptocurrency for Small Business Owners',
    'Digital Marketing Trends and Predictions'
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Book</h1>
        <p className="text-gray-600">Let our AI agents help you create a professional book from trending topics.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-2 ${
                step.id === currentStep ? 'text-blue-600' : 
                step.id < currentStep ? 'text-emerald-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.id === currentStep ? 'border-blue-600 bg-blue-50' :
                  step.id < currentStep ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm hidden sm:block">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-0.5 mx-4 ${
                  step.id < currentStep ? 'bg-emerald-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content based on current step */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What topic would you like to write about?</h2>
              <div className="relative">
                <input
                  type="text"
                  value={bookTopic}
                  onChange={(e) => setBookTopic(e.target.value)}
                  placeholder="Enter your book topic or select from suggestions below..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Trending Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setBookTopic(topic)}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{topic}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Audience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {audiences.map((audience) => (
                  <label key={audience.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="audience"
                      value={audience.id}
                      checked={selectedAudience === audience.id}
                      onChange={(e) => setSelectedAudience(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg transition-all ${
                      selectedAudience === audience.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <h4 className="font-semibold text-gray-900">{audience.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{audience.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Book Length</h3>
              <div className="flex space-x-4">
                {[
                  { id: 'short', name: 'Short Guide', pages: '30-50 pages', time: '24 hours' },
                  { id: 'medium', name: 'Standard Book', pages: '80-120 pages', time: '48 hours' },
                  { id: 'long', name: 'Comprehensive', pages: '150-200 pages', time: '72 hours' }
                ].map((length) => (
                  <label key={length.id} className="cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="length"
                      value={length.id}
                      checked={bookLength === length.id}
                      onChange={(e) => setBookLength(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                      bookLength === length.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <h4 className="font-semibold text-gray-900">{length.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{length.pages}</p>
                      <p className="text-xs text-gray-500">ETA: {length.time}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Save Draft
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!bookTopic || !selectedAudience}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Start AI Research
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Research in Progress</h2>
              <p className="text-gray-600">Our research agents are gathering comprehensive information on "{bookTopic}"</p>
            </div>

            <div className="space-y-4">
              {[
                { agent: 'Trend Analysis Agent', status: 'Completed', progress: 100, task: 'Analyzing market trends and opportunities' },
                { agent: 'Source Collection Agent', status: 'Active', progress: 75, task: 'Gathering information from 127 sources' },
                { agent: 'Fact Verification Agent', status: 'Active', progress: 60, task: 'Verifying claims and statistics' },
                { agent: 'Competitive Analysis Agent', status: 'Queued', progress: 0, task: 'Analyzing existing books and content' }
              ].map((agent, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{agent.agent}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      agent.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      agent.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{agent.task}</p>
                  <ProgressBar progress={agent.progress} />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Research Highlights</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Found 89 relevant academic papers and studies</li>
                <li>• Identified 23 key trends in the topic area</li>
                <li>• Located 156 supporting statistics and data points</li>
                <li>• Discovered 12 underexplored subtopics with high potential</li>
              </ul>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Topic
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Writing
              </button>
            </div>
          </div>
        )}

        {/* Add more steps as needed */}
        {currentStep > 2 && (
          <div className="text-center space-y-4">
            <BookOpen className="h-16 w-16 text-blue-600 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-900">Feature Coming Soon</h2>
            <p className="text-gray-600">This step is currently under development. Our AI agents will handle the complete workflow automatically.</p>
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Book
            </button>
          </div>
        )}
      </div>
    </div>
  );
}