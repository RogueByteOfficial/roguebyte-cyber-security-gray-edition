import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db/database.ts';
import { User, UserRole } from '../shared/types.ts';

// In production, configure JWT_SECRET in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'roguebyte_master_signing_key_sidodev_2026_isolated_sec';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  exp: number;
}

export function generateToken(user: User): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
  const payload = Buffer.from(JSON.stringify({ userId: user.id, role: user.role, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const decodedPayload: TokenPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return decodedPayload;
  } catch {
    return null;
  }
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  const user = db.getUserById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ error: 'Account suspended. Contact platform administrator.' });
  }

  req.user = user;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      db.createAuditEvent({
        userId: req.user.id,
        username: req.user.username,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        category: 'SECURITY',
        details: `User with role ${req.user.role} attempted to access restricted endpoint requiring [${roles.join(', ')}]`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'WARNING'
      });
      return res.status(403).json({ error: 'Access forbidden. Insufficient privileges.' });
    }
    next();
  };
}
