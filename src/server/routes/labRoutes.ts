import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate } from '../auth.ts';
import { labManager } from '../lab/labManager.ts';

const router = Router();

// POST /api/v1/lab-sessions/missions/:id/launch
router.post('/missions/:id/launch', authenticate, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const missionId = req.params.id;
    const ip = req.ip || '127.0.0.1';

    const { session, message } = labManager.launchLab(user.id, missionId, ip);
    return res.status(201).json({ session, message });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to initialize lab session.' });
  }
});

// GET /api/v1/lab-sessions/:id
router.get('/:id', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const session = db.getLabSessionById(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Lab session not found.' });
  }

  if (session.userId !== user.id && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized to view this lab session.' });
  }

  const profile = db.getLabProfileById(session.profileId);
  const remainingSeconds = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));

  return res.json({
    session,
    profile,
    remainingSeconds,
  });
});

// POST /api/v1/lab-sessions/:id/exec
router.post('/:id/exec', authenticate, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { command } = req.body;
    if (typeof command !== 'string') {
      return res.status(400).json({ error: 'Command must be a string.' });
    }

    const result = labManager.executeCommand(req.params.id, user.id, command);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Execution failed.' });
  }
});

// POST /api/v1/lab-sessions/:id/terminate
router.post('/:id/terminate', authenticate, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    labManager.terminateLab(req.params.id, user.id);
    return res.json({ message: 'Lab session successfully terminated and isolated resources released.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Termination failed.' });
  }
});

// POST /api/v1/lab-sessions/:id/grade
router.post('/:id/grade', authenticate, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { checkId } = req.body;
    const session = db.getLabSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Lab session not found.' });

    if (session.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const result = labManager.gradeLabState(session.id, checkId);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Grading failed.' });
  }
});

export default router;
