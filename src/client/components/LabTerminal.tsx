import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api.ts';
import { Terminal as TerminalIcon, Play, Trash2, Maximize2, Minimize2, AlertCircle, RefreshCw } from 'lucide-react';

interface LabTerminalProps {
  sessionId: string;
  initialHistory?: string[];
  remainingSeconds: number;
  onTerminate: () => void;
}

export const LabTerminal: React.FC<LabTerminalProps> = ({
  sessionId,
  initialHistory = [],
  remainingSeconds,
  onTerminate,
}) => {
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [executing, setExecuting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCurrentCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete basic commands
      const commonCommands = ['ls', 'cat', 'grep', 'chmod', 'stat', 'clear', 'help', 'whoami', 'pwd', 'id'];
      const match = commonCommands.find(c => c.startsWith(input.trim()));
      if (match) {
        setInput(match + ' ');
      }
    }
  };

  const executeCurrentCommand = async () => {
    const cmd = input.trim();
    if (!cmd || executing) return;

    setInput('');
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setExecuting(true);

    if (cmd === 'clear') {
      setHistory([]);
      setExecuting(false);
      return;
    }

    try {
      const res = await api.execCommand(sessionId, cmd);
      setHistory(prev => [
        ...prev,
        `student@roguebyte-lab:~$ ${cmd}`,
        ...(res.stdout ? [res.stdout] : []),
        ...(res.stderr ? [`[ERROR] ${res.stderr}`] : [])
      ]);
    } catch (err: any) {
      setHistory(prev => [
        ...prev,
        `student@roguebyte-lab:~$ ${cmd}`,
        `[FATAL] ${err.message || 'Execution failed'}`
      ]);
    } finally {
      setExecuting(false);
      inputRef.current?.focus();
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col bg-[#090c10] border border-zinc-800 rounded-lg overflow-hidden font-mono shadow-2xl ${isFullscreen ? 'fixed inset-4 z-50' : 'h-[460px]'}`}>
      
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#12161d] border-b border-zinc-800 text-xs">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-zinc-400 font-semibold ml-2 flex items-center space-x-1">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>bash &bull; session:{sessionId.slice(0, 8)}</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="text-[11px] text-zinc-400 flex items-center space-x-1">
            <span className="text-zinc-500">TTL:</span>
            <span className={`font-mono font-bold ${remainingSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {formatTimer(remainingSeconds)}
            </span>
          </div>

          <button
            onClick={() => setHistory([])}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onTerminate}
            className="text-xs px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-rose-300 hover:bg-rose-900 transition"
          >
            Stop Lab
          </button>
        </div>
      </div>

      {/* Terminal Screen & Outputs */}
      <div 
        className="flex-1 p-3 overflow-y-auto text-xs space-y-1 select-text bg-[#090c10]"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, idx) => {
          const isPrompt = line.startsWith('student@roguebyte-lab:~$');
          const isError = line.startsWith('[ERROR]') || line.startsWith('[FATAL]');
          const isSuccess = line.includes('[+]') || line.includes('[VERIFIED]');

          return (
            <div 
              key={idx} 
              className={`whitespace-pre-wrap leading-relaxed ${
                isPrompt ? 'text-zinc-300 font-bold' : 
                isError ? 'text-rose-400' : 
                isSuccess ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {line}
            </div>
          );
        })}

        {/* Active Command Prompt Line */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse pt-1">
          <span className="text-emerald-400 font-bold select-none whitespace-nowrap">
            student@roguebyte-lab:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={executing}
            className="flex-1 bg-transparent text-zinc-100 outline-none border-none p-0 focus:ring-0 font-mono text-xs"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          {executing && (
            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
          )}
        </div>
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Quick Help Bar */}
      <div className="px-3 py-1 bg-[#0c1015] border-t border-zinc-800/80 text-[10px] text-zinc-500 flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span>Shortcuts:</span>
          <span><kbd className="px-1 bg-zinc-800 rounded text-zinc-400">Tab</kbd> Autocomplete</span>
          <span><kbd className="px-1 bg-zinc-800 rounded text-zinc-400">&uarr; &darr;</kbd> History</span>
          <span><kbd className="px-1 bg-zinc-800 rounded text-zinc-400">help</kbd> Commands</span>
        </div>
        <div className="text-emerald-500/70 font-mono">
          Container Isolation: active
        </div>
      </div>
    </div>
  );
};
