import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Lock, Mail, User, Shield, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  initialMode = 'login', 
  onClose 
}) => {
  const { login, register, quickDemoLogin, t } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ emailOrUsername, password });
      } else {
        await register({ email, username, password, role });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    try {
      setLoading(true);
      await quickDemoLogin(demoRole);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-[#0c1015] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-100">
            {mode === 'login' ? 'Authenticate Operative' : 'Create Training Profile'}
          </h2>
          <p className="text-xs text-zinc-400">
            RogueByte Cyber Lab &bull; SidoDev-Dz
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'login' ? (
            <div>
              <label className="text-zinc-400 block mb-1">Email or Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  placeholder="student@roguebyte.local or Cadet_Alex"
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-zinc-400 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-[#090c10] border border-zinc-800 rounded-lg pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Handle / Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="CyberOperative_01"
                    className="w-full bg-[#090c10] border border-zinc-800 rounded-lg pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Desired Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="STUDENT">Student / Cyber Trainee</option>
                  <option value="INSTRUCTOR">Instructor / Cohort Lead</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-zinc-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#090c10] border border-zinc-800 rounded-lg pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg transition mt-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Laboratory' : 'Create Account'}
          </button>
        </form>

        {/* Quick Demo Login Buttons */}
        <div className="pt-3 border-t border-zinc-800">
          <div className="text-[10px] uppercase font-mono text-zinc-500 text-center mb-2">
            One-Click Development Credentials
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemo('STUDENT')}
              className="px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-zinc-300 text-[11px] transition"
            >
              Student
            </button>
            <button
              onClick={() => handleDemo('INSTRUCTOR')}
              className="px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-300 text-[11px] transition"
            >
              Instructor
            </button>
            <button
              onClick={() => handleDemo('ADMIN')}
              className="px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-rose-500 text-zinc-300 text-[11px] transition"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-zinc-500">
          {mode === 'login' ? (
            <span>
              Need a training account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
