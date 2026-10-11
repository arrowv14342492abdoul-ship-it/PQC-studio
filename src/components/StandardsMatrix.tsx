import React from 'react';
import { NIST_ALGORITHMS } from '../data/pqcPresets';
import { Cpu, ShieldAlert, Award, AlertCircle, FileCheck, Layers, Calendar, ExternalLink } from 'lucide-react';

export const StandardsMatrix: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
            <Award className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight">
            NIST Post-Quantum Cryptography Standards & Threat Matrix
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Official NIST FIPS standards published in August 2024. Transition guidelines for deprecating
          vulnerable classical primitives (RSA, ECDH, ECDSA) and deploying hybrid architectures.
        </p>

        {/* CNSA 2.0 Mandate Card */}
        <div className="mt-4 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold">CNSA 2.0 Mandate</span>
              <p className="text-slate-400 text-[10px] mt-0.5">
                NSA requires national security systems to adopt ML-KEM & ML-DSA by 2025–2030, full phase-out by 2033.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold">HNDL Attack Vector</span>
              <p className="text-slate-400 text-[10px] mt-0.5">
                "Harvest Now, Decrypt Later": Adversaries intercept and store classical TLS traffic today to decrypt with future CRQCs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold">Hybrid Imperative</span>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Combining X25519 with ML-KEM ensures classical FIPS 140-3 validation remains intact while mitigating lattice cryptanalysis risk.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Standards Table */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Standardized PQC Algorithm Specifications (FIPS 203 / 204 / 205)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            FIPS Final Release (2024)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Algorithm & FIPS</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Security Level</th>
                <th className="py-3 px-4">Math Family</th>
                <th className="py-3 px-4">Public Key</th>
                <th className="py-3 px-4">Ciphertext / Sig</th>
                <th className="py-3 px-4">Recommended Deployment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {NIST_ALGORITHMS.map((algo) => (
                <tr key={algo.name} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{algo.name}</div>
                    <div className="text-[10px] text-cyan-400">{algo.standard}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] border ${
                        algo.type === 'KEM'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                          : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                      }`}
                    >
                      {algo.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200">{algo.securityLevel}</div>
                    <div className="text-[10px] text-slate-500">{algo.classicalEquiv}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{algo.mathFamily}</td>
                  <td className="py-3 px-4">
                    <span className="text-slate-200">{algo.publicKeySize.toLocaleString()} B</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-teal-300">{algo.ciphertextOrSigSize.toLocaleString()} B</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                    {algo.recommendedUse}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classical vs Quantum Vulnerability Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0b0f19] border border-rose-900/30 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider">
              Vulnerable Classical Primitives (Broken by Shor's Algorithm)
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Shor's algorithm on a Cryptographically Relevant Quantum Computer (CRQC) solves integer factorization
            and discrete logarithms in polynomial time <span className="font-mono text-rose-300">O((log N)³)</span>:
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-rose-200">RSA (2048 / 4096-bit)</span>
                <span className="text-slate-400 text-[10px] block">Integer Factorization</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] border border-rose-800">
                0 Bits Quantum Security
              </span>
            </div>

            <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-rose-200">ECDH / ECDSA (Curve25519, P-256)</span>
                <span className="text-slate-400 text-[10px] block">Elliptic Curve Discrete Log</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] border border-rose-800">
                0 Bits Quantum Security
              </span>
            </div>

            <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-rose-200">Diffie-Hellman (DH-2048)</span>
                <span className="text-slate-400 text-[10px] block">Finite Field Discrete Log</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] border border-rose-800">
                0 Bits Quantum Security
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-emerald-900/30 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider">
              Symmetric Primitives & Grover's Algorithm Impact
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Grover's algorithm provides a quadratic speedup for unstructured search <span className="font-mono text-emerald-300">O(√N)</span>.
            Symmetric ciphers only require key-doubling to preserve target security margins:
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-200">AES-256 (GCM / CBC)</span>
                <span className="text-slate-400 text-[10px] block">Symmetric Block Cipher</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                128 Bits Quantum Security (Safe)
              </span>
            </div>

            <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-200">SHA-384 / SHA-512 / SHA3</span>
                <span className="text-slate-400 text-[10px] block">Cryptographic Hash Functions</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                192–256 Bits Preimage Resistance
              </span>
            </div>

            <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-200">ChaCha20-Poly1305</span>
                <span className="text-slate-400 text-[10px] block">256-bit Stream Cipher</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                128 Bits Quantum Security (Safe)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
