import React from 'react';
import { ShieldCheck, Cpu, KeyRound, BookOpen, Terminal, Sparkles, Download, FileText } from 'lucide-react';
import { downloadMarkdownSpecification } from '../data/pqcPresets';

interface NavbarProps {
  activeTab: 'agent' | 'simulator' | 'standards' | 'audit';
  setActiveTab: (tab: 'agent' | 'simulator' | 'standards' | 'audit') => void;
  isStreaming: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#090d16]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-950/40">
              <div className="w-full h-full bg-[#0b101c] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                  PQC STUDIO
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
                  FIPS 203 / 204
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Post-Quantum Cryptography & Hybrid KEM Engineering Workbench
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/90 border border-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('agent')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'agent'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>PQC Agent</span>
              {isStreaming && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Handshake Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('standards')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'standards'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NIST Standards</span>
              <span className="sm:hidden">NIST</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Crypto Audit</span>
            </button>
          </nav>

          {/* Right Action: Export .md & Clearance Badges */}
          <div className="flex items-center space-x-2.5 text-xs">
            <button
              onClick={downloadMarkdownSpecification}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 rounded-xl font-mono text-xs font-medium transition shadow-sm hover:shadow-cyan-950/50 cursor-pointer"
              title="Download PQC_HYBRID_KEM_INTEGRATION.md"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export .md</span>
            </button>

            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px]">Temp: 0.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
