import React, { useState, useMemo } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  onAudit?: () => void;
}

// Tokenizer & syntax highlighter that runs natively in any environment without external globals
function highlightCode(code: string, language: string): React.ReactNode[] {
  const lines = code.split('\n');

  const pythonKeywords = new Set([
    'import', 'from', 'as', 'def', 'class', 'return', 'with', 'async', 'await',
    'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'raise',
    'assert', 'in', 'is', 'not', 'and', 'or', 'lambda', 'yield', 'pass', 'break',
    'continue', 'global', 'nonlocal', 'True', 'False', 'None'
  ]);

  const rustGoKeywords = new Set([
    'fn', 'pub', 'struct', 'impl', 'use', 'let', 'mut', 'const', 'enum', 'trait',
    'match', 'where', 'type', 'package', 'func', 'var', 'range', 'go', 'select',
    'defer', 'interface', 'return', 'if', 'else', 'for', 'true', 'false', 'nil'
  ]);

  const activeKeywords = language === 'rust' || language === 'go' ? rustGoKeywords : pythonKeywords;

  return lines.map((line, lineIdx) => {
    // Process line tokens
    const tokens: React.ReactNode[] = [];
    let i = 0;
    const len = line.length;

    // Fast tokenizer for a single line
    while (i < len) {
      // 1. Comments
      if ((language === 'python' || language === 'bash') && line[i] === '#') {
        tokens.push(
          <span key={`c-${i}`} className="text-slate-500 italic">
            {line.slice(i)}
          </span>
        );
        break;
      }
      if (line.slice(i, i + 2) === '//') {
        tokens.push(
          <span key={`c-${i}`} className="text-slate-500 italic">
            {line.slice(i)}
          </span>
        );
        break;
      }

      // 2. Python Decorators / Rust Attributes (@... or #[...])
      if (line[i] === '@' && i === line.search(/\S/)) {
        const match = line.slice(i).match(/^@[a-zA-Z0-9_.]+/);
        if (match) {
          tokens.push(
            <span key={`dec-${i}`} className="text-amber-400 font-semibold">
              {match[0]}
            </span>
          );
          i += match[0].length;
          continue;
        }
      }

      // 3. String literals ("..." or '...' or `...` or f"...")
      if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
        const quote = line[i];
        let end = i + 1;
        while (end < len && (line[end] !== quote || line[end - 1] === '\\')) {
          end++;
        }
        if (end < len) end++; // include closing quote
        const strVal = line.slice(i, end);
        tokens.push(
          <span key={`str-${i}`} className="text-emerald-300">
            {strVal}
          </span>
        );
        i = end;
        continue;
      }

      // 4. Identifiers & Keywords
      if (/[a-zA-Z_]/.test(line[i])) {
        let start = i;
        while (i < len && /[a-zA-Z0-9_]/.test(line[i])) {
          i++;
        }
        const word = line.slice(start, i);

        if (activeKeywords.has(word)) {
          tokens.push(
            <span key={`kw-${start}`} className="text-cyan-400 font-semibold">
              {word}
            </span>
          );
        } else if (
          ['bytes', 'str', 'int', 'bool', 'float', 'Tuple', 'NamedTuple', 'dataclass', 'List', 'Dict', 'Optional', 'u8', 'u32', 'u64', 'usize', 'String', 'Vec', 'Result', 'Option'].includes(word)
        ) {
          tokens.push(
            <span key={`ty-${start}`} className="text-teal-300 font-medium">
              {word}
            </span>
          );
        } else if (
          ['len', 'print', 'range', 'isinstance', 'issubclass', 'bytearray', 'hashlib', 'hmac', 'crypto', 'oqs'].includes(word)
        ) {
          tokens.push(
            <span key={`fn-${start}`} className="text-sky-300">
              {word}
            </span>
          );
        } else {
          tokens.push(<span key={`id-${start}`}>{word}</span>);
        }
        continue;
      }

      // 5. Numbers
      if (/[0-9]/.test(line[i])) {
        let start = i;
        while (i < len && /[0-9a-fA-Fx_.]/.test(line[i])) {
          i++;
        }
        tokens.push(
          <span key={`num-${start}`} className="text-purple-300 font-mono">
            {line.slice(start, i)}
          </span>
        );
        continue;
      }

      // 6. Symbols, Operators & Whitespace
      tokens.push(<span key={`raw-${i}`}>{line[i]}</span>);
      i++;
    }

    return (
      <div key={`line-${lineIdx}`} className="table-row hover:bg-slate-900/40">
        <span className="table-cell pr-4 text-right select-none text-slate-600 font-mono text-[11px] w-12 align-top">
          {lineIdx + 1}
        </span>
        <span className="table-cell font-mono whitespace-pre text-slate-200">
          {tokens.length > 0 ? tokens : ' '}
        </span>
      </div>
    );
  });
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'python',
  filename = 'hybrid_kem.py',
  onAudit,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const renderedLines = useMemo(() => highlightCode(code, language), [code, language]);

  return (
    <div className="flex flex-col h-full bg-[#070b12] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* File Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-slate-200 font-semibold">{filename}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono">{lineCount} lines</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-mono text-[10px] uppercase">
            {language}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onAudit && (
            <button
              onClick={onAudit}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 rounded text-xs font-medium transition cursor-pointer"
              title="Audit code against NIST PQC verification guidelines"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Cryptography</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700/80 transition cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700/80 transition cursor-pointer"
            title="Download code file"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Editor / Viewer */}
      <div className="relative flex-1 overflow-auto p-4 text-xs font-mono text-slate-300 bg-[#070b12] leading-relaxed selection:bg-cyan-900 selection:text-white">
        <div className="table w-full">
          {renderedLines}
        </div>
      </div>
    </div>
  );
};
