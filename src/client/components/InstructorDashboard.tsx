import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api.ts';
import { Mission, Assignment } from '../../shared/types.ts';
import { 
  Users, BookOpen, CheckSquare, Plus, MessageSquare, 
  Clock, Award, ArrowUpRight, CheckCircle, XCircle 
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState<'assignments' | 'students' | 'reviews'>('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [cohortData, setCohortData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  // New assignment form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgGroup, setAsgGroup] = useState('Cadet Cohort 2026');
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [asgDueDate, setAsgDueDate] = useState('');

  // Review modal state
  const [reviewSubId, setReviewSubId] = useState<string | null>(null);
  const [reviewScore, setReviewScore] = useState(100);
  const [reviewCorrect, setReviewCorrect] = useState(true);
  const [reviewFeedback, setReviewFeedback] = useState('Excellent work. Clear technical analysis.');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [asg, cohort, subs, mList] = await Promise.all([
        api.getAssignments(),
        api.getCohortAnalytics(),
        api.getInstructorSubmissions(),
        api.getMissions(),
      ]);
      setAssignments(asg);
      setCohortData(cohort);
      setSubmissions(subs);
      setMissions(mList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle || selectedMissions.length === 0) {
      alert('Please enter a title and select at least one mission.');
      return;
    }

    try {
      await api.createAssignment({
        title: asgTitle,
        description: asgDesc,
        targetGroup: asgGroup,
        missionIds: selectedMissions,
        dueDate: asgDueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      setShowCreateModal(false);
      setAsgTitle('');
      setAsgDesc('');
      setSelectedMissions([]);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment');
    }
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewSubId) return;

    try {
      await api.reviewSubmission(reviewSubId, {
        isCorrect: reviewCorrect,
        score: reviewScore,
        feedback: reviewFeedback,
      });
      setReviewSubId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 flex items-center space-x-3 rtl:space-x-reverse">
            <span>{t.instructor.title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              Instructor Authority
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Curate assignments, track student cohorts, and evaluate student incident reports.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>{t.instructor.createAssignment}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-zinc-800 text-xs">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 font-medium transition border-b-2 ${
            activeTab === 'assignments' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          Assignments ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 font-medium transition border-b-2 ${
            activeTab === 'students' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          Cohort Roster ({cohortData?.totalStudents || 0})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 font-medium transition border-b-2 ${
            activeTab === 'reviews' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          Submissions Stream ({submissions.length})
        </button>
      </div>

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignments.map(asg => (
            <div key={asg.id} className="bg-[#0f1319] border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                    {asg.targetGroup}
                  </span>
                  <h3 className="text-base font-bold text-zinc-100 mt-1">{asg.title}</h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{asg.description}</p>

              <div className="pt-3 border-t border-zinc-800 text-xs">
                <div className="text-zinc-500 text-[11px] mb-1.5 font-mono">Assigned Missions ({asg.missionIds.length}):</div>
                <div className="flex flex-wrap gap-1.5">
                  {asg.missionIds.map(mid => {
                    const m = missions.find(x => x.id === mid);
                    return (
                      <span key={mid} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
                        {m?.title || mid}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-[#0f1319] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#12161d] text-zinc-400 border-b border-zinc-800 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Total XP</th>
                  <th className="px-4 py-3">Missions Completed</th>
                  <th className="px-4 py-3">Curriculum Rate</th>
                  <th className="px-4 py-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {cohortData?.students?.map((st: any) => (
                  <tr key={st.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-semibold text-zinc-100">
                      {st.username}
                      <span className="block text-[10px] text-zinc-500 font-normal">{st.email}</span>
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-mono">{st.currentRank}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{st.xp} XP</td>
                    <td className="px-4 py-3 font-mono">{st.completedMissionsCount}</td>
                    <td className="px-4 py-3 font-mono">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-16 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${st.completionRate}%` }}></div>
                        </div>
                        <span>{st.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-500">
                      {new Date(st.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submissions Review Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-[#0f1319] border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#12161d] text-zinc-400 border-b border-zinc-800 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Mission</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-mono text-zinc-500">
                      {new Date(sub.submittedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-100">{sub.studentUsername}</td>
                    <td className="px-4 py-3 text-zinc-300">{sub.missionTitle}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-zinc-400">{sub.submissionType}</td>
                    <td className="px-4 py-3">
                      {sub.isCorrect ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                          PASSED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-mono">
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setReviewSubId(sub.id);
                          setReviewCorrect(sub.isCorrect);
                          setReviewScore(sub.score || 100);
                          setReviewFeedback(sub.feedback || '');
                        }}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 text-[11px]"
                      >
                        Review Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1319] border border-zinc-800 max-w-lg w-full rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-100">Create New Cohort Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={e => setAsgTitle(e.target.value)}
                  placeholder="e.g. Week 2: Advanced SUID & Web Exploitation"
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={asgDesc}
                  onChange={e => setAsgDesc(e.target.value)}
                  placeholder="Instructions for students..."
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Target Group</label>
                <input
                  type="text"
                  value={asgGroup}
                  onChange={e => setAsgGroup(e.target.value)}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Select Missions</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-[#090c10] p-2 rounded-lg border border-zinc-800">
                  {missions.map(m => (
                    <label key={m.id} className="flex items-center space-x-2 rtl:space-x-reverse p-1 hover:bg-zinc-800/40 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMissions.includes(m.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedMissions(prev => [...prev, m.id]);
                          else setSelectedMissions(prev => prev.filter(x => x !== m.id));
                        }}
                        className="rounded border-zinc-700 bg-zinc-900 text-emerald-500"
                      />
                      <span className="text-zinc-300 font-mono">{m.title} ({m.category})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewSubId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1319] border border-zinc-800 max-w-lg w-full rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-100">Review Student Submission</h3>
            <form onSubmit={handleReviewSubmission} className="space-y-4 text-xs">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="radio"
                    name="correct"
                    checked={reviewCorrect}
                    onChange={() => setReviewCorrect(true)}
                  />
                  <span className="text-emerald-400 font-bold">Approve (Correct)</span>
                </label>
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="radio"
                    name="correct"
                    checked={!reviewCorrect}
                    onChange={() => setReviewCorrect(false)}
                  />
                  <span className="text-rose-400 font-bold">Reject (Needs Work)</span>
                </label>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Score (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={reviewScore}
                  onChange={e => setReviewScore(Number(e.target.value))}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg p-2 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Instructor Feedback</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setReviewSubId(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
