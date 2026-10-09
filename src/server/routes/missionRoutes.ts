import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.ts';
import { authenticate } from '../auth.ts';
import { labManager } from '../lab/labManager.ts';
import { MissionAttempt, Submission } from '../../shared/types.ts';

const router = Router();

// GET /api/v1/missions (public or authenticated)
router.get('/', (req: Request, res: Response) => {
  const missions = db.getMissions().filter(m => m.isPublished);

  const authHeader = req.headers.authorization;
  let userId: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
      userId = payload.userId;
    } catch {}
  }

  const category = req.query.category as string;
  const difficulty = req.query.difficulty as string;
  const search = (req.query.search as string || '').toLowerCase();

  let filtered = missions;
  if (category) filtered = filtered.filter(m => m.category === category);
  if (difficulty) filtered = filtered.filter(m => m.difficulty === difficulty);
  if (search) {
    filtered = filtered.filter(m => 
      m.title.toLowerCase().includes(search) || 
      m.description.toLowerCase().includes(search) ||
      (m.titleAr && m.titleAr.includes(search))
    );
  }

  const userAttempts = userId ? db.getUserAttempts(userId) : [];
  const completedMissionIds = new Set(userAttempts.filter(a => a.status === 'COMPLETED').map(a => a.missionId));

  const responseMissions = filtered.map(m => {
    // Hide answers and sensitive validation rules from list view
    const { validationRules, ...safeMission } = m;
    return {
      ...safeMission,
      isCompleted: completedMissionIds.has(m.id),
      hasPrerequisitesMet: m.prerequisites.every(p => completedMissionIds.has(p)),
    };
  });

  return res.json(responseMissions);
});

// GET /api/v1/missions/:id
router.get('/:id', (req: Request, res: Response) => {
  const mission = db.getMissionById(req.params.id);
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found.' });
  }

  const authHeader = req.headers.authorization;
  let userId: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
      userId = payload.userId;
    } catch {}
  }

  let attempt: MissionAttempt | undefined;
  let isCompleted = false;
  let prerequisitesMet = true;

  if (userId) {
    const userAttempts = db.getUserAttempts(userId);
    const completedIds = new Set(userAttempts.filter(a => a.status === 'COMPLETED').map(a => a.missionId));
    isCompleted = completedIds.has(mission.id);
    prerequisitesMet = mission.prerequisites.every(p => completedIds.has(p));
    attempt = db.getActiveAttempt(userId, mission.id) || db.getCompletedAttempt(userId, mission.id);
  }

  // Do not expose sensitive validation answer keys directly to client
  const { validationRules, ...safeMission } = mission;

  return res.json({
    ...safeMission,
    isCompleted,
    prerequisitesMet,
    activeAttempt: attempt,
    hints: mission.hints.map(h => ({
      index: h.index,
      title: h.title,
      xpPenalty: h.xpPenalty,
      // Only show hint content if already used in attempt
      content: attempt?.hintsUsed.includes(h.index) ? h.content : undefined,
      isUnlocked: attempt?.hintsUsed.includes(h.index) || false,
    }))
  });
});

// POST /api/v1/missions/:id/attempts - Start or resume attempt
router.post('/:id/attempts', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const mission = db.getMissionById(req.params.id);
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found.' });
  }

  // Check prerequisites
  const userAttempts = db.getUserAttempts(user.id);
  const completedIds = new Set(userAttempts.filter(a => a.status === 'COMPLETED').map(a => a.missionId));
  const missingPrereqs = mission.prerequisites.filter(p => !completedIds.has(p));
  if (missingPrereqs.length > 0) {
    return res.status(400).json({ 
      error: 'Mission prerequisites not met. You must complete earlier missions first.',
      missingPrerequisites: missingPrereqs,
    });
  }

  let activeAttempt = db.getActiveAttempt(user.id, mission.id);
  if (!activeAttempt) {
    activeAttempt = {
      id: `att-${crypto.randomUUID().slice(0, 10)}`,
      missionId: mission.id,
      userId: user.id,
      startedAt: new Date().toISOString(),
      status: 'IN_PROGRESS',
      earnedXp: 0,
      hintsUsed: [],
      submissionsCount: 0,
    };
    db.createAttempt(activeAttempt);

    db.createAuditEvent({
      userId: user.id,
      username: user.username,
      action: 'MISSION_ATTEMPT_STARTED',
      category: 'MISSION',
      details: `Started mission: ${mission.title} (${mission.category} - ${mission.difficulty})`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS'
    });
  }

  return res.json({ attempt: activeAttempt });
});

// POST /api/v1/missions/:id/hints/:hintIndex - Unlock hint
router.post('/:id/hints/:hintIndex', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const mission = db.getMissionById(req.params.id);
  if (!mission) return res.status(404).json({ error: 'Mission not found.' });

  const hintIdx = parseInt(req.params.hintIndex, 10);
  const hint = mission.hints.find(h => h.index === hintIdx);
  if (!hint) return res.status(404).json({ error: 'Hint not found.' });

  let attempt = db.getActiveAttempt(user.id, mission.id);
  if (!attempt) {
    attempt = {
      id: `att-${crypto.randomUUID().slice(0, 10)}`,
      missionId: mission.id,
      userId: user.id,
      startedAt: new Date().toISOString(),
      status: 'IN_PROGRESS',
      earnedXp: 0,
      hintsUsed: [],
      submissionsCount: 0,
    };
    db.createAttempt(attempt);
  }

  if (!attempt.hintsUsed.includes(hintIdx)) {
    attempt.hintsUsed.push(hintIdx);
    db.updateAttempt(attempt.id, { hintsUsed: attempt.hintsUsed });

    db.createAuditEvent({
      userId: user.id,
      username: user.username,
      action: 'HINT_UNLOCKED',
      category: 'MISSION',
      details: `Unlocked hint #${hintIdx} for ${mission.title} (-${hint.xpPenalty} XP penalty)`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS'
    });
  }

  return res.json({
    hint: {
      index: hint.index,
      title: hint.title,
      content: hint.content,
      xpPenalty: hint.xpPenalty,
      isUnlocked: true,
    },
    hintsUsed: attempt.hintsUsed
  });
});

// POST /api/v1/missions/:id/submit - Grade submission on the backend!
router.post('/:id/submit', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const mission = db.getMissionById(req.params.id);
  if (!mission) return res.status(404).json({ error: 'Mission not found.' });

  const { submissionContent, sessionId } = req.body;

  let attempt = db.getActiveAttempt(user.id, mission.id);
  if (!attempt) {
    // If completed already or first submit
    attempt = db.getCompletedAttempt(user.id, mission.id);
    if (!attempt) {
      attempt = {
        id: `att-${crypto.randomUUID().slice(0, 10)}`,
        missionId: mission.id,
        userId: user.id,
        startedAt: new Date().toISOString(),
        status: 'IN_PROGRESS',
        earnedXp: 0,
        hintsUsed: [],
        submissionsCount: 0,
      };
      db.createAttempt(attempt);
    }
  }

  attempt.submissionsCount += 1;
  db.updateAttempt(attempt.id, { submissionsCount: attempt.submissionsCount });

  let isCorrect = false;
  let feedback = '';

  // Rigorous backend grading per mission type
  switch (mission.submissionType) {
    case 'FLAG': {
      const cleanSubmit = (submissionContent || '').trim();
      const expectedFlag = mission.validationRules.expectedFlag;
      if (cleanSubmit === expectedFlag) {
        isCorrect = true;
        feedback = 'Success! Correct flag validated. Security objective completed.';
      } else {
        isCorrect = false;
        feedback = 'Incorrect flag. Please inspect your evidence carefully and try again.';
      }
      break;
    }

    case 'ANSWER': {
      const cleanSubmit = (submissionContent || '').trim().toLowerCase();
      const expected = (mission.validationRules.expectedAnswer || '').toLowerCase();
      const accepted = (mission.validationRules.acceptedAnswers || []).map(a => a.toLowerCase());

      if (cleanSubmit === expected || accepted.includes(cleanSubmit)) {
        isCorrect = true;
        feedback = 'Accurate analysis! Your answer matches the verified criteria.';
      } else {
        isCorrect = false;
        feedback = 'Answer did not match the expected solution. Check your calculations or configuration syntax.';
      }
      break;
    }

    case 'LAB_STATE': {
      const checkId = mission.validationRules.labStateCheckId;
      if (!checkId) {
        return res.status(500).json({ error: 'Lab state validation configuration error.' });
      }

      // Check against current active lab session
      const activeLab = sessionId 
        ? db.getLabSessionById(sessionId) 
        : db.getActiveLabSessionByUser(user.id);

      if (!activeLab) {
        return res.status(400).json({ 
          error: 'No active lab session found. Please launch the lab terminal first and perform the required changes.' 
        });
      }

      const checkResult = labManager.gradeLabState(activeLab.id, checkId);
      isCorrect = checkResult.success;
      feedback = checkResult.feedback;
      break;
    }

    case 'STRUCTURED_JSON': {
      try {
        const parsed = typeof submissionContent === 'string' ? JSON.parse(submissionContent) : submissionContent;
        const requiredKeys = mission.validationRules.jsonSchemaRequiredKeys || [];
        const missingKeys = requiredKeys.filter(k => !(k in parsed));

        if (missingKeys.length > 0) {
          isCorrect = false;
          feedback = `Missing required JSON fields: ${missingKeys.join(', ')}`;
        } else {
          // Check key values for SIEM exercise
          if (parsed.c2_url && String(parsed.c2_url).includes('c2.roguebyte.lab')) {
            isCorrect = true;
            feedback = 'Excellent threat intelligence triage! Structured IOCs decoded and verified.';
          } else {
            isCorrect = false;
            feedback = 'JSON structure is valid, but the extracted C2 URL or indicators appear incorrect.';
          }
        }
      } catch {
        isCorrect = false;
        feedback = 'Invalid JSON syntax. Ensure valid quotation and formatting.';
      }
      break;
    }

    case 'REPORT': {
      const text = String(submissionContent || '').trim();
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const lower = text.toLowerCase();
      const hasExecSummary = lower.includes('executive summary');
      const hasRootCause = lower.includes('root cause');
      const hasContainment = lower.includes('containment');
      const hasHardening = lower.includes('hardening') || lower.includes('remediation');

      if (wordCount < 60) {
        isCorrect = false;
        feedback = `Incident report too brief (${wordCount} words). Minimum 60 words required with thorough triage findings.`;
      } else if (!hasExecSummary || !hasRootCause || !hasContainment || !hasHardening) {
        isCorrect = false;
        feedback = 'Incident report must include sections: [Executive Summary], [Root Cause], [Containment], and [Hardening].';
      } else {
        isCorrect = true;
        feedback = 'Comprehensive incident triage report accepted! Detailed technical and executive synthesis commended.';
      }
      break;
    }

    default: {
      isCorrect = false;
      feedback = 'Unsupported submission format.';
    }
  }

  // Calculate XP with penalties
  let totalPenalty = 0;
  for (const hIndex of attempt.hintsUsed) {
    const hObj = mission.hints.find(h => h.index === hIndex);
    if (hObj) totalPenalty += hObj.xpPenalty;
  }
  const earnedXp = isCorrect ? Math.max(20, mission.xpReward - totalPenalty) : 0;

  // Record submission in database
  const subRecord: Submission = {
    id: `sub-${crypto.randomUUID().slice(0, 10)}`,
    attemptId: attempt.id,
    missionId: mission.id,
    userId: user.id,
    submissionType: mission.submissionType,
    content: typeof submissionContent === 'object' ? JSON.stringify(submissionContent) : String(submissionContent || ''),
    submittedAt: new Date().toISOString(),
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback,
  };
  db.createSubmission(subRecord);

  let newBadges: any[] = [];
  let certificate: any = undefined;
  let updatedUser = user;

  if (isCorrect) {
    const rewardResult = db.completeMissionAndAwardXp(user.id, mission.id, earnedXp, attempt.id);
    updatedUser = rewardResult.user;
    newBadges = rewardResult.newBadges;
    certificate = rewardResult.certificate;

    db.createAuditEvent({
      userId: user.id,
      username: user.username,
      action: 'MISSION_COMPLETED',
      category: 'MISSION',
      details: `Completed mission ${mission.title} (+${earnedXp} XP awarded)`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS'
    });
  } else {
    db.createAuditEvent({
      userId: user.id,
      username: user.username,
      action: 'MISSION_SUBMISSION_FAILED',
      category: 'MISSION',
      details: `Failed submission for mission ${mission.title}`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'WARNING'
    });
  }

  return res.json({
    isCorrect,
    feedback,
    earnedXp,
    newBadges,
    certificate,
    user: {
      xp: updatedUser.xp,
      currentRank: updatedUser.currentRank,
    }
  });
});

export default router;
