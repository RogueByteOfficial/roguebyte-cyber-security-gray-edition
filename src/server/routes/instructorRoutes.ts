import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.ts';
import { authenticate, requireRole } from '../auth.ts';
import { Assignment } from '../../shared/types.ts';

const router = Router();

// Only INSTRUCTOR or ADMIN can access instructor endpoints
router.use(authenticate, requireRole('INSTRUCTOR', 'ADMIN'));

// GET /api/v1/instructor/assignments
router.get('/assignments', (req: Request, res: Response) => {
  const assignments = db.getAssignments();
  return res.json(assignments);
});

// POST /api/v1/instructor/assignments
router.post('/assignments', (req: Request, res: Response) => {
  const user = req.user!;
  const { title, description, missionIds, targetGroup, dueDate } = req.body;

  if (!title || !missionIds || !Array.isArray(missionIds)) {
    return res.status(400).json({ error: 'Title and missionIds array are required.' });
  }

  const asg: Assignment = {
    id: `asg-${crypto.randomUUID().slice(0, 10)}`,
    title,
    description: description || '',
    missionIds,
    targetGroup: targetGroup || 'General Cohort',
    dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
    createdById: user.id,
    createdAt: new Date().toISOString(),
  };

  db.createAssignment(asg);

  db.createAuditEvent({
    userId: user.id,
    username: user.username,
    action: 'ASSIGNMENT_CREATED',
    category: 'ADMIN',
    details: `Instructor created assignment: ${asg.title} (${asg.missionIds.length} missions)`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  return res.status(201).json(asg);
});

// GET /api/v1/instructor/cohort-analytics
router.get('/cohort-analytics', (req: Request, res: Response) => {
  const students = db.getUsers().filter(u => u.role === 'STUDENT');
  const allMissions = db.getMissions();
  const attempts = db.getAttempts();

  const studentMetrics = students.map(st => {
    const stAttempts = attempts.filter(a => a.userId === st.id);
    const completedMissions = stAttempts.filter(a => a.status === 'COMPLETED');
    const completedCount = new Set(completedMissions.map(a => a.missionId)).size;

    return {
      id: st.id,
      username: st.username,
      email: st.email,
      xp: st.xp,
      currentRank: st.currentRank,
      completedMissionsCount: completedCount,
      completionRate: Math.round((completedCount / allMissions.length) * 100),
      lastActive: st.lastLoginAt || st.createdAt,
    };
  });

  return res.json({
    totalStudents: students.length,
    students: studentMetrics,
  });
});

// GET /api/v1/instructor/submissions
router.get('/submissions', (req: Request, res: Response) => {
  const allSubmissions = db.getSubmissions();
  const missions = db.getMissions();
  const users = db.getUsers();

  const enriched = allSubmissions.slice(0, 50).map(sub => {
    const mission = missions.find(m => m.id === sub.missionId);
    const student = users.find(u => u.id === sub.userId);
    return {
      ...sub,
      missionTitle: mission?.title || 'Unknown Mission',
      category: mission?.category,
      studentUsername: student?.username || 'Unknown Student',
    };
  });

  return res.json(enriched);
});

// POST /api/v1/instructor/submissions/:id/review
router.post('/submissions/:id/review', (req: Request, res: Response) => {
  const user = req.user!;
  const { isCorrect, score, feedback } = req.body;

  const submission = db.updateSubmission(req.params.id, {
    isCorrect: Boolean(isCorrect),
    score: Number(score) || 0,
    feedback: String(feedback || 'Reviewed by instructor'),
    reviewedBy: user.username,
  });

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  // If marked correct, check if we should complete the mission attempt
  if (isCorrect) {
    const attempt = db.getAttemptById(submission.attemptId);
    if (attempt && attempt.status !== 'COMPLETED') {
      const mission = db.getMissionById(submission.missionId);
      const earnedXp = mission ? mission.xpReward : 50;
      db.completeMissionAndAwardXp(submission.userId, submission.missionId, earnedXp, attempt.id);
    }
  }

  db.createAuditEvent({
    userId: user.id,
    username: user.username,
    action: 'SUBMISSION_REVIEWED',
    category: 'ADMIN',
    details: `Instructor reviewed submission ${submission.id} (Score: ${score}, Correct: ${isCorrect})`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  return res.json(submission);
});

export default router;
