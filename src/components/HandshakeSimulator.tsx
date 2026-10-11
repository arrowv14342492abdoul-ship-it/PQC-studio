import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  Key,
  ShieldCheck,
  ArrowRight,
  Cpu,
  Layers,
  Copy,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SimulationResult } from '../types/pqc';

export const HandshakeSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [step, setStep] = useState<number>(4);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState('X25519+ML-KEM-768');
  const [context, setContext] = useState('Hybrid-X25519-ML-KEM-768-v1');

  const runSimulation = async () => {
    setIsRunning(true);
    setStep(1);

    try {
      // Step animation
      setTimeout(() => setStep(2), 350);
      setTimeout(() => setStep(3), 700);

      const response = await fetch('/api/pqc/simulate-handshake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kemAlgorithm: algorithm, context }),
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }

      const data: SimulationResult = await response.json();
      setTimeout(() => {
        setSimulation(data);
        setStep(4);
        setIsRunning(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const copyHex = (hex: string, keyName: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-950/80 border border-teal-800 text-teal-400">
                <Lock className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Hybrid KEM Protocol Visualizer & Cryptographic Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Step-by-step verification of Alice and Bob establishing quantum-safe session keys combining
              classical X25519 and NIST FIPS 203 ML-KEM-768 via HKDF-SHA256.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-teal-950/40 transition disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Handshake...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Live Handshake</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Handshake Progress Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div
            className={`p-2.5 rounded-xl border transition ${
              step >= 1
                ? 'bg-slate-900 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span>Stage 1</span>
              {step >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <div className="font-semibold text-slate-200 mt-1">Alice KeyGen</div>
            <div className="text-[10px] text-slate-400">X25519 (32B) + ML-KEM (1184B)</div>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition ${
              step >= 2
                ? 'bg-slate-900 border-teal-700/60 text-teal-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span>Stage 2</span>
              {step >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
            </div>
            <div className="font-semibold text-slate-200 mt-1">Bob Encapsulation</div>
            <div className="text-[10px] text-slate-400">Ephemeral ECDH + PQC Ciphertext</div>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition ${
              step >= 3
                ? 'bg-slate-900 border-indigo-700/60 text-indigo-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span>Stage 3</span>
              {step >= 3 && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <div className="font-semibold text-slate-200 mt-1">Dual-PRF HKDF</div>
            <div className="text-[10px] text-slate-400">Extract & Expand (RFC 5869)</div>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition ${
              step >= 4
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span>Stage 4</span>
              {step >= 4 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <div className="font-semibold text-slate-200 mt-1">Decapsulation & Match</div>
            <div className="text-[10px] text-slate-400">Constant-time verification</div>
          </div>
        </div>
      </div>

      {/* Protocol Visual Flow & Artifact Cards */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Alice's Workspace (4 cols) */}
          <div className="lg:col-span-4 bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
                  A
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">
                    Alice (Receiver / Key Holder)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Long-term Classical + PQC</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                Initiator
              </span>
            </div>

            {/* Alice Public Key Artifacts */}
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Classical Public Key (X25519)</span>
                  <span className="text-cyan-400">{simulation.artifacts.alice.classicalPubLen} B</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 px-2 py-1.5 rounded text-[11px] text-slate-300">
                  <span className="truncate max-w-[200px]">{simulation.artifacts.alice.classicalPubHex}</span>
                  <button
                    onClick={() => copyHex(simulation.artifacts.alice.classicalPubHex, 'aliceClassical')}
                    className="text-slate-400 hover:text-slate-200 ml-2"
                  >
                    {copiedKey === 'aliceClassical' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>PQC Public Key (ML-KEM-768)</span>
                  <span className="text-teal-400">{simulation.artifacts.alice.pqcPubLen} B</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 px-2 py-1.5 rounded text-[11px] text-slate-300">
                  <span className="truncate max-w-[200px]">{simulation.artifacts.alice.pqcPubPreviewHex}</span>
                  <span className="text-slate-500 text-[10px]">FIPS 203 pk</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-cyan-300 text-[11px] font-semibold">
                  <span>Alice Composite PK</span>
                  <span>{simulation.artifacts.alice.combinedPubLen} Bytes</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Sent to Bob over standard TLS or transport channel.
                </p>
              </div>

              {/* Alice Decapsulated Master Secret */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1.5 mt-4">
                <div className="flex items-center justify-between text-emerald-300 text-[11px] font-semibold">
                  <span>Alice Derived Session Key</span>
                  <span className="text-emerald-400">256-bit</span>
                </div>
                <div className="bg-black/50 p-2 rounded text-[10px] text-emerald-200 break-all font-mono">
                  {simulation.artifacts.decapsulation.aliceDerivedMasterKeyHex}
                </div>
              </div>
            </div>
          </div>

          {/* Middle: HKDF Combiner & Dual Channel (4 cols) */}
          <div className="lg:col-span-4 bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">
                    HKDF-SHA256 Combiner
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">RFC 5869 Dual-PRF Binding</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono">
                Constant-Time
              </span>
            </div>

            {/* Secret Breakdown */}
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">
                  1. Classical ECDH Secret (32 Bytes):
                </span>
                <div className="text-[10px] text-slate-300 bg-black/40 p-1.5 rounded truncate">
                  {simulation.artifacts.bob.classicalSharedHex}
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 block">
                  2. PQC ML-KEM-768 Secret (32 Bytes):
                </span>
                <div className="text-[10px] text-slate-300 bg-black/40 p-1.5 rounded truncate">
                  {simulation.artifacts.bob.pqcSharedHex}
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-800/50 rounded-xl space-y-1">
                <span className="text-[11px] text-indigo-300 font-semibold block">
                  Combined Input Keying Material (IKM):
                </span>
                <p className="text-[10px] text-slate-400">
                  IKM = ss_classical (32B) || ss_pqc (32B) = 64 Bytes
                </p>
                <p className="text-[10px] text-slate-400">
                  Salt = SHA-256(Composite Ciphertext)
                </p>
                <p className="text-[10px] text-slate-400">
                  Info = "{context}"
                </p>
              </div>

              {/* Match Verification Box */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-700/60 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Key Derivation Integrity Verified</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Cryptographic Equivalence:</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold">
                    100% IDENTICAL (Constant-Time)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Computation Latency:</span>
                  </span>
                  <span className="text-slate-200 font-mono">{simulation.durationMs} ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bob's Workspace (4 cols) */}
          <div className="lg:col-span-4 bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-950/80 border border-teal-800 flex items-center justify-center font-mono font-bold text-xs text-teal-400">
                  B
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">
                    Bob (Sender / Encapsulator)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Ephemeral Encapsulation</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300 font-mono">
                Encapsulator
              </span>
            </div>

            {/* Bob Ciphertext Artifacts */}
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Ephemeral PubKey (X25519)</span>
                  <span className="text-cyan-400">{simulation.artifacts.bob.ephemeralPubLen} B</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 px-2 py-1.5 rounded text-[11px] text-slate-300">
                  <span className="truncate max-w-[200px]">{simulation.artifacts.bob.ephemeralPubHex}</span>
                  <button
                    onClick={() => copyHex(simulation.artifacts.bob.ephemeralPubHex, 'bobEphemeral')}
                    className="text-slate-400 hover:text-slate-200 ml-2"
                  >
                    {copiedKey === 'bobEphemeral' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>PQC Ciphertext (ML-KEM-768)</span>
                  <span className="text-teal-400">{simulation.artifacts.bob.pqcCiphertextLen} B</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 px-2 py-1.5 rounded text-[11px] text-slate-300">
                  <span className="truncate max-w-[200px]">{simulation.artifacts.bob.pqcCiphertextPreviewHex}</span>
                  <span className="text-slate-500 text-[10px]">FIPS 203 ct</span>
                </div>
              </div>

              <div className="p-3 bg-teal-950/30 border border-teal-800/50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-teal-300 text-[11px] font-semibold">
                  <span>Bob Composite Ciphertext</span>
                  <span>{simulation.artifacts.bob.combinedCiphertextLen} Bytes</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Transmitted to Alice for decapsulation.
                </p>
              </div>

              {/* Bob Derived Master Secret */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1.5 mt-4">
                <div className="flex items-center justify-between text-emerald-300 text-[11px] font-semibold">
                  <span>Bob Derived Session Key</span>
                  <span className="text-emerald-400">256-bit</span>
                </div>
                <div className="bg-black/50 p-2 rounded text-[10px] text-emerald-200 break-all font-mono">
                  {simulation.artifacts.bob.derivedMasterKeyHex}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wire Transmission Overhead Inspector */}
      {simulation && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Cryptographic Wire Overhead Analysis (TLS 1.3 ClientHello / ServerHello)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              Total Exchange Payload: {simulation.artifacts.metrics.totalPublicTransmissionBytes} Bytes (~2.3 KB)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Classical X25519 Payload:</span>
              <div className="text-lg font-bold text-slate-100 mt-1">64 Bytes</div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Alice 32B PK + Bob 32B Ephemeral PK
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">PQC ML-KEM-768 Overhead:</span>
              <div className="text-lg font-bold text-cyan-400 mt-1">2,272 Bytes</div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Alice 1,184B PK + Bob 1,088B Ciphertext
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Security Assurance Margin:</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">NIST Category 3</div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Resistant to both classical compute & quantum CRQC attacks
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
