import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Upload, FileText, GitCompare, Award, Layers } from 'lucide-react';
import UploadPage from './pages/UploadPage';
import FactsPage from './pages/FactsPage';
import RelationsPage from './pages/RelationsPage';
import ShowcasePage from './pages/ShowcasePage';

function App() {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-slate-800/90 text-white shadow-sm border border-slate-700/60'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Linear-style Sidebar */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col flex-shrink-0 border-r border-slate-850">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                FactLayer
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Knowledge Layer System</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          <NavLink to="/" className={navLinkClass}>
            <Upload className="w-4 h-4" />
            Upload Documents
          </NavLink>
          <NavLink to="/facts" className={navLinkClass}>
            <FileText className="w-4 h-4" />
            Fact Explorer
          </NavLink>
          <NavLink to="/relations" className={navLinkClass}>
            <GitCompare className="w-4 h-4" />
            Cross-Doc Relations
          </NavLink>
          <NavLink to="/showcase" className={navLinkClass}>
            <Award className="w-4 h-4" />
            Four Cases Showcase
          </NavLink>
        </nav>

        {/* System Info Footer */}
        <div className="p-4 border-t border-slate-850/80 bg-slate-950/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              FastAPI Engine
            </span>
            <span className="font-mono text-[11px] text-slate-400">localhost:8000</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto scrollbar-custom bg-slate-50">
        <div className="max-w-6xl mx-auto p-8 lg:p-10">
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
