import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Terminal, Shield, Zap, Lock, Award, Globe, 
  ExternalLink, ChevronRight, CheckCircle, Flame, Layers 
} from 'lucide-react';

interface LandingPageProps {
  onStartTraining: () => void;
  onExploreMissions: () => void;
  openPolicyModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTraining,
  onExploreMissions,
  openPolicyModal,
}) => {
  const { t, language } = useAuth();

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Glow & Grid Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-6">
          
          {/* Creator Attribution Badge */}
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-xs font-mono text-zinc-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Architected by <strong className="text-emerald-400 font-bold">SidoDev-Dz</strong></span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-amber-400 font-semibold">Black Gray Edition v1</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {t.hero.title}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartTraining}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.3)] transition transform hover:-translate-y-0.5 flex items-center space-x-2 rtl:space-x-reverse text-sm"
            >
              <Zap className="w-4 h-4" />
              <span>{t.hero.startTraining}</span>
            </button>

            <button
              onClick={onExploreMissions}
              className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold rounded-xl border border-zinc-800 hover:border-zinc-700 transition flex items-center space-x-2 rtl:space-x-reverse text-sm"
            >
              <span>{t.hero.viewCatalog}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          {/* Official Project & Creator Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs font-mono">
            <a
              href="https://ko-fi.com/roguebyte"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 flex items-center space-x-1.5 rtl:space-x-reverse transition shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Support on Ko-fi (RogueByte)</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>

            <a
              href="https://github.com/RogueByteOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center space-x-1.5 rtl:space-x-reverse transition shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>GitHub (RogueByteOfficial)</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>

          {/* Platform Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="bg-[#0f1319]/80 border border-zinc-800/80 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">16</div>
              <div className="text-xs text-zinc-400 mt-1">{t.stats.missions}</div>
            </div>
            <div className="bg-[#0f1319]/80 border border-zinc-800/80 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">4</div>
              <div className="text-xs text-zinc-400 mt-1">{t.stats.categories}</div>
            </div>
            <div className="bg-[#0f1319]/80 border border-zinc-800/80 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-zinc-200 font-mono">6</div>
              <div className="text-xs text-zinc-400 mt-1">{t.stats.labRuntime}</div>
            </div>
            <div className="bg-[#0f1319]/80 border border-zinc-800/80 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">100%</div>
              <div className="text-xs text-zinc-400 mt-1">{t.stats.grading}</div>
            </div>
          </div>

        </div>
      </section>

      {/* Training Paths Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            {t.paths.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            {t.paths.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Linux Path */}
          <div className="bg-[#0f1319] border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-4 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">{t.paths.linux}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.paths.linuxDesc}</p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
              <span>4 Hands-on Labs</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </div>
          </div>

          {/* Networking Path */}
          <div className="bg-[#0f1319] border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-6 space-y-4 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">{t.paths.networking}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.paths.networkingDesc}</p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 text-[11px] font-mono text-amber-400 flex items-center justify-between">
              <span>4 Network Traces</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </div>
          </div>

          {/* Web Security Path */}
          <div className="bg-[#0f1319] border border-zinc-800 hover:border-rose-500/50 rounded-2xl p-6 space-y-4 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">{t.paths.web}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.paths.webDesc}</p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 text-[11px] font-mono text-rose-400 flex items-center justify-between">
              <span>4 Exploits & Defenses</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </div>
          </div>

          {/* Defensive Path */}
          <div className="bg-[#0f1319] border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-6 space-y-4 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-100">{t.paths.defensive}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{t.paths.defensiveDesc}</p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 text-[11px] font-mono text-blue-400 flex items-center justify-between">
              <span>4 SOC Triage Labs</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </div>
          </div>

        </div>
      </section>

      {/* Ethical Hacking Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-zinc-900 via-[#10151c] to-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left rtl:md:text-right">
            <h3 className="text-xl font-bold text-zinc-100 flex items-center justify-center md:justify-start rtl:md:justify-start space-x-2 rtl:space-x-reverse">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Responsible Cybersecurity Education Standard</span>
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              All lab environments run in isolated sandboxes. Practice defensive analysis and ethical vulnerability discovery with zero risk to host infrastructure.
            </p>
          </div>
          <button
            onClick={openPolicyModal}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold rounded-lg transition whitespace-nowrap"
          >
            Review Acceptable Use Policy
          </button>
        </div>
      </section>

    </div>
  );
};
