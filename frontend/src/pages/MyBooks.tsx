import React, { useState } from 'react';
import { BookOpen, Star, DollarSign, Eye, Download, MoreVertical } from 'lucide-react';

export function MyBooks() {
  const [filter, setFilter] = useState('all');

  const books = [
    {
      id: 1,
      title: 'AI-Powered Productivity for Remote Workers',
      status: 'Published',
      rating: 4.6,
      sales: 847,
      revenue: 3234,
      published: '2024-01-15',
      category: 'Business',
      cover: '/api/placeholder/200/300'
    },
    {
      id: 2,
      title: 'Digital Marketing Mastery 2025',
      status: 'In Review',
      rating: 0,
      sales: 0,
      revenue: 0,
      published: null,
      category: 'Marketing',
      cover: '/api/placeholder/200/300'
    },
    {
      id: 3,
      title: 'Cryptocurrency Explained Simply',
      status: 'Published',
      rating: 4.2,
      sales: 1243,
      revenue: 5672,
      published: '2024-01-08',
      category: 'Finance',
      cover: '/api/placeholder/200/300'
    },
    {
      id: 4,
      title: 'Remote Team Leadership Guide',
      status: 'Draft',
      rating: 0,
      sales: 0,
      revenue: 0,
      published: null,
      category: 'Leadership',
      cover: '/api/placeholder/200/300'
    }
  ];

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    return book.status.toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-emerald-100 text-emerald-800';
      case 'In Review': return 'bg-yellow-100 text-yellow-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
          <p className="text-gray-600 mt-1">Manage your AI-generated book collection and track performance.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Create New Book</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { id: 'all', label: 'All Books', count: books.length },
          { id: 'published', label: 'Published', count: books.filter(b => b.status === 'Published').length },
          { id: 'in review', label: 'In Review', count: books.filter(b => b.status === 'In Review').length },
          { id: 'draft', label: 'Draft', count: books.filter(b => b.status === 'Draft').length }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
              <div className="absolute top-3 right-3">
                <button className="p-1 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(book.status)}`}>
                  {book.status}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{book.category}</p>
              
              {book.status === 'Published' && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{book.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">{book.sales} sales</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">${book.revenue.toLocaleString()}</span>
                    </div>
                    <span className="text-sm text-gray-600">Total revenue</span>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                {book.status === 'Published' && (
                  <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {book.published && (
                <p className="text-xs text-gray-500 mt-3">Published {new Date(book.published).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "You haven't created any books yet. Start your first AI-generated book today!"
              : `No books with status "${filter}". Try a different filter.`
            }
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Create Your First Book
          </button>
        </div>
      )}
    </div>
  );
}