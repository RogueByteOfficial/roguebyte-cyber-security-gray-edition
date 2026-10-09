import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Terminal, Shield, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  openPolicyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ openPolicyModal }) => {
  const { t } = useAuth();

  return (
    <footer className="bg-[#080a0e] border-t border-zinc-800/80 text-zinc-400 py-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-zinc-100 text-sm font-mono">
                ROGUE<span className="text-emerald-400">BYTE</span> CYBER LAB
              </div>
              <div className="text-[11px] text-zinc-500">
                Created & Maintained by <strong className="text-emerald-400">SidoDev-Dz</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <a
              href="https://ko-fi.com/roguebyte"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 rtl:space-x-reverse transition"
            >
              <span>Support on Ko-fi</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://github.com/RogueByteOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white flex items-center space-x-1 rtl:space-x-reverse transition"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={openPolicyModal}
              className="hover:text-zinc-200 transition"
            >
              {t.footer.acceptableUse}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
          <div>
            &copy; 2026 RogueByte Cyber Lab. All rights reserved. SidoDev-Dz.
          </div>
          <div>
            {t.footer.disclaimer}
          </div>
        </div>

      </div>
    </footer>
  );
};
