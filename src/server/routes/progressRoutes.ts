import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate } from '../auth.ts';

const router = Router();

// GET /api/v1/progress/summary
router.get('/summary', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const allMissions = db.getMissions();
  const attempts = db.getUserAttempts(user.id);
  const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
  const completedMissionIds = new Set(completedAttempts.map(a => a.missionId));

  const categories = ['LINUX', 'NETWORKING', 'WEB_SECURITY', 'DEFENSIVE'] as const;
  const categoryStats = categories.map(cat => {
    const catMissions = allMissions.filter(m => m.category === cat);
    const catCompleted = catMissions.filter(m => completedMissionIds.has(m.id)).length;
    return {
      category: cat,
      total: catMissions.length,
      completed: catCompleted,
      percentage: catMissions.length > 0 ? Math.round((catCompleted / catMissions.length) * 100) : 0,
    };
  });

  const earnedBadges = db.getUserBadges(user.id);
  const certificates = db.getCertificatesByUser(user.id);
  const activeLab = db.getActiveLabSessionByUser(user.id);

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      xp: user.xp,
      currentRank: user.currentRank,
      createdAt: user.createdAt,
    },
    totalMissionsCount: allMissions.length,
    completedMissionsCount: completedMissionIds.size,
    completionPercentage: Math.round((completedMissionIds.size / allMissions.length) * 100),
    categoryStats,
    earnedBadges,
    certificates,
    activeLabSession: activeLab ? {
      id: activeLab.id,
      missionId: activeLab.missionId,
      expiresAt: activeLab.expiresAt,
    } : null,
  });
});

// GET /api/v1/progress/leaderboard
router.get('/leaderboard', (req: Request, res: Response) => {
  const users = db.getUsers().filter(u => !u.isSuspended);
  const sorted = users
    .map(u => {
      const attempts = db.getUserAttempts(u.id);
      const completedCount = new Set(attempts.filter(a => a.status === 'COMPLETED').map(a => a.missionId)).size;
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        xp: u.xp,
        currentRank: u.currentRank,
        completedMissions: completedCount,
        joinedAt: u.createdAt,
      };
    })
    .sort((a, b) => b.xp - a.xp);

  return res.json(sorted);
});

// GET /api/v1/progress/badges
router.get('/badges', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const allBadges = db.getBadges();
  const userBadges = db.getUserBadges(user.id);
  const earnedMap = new Map(userBadges.map(ub => [ub.badge.id, ub.awardedAt]));

  const result = allBadges.map(b => ({
    ...b,
    isEarned: earnedMap.has(b.id),
    awardedAt: earnedMap.get(b.id) || null,
  }));

  return res.json(result);
});

// GET /api/v1/progress/certificates
router.get('/certificates', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const certs = db.getCertificatesByUser(user.id);
  return res.json(certs);
});

// GET /api/v1/progress/certificates/verify/:identifier
router.get('/certificates/verify/:identifier', (req: Request, res: Response) => {
  const cert = db.getCertificateById(req.params.identifier);
  if (!cert) {
    return res.status(404).json({ valid: false, error: 'Certificate not found in RogueByte cryptographic registry.' });
  }

  return res.json({
    valid: true,
    certificate: cert,
    issuer: 'RogueByte Cyber Lab (SidoDev-Dz)',
  });
});

export default router;
