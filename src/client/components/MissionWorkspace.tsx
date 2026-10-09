import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api.ts';
import { Mission, LabSession, Badge, Certificate } from '../../shared/types.ts';
import { LabTerminal } from './LabTerminal.tsx';
import { 
  ArrowLeft, Terminal, Shield, CheckCircle, AlertTriangle, 
  HelpCircle, Clock, Zap, Award, Sparkles, Send, FileText, 
  RotateCcw, Lock, ChevronRight 
} from 'lucide-react';

interface MissionWorkspaceProps {
  missionId: string;
  onBack: () => void;
  onComplete?: () => void;
}

export const MissionWorkspace: React.FC<MissionWorkspaceProps> = ({
  missionId,
  onBack,
  onComplete,
}) => {
  const { user, language, t } = useAuth();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active lab session
  const [activeLab, setActiveLab] = useState<LabSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(1800);
  const [launchingLab, setLaunchingLab] = useState(false);

  // Submissions state
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState<{
    isCorrect: boolean;
    feedback: string;
    earnedXp: number;
    newBadges?: Badge[];
    certificate?: Certificate;
  } | null>(null);

  // Hints
  const [unlockingHint, setUnlockingHint] = useState<number | null>(null);

  const fetchMissionData = async () => {
    try {
      setLoading(true);
      const data = await api.getMission(missionId);
      setMission(data);

      // Start attempt if authenticated
      if (user) {
        await api.startAttempt(missionId).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load mission');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionData();
  }, [missionId]);

  // Check active lab session if mission requires one
  useEffect(() => {
    if (!user || !mission?.labProfileId) return;

    const checkLab = async () => {
      try {
        const summary = await api.getSummary();
        if (summary.activeLabSession && summary.activeLabSession.missionId === mission.id) {
          const labData = await api.getLab(summary.activeLabSession.id);
          setActiveLab(labData.session);
          setRemainingSeconds(labData.remainingSeconds);
        }
      } catch {}
    };

    checkLab();
  }, [mission, user]);

  // Lab timer countdown
  useEffect(() => {
    if (!activeLab || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setActiveLab(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeLab, remainingSeconds]);

  const handleLaunchLab = async () => {
    if (!user) {
      alert('Please sign in to launch an isolated lab container.');
      return;
    }
    try {
      setLaunchingLab(true);
      const res = await api.launchLab(mission.id);
      setActiveLab(res.session);
      setRemainingSeconds(1800);
    } catch (err: any) {
      alert(err.message || 'Failed to start lab container');
    } finally {
      setLaunchingLab(false);
    }
  };

  const handleTerminateLab = async () => {
    if (!activeLab) return;
    try {
      await api.terminateLab(activeLab.id);
      setActiveLab(null);
    } catch (err: any) {
      alert(err.message || 'Failed to terminate lab');
    }
  };

  const handleUnlockHint = async (hintIndex: number) => {
    try {
      setUnlockingHint(hintIndex);
      const res = await api.unlockHint(mission.id, hintIndex);
      // Update local hints array
      setMission((prev: any) => ({
        ...prev,
        hints: prev.hints.map((h: any) => h.index === hintIndex ? res.hint : h),
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to unlock hint');
    } finally {
      setUnlockingHint(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to submit your solution.');
      return;
    }

    try {
      setSubmitting(true);
      setGradingResult(null);

      const res = await api.submitSolution(mission.id, {
        submissionContent: submissionText,
        sessionId: activeLab?.id,
      });

      setGradingResult(res);
      if (res.isCorrect) {
        setMission((prev: any) => ({ ...prev, isCompleted: true }));
        if (onComplete) onComplete();
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 font-mono text-sm">Provisioning mission briefing & security profile...</p>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="p-6 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-200">
          <h3 className="font-bold text-lg mb-2">Failed to load mission</h3>
          <p className="text-sm mb-4">{error || 'Mission not found'}</p>
          <button onClick={onBack} className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700">
            Back to catalogue
          </button>
        </div>
      </div>
    );
  }

  const title = (language === 'ar' && mission.titleAr) ? mission.titleAr : mission.title;
  const description = (language === 'ar' && mission.descriptionAr) ? mission.descriptionAr : mission.description;
  const taskInstructions = (language === 'ar' && mission.taskInstructionsAr) ? mission.taskInstructionsAr : mission.taskInstructions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-zinc-400 hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Mission Catalogue</span>
        </button>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {mission.isCompleted && (
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/60 text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mission Completed</span>
            </span>
          )}
          <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-amber-400 border border-amber-500/30 font-mono font-bold">
            +{mission.xpReward} XP Bounty
          </span>
        </div>
      </div>

      {/* Mission Title Header */}
      <div className="bg-[#0f1319] border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            {mission.category}
          </span>
          <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${
            mission.difficulty === 'BEGINNER' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' :
            mission.difficulty === 'INTERMEDIATE' ? 'bg-amber-950/60 text-amber-400 border-amber-800' :
            'bg-rose-950/60 text-rose-400 border-rose-800'
          }`}>
            {mission.difficulty}
          </span>
          <span className="text-xs text-zinc-400 flex items-center space-x-1 rtl:space-x-reverse ml-2">
            <Clock className="w-3.5 h-3.5" />
            <span>~{mission.estimatedMinutes} mins</span>
          </span>
          <span className="text-xs text-zinc-400 font-mono ml-auto">
            Submission: <strong className="text-zinc-200">{mission.submissionType}</strong>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mb-2">
          {title}
        </h1>
        <p className="text-zinc-400 text-sm max-w-4xl leading-relaxed">
          {description}
        </p>
      </div>

      {/* Main Workspace Grid (Left: Briefing & Instructions, Right: Lab Terminal & Submission) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Briefing, Objectives, Hints */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Learning Objectives */}
          <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center space-x-2 rtl:space-x-reverse">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{t.workspace.objectives}</span>
            </h3>
            <ul className="space-y-2 text-xs text-zinc-300">
              {mission.learningObjectives?.map((obj: string, i: number) => (
                <li key={i} className="flex items-start space-x-2 rtl:space-x-reverse">
                  <span className="text-emerald-400 mt-0.5 font-bold">&#8227;</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threat Model */}
          {mission.threatModel && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs space-y-1.5">
              <div className="font-semibold text-amber-400 flex items-center space-x-1.5 rtl:space-x-reverse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t.workspace.threatModel}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{mission.threatModel}</p>
            </div>
          )}

          {/* Operational Instructions */}
          <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center space-x-2 rtl:space-x-reverse">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{t.workspace.instructions}</span>
            </h3>
            <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono bg-[#090c10] p-4 rounded-lg border border-zinc-800/80">
              {taskInstructions}
            </div>
          </div>

          {/* Progressive Hints */}
          {mission.hints && mission.hints.length > 0 && (
            <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center space-x-2 rtl:space-x-reverse">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>{t.workspace.hints}</span>
              </h3>
              <div className="space-y-2">
                {mission.hints.map((hint: any) => (
                  <div key={hint.index} className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-zinc-300">
                        Hint #{hint.index}: {hint.title}
                      </span>
                      {!hint.isUnlocked ? (
                        <button
                          onClick={() => handleUnlockHint(hint.index)}
                          disabled={unlockingHint === hint.index}
                          className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 hover:bg-amber-900 transition flex items-center space-x-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>{t.workspace.unlockHint} (-{hint.xpPenalty} XP)</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Unlocked</span>
                      )}
                    </div>
                    {hint.isUnlocked && (
                      <p className="text-zinc-400 mt-2 p-2 bg-black/40 rounded border border-zinc-800 font-mono">
                        {hint.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remediation Guidance */}
          {mission.remediationGuidance && (
            <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5 text-xs space-y-2">
              <h4 className="font-semibold text-emerald-400">{t.workspace.remediation}</h4>
              <p className="text-zinc-400 leading-relaxed">{mission.remediationGuidance}</p>
            </div>
          )}

        </div>

        {/* Right Column: Lab Terminal & Submission Box */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Lab Control Section */}
          {mission.labProfileId ? (
            <div className="space-y-3">
              {!activeLab ? (
                <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-200">
                      Isolated Lab Container Available
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                      A dedicated sandboxed Linux runtime is configured for this mission with live filesystem state and authentic inspection utilities.
                    </p>
                  </div>
                  <button
                    onClick={handleLaunchLab}
                    disabled={launchingLab}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.25)] transition flex items-center space-x-2 rtl:space-x-reverse mx-auto"
                  >
                    {launchingLab ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Spawning Sandbox Container...</span>
                      </span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Launch Isolated Lab Session</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <LabTerminal
                  sessionId={activeLab.id}
                  initialHistory={activeLab.terminalHistory}
                  remainingSeconds={remainingSeconds}
                  onTerminate={handleTerminateLab}
                />
              )}
            </div>
          ) : (
            <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5 text-xs text-zinc-400">
              <span className="text-emerald-400 font-semibold">Analytical Assessment:</span> This exercise evaluates protocol comprehension and threat correlation. Inspect the provided data in the briefing and submit the verified finding.
            </div>
          )}

          {/* Solution Submission Card */}
          <div className="bg-[#0f1319] border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center space-x-2 rtl:space-x-reverse">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>{t.workspace.submitAnswer}</span>
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                Type: {mission.submissionType}
              </span>
            </div>

            {/* Inputs by Submission Type */}
            {mission.submissionType === 'FLAG' && (
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Captured Security Flag</label>
                <input
                  type="text"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder={t.workspace.enterFlag}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg px-4 py-2.5 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {mission.submissionType === 'ANSWER' && (
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Calculated Value / Keyword Solution</label>
                <input
                  type="text"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder={t.workspace.enterAnswer}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg px-4 py-2.5 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {mission.submissionType === 'STRUCTURED_JSON' && (
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Structured JSON Intelligence</label>
                <textarea
                  rows={5}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder={t.workspace.enterJson}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {mission.submissionType === 'REPORT' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Incident Triage Report</span>
                  <span className="font-mono">
                    Words: {submissionText.trim().split(/\s+/).filter(Boolean).length} / 60 min
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder={t.workspace.enterReport}
                  className="w-full bg-[#090c10] border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>
            )}

            {mission.submissionType === 'LAB_STATE' && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs space-y-2">
                <p className="text-zinc-300">
                  This mission validates against the live configuration state of your active container sandbox. Apply your permission changes using the terminal above, then click the verification button below.
                </p>
              </div>
            )}

            {/* Submission Action Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || (mission.submissionType !== 'LAB_STATE' && !submissionText.trim())}
              className="w-full py-2.5 rounded-lg font-bold text-xs bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 transition flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {submitting ? (
                <span>{t.workspace.submitting}</span>
              ) : mission.submissionType === 'LAB_STATE' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.workspace.gradeLabState}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.workspace.submitAnswer}</span>
                </>
              )}
            </button>

            {/* Live Grading Result Card */}
            {gradingResult && (
              <div className={`p-4 rounded-lg border text-xs space-y-3 ${
                gradingResult.isCorrect 
                  ? 'bg-emerald-950/30 border-emerald-600/60 text-emerald-200' 
                  : 'bg-rose-950/30 border-rose-700/60 text-rose-200'
              }`}>
                <div className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-sm">
                  {gradingResult.isCorrect ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Validation Successful! (+{gradingResult.earnedXp} XP Awarded)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Verification Failed</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed font-mono whitespace-pre-wrap">
                  {gradingResult.feedback}
                </p>

                {/* Newly Awarded Badges */}
                {gradingResult.newBadges && gradingResult.newBadges.length > 0 && (
                  <div className="p-3 bg-zinc-900 border border-amber-500/40 rounded-lg space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>New Badge Unlocked!</span>
                    </div>
                    {gradingResult.newBadges.map((b, i) => (
                      <div key={i} className="text-zinc-200 font-semibold">
                        &bull; {b.title} - <span className="text-zinc-400 font-normal">{b.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certificate Issued */}
                {gradingResult.certificate && (
                  <div className="p-3 bg-zinc-900 border border-emerald-500/40 rounded-lg space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                      <Award className="w-4 h-4" />
                      <span>Official Certificate of Completion Issued!</span>
                    </div>
                    <div className="text-zinc-300">
                      Certificate #{gradingResult.certificate.certificateNumber} signed by SidoDev-Dz. Available on your Dashboard.
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
