import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api.ts';
import { User, Mission, AuditEvent, SystemSettings } from '../../shared/types.ts';
import { 
  Shield, Users, Activity, Terminal, Database, Download, 
  Settings, AlertOctagon, Trash2, Edit3, Plus, Power, CheckCircle, XCircle 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'missions' | 'labs' | 'audit' | 'settings'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeLabs, setActiveLabs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // New Mission Modal
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionCategory, setNewMissionCategory] = useState<'LINUX' | 'NETWORKING' | 'WEB_SECURITY' | 'DEFENSIVE'>('LINUX');
  const [newMissionDifficulty, setNewMissionDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [newMissionDesc, setNewMissionDesc] = useState('');
  const [newMissionFlag, setNewMissionFlag] = useState('');
  const [newMissionXp, setNewMissionXp] = useState(100);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [st, u, m, l, a, s] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getMissions(),
        api.getAdminLabs(),
        api.getAuditLogs(),
        api.getAdminSettings(),
      ]);
      setStats(st);
      setUsers(u);
      setMissions(m);
      setActiveLabs(l);
      setAuditLogs(a);
      setSettings(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSuspend = async (user: User) => {
    try {
      await api.updateAdminUser(user.id, { isSuspended: !user.isSuspended });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      await api.updateAdminUser(userId, { role });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTerminateLab = async (sessionId: string) => {
    if (!confirm('Force stop this student lab container?')) return;
    try {
      await api.terminateAdminLab(sessionId);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (!confirm('Permanently delete this mission definition?')) return;
    try {
      await api.deleteAdminMission(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminMission({
        title: newMissionTitle,
        category: newMissionCategory,
        difficulty: newMissionDifficulty,
        description: newMissionDesc,
        xpReward: newMissionXp,
        submissionType: 'FLAG',
        validationRules: { expectedFlag: newMissionFlag },
        taskInstructions: `Follow standard procedures and capture the flag.`,
        learningObjectives: ['Audit and remediate system target.'],
      });
      setShowNewMissionModal(false);
      setNewMissionTitle('');
      setNewMissionDesc('');
      setNewMissionFlag('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!settings) return;
    try {
      const updated = await api.updateAdminSettings({ maintenanceMode: !settings.maintenanceMode });
      setSettings(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 flex items-center space-x-3 rtl:space-x-reverse">
            <span>{t.admin.title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
              Root Authority
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Global system governance, real container orchestration, audit logs, and policy toggles.
          </p>
        </div>

        {/* CSV Export Quick Actions */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <a
            href="/api/v1/admin/export/users"
            download
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs border border-zinc-700 flex items-center space-x-1.5 rtl:space-x-reverse transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Users CSV</span>
          </a>
          <a
            href="/api/v1/admin/export/audit-logs"
            download
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs border border-zinc-700 flex items-center space-x-1.5 rtl:space-x-reverse transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit CSV</span>
          </a>
          <a
            href="/api/v1/admin/export/missions"
            download
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs border border-zinc-700 flex items-center space-x-1.5 rtl:space-x-reverse transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Missions CSV</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-zinc-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'stats' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          Telemetry & Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'users' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2.5 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'missions' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          Mission Studio ({missions.length})
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`px-4 py-2.5 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'labs' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          Active Labs ({activeLabs.filter(l => l.status === 'RUNNING').length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'audit' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'settings' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          System Controls
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block">Registered Users</span>
              <span className="text-2xl font-extrabold text-zinc-100 font-mono mt-1 block">{stats.totalUsers}</span>
              <span className="text-[11px] text-zinc-400">{stats.studentsCount} Students &bull; {stats.instructorsCount} Instructors</span>
            </div>

            <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block">Active Lab Containers</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">{stats.activeLabsCount}</span>
              <span className="text-[11px] text-zinc-400">Isolated Sandboxes</span>
            </div>

            <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block">Total Submissions</span>
              <span className="text-2xl font-extrabold text-zinc-100 font-mono mt-1 block">{stats.totalSubmissions}</span>
              <span className="text-[11px] text-emerald-400 font-mono">{stats.passRatePercentage}% Validation Pass Rate</span>
            </div>

            <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block">Total XP Distributed</span>
              <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">{stats.totalXpAwarded} XP</span>
              <span className="text-[11px] text-zinc-400">{stats.completedMissionsCount} Completed Missions</span>
            </div>
          </div>

          <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-zinc-200 mb-3">Live Platform Runtime Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-zinc-400">
              <div className="p-3 bg-[#090c10] rounded border border-zinc-800/80">
                <span className="text-zinc-500 block">Database Engine:</span>
                <span className="text-emerald-400">PostgreSQL / Persistent JSON</span>
              </div>
              <div className="p-3 bg-[#090c10] rounded border border-zinc-800/80">
                <span className="text-zinc-500 block">Isolation Layer:</span>
                <span className="text-emerald-400">Sub-process & Virtual Filesystem Sandbox</span>
              </div>
              <div className="p-3 bg-[#090c10] rounded border border-zinc-800/80">
                <span className="text-zinc-500 block">Lead Architect:</span>
                <span className="text-amber-400">SidoDev-Dz</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-[#0f1319] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#12161d] text-zinc-400 border-b border-zinc-800 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-semibold text-zinc-100">
                      {u.username}
                      <span className="block text-[10px] text-zinc-500 font-normal">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={e => handleChangeRole(u.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 text-xs"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-mono">{u.currentRank}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{u.xp}</td>
                    <td className="px-4 py-3">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px]">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleSuspend(u)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          u.isSuspended 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 hover:bg-emerald-900' 
                            : 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900'
                        }`}
                      >
                        {u.isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mission Studio Tab */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewMissionModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 rtl:space-x-reverse"
            >
              <Plus className="w-4 h-4" />
              <span>Author New Mission</span>
            </button>
          </div>

          <div className="bg-[#0f1319] border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-[#12161d] text-zinc-400 border-b border-zinc-800 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Mission ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">XP</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                  {missions.map(m => (
                    <tr key={m.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-mono text-zinc-500">{m.id}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-100">{m.title}</td>
                      <td className="px-4 py-3 font-mono text-zinc-400">{m.category}</td>
                      <td className="px-4 py-3">{m.difficulty}</td>
                      <td className="px-4 py-3 font-mono text-amber-400 font-bold">{m.xpReward}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-zinc-400">{m.submissionType}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteMission(m.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded transition"
                          title="Delete mission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Active Labs Tab */}
      {activeTab === 'labs' && (
        <div className="bg-[#0f1319] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#12161d] text-zinc-400 border-b border-zinc-800 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Session ID</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Mission</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires At</th>
                  <th className="px-4 py-3">Commands Run</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {activeLabs.map((l: any) => (
                  <tr key={l.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-mono text-zinc-400">{l.id}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-100">{l.username}</td>
                    <td className="px-4 py-3 text-zinc-300">{l.missionTitle}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        l.status === 'RUNNING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      {new Date(l.expiresAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{l.executedCommandsCount}</td>
                    <td className="px-4 py-3">
                      {l.status === 'RUNNING' && (
                        <button
                          onClick={() => handleTerminateLab(l.id)}
                          className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-[11px]"
                        >
                          Kill Container
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-[#0f1319] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#12161d] text-zinc-400 border-b border-zinc-800 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {auditLogs.slice(0, 50).map(log => (
                  <tr key={log.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-mono text-zinc-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-zinc-200">{log.action}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-zinc-400">{log.category}</td>
                    <td className="px-4 py-3 text-zinc-300">{log.username || 'System'}</td>
                    <td className="px-4 py-3 font-mono text-zinc-500">{log.ipAddress}</td>
                    <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-6 space-y-6 max-w-2xl">
          <h3 className="text-base font-bold text-zinc-100">Platform Security & Quota Controls</h3>

          <div className="flex items-center justify-between p-4 bg-[#090c10] border border-zinc-800 rounded-lg">
            <div>
              <div className="text-sm font-semibold text-zinc-200">System Maintenance Mode</div>
              <div className="text-xs text-zinc-500">Temporarily suspends new lab container creation.</div>
            </div>
            <button
              onClick={handleToggleMaintenance}
              className={`px-4 py-2 rounded font-bold text-xs ${
                settings.maintenanceMode 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {settings.maintenanceMode ? 'ENABLED (Paused)' : 'DISABLED (Operational)'}
            </button>
          </div>

          <div className="p-4 bg-[#090c10] border border-zinc-800 rounded-lg text-xs space-y-2">
            <div className="text-zinc-300 font-semibold">Concurrency Limits:</div>
            <div className="text-zinc-400">Max concurrent labs per user: <strong>{settings.maxConcurrentLabsPerUser}</strong></div>
            <div className="text-zinc-400">Default session timeout: <strong>{settings.defaultLabTimeoutMinutes} minutes</strong></div>
            <div className="text-zinc-400">Registration status: <strong>{settings.registrationOpen ? 'Open' : 'Restricted'}</strong></div>
          </div>
        </div>
      )}

      {/* New Mission Modal */}
      {showNewMissionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1319] border border-zinc-800 max-w-lg w-full rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-zinc-100">Author New Security Mission</h3>
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newMissionTitle}
                  onChange={e => setNewMissionTitle(e.target.value)}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded p-2 text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Category</label>
                  <select
                    value={newMissionCategory}
                    onChange={e => setNewMissionCategory(e.target.value as any)}
                    className="w-full bg-[#090c10] border border-zinc-800 rounded p-2 text-zinc-200"
                  >
                    <option value="LINUX">LINUX</option>
                    <option value="NETWORKING">NETWORKING</option>
                    <option value="WEB_SECURITY">WEB_SECURITY</option>
                    <option value="DEFENSIVE">DEFENSIVE</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Difficulty</label>
                  <select
                    value={newMissionDifficulty}
                    onChange={e => setNewMissionDifficulty(e.target.value as any)}
                    className="w-full bg-[#090c10] border border-zinc-800 rounded p-2 text-zinc-200"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newMissionDesc}
                  onChange={e => setNewMissionDesc(e.target.value)}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded p-2 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Secret Flag (e.g. ROGUE&#123;...&#125;)</label>
                <input
                  type="text"
                  required
                  value={newMissionFlag}
                  onChange={e => setNewMissionFlag(e.target.value)}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">XP Reward</label>
                <input
                  type="number"
                  value={newMissionXp}
                  onChange={e => setNewMissionXp(Number(e.target.value))}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewMissionModal(false)}
                  className="px-4 py-2 bg-zinc-800 rounded text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded"
                >
                  Save Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
