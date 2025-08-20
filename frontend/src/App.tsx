import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { TrendAnalysis } from './pages/TrendAnalysis';
import { BookCreation } from './pages/BookCreation';
import { MyBooks } from './pages/MyBooks';
import { Publishing } from './pages/Publishing';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trends" element={<TrendAnalysis />} />
              <Route path="/create" element={<BookCreation />} />
              <Route path="/books" element={<MyBooks />} />
              <Route path="/publishing" element={<Publishing />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;