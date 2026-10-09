import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Shield, Terminal, Award, Users, Settings, LogIn, 
  LogOut, Globe, ExternalLink, Zap, ChevronDown, CheckCircle2 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openPolicyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  openAuthModal,
  openPolicyModal 
}) => {
  const { user, logout, quickDemoLogin, language, setLanguage, t } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleDemo = async (role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    try {
      setDemoLoading(role);
      await quickDemoLogin(role);
      setShowDemoMenu(false);
      setActiveTab(role === 'ADMIN' ? 'admin' : role === 'INSTRUCTOR' ? 'instructor' : 'dashboard');
    } catch (err: any) {
      alert(err.message || 'Demo login failed');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0c1015]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Attribution */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-bold text-lg tracking-wider text-zinc-100 font-mono">
                  ROGUE<span className="text-emerald-400">BYTE</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  LAB v1
                </span>
              </div>
              <div className="flex items-center text-[11px] text-zinc-400">
                <span>By <strong className="text-emerald-400 font-medium">SidoDev-Dz</strong></span>
                <span className="mx-1.5 text-zinc-600">•</span>
                <span className="text-zinc-500 font-mono text-[10px]">Black Gray Edition</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse text-sm font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'home' ? 'text-emerald-400 bg-zinc-800/70 border border-emerald-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 rtl:space-x-reverse ${activeTab === 'missions' ? 'text-emerald-400 bg-zinc-800/70 border border-emerald-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
            >
              <span>{t.nav.missions}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                16
              </span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'leaderboard' ? 'text-emerald-400 bg-zinc-800/70 border border-emerald-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
            >
              {t.nav.leaderboard}
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'dashboard' ? 'text-emerald-400 bg-zinc-800/70 border border-emerald-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
              >
                {t.nav.dashboard}
              </button>
            )}

            {user && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
              <button
                onClick={() => setActiveTab('instructor')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'instructor' ? 'text-amber-400 bg-zinc-800/70 border border-amber-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
              >
                {t.nav.instructor}
              </button>
            )}

            {user && user.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-md transition ${activeTab === 'admin' ? 'text-rose-400 bg-zinc-800/70 border border-rose-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
              >
                {t.nav.admin}
              </button>
            )}
          </nav>

          {/* Right Action Tools & Auth */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center space-x-1 rtl:space-x-reverse transition"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono">{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="px-2.5 py-1 text-xs rounded bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center space-x-1.5 rtl:space-x-reverse transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Demo Logins</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-md bg-zinc-900 border border-zinc-800 shadow-xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-mono text-zinc-400 border-b border-zinc-800">
                    Instant Development Roles
                  </div>
                  <button
                    onClick={() => handleDemo('STUDENT')}
                    disabled={Boolean(demoLoading)}
                    className="w-full text-left rtl:text-right px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-emerald-400">Cadet Student</div>
                      <div className="text-[10px] text-zinc-400 font-mono">student@roguebyte.local</div>
                    </div>
                    {demoLoading === 'STUDENT' ? <span className="animate-spin text-xs">...</span> : <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />}
                  </button>
                  <button
                    onClick={() => handleDemo('INSTRUCTOR')}
                    disabled={Boolean(demoLoading)}
                    className="w-full text-left rtl:text-right px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-amber-400">Cyber Instructor</div>
                      <div className="text-[10px] text-zinc-400 font-mono">instructor@roguebyte.local</div>
                    </div>
                    {demoLoading === 'INSTRUCTOR' ? <span className="animate-spin text-xs">...</span> : <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />}
                  </button>
                  <button
                    onClick={() => handleDemo('ADMIN')}
                    disabled={Boolean(demoLoading)}
                    className="w-full text-left rtl:text-right px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-rose-400">Admin SidoDev-Dz</div>
                      <div className="text-[10px] text-zinc-400 font-mono">admin@roguebyte.local</div>
                    </div>
                    {demoLoading === 'ADMIN' ? <span className="animate-spin text-xs">...</span> : <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Login/Register */}
            {user ? (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div 
                  onClick={() => setActiveTab('dashboard')}
                  className="cursor-pointer flex items-center space-x-2 rtl:space-x-reverse bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 px-2.5 py-1 rounded-md transition"
                >
                  <div className="w-6 h-6 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left rtl:text-right">
                    <div className="text-xs font-semibold text-zinc-200 leading-tight">
                      {user.username}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 leading-tight flex items-center space-x-1 rtl:space-x-reverse">
                      <span>{user.xp} XP</span>
                      <span>•</span>
                      <span className="text-zinc-400">{user.role}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800 transition"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white rounded bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded shadow-[0_0_12px_rgba(16,185,129,0.3)] transition"
                >
                  {t.nav.register}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
