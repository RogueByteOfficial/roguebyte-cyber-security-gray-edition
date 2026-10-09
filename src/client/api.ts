import { Mission, LabSession, User } from '../shared/types.ts';

const TOKEN_KEY = 'roguebyte_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<{ message: string; token: string; user: User }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  login: (body: any) => request<{ message: string; token: string; user: User }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  logout: () => request<{ message: string }>('/api/v1/auth/logout', { method: 'POST' }),
  getMe: () => request<{ user: User; stats: { completedMissionsCount: number; badgesCount: number } }>('/api/v1/auth/me'),

  // Missions
  getMissions: (params: { category?: string; difficulty?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.search) query.set('search', params.search);
    return request<(Mission & { isCompleted: boolean; hasPrerequisitesMet: boolean })[]>(`/api/v1/missions?${query.toString()}`);
  },
  getMission: (id: string) => request<Mission & { isCompleted: boolean; prerequisitesMet: boolean; activeAttempt?: any }>(`/api/v1/missions/${id}`),
  startAttempt: (id: string) => request<{ attempt: any }>(`/api/v1/missions/${id}/attempts`, { method: 'POST' }),
  unlockHint: (id: string, hintIndex: number) => request<{ hint: any; hintsUsed: number[] }>(`/api/v1/missions/${id}/hints/${hintIndex}`, { method: 'POST' }),
  submitSolution: (id: string, body: { submissionContent: any; sessionId?: string }) => 
    request<{ isCorrect: boolean; feedback: string; earnedXp: number; newBadges: any[]; certificate?: any; user: any }>(`/api/v1/missions/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Labs
  launchLab: (missionId: string) => request<{ session: LabSession; message?: string }>(`/api/v1/lab-sessions/missions/${missionId}/launch`, { method: 'POST' }),
  getLab: (id: string) => request<{ session: LabSession; profile: any; remainingSeconds: number }>(`/api/v1/lab-sessions/${id}`),
  execCommand: (sessionId: string, command: string) => request<{ stdout: string; stderr: string; exitCode: number }>(`/api/v1/lab-sessions/${sessionId}/exec`, {
    method: 'POST',
    body: JSON.stringify({ command }),
  }),
  terminateLab: (sessionId: string) => request<{ message: string }>(`/api/v1/lab-sessions/${sessionId}/terminate`, { method: 'POST' }),
  gradeLab: (sessionId: string, checkId: string) => request<{ success: boolean; feedback: string }>(`/api/v1/lab-sessions/${sessionId}/grade`, {
    method: 'POST',
    body: JSON.stringify({ checkId }),
  }),

  // Progress
  getSummary: () => request<any>('/api/v1/progress/summary'),
  getLeaderboard: () => request<any[]>('/api/v1/progress/leaderboard'),
  getBadges: () => request<any[]>('/api/v1/progress/badges'),
  getCertificates: () => request<any[]>('/api/v1/progress/certificates'),
  verifyCertificate: (identifier: string) => request<any>(`/api/v1/progress/certificates/verify/${identifier}`),

  // Instructor
  getAssignments: () => request<any[]>('/api/v1/instructor/assignments'),
  createAssignment: (body: any) => request<any>('/api/v1/instructor/assignments', { method: 'POST', body: JSON.stringify(body) }),
  getCohortAnalytics: () => request<any>('/api/v1/instructor/cohort-analytics'),
  getInstructorSubmissions: () => request<any[]>('/api/v1/instructor/submissions'),
  reviewSubmission: (id: string, body: any) => request<any>(`/api/v1/instructor/submissions/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminUsers: () => request<User[]>('/api/v1/admin/users'),
  updateAdminUser: (id: string, body: any) => request<User>(`/api/v1/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  createAdminMission: (body: any) => request<Mission>('/api/v1/admin/missions', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminMission: (id: string, body: any) => request<Mission>(`/api/v1/admin/missions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminMission: (id: string) => request<{ message: string }>(`/api/v1/admin/missions/${id}`, { method: 'DELETE' }),
  getAdminLabs: () => request<any[]>('/api/v1/admin/labs'),
  terminateAdminLab: (id: string) => request<{ message: string }>(`/api/v1/admin/labs/${id}/terminate`, { method: 'POST' }),
  getAuditLogs: (params: { category?: string; status?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.status) q.set('status', params.status);
    return request<any[]>(`/api/v1/admin/audit-logs?${q.toString()}`);
  },
  getAdminStats: () => request<any>('/api/v1/admin/stats'),
  getAdminSettings: () => request<any>('/api/v1/admin/settings'),
  updateAdminSettings: (body: any) => request<any>('/api/v1/admin/settings', { method: 'PATCH', body: JSON.stringify(body) }),
};
