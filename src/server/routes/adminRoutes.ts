import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.ts';
import { authenticate, requireRole } from '../auth.ts';
import { labManager } from '../lab/labManager.ts';
import { Mission, UserRole } from '../../shared/types.ts';

const router = Router();

// Only ADMIN can access
router.use(authenticate, requireRole('ADMIN'));

// GET /api/v1/admin/users
router.get('/users', (req: Request, res: Response) => {
  const users = db.getUsers().map(({ passwordHash, ...safe }) => safe);
  return res.json(users);
});

// PATCH /api/v1/admin/users/:id
router.patch('/users/:id', (req: Request, res: Response) => {
  const admin = req.user!;
  const targetId = req.params.id;
  const { role, isSuspended } = req.body;

  const updates: any = {};
  if (role !== undefined) updates.role = role as UserRole;
  if (isSuspended !== undefined) updates.isSuspended = Boolean(isSuspended);

  const updated = db.updateUser(targetId, updates);
  if (!updated) return res.status(404).json({ error: 'User not found.' });

  db.createAuditEvent({
    userId: admin.id,
    username: admin.username,
    action: 'USER_MODIFIED_BY_ADMIN',
    category: 'ADMIN',
    details: `Admin updated user ${updated.username} (Role: ${updated.role}, Suspended: ${updated.isSuspended})`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  const { passwordHash, ...safe } = updated;
  return res.json(safe);
});

// POST /api/v1/admin/missions
router.post('/missions', (req: Request, res: Response) => {
  const admin = req.user!;
  const body = req.body;

  if (!body.title || !body.category || !body.difficulty) {
    return res.status(400).json({ error: 'Title, category, and difficulty are required.' });
  }

  const newMission: Mission = {
    id: `m-custom-${crypto.randomUUID().slice(0, 8)}`,
    slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: body.title,
    titleAr: body.titleAr,
    description: body.description || '',
    descriptionAr: body.descriptionAr,
    category: body.category,
    difficulty: body.difficulty,
    xpReward: Number(body.xpReward) || 100,
    estimatedMinutes: Number(body.estimatedMinutes) || 20,
    prerequisites: Array.isArray(body.prerequisites) ? body.prerequisites : [],
    submissionType: body.submissionType || 'FLAG',
    labProfileId: body.labProfileId,
    learningObjectives: Array.isArray(body.learningObjectives) ? body.learningObjectives : ['Analyze system state'],
    threatModel: body.threatModel || '',
    taskInstructions: body.taskInstructions || '',
    taskInstructionsAr: body.taskInstructionsAr,
    hints: Array.isArray(body.hints) ? body.hints : [],
    validationRules: body.validationRules || {},
    remediationGuidance: body.remediationGuidance || '',
    isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
    author: admin.username,
    createdAt: new Date().toISOString(),
  };

  db.saveMission(newMission);

  db.createAuditEvent({
    userId: admin.id,
    username: admin.username,
    action: 'MISSION_CREATED',
    category: 'ADMIN',
    details: `Created new mission: ${newMission.title} (${newMission.id})`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  return res.status(201).json(newMission);
});

// PUT /api/v1/admin/missions/:id
router.put('/missions/:id', (req: Request, res: Response) => {
  const admin = req.user!;
  const existing = db.getMissionById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Mission not found.' });

  const updated: Mission = {
    ...existing,
    ...req.body,
    id: existing.id, // Immutable ID
  };

  db.saveMission(updated);

  db.createAuditEvent({
    userId: admin.id,
    username: admin.username,
    action: 'MISSION_UPDATED',
    category: 'ADMIN',
    details: `Updated mission: ${updated.title} (${updated.id})`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  return res.json(updated);
});

// DELETE /api/v1/admin/missions/:id
router.delete('/missions/:id', (req: Request, res: Response) => {
  const admin = req.user!;
  const deleted = db.deleteMission(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Mission not found.' });

  db.createAuditEvent({
    userId: admin.id,
    username: admin.username,
    action: 'MISSION_DELETED',
    category: 'ADMIN',
    details: `Deleted mission ID ${req.params.id}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  return res.json({ message: 'Mission deleted successfully.' });
});

// GET /api/v1/admin/labs
router.get('/labs', (req: Request, res: Response) => {
  const sessions = db.getLabSessions();
  const users = db.getUsers();
  const missions = db.getMissions();

  const enriched = sessions.map(s => {
    const user = users.find(u => u.id === s.userId);
    const mission = missions.find(m => m.id === s.missionId);
    return {
      ...s,
      username: user?.username || 'Unknown',
      missionTitle: mission?.title || 'Unknown',
    };
  });

  return res.json(enriched);
});

// POST /api/v1/admin/labs/:id/terminate
router.post('/labs/:id/terminate', (req: Request, res: Response) => {
  const admin = req.user!;
  try {
    labManager.terminateLab(req.params.id, admin.id);
    return res.json({ message: 'Lab terminated by administrator.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/v1/admin/audit-logs
router.get('/audit-logs', (req: Request, res: Response) => {
  const category = req.query.category as string;
  const status = req.query.status as string;

  let logs = db.getAuditEvents();
  if (category) logs = logs.filter(l => l.category === category);
  if (status) logs = logs.filter(l => l.status === status);

  return res.json(logs);
});

// GET /api/v1/admin/stats
router.get('/stats', (req: Request, res: Response) => {
  const users = db.getUsers();
  const missions = db.getMissions();
  const attempts = db.getAttempts();
  const submissions = db.getSubmissions();
  const sessions = db.getLabSessions();

  const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
  const activeLabs = sessions.filter(s => s.status === 'RUNNING');
  const totalXpAwarded = users.reduce((acc, u) => acc + u.xp, 0);

  return res.json({
    totalUsers: users.length,
    studentsCount: users.filter(u => u.role === 'STUDENT').length,
    instructorsCount: users.filter(u => u.role === 'INSTRUCTOR').length,
    totalMissions: missions.length,
    totalAttempts: attempts.length,
    completedMissionsCount: completedAttempts.length,
    activeLabsCount: activeLabs.length,
    totalSubmissions: submissions.length,
    passRatePercentage: submissions.length > 0 
      ? Math.round((submissions.filter(s => s.isCorrect).length / submissions.length) * 100) 
      : 0,
    totalXpAwarded,
  });
});

// GET /api/v1/admin/settings
router.get('/settings', (req: Request, res: Response) => {
  return res.json(db.getSettings());
});

// PATCH /api/v1/admin/settings
router.patch('/settings', (req: Request, res: Response) => {
  const admin = req.user!;
  const updated = db.updateSettings(req.body);

  db.createAuditEvent({
    userId: admin.id,
    username: admin.username,
    action: 'SYSTEM_SETTINGS_UPDATED',
    category: 'ADMIN',
    details: `Admin updated system settings: MaintenanceMode=${updated.maintenanceMode}, RegistrationOpen=${updated.registrationOpen}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });

  return res.json(updated);
});

// GET /api/v1/admin/export/:type - Authentic CSV export
router.get('/export/:type', (req: Request, res: Response) => {
  const type = req.params.type;

  if (type === 'users') {
    const users = db.getUsers();
    let csv = 'ID,Username,Email,Role,XP,Rank,Suspended,Created_At\n';
    for (const u of users) {
      csv += `"${u.id}","${u.username}","${u.email}","${u.role}",${u.xp},"${u.currentRank}",${u.isSuspended},"${u.createdAt}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=roguebyte_users.csv');
    return res.send(csv);
  }

  if (type === 'audit-logs') {
    const logs = db.getAuditEvents();
    let csv = 'ID,Timestamp,User,Category,Action,Status,IP,Details\n';
    for (const l of logs) {
      csv += `"${l.id}","${l.timestamp}","${l.username || 'System'}","${l.category}","${l.action}","${l.status}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=roguebyte_audit_logs.csv');
    return res.send(csv);
  }

  if (type === 'missions') {
    const missions = db.getMissions();
    let csv = 'ID,Slug,Title,Category,Difficulty,XP,Estimated_Minutes,Submission_Type\n';
    for (const m of missions) {
      csv += `"${m.id}","${m.slug}","${m.title}","${m.category}","${m.difficulty}",${m.xpReward},${m.estimatedMinutes},"${m.submissionType}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=roguebyte_missions.csv');
    return res.send(csv);
  }

  return res.status(400).json({ error: 'Unknown export type. Choose users, audit-logs, or missions.' });
});

export default router;
