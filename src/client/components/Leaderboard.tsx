import React, { useState, useEffect } from 'react';
import { api } from '../api.ts';
import { Trophy, Award, Shield, User, Clock, Flame } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getLeaderboard();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 flex items-center space-x-3 rtl:space-x-reverse">
          <Trophy className="w-7 h-7 text-amber-400" />
          <span>Global Cyber Leaderboard</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Operational rankings determined strictly by verified mission completions and server-side XP transactions.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 font-mono text-xs">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Calculating global rankings...
        </div>
      ) : (
        <div className="bg-[#0f1319] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#12161d] text-zinc-400 border-b border-zinc-800 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3 w-16">Rank</th>
                  <th className="px-5 py-3">Operative Handle</th>
                  <th className="px-5 py-3">Classification</th>
                  <th className="px-5 py-3">Missions Solved</th>
                  <th className="px-5 py-3 text-right rtl:text-left">Experience (XP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {users.map((u, idx) => {
                  const isTop1 = idx === 0;
                  const isTop2 = idx === 1;
                  const isTop3 = idx === 2;

                  return (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-zinc-800/30 transition ${
                        isTop1 ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-sm">
                        {isTop1 ? (
                          <span className="flex items-center space-x-1 text-amber-400">
                            <Flame className="w-4 h-4" />
                            <span>#1</span>
                          </span>
                        ) : isTop2 ? (
                          <span className="text-zinc-300">#2</span>
                        ) : isTop3 ? (
                          <span className="text-amber-600">#3</span>
                        ) : (
                          <span className="text-zinc-500">#{idx + 1}</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-zinc-100 flex items-center space-x-2 rtl:space-x-reverse">
                          <span>{u.username}</span>
                          {u.role === 'ADMIN' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 font-mono">
                              ARCHITECT
                            </span>
                          )}
                          {u.role === 'INSTRUCTOR' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                              INSTRUCTOR
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Joined: {new Date(u.joinedAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-zinc-300 font-medium">
                        {u.currentRank}
                      </td>

                      <td className="px-5 py-4 font-mono text-zinc-300">
                        {u.completedMissions} missions
                      </td>

                      <td className="px-5 py-4 text-right rtl:text-left font-mono font-black text-sm text-emerald-400">
                        {u.xp} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
