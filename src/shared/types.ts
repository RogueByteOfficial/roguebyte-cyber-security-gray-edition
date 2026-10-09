export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  isSuspended: boolean;
  avatarUrl?: string;
  currentRank: string;
  xp: number;
  createdAt: string;
  lastLoginAt?: string;
}

export type MissionCategory = 'LINUX' | 'NETWORKING' | 'WEB_SECURITY' | 'DEFENSIVE';
export type MissionDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SubmissionType = 
  | 'ANSWER' 
  | 'FLAG' 
  | 'STRUCTURED_JSON' 
  | 'REPORT' 
  | 'LAB_STATE' 
  | 'INSTRUCTOR_REVIEW';

export interface MissionHint {
  index: number;
  title: string;
  content: string;
  xpPenalty: number;
}

export interface Mission {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xpReward: number;
  estimatedMinutes: number;
  prerequisites: string[]; // mission ids
  submissionType: SubmissionType;
  labProfileId?: string; // If requires executable isolated lab
  learningObjectives: string[];
  threatModel?: string;
  taskInstructions: string;
  taskInstructionsAr?: string;
  hints: MissionHint[];
  validationRules: {
    expectedFlag?: string;
    expectedAnswer?: string;
    acceptedAnswers?: string[];
    labStateCheckId?: string;
    jsonSchemaRequiredKeys?: string[];
  };
  remediationGuidance: string;
  isPublished: boolean;
  author: string;
  createdAt: string;
}

export interface LabProfile {
  id: string;
  name: string;
  category: MissionCategory;
  dockerImage: string;
  initialFiles: Record<string, {
    content: string;
    permissions: string; // e.g. "0640", "0755", "4755"
    owner: string;
  }>;
  environmentVars?: Record<string, string>;
  resourceLimits: {
    cpu: string;
    memoryMb: number;
    maxProcesses: number;
    timeoutMinutes: number;
  };
}

export interface LabSession {
  id: string;
  missionId: string;
  userId: string;
  profileId: string;
  status: 'STARTING' | 'RUNNING' | 'TERMINATING' | 'STOPPED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  terminalHistory: string[];
  // File state snapshot for isolated container simulation
  currentFiles: Record<string, {
    content: string;
    permissions: string;
    owner: string;
  }>;
  executedCommandsCount: number;
  lastActiveAt: string;
}

export interface MissionAttempt {
  id: string;
  missionId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  earnedXp: number;
  hintsUsed: number[];
  submissionsCount: number;
}

export interface Submission {
  id: string;
  attemptId: string;
  missionId: string;
  userId: string;
  submissionType: SubmissionType;
  content: string; // Answer string, flag, JSON payload, or report text
  submittedAt: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  reviewedBy?: string;
}

export interface Badge {
  id: string;
  code: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  category: MissionCategory | 'GENERAL';
  xpRequired?: number;
  missionsRequired?: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  userId: string;
  username: string;
  title: string;
  category?: MissionCategory;
  issuedAt: string;
  verificationHash: string;
  signature: string; // SidoDev-Dz cryptographic signature
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  username?: string;
  action: string;
  category: 'AUTH' | 'LAB' | 'MISSION' | 'ADMIN' | 'SECURITY';
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  missionIds: string[];
  targetGroup: string;
  dueDate: string;
  createdById: string;
  createdAt: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maxConcurrentLabsPerUser: number;
  defaultLabTimeoutMinutes: number;
  registrationOpen: boolean;
  strictRateLimiting: boolean;
}
