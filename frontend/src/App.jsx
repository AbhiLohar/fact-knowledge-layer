import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Upload, FileText, GitCompare, Award, Database } from 'lucide-react';
import UploadPage from './pages/UploadPage';
import FactsPage from './pages/FactsPage';
import RelationsPage from './pages/RelationsPage';
import ShowcasePage from './pages/ShowcasePage';

function App() {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-xl font-bold text-white mb-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <span>Fact Knowledge</span>
          </div>
          <p className="text-gray-400 text-sm">Layer System</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink to="/" className={navLinkClass}>
            <Upload className="w-5 h-5" />
            Upload
          </NavLink>
          <NavLink to="/facts" className={navLinkClass}>
            <FileText className="w-5 h-5" />
            Facts
          </NavLink>
          <NavLink to="/relations" className={navLinkClass}>
            <GitCompare className="w-5 h-5" />
            Relations
          </NavLink>
          <NavLink to="/showcase" className={navLinkClass}>
            <Award className="w-5 h-5" />
            Showcase
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-custom relative">
        <div className="max-w-7xl mx-auto p-8">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/facts" element={<FactsPage />} />
            <Route path="/relations" element={<RelationsPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
