import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AgentStudio } from './components/AgentStudio';
import { HandshakeSimulator } from './components/HandshakeSimulator';
import { StandardsMatrix } from './components/StandardsMatrix';
import { AuditVerification } from './components/AuditVerification';
import { INITIAL_PYTHON_IMPLEMENTATION } from './data/pqcPresets';
import { ShieldCheck, Cpu, Terminal, Lock, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'agent' | 'simulator' | 'standards' | 'audit'>('agent');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>(INITIAL_PYTHON_IMPLEMENTATION);

  const handleTriggerAudit = (code: string) => {
    setCurrentCode(code);
    setActiveTab('audit');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'agent' && (
          <AgentStudio
            onTriggerAudit={handleTriggerAudit}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
          />
        )}

        {activeTab === 'simulator' && <HandshakeSimulator />}

        {activeTab === 'standards' && <StandardsMatrix />}

        {activeTab === 'audit' && <AuditVerification currentCode={currentCode} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a12] py-4 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>PQC Studio • NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) Compliance Engine</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>CNSA 2.0 Ready</span>
            <span>•</span>
            <span>RFC 7748 X25519</span>
            <span>•</span>
            <span>RFC 5869 HKDF</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
