import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, History, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-gray-900 px-6 py-4 flex items-center gap-3">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">RegulaAI</span>
      </Link>
      <span className="text-xs bg-gray-800 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full">
        Reasoning Agent
      </span>

      <div className="ml-auto flex items-center gap-1">
        <Link to="/app"
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${
            isActive('/app') ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}>
          <PlusCircle size={14} /> New Analysis
        </Link>
        <Link to="/history"
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${
            isActive('/history') ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}>
          <History size={14} /> History
        </Link>
        <span className="ml-2 text-xs text-gray-500 bg-gray-800 border border-gray-700 px-3 py-1 rounded-full">
          ⚡ Foundry IQ + Fabric IQ
        </span>
      </div>
    </header>
  );
}
