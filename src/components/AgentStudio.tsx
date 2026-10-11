import React, { useState, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  FileText,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import {
  INITIAL_PROMPT,
  DEFAULT_SYSTEM_INSTRUCTION,
  PRESET_TASKS,
  INITIAL_PYTHON_IMPLEMENTATION,
  downloadMarkdownSpecification,
} from '../data/pqcPresets';
import { Download } from 'lucide-react';

interface AgentStudioProps {
  onTriggerAudit: (code: string) => void;
  isStreaming: boolean;
  setIsStreaming: (s: boolean) => void;
}

export const AgentStudio: React.FC<AgentStudioProps> = ({
  onTriggerAudit,
  isStreaming,
  setIsStreaming,
}) => {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [selectedPresetId, setSelectedPresetId] = useState('user-default');
  const [temperature, setTemperature] = useState(0.0);
  const [model, setModel] = useState('gemini-3.8-flash');
  const [systemInstruction, setSystemInstruction] = useState(DEFAULT_SYSTEM_INSTRUCTION);
  const [showConfig, setShowConfig] = useState(false);
  const [outputCode, setOutputCode] = useState(INITIAL_PYTHON_IMPLEMENTATION);
  const [activeTab, setActiveTab] = useState<'code' | 'docs' | 'config'>('code');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{ durationSec?: number; status: string }>({
    status: 'Ready (Audited NIST Standard Module Loaded)',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = PRESET_TASKS.find((p) => p.id === presetId);
    if (found) {
      setPrompt(found.prompt);
    }
  };

  const handleExecuteAgent = async () => {
    if (isStreaming) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsStreaming(false);
      setMetrics({ status: 'Cancelled by user' });
      return;
    }

    setIsStreaming(true);
    setErrorMsg(null);
    setOutputCode('');
    setActiveTab('code');

    const startTime = Date.now();
    setMetrics({ status: 'Generating PQC implementation via Gemini API...' });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/pqc/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          temperature,
          model,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable response stream available');
      }

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.text) {
                accumulated += data.text;
                setOutputCode(accumulated);
              }
              if (data.done) {
                const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
                setMetrics({
                  durationSec: Number(totalSec),
                  status: `Generation completed successfully in ${totalSec}s`,
                });
              }
            } catch (jsonErr: any) {
              // ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMetrics({ status: 'Generation stopped' });
      } else {
        console.error('Agent generation failed:', err);
        setErrorMsg(err.message || 'Generation failed. Check server logs.');
        setMetrics({ status: 'Error occurred during generation' });
        // Fallback to loaded template if empty
        if (!outputCode) {
          setOutputCode(INITIAL_PYTHON_IMPLEMENTATION);
        }
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Determine language for syntax highlight
  const currentPreset = PRESET_TASKS.find((p) => p.id === selectedPresetId);
  const detectedLang = currentPreset?.language || 'python';
  const detectedFilename =
    detectedLang === 'rust'
      ? 'hybrid_kem.rs'
      : detectedLang === 'go'
      ? 'hybrid_kem.go'
      : 'hybrid_kem.py';

  return (
    <div className="space-y-6">
      {/* Hero & Control Header */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <Terminal className="w-4 h-4" />
              </span>
              <h1 className="text-lg font-bold text-white tracking-tight">
                PQC Implementation Agent (Senior Cryptography Engineer)
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Standardized NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) deterministic code generator.
              Enforces peer-reviewed library bindings (liboqs, cryptography), strict constant-time operations, and zero custom mathematics.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                showConfig
                  ? 'bg-slate-800 text-cyan-300 border-cyan-700/50'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Agent Parameters</span>
            </button>

            <button
              onClick={handleExecuteAgent}
              disabled={false}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                isStreaming
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-950/50'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-cyan-950/50 hover:shadow-cyan-900/40'
              }`}
            >
              {isStreaming ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Halt Generation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute PQC Agent</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Selector Badges */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase text-slate-500 mr-1">
            Engine Presets:
          </span>
          {PRESET_TASKS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition font-mono ${
                selectedPresetId === preset.id
                  ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Drawer (if toggled) */}
      {showConfig && (
        <div className="bg-[#0c121e] border border-cyan-900/40 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Cryptographic Agent Runtime Parameters
              </h3>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded">
              Audited Mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                Temperature (Strict Determinism)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.0"
                  max="0.8"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="font-mono text-cyan-300 w-10 text-right">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                0.0 enforces strict mathematical and deterministic compliance.
              </p>
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                Gemini Foundation Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-600 font-mono"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended, Low Latency)</option>
                <option value="gemini-flash-latest">gemini-flash-latest</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                Cryptographic Standard Target
              </label>
              <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>NIST FIPS 203 + RFC 7748</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Cryptographic System Instruction (Security Directive)
            </label>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              rows={3}
              className="w-full bg-[#080c14] border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs font-mono focus:outline-none focus:border-cyan-600"
            />
          </div>
        </div>
      )}

      {/* Main Grid: Prompt Input & Generated Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompting & Engineering Task Spec (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 font-mono flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Engineering Task Specification</span>
              </span>
              <button
                onClick={() => setPrompt(INITIAL_PROMPT)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition"
              >
                Reset to User Brief
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Describe the post-quantum cryptographic algorithm or hybrid mechanism..."
              className="w-full bg-[#070a12] border border-slate-800/90 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30 leading-relaxed"
            />

            {/* Cryptographic Guardrails Checklist */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-300">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enforced Cryptographic Directives</span>
                </span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Strict NIST FIPS 203 & RFC 7748 algorithms only</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Prohibition of custom or proprietary mathematics</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Dual-PRF combiner with domain-separated salt & context</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Secure zeroization & constant-time key comparisons</span>
                </li>
              </ul>
            </div>

            {/* Status & Error display */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/70 rounded-xl text-rose-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Execution Alert</p>
                  <p className="text-[11px] text-rose-300/90 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="truncate max-w-[280px]">{metrics.status}</span>
              </span>
              {metrics.durationSec && (
                <span className="text-slate-500">{metrics.durationSec}s</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code & Documentation Output (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[650px]">
          {/* Tabs bar */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-t-xl px-4 py-2">
            <div className="flex items-center space-x-1 text-xs">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'code'
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Engineered Code</span>
              </button>

              <button
                onClick={() => setActiveTab('docs')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'docs'
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Integration Spec & Math</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={downloadMarkdownSpecification}
                className="flex items-center space-x-1 px-2.5 py-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 rounded text-[11px] font-mono transition cursor-pointer"
                title="Export complete specification as .md file"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Export .md</span>
              </button>

              <button
                onClick={() => onTriggerAudit(outputCode)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded text-[11px] font-mono transition cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Audit Module</span>
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'code' ? (
              <CodeViewer
                code={outputCode || '# Generating post-quantum cryptographic module...\n'}
                language={detectedLang}
                filename={detectedFilename}
                onAudit={() => onTriggerAudit(outputCode)}
              />
            ) : (
              <div className="h-full bg-[#070b12] rounded-b-xl border-x border-b border-slate-800 p-5 overflow-auto text-xs text-slate-300 space-y-4 leading-relaxed font-sans">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    Integration Architecture: Hybrid KEM (X25519 + ML-KEM-768)
                  </h3>
                  <p className="text-slate-400 mt-1">
                    Formal integration specification adhering to NIST FIPS 203, RFC 7748, and RFC 9180.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                    <span className="text-cyan-400 font-semibold block">NIST FIPS 203 (ML-KEM-768)</span>
                    <span className="text-slate-400 text-[11px]">
                      PK: 1,184 Bytes | SK: 2,400 Bytes | Ciphertext: 1,088 Bytes
                    </span>
                    <p className="text-slate-500 text-[10px] mt-1">
                      Quantum Security: NIST Category 3 (Equivalent to AES-192 brute-force resistance against quantum grover search).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                    <span className="text-teal-400 font-semibold block">RFC 7748 (Classical X25519)</span>
                    <span className="text-slate-400 text-[11px]">
                      PK: 32 Bytes | SK: 32 Bytes | ECDH Shared Secret: 32 Bytes
                    </span>
                    <p className="text-slate-500 text-[10px] mt-1">
                      Classical Security: 128-bit security margin; highly optimized Montgomery curve operations.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-100 text-xs uppercase font-mono tracking-wider">
                    1. Dual-PRF Security Theorem
                  </h4>
                  <p className="text-slate-300 text-xs">
                    The combined key derivation uses <span className="font-mono text-cyan-300">HKDF-SHA256 (RFC 5869)</span> as a dual-PRF combiner:
                  </p>
                  <pre className="p-2.5 bg-slate-950 border border-slate-800 rounded text-cyan-300 font-mono text-[11px]">
{`IKM  = ss_classical (32B) || ss_pqc (32B)  # 64 Bytes total
Salt = SHA-256(ciphertext_composite)       # Channel binding
PRK  = HKDF-Extract(salt, IKM)
SS   = HKDF-Expand(PRK, info="Hybrid-X25519-ML-KEM-768-v1", L=32)`}
                  </pre>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Proof Guarantee:</strong> The hybrid shared secret remains indistinguishable from random even if either the classical discrete logarithm problem is solved (e.g., via Shor's algorithm on a cryptographically relevant quantum computer) OR an unforeseen flaw is discovered in module-lattice learning-with-errors mathematics.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-100 text-xs uppercase font-mono tracking-wider">
                    2. Integration & Deployment Instructions
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                    <li>Ensure <code className="text-cyan-300">liboqs</code> C shared library is installed (<code className="text-slate-400">brew install liboqs</code> or compile from source).</li>
                    <li>Install bindings: <code className="text-cyan-300">pip install liboqs-python cryptography</code></li>
                    <li>Import module and call <code className="text-cyan-300">generate_keypair()</code> for Alice.</li>
                    <li>Bob executes <code className="text-cyan-300">encapsulate(alice_pub)</code>, yielding composite ciphertext (1,120 bytes) and 256-bit symmetric session key.</li>
                    <li>Alice invokes <code className="text-cyan-300">alice_priv.decapsulate(ciphertext)</code>, producing identical 256-bit master key.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
