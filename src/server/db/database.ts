import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { 
  User, Mission, LabProfile, LabSession, MissionAttempt, 
  Submission, Badge, UserBadge, Certificate, AuditEvent, 
  Assignment, SystemSettings 
} from '../../shared/types.ts';
import { INITIAL_MISSIONS, INITIAL_LAB_PROFILES, INITIAL_BADGES } from './seedData.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'roguebyte_db.json');

export interface DatabaseSchema {
  users: User[];
  missions: Mission[];
  labProfiles: LabProfile[];
  labSessions: LabSession[];
  attempts: MissionAttempt[];
  submissions: Submission[];
  userBadges: UserBadge[];
  certificates: Certificate[];
  auditEvents: AuditEvent[];
  assignments: Assignment[];
  settings: SystemSettings;
}

// Password hashing helper using crypto scrypt (secure, built-in)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, originalHash] = combinedHash.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    missions: [],
    labProfiles: [],
    labSessions: [],
    attempts: [],
    submissions: [],
    userBadges: [],
    certificates: [],
    auditEvents: [],
    assignments: [],
    settings: {
      maintenanceMode: false,
      maxConcurrentLabsPerUser: 1,
      defaultLabTimeoutMinutes: 30,
      registrationOpen: true,
      strictRateLimiting: false,
    }
  };

  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.persist();
      }
      this.initialized = true;
    } catch (err) {
      console.error('[DB] Error initializing database file, recreating initial seed:', err);
      this.seedInitialData();
      this.persist();
      this.initialized = true;
    }
  }

  public persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to persist data:', err);
    }
  }

  public seedInitialData() {
    this.data.missions = [...INITIAL_MISSIONS];
    this.data.labProfiles = [...INITIAL_LAB_PROFILES];

    // Seed default administrative, instructor, and student accounts
    const initialUsers: User[] = [
      {
        id: 'usr-admin-01',
        email: 'admin@roguebyte.local',
        username: 'SidoDev-Dz',
        passwordHash: hashPassword('AdminSidoDev2026!'),
        role: 'ADMIN',
        isSuspended: false,
        avatarUrl: '',
        currentRank: 'Principal Cyber Architect',
        xp: 3500,
        createdAt: '2026-10-09T00:00:00Z',
      },
      {
        id: 'usr-instructor-01',
        email: 'instructor@roguebyte.local',
        username: 'Instructor_Malik',
        passwordHash: hashPassword('InstructorPass2026!'),
        role: 'INSTRUCTOR',
        isSuspended: false,
        avatarUrl: '',
        currentRank: 'Senior Cyber Instructor',
        xp: 1800,
        createdAt: '2026-10-09T00:00:00Z',
      },
      {
        id: 'usr-student-01',
        email: 'student@roguebyte.local',
        username: 'Cadet_Alex',
        passwordHash: hashPassword('StudentPass2026!'),
        role: 'STUDENT',
        isSuspended: false,
        avatarUrl: '',
        currentRank: 'Cyber Apprentice',
        xp: 100,
        createdAt: '2026-10-09T00:00:00Z',
      }
    ];

    this.data.users = initialUsers;

    // Seed sample audit log
    this.data.auditEvents = [
      {
        id: 'audit-boot-01',
        timestamp: new Date().toISOString(),
        userId: 'usr-admin-01',
        username: 'SidoDev-Dz',
        action: 'SYSTEM_BOOTSTRAP',
        category: 'ADMIN',
        details: 'RogueByte Cyber Lab initialized with 16 functional training missions and 6 isolated lab profiles.',
        ipAddress: '127.0.0.1',
        status: 'SUCCESS'
      }
    ];

    // Seed sample assignment
    this.data.assignments = [
      {
        id: 'asg-core-01',
        title: 'Cohort Week 1: Linux & Network Forensics Essentials',
        description: 'Complete the Linux file inspection mission and the network packet analysis lab.',
        missionIds: ['m-linux-01', 'm-linux-02', 'm-net-02'],
        targetGroup: 'Beginner Cohort 2026',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        createdById: 'usr-instructor-01',
        createdAt: new Date().toISOString()
      }
    ];

    // Seed badge for cadet student
    this.data.userBadges = [
      {
        id: 'ub-01',
        userId: 'usr-student-01',
        badgeId: 'badge-first-blood',
        awardedAt: '2026-10-09T01:00:00Z'
      }
    ];

    // Mark mission 1 as completed for cadet student
    this.data.attempts = [
      {
        id: 'att-seed-01',
        missionId: 'm-linux-01',
        userId: 'usr-student-01',
        startedAt: '2026-10-09T00:50:00Z',
        completedAt: '2026-10-09T01:00:00Z',
        status: 'COMPLETED',
        earnedXp: 100,
        hintsUsed: [],
        submissionsCount: 1,
      }
    ];

    this.data.submissions = [
      {
        id: 'sub-seed-01',
        attemptId: 'att-seed-01',
        missionId: 'm-linux-01',
        userId: 'usr-student-01',
        submissionType: 'FLAG',
        content: 'ROGUE{su1d_p3rm1ss10n_3xp0s3d_2026}',
        submittedAt: '2026-10-09T01:00:00Z',
        isCorrect: true,
        score: 100,
        feedback: 'Flag verified successfully! File permissions properly investigated.',
      }
    ];
  }

  // --- USER METHODS ---
  public getUsers(): User[] {
    return [...this.data.users];
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByUsername(username: string): User | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // --- MISSION METHODS ---
  public getMissions(): Mission[] {
    return [...this.data.missions];
  }

  public getMissionById(id: string): Mission | undefined {
    return this.data.missions.find(m => m.id === id || m.slug === id);
  }

  public saveMission(mission: Mission): Mission {
    const idx = this.data.missions.findIndex(m => m.id === mission.id);
    if (idx >= 0) {
      this.data.missions[idx] = mission;
    } else {
      this.data.missions.push(mission);
    }
    this.persist();
    return mission;
  }

  public deleteMission(id: string): boolean {
    const initialLen = this.data.missions.length;
    this.data.missions = this.data.missions.filter(m => m.id !== id);
    if (this.data.missions.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- LAB PROFILES & SESSIONS ---
  public getLabProfiles(): LabProfile[] {
    return [...this.data.labProfiles];
  }

  public getLabProfileById(id: string): LabProfile | undefined {
    return this.data.labProfiles.find(p => p.id === id);
  }

  public getLabSessions(): LabSession[] {
    return [...this.data.labSessions];
  }

  public getLabSessionById(id: string): LabSession | undefined {
    return this.data.labSessions.find(s => s.id === id);
  }

  public getActiveLabSessionByUser(userId: string): LabSession | undefined {
    return this.data.labSessions.find(s => s.userId === userId && s.status === 'RUNNING');
  }

  public createLabSession(session: LabSession): LabSession {
    this.data.labSessions.push(session);
    this.persist();
    return session;
  }

  public updateLabSession(id: string, updates: Partial<LabSession>): LabSession | undefined {
    const idx = this.data.labSessions.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.data.labSessions[idx] = { ...this.data.labSessions[idx], ...updates };
    this.persist();
    return this.data.labSessions[idx];
  }

  // --- MISSION ATTEMPTS & SUBMISSIONS ---
  public getAttempts(): MissionAttempt[] {
    return [...this.data.attempts];
  }

  public getAttemptById(id: string): MissionAttempt | undefined {
    return this.data.attempts.find(a => a.id === id);
  }

  public getUserAttempts(userId: string): MissionAttempt[] {
    return this.data.attempts.filter(a => a.userId === userId);
  }

  public getActiveAttempt(userId: string, missionId: string): MissionAttempt | undefined {
    return this.data.attempts.find(a => a.userId === userId && a.missionId === missionId && a.status === 'IN_PROGRESS');
  }

  public getCompletedAttempt(userId: string, missionId: string): MissionAttempt | undefined {
    return this.data.attempts.find(a => a.userId === userId && a.missionId === missionId && a.status === 'COMPLETED');
  }

  public createAttempt(attempt: MissionAttempt): MissionAttempt {
    this.data.attempts.push(attempt);
    this.persist();
    return attempt;
  }

  public updateAttempt(id: string, updates: Partial<MissionAttempt>): MissionAttempt | undefined {
    const idx = this.data.attempts.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.data.attempts[idx] = { ...this.data.attempts[idx], ...updates };
    this.persist();
    return this.data.attempts[idx];
  }

  public getSubmissions(): Submission[] {
    return [...this.data.submissions];
  }

  public getSubmissionsByAttempt(attemptId: string): Submission[] {
    return this.data.submissions.filter(s => s.attemptId === attemptId);
  }

  public getSubmissionsByUser(userId: string): Submission[] {
    return this.data.submissions.filter(s => s.userId === userId);
  }

  public createSubmission(submission: Submission): Submission {
    this.data.submissions.push(submission);
    this.persist();
    return submission;
  }

  public updateSubmission(id: string, updates: Partial<Submission>): Submission | undefined {
    const idx = this.data.submissions.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.data.submissions[idx] = { ...this.data.submissions[idx], ...updates };
    this.persist();
    return this.data.submissions[idx];
  }

  // --- TRANSACTIONAL REWARDS: XP, BADGES, CERTIFICATES ---
  public completeMissionAndAwardXp(
    userId: string, 
    missionId: string, 
    earnedXp: number, 
    attemptId: string
  ): { user: User; newBadges: Badge[]; certificate?: Certificate } {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const mission = this.getMissionById(missionId);
    if (!mission) throw new Error('Mission not found');

    // Update attempt
    this.updateAttempt(attemptId, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      earnedXp,
    });

    // Check if this mission was already completed prior to this attempt (prevent duplicate XP)
    const existingCompletions = this.data.attempts.filter(
      a => a.userId === userId && a.missionId === missionId && a.status === 'COMPLETED' && a.id !== attemptId
    );

    let xpToAdd = earnedXp;
    if (existingCompletions.length > 0) {
      xpToAdd = 0; // Already awarded in previous attempt!
    }

    const newTotalXp = user.xp + xpToAdd;
    let newRank = user.currentRank;

    if (newTotalXp >= 3000) newRank = 'Principal Cyber Operative';
    else if (newTotalXp >= 1500) newRank = 'Senior Cyber Specialist';
    else if (newTotalXp >= 800) newRank = 'Cyber Analyst';
    else if (newTotalXp >= 300) newRank = 'Junior Threat Hunter';
    else if (newTotalXp >= 100) newRank = 'Cyber Apprentice';

    const updatedUser = this.updateUser(userId, {
      xp: newTotalXp,
      currentRank: newRank,
    })!;

    // Evaluate badges
    const userCompletedMissionCount = new Set(
      this.data.attempts
        .filter(a => a.userId === userId && a.status === 'COMPLETED')
        .map(a => a.missionId)
    ).size;

    const existingUserBadges = new Set(
      this.data.userBadges.filter(ub => ub.userId === userId).map(ub => ub.badgeId)
    );

    const newlyAwardedBadges: Badge[] = [];

    for (const badge of INITIAL_BADGES) {
      if (existingUserBadges.has(badge.id)) continue;

      let qualify = false;
      if (badge.missionsRequired && userCompletedMissionCount >= badge.missionsRequired) {
        if (badge.category === 'GENERAL') {
          qualify = true;
        } else {
          // Category-specific mission completions
          const completedCategoryCount = this.data.attempts
            .filter(a => a.userId === userId && a.status === 'COMPLETED')
            .filter(a => {
              const m = this.getMissionById(a.missionId);
              return m && m.category === badge.category;
            }).length;
          if (completedCategoryCount >= badge.missionsRequired) {
            qualify = true;
          }
        }
      }

      if (badge.xpRequired && updatedUser.xp >= badge.xpRequired) {
        qualify = true;
      }

      if (qualify) {
        this.data.userBadges.push({
          id: `ub-${crypto.randomUUID().slice(0, 8)}`,
          userId,
          badgeId: badge.id,
          awardedAt: new Date().toISOString()
        });
        newlyAwardedBadges.push(badge);
      }
    }

    // Evaluate certificate generation if user completed 4+ missions
    let certificate: Certificate | undefined;
    const existingCert = this.data.certificates.find(c => c.userId === userId);
    if (!existingCert && userCompletedMissionCount >= 4) {
      const certId = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const certHash = crypto.createHash('sha256').update(`${userId}:${user.username}:${certId}:SidoDev-Dz`).digest('hex');
      certificate = {
        id: certId,
        certificateNumber: `RBCL-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: user.id,
        username: user.username,
        title: 'Certified Cyber Lab Specialist - Foundations',
        issuedAt: new Date().toISOString(),
        verificationHash: certHash,
        signature: 'SidoDev-Dz (Creator & Security Architect, RogueByte)'
      };
      this.data.certificates.push(certificate);
    }

    this.persist();
    return { user: updatedUser, newBadges: newlyAwardedBadges, certificate };
  }

  // --- BADGES & CERTIFICATES ---
  public getBadges(): Badge[] {
    return [...INITIAL_BADGES];
  }

  public getUserBadges(userId: string): { badge: Badge; awardedAt: string }[] {
    const userBadges = this.data.userBadges.filter(ub => ub.userId === userId);
    return userBadges.map(ub => {
      const badge = INITIAL_BADGES.find(b => b.id === ub.badgeId) || {
        id: ub.badgeId,
        code: 'UNKNOWN',
        title: 'Cyber Achievement',
        titleAr: 'إنجاز سيبراني',
        description: 'Special badge awarded',
        descriptionAr: 'شارة خاصة',
        icon: 'Award',
        category: 'GENERAL'
      };
      return { badge, awardedAt: ub.awardedAt };
    });
  }

  public getCertificatesByUser(userId: string): Certificate[] {
    return this.data.certificates.filter(c => c.userId === userId);
  }

  public getCertificateById(id: string): Certificate | undefined {
    return this.data.certificates.find(c => c.id === id || c.certificateNumber === id);
  }

  // --- AUDIT LOGS ---
  public createAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const audit: AuditEvent = {
      ...event,
      id: `audit-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditEvents.unshift(audit);
    // Keep max 2000 events
    if (this.data.auditEvents.length > 2000) {
      this.data.auditEvents = this.data.auditEvents.slice(0, 2000);
    }
    this.persist();
    return audit;
  }

  public getAuditEvents(): AuditEvent[] {
    return [...this.data.auditEvents];
  }

  // --- ASSIGNMENTS ---
  public getAssignments(): Assignment[] {
    return [...this.data.assignments];
  }

  public createAssignment(asg: Assignment): Assignment {
    this.data.assignments.unshift(asg);
    this.persist();
    return asg;
  }

  // --- SYSTEM SETTINGS ---
  public getSettings(): SystemSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return { ...this.data.settings };
  }
}

export const db = new Database();
