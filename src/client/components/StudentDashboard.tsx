import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api.ts';
import { Certificate, Badge } from '../../shared/types.ts';
import { 
  User, Award, Shield, Terminal, CheckCircle, Zap, 
  Clock, ArrowRight, ExternalLink, Sparkles, Layers 
} from 'lucide-react';

interface StudentDashboardProps {
  onSelectMission: (missionId: string) => void;
  onOpenCertificate: (cert: Certificate) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  onSelectMission,
  onOpenCertificate 
}) => {
  const { user, t } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await api.getSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-zinc-500 font-mono text-xs">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Compiling operative records and telemetry...
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Identity Card */}
      <div className="bg-[#0f1319] border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center text-2xl font-mono font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              {summary.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h1 className="text-2xl font-extrabold text-zinc-100 font-mono">
                  {summary.user.username}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  {summary.user.role}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Rank: <strong className="text-amber-400 font-semibold">{summary.user.currentRank}</strong>
                <span className="mx-2 text-zinc-600">&bull;</span>
                Operative ID: <span className="font-mono text-zinc-500">{summary.user.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
            <div className="text-center px-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Experience</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{summary.user.xp} XP</span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="text-center px-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Missions</span>
              <span className="text-xl font-extrabold text-zinc-200 font-mono">
                {summary.completedMissionsCount} / {summary.totalMissionsCount}
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="text-center px-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Badges</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">{summary.earnedBadges.length}</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Overall Training Curriculum Progress</span>
            <span className="font-mono font-bold text-emerald-400">{summary.completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${summary.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Active Lab Notification Banner (if any) */}
      {summary.activeLabSession && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/40 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-400 flex items-center justify-center animate-pulse">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400">Isolated Lab Container Running</div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Session ID: {summary.activeLabSession.id} &bull; Mission: {summary.activeLabSession.missionId}
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectMission(summary.activeLabSession.missionId)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition"
          >
            Open Lab Terminal
          </button>
        </div>
      )}

      {/* Category Mastery Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2 rtl:space-x-reverse">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span>Domain Mastery Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.categoryStats?.map((cat: any) => (
            <div key={cat.category} className="bg-[#0f1319] border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-zinc-300">
                  {cat.category}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {cat.completed}/{cat.total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-zinc-500 text-right rtl:text-left font-mono">
                {cat.percentage}% Mastery
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earned Badges Gallery */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2 rtl:space-x-reverse">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Earned Badges & Insignias</span>
        </h2>

        {summary.earnedBadges.length === 0 ? (
          <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-xs">
            Complete training missions in the catalogue to earn verified operational badges.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {summary.earnedBadges.map((ub: any) => (
              <div key={ub.badge.id} className="bg-[#0f1319] border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">{ub.badge.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{ub.badge.description}</p>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-2">
                    Awarded: {new Date(ub.awardedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Certificates */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2 rtl:space-x-reverse">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Cryptographic Completion Certificates</span>
        </h2>

        {summary.certificates.length === 0 ? (
          <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-8 text-center space-y-2">
            <Award className="w-10 h-10 text-zinc-600 mx-auto" />
            <h4 className="text-xs font-semibold text-zinc-300">No Certificates Earned Yet</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Complete at least 4 training missions across different domains to unlock your first verified certificate signed by SidoDev-Dz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.certificates.map((cert: Certificate) => (
              <div key={cert.id} className="bg-[#0f1319] border border-emerald-500/30 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    {cert.certificateNumber}
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100 mt-1">{cert.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">Signed by {cert.signature}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    SHA256: {cert.verificationHash.slice(0, 16)}...
                  </p>
                </div>
                <button
                  onClick={() => onOpenCertificate(cert)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg border border-zinc-700 transition flex items-center space-x-1 rtl:space-x-reverse"
                >
                  <span>View Certificate</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
