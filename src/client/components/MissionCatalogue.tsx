import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api.ts';
import { Mission, MissionCategory, MissionDifficulty } from '../../shared/types.ts';
import { 
  Terminal, Search, Filter, Shield, Clock, Zap, 
  CheckCircle, Lock, ChevronRight, AlertCircle, Award 
} from 'lucide-react';

interface MissionCatalogueProps {
  onSelectMission: (missionId: string) => void;
}

export const MissionCatalogue: React.FC<MissionCatalogueProps> = ({ onSelectMission }) => {
  const { user, language, t } = useAuth();
  const [missions, setMissions] = useState<(Mission & { isCompleted: boolean; hasPrerequisitesMet: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [filterCompletedOnly, setFilterCompletedOnly] = useState(false);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const data = await api.getMissions({
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        search: search || undefined,
      });
      setMissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [selectedCategory, selectedDifficulty, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMissions();
  };

  const categories: { key: MissionCategory | ''; label: string }[] = [
    { key: '', label: t.missions.allCategories },
    { key: 'LINUX', label: 'Linux Hardening' },
    { key: 'NETWORKING', label: 'Networking & Traffic' },
    { key: 'WEB_SECURITY', label: 'Web Application Sec' },
    { key: 'DEFENSIVE', label: 'SOC & Defensive' },
  ];

  const difficulties: { key: MissionDifficulty | ''; label: string }[] = [
    { key: '', label: t.missions.allDifficulties },
    { key: 'BEGINNER', label: 'Beginner' },
    { key: 'INTERMEDIATE', label: 'Intermediate' },
    { key: 'ADVANCED', label: 'Advanced' },
  ];

  const filteredMissions = filterCompletedOnly 
    ? missions.filter(m => m.isCompleted) 
    : missions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 flex items-center space-x-3 rtl:space-x-reverse">
            <span>{t.missions.title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {missions.length} Missions Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real offensive vectors and defensive remediation tasks evaluated against server-side criteria.
          </p>
        </div>

        {user && (
          <div className="flex items-center space-x-4 rtl:space-x-reverse bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs">
            <div>
              <span className="text-zinc-500 block">Completed</span>
              <strong className="text-emerald-400 font-mono text-sm">
                {missions.filter(m => m.isCompleted).length} / {missions.length}
              </strong>
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <div>
              <span className="text-zinc-500 block">Current Rank</span>
              <strong className="text-zinc-200 font-medium">{user.currentRank}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0f1319] border border-zinc-800 p-4 rounded-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.missions.searchPlaceholder}
              className="w-full bg-[#090c10] border border-zinc-800 rounded-lg pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty & Status toggles */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              {difficulties.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>

            {user && (
              <button
                onClick={() => setFilterCompletedOnly(!filterCompletedOnly)}
                className={`px-2.5 py-1.5 rounded-lg border transition ${
                  filterCompletedOnly 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                Completed only
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Missions Grid */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-xs font-mono">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Scanning mission catalogue...
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-12 text-center space-y-3">
          <Shield className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-zinc-300 font-bold text-sm">No missions match your query</h3>
          <p className="text-zinc-500 text-xs">Try selecting a different domain category or clearing your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMissions.map((m) => {
            const displayTitle = (language === 'ar' && m.titleAr) ? m.titleAr : m.title;
            const displayDesc = (language === 'ar' && m.descriptionAr) ? m.descriptionAr : m.description;

            return (
              <div
                key={m.id}
                onClick={() => onSelectMission(m.id)}
                className={`group cursor-pointer bg-[#0f1319] hover:bg-[#131821] border rounded-xl p-5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  m.isCompleted 
                    ? 'border-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.06)]' 
                    : 'border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                {m.isCompleted && (
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                    <div className="bg-emerald-500 text-zinc-950 text-[9px] font-bold py-0.5 text-center transform rotate-45 translate-x-4 translate-y-2 w-24 shadow-sm">
                      DONE
                    </div>
                  </div>
                )}

                <div>
                  {/* Category & Difficulty Header */}
                  <div className="flex items-center justify-between text-[11px] font-mono mb-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {m.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${
                      m.difficulty === 'BEGINNER' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900' :
                      m.difficulty === 'INTERMEDIATE' ? 'bg-amber-950/40 text-amber-400 border-amber-900' :
                      'bg-rose-950/40 text-rose-400 border-rose-900'
                    }`}>
                      {m.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-zinc-100 group-hover:text-emerald-400 transition text-base mb-2 line-clamp-1">
                    {displayTitle}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-4">
                    {displayDesc}
                  </p>
                </div>

                {/* Card Footer Metadata */}
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse text-zinc-400 font-mono text-[11px]">
                    <span className="text-amber-400 font-semibold">+{m.xpReward} XP</span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{m.estimatedMinutes}m</span>
                    </span>
                    {m.labProfileId && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px]">
                        Lab
                      </span>
                    )}
                  </div>

                  <div className="text-emerald-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition">
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
