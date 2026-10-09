import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { db, hashPassword, verifyPassword } from '../db/database.ts';
import { generateToken, authenticate } from '../auth.ts';
import { User, UserRole } from '../../shared/types.ts';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username must be alphanumeric with dashes or underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).optional().default('STUDENT'),
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/v1/auth/register
router.post('/register', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    if (!settings.registrationOpen) {
      return res.status(403).json({ error: 'Public registration is currently closed by the administrator.' });
    }

    const validated = registerSchema.parse(req.body);

    // Check existing
    if (db.getUserByEmail(validated.email)) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }
    if (db.getUserByUsername(validated.username)) {
      return res.status(409).json({ error: 'This username is already taken.' });
    }

    const newUser: User = {
      id: `usr-${crypto.randomUUID().slice(0, 10)}`,
      email: validated.email.toLowerCase(),
      username: validated.username,
      passwordHash: hashPassword(validated.password),
      role: validated.role as UserRole,
      isSuspended: false,
      avatarUrl: '',
      currentRank: validated.role === 'INSTRUCTOR' ? 'Cyber Instructor' : 'Cyber Apprentice',
      xp: 0,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    db.createAuditEvent({
      userId: newUser.id,
      username: newUser.username,
      action: 'USER_REGISTERED',
      category: 'AUTH',
      details: `New account registered: ${newUser.username} (${newUser.role})`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS'
    });

    const token = generateToken(newUser);
    const { passwordHash, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = (err as any).issues?.[0]?.message || 'Validation error';
      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/v1/auth/login
router.post('/login', (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const identifier = validated.emailOrUsername.trim();

    let user = db.getUserByEmail(identifier) || db.getUserByUsername(identifier);

    if (!user) {
      db.createAuditEvent({
        action: 'FAILED_LOGIN_UNKNOWN_USER',
        category: 'AUTH',
        details: `Failed login attempt for nonexistent user identifier: ${identifier}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'WARNING'
      });
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    if (user.isSuspended) {
      db.createAuditEvent({
        userId: user.id,
        username: user.username,
        action: 'SUSPENDED_LOGIN_ATTEMPT',
        category: 'AUTH',
        details: `Suspended user ${user.username} attempted to authenticate`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'FAILURE'
      });
      return res.status(403).json({ error: 'This account has been suspended by the administrator.' });
    }

    const isValid = verifyPassword(validated.password, user.passwordHash);
    if (!isValid) {
      db.createAuditEvent({
        userId: user.id,
        username: user.username,
        action: 'FAILED_LOGIN_BAD_PASSWORD',
        category: 'AUTH',
        details: `Incorrect password attempt for user ${user.username}`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'WARNING'
      });
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    // Update last login
    user = db.updateUser(user.id, { lastLoginAt: new Date().toISOString() })!;

    db.createAuditEvent({
      userId: user.id,
      username: user.username,
      action: 'USER_LOGIN_SUCCESS',
      category: 'AUTH',
      details: `User ${user.username} authenticated successfully (${user.role})`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS'
    });

    const token = generateToken(user);
    const { passwordHash, ...safeUser } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      const msg = (err as any).issues?.[0]?.message || 'Validation error';
      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const userAttempts = db.getUserAttempts(user.id);
  const completedCount = new Set(userAttempts.filter(a => a.status === 'COMPLETED').map(a => a.missionId)).size;
  const badges = db.getUserBadges(user.id);

  const { passwordHash, ...safeUser } = user;
  return res.json({
    user: safeUser,
    stats: {
      completedMissionsCount: completedCount,
      badgesCount: badges.length,
    }
  });
});

// POST /api/v1/auth/logout
router.post('/logout', authenticate, (req: Request, res: Response) => {
  db.createAuditEvent({
    userId: req.user?.id,
    username: req.user?.username,
    action: 'USER_LOGOUT',
    category: 'AUTH',
    details: `User ${req.user?.username} logged out.`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS'
  });
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
