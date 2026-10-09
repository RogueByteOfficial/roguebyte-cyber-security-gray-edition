import crypto from 'node:crypto';
import { db } from '../db/database.ts';
import { LabProfile, LabSession } from '../../shared/types.ts';

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class LabManager {
  private activeInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  // Periodic daemon that cleans up expired lab sessions
  private startCleanupInterval() {
    if (this.activeInterval) clearInterval(this.activeInterval);
    this.activeInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 30 * 1000); // Check every 30 seconds
    if (this.activeInterval.unref) {
      this.activeInterval.unref();
    }
  }

  public cleanupExpiredSessions() {
    const now = new Date().getTime();
    const sessions = db.getLabSessions();
    for (const s of sessions) {
      if (s.status === 'RUNNING' && new Date(s.expiresAt).getTime() < now) {
        db.updateLabSession(s.id, { status: 'EXPIRED' });
        db.createAuditEvent({
          userId: s.userId,
          action: 'LAB_SESSION_EXPIRED',
          category: 'LAB',
          details: `Lab session ${s.id} (profile: ${s.profileId}) reached timeout and was automatically cleaned up.`,
          ipAddress: s.ipAddress,
          status: 'SUCCESS'
        });
      }
    }
  }

  public launchLab(userId: string, missionId: string, ipAddress: string): { session: LabSession; message?: string } {
    const settings = db.getSettings();
    if (settings.maintenanceMode) {
      throw new Error('System is currently in maintenance mode. Lab creation is paused.');
    }

    const mission = db.getMissionById(missionId);
    if (!mission) throw new Error('Mission not found');
    if (!mission.labProfileId) throw new Error('This mission does not require an isolated lab container.');

    const profile = db.getLabProfileById(mission.labProfileId);
    if (!profile) throw new Error('Lab configuration profile not found.');

    // Check user concurrency limit
    const existingActive = db.getActiveLabSessionByUser(userId);
    if (existingActive) {
      // If user already has an active lab for this exact mission, reuse it
      if (existingActive.missionId === missionId) {
        return { session: existingActive, message: 'Existing lab session resumed.' };
      }
      // Otherwise terminate prior active lab to obey concurrency quota
      this.terminateLab(existingActive.id, userId);
    }

    const timeoutMinutes = profile.resourceLimits.timeoutMinutes || settings.defaultLabTimeoutMinutes || 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + timeoutMinutes * 60 * 1000);

    // Deep copy initial files to provide an isolated environment state
    const clonedFiles: Record<string, { content: string; permissions: string; owner: string }> = {};
    for (const [filePath, fileData] of Object.entries(profile.initialFiles)) {
      clonedFiles[filePath] = {
        content: fileData.content,
        permissions: fileData.permissions,
        owner: fileData.owner,
      };
    }

    const session: LabSession = {
      id: `lab-${crypto.randomUUID().slice(0, 10)}`,
      missionId,
      userId,
      profileId: profile.id,
      status: 'RUNNING',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ipAddress,
      terminalHistory: [
        `\x1b[1;32m[+] RogueByte Isolated Lab Runtime v1.0\x1b[0m`,
        `\x1b[1;30mTarget profile: ${profile.name} [Image: ${profile.dockerImage}]\x1b[0m`,
        `\x1b[1;30mResource constraints: CPU ${profile.resourceLimits.cpu} core, Memory: ${profile.resourceLimits.memoryMb}MB\x1b[0m`,
        `\x1b[1;33mSession expires in ${timeoutMinutes} minutes. Type 'help' for available commands.\x1b[0m\n`
      ],
      currentFiles: clonedFiles,
      executedCommandsCount: 0,
      lastActiveAt: now.toISOString(),
    };

    db.createLabSession(session);

    db.createAuditEvent({
      userId,
      action: 'LAB_SESSION_STARTED',
      category: 'LAB',
      details: `Started isolated lab session ${session.id} for mission ${mission.slug} (${profile.dockerImage})`,
      ipAddress,
      status: 'SUCCESS'
    });

    return { session };
  }

  public terminateLab(sessionId: string, userId: string): boolean {
    const session = db.getLabSessionById(sessionId);
    if (!session) return false;

    const user = db.getUserById(userId);
    // Student can only terminate their own lab; Admin can terminate any lab
    if (session.userId !== userId && user?.role !== 'ADMIN') {
      throw new Error('Unauthorized to terminate this lab session.');
    }

    db.updateLabSession(sessionId, { status: 'STOPPED' });

    db.createAuditEvent({
      userId,
      action: 'LAB_SESSION_TERMINATED',
      category: 'LAB',
      details: `Lab session ${sessionId} manually terminated.`,
      ipAddress: session.ipAddress,
      status: 'SUCCESS'
    });

    return true;
  }

  // Realistic sandboxed Linux command shell execution
  public executeCommand(sessionId: string, userId: string, rawCmd: string): CommandExecutionResult {
    const session = db.getLabSessionById(sessionId);
    if (!session) throw new Error('Lab session not found');
    if (session.status !== 'RUNNING') throw new Error('Lab session is no longer active.');
    if (session.userId !== userId) throw new Error('Unauthorized to access this lab terminal.');

    const trimmed = rawCmd.trim();
    if (!trimmed) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    session.lastActiveAt = new Date().toISOString();
    session.executedCommandsCount += 1;

    // Check if session expired
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      session.status = 'EXPIRED';
      db.updateLabSession(session.id, { status: 'EXPIRED' });
      throw new Error('Lab session has expired. Please launch a new session.');
    }

    // Split pipeline / compound commands if any (supports `&&` or single command)
    const subCommands = trimmed.split('&&').map(c => c.trim());
    let combinedStdout = '';
    let combinedStderr = '';
    let lastExit = 0;

    for (const cmdLine of subCommands) {
      const parts = cmdLine.split(/\s+/).filter(Boolean);
      const command = parts[0]?.toLowerCase();
      const args = parts.slice(1);

      const result = this.dispatchCommand(command, args, session);
      if (result.stdout) combinedStdout += (combinedStdout ? '\n' : '') + result.stdout;
      if (result.stderr) combinedStderr += (combinedStderr ? '\n' : '') + result.stderr;
      lastExit = result.exitCode;
      if (lastExit !== 0) break;
    }

    // Append to terminal history
    session.terminalHistory.push(`student@roguebyte-lab:~$ ${trimmed}`);
    if (combinedStdout) session.terminalHistory.push(combinedStdout);
    if (combinedStderr) session.terminalHistory.push(`\x1b[31m${combinedStderr}\x1b[0m`);

    // Keep history capped to last 150 entries
    if (session.terminalHistory.length > 150) {
      session.terminalHistory = session.terminalHistory.slice(-150);
    }

    db.updateLabSession(session.id, {
      currentFiles: session.currentFiles,
      terminalHistory: session.terminalHistory,
      executedCommandsCount: session.executedCommandsCount,
      lastActiveAt: session.lastActiveAt
    });

    return {
      stdout: combinedStdout,
      stderr: combinedStderr,
      exitCode: lastExit,
    };
  }

  private dispatchCommand(command: string, args: string[], session: LabSession): CommandExecutionResult {
    switch (command) {
      case 'help': {
        return {
          stdout: `RogueByte Cyber Lab Shell v1.0
Available utilities:
  ls, cat, grep, chmod, stat, file, id, whoami, pwd, cd, find
  tshark, tcpdump, nmap, curl, ps, env, echo, clear, date, uptime
  help, exit`,
          stderr: '',
          exitCode: 0,
        };
      }

      case 'whoami': {
        return { stdout: 'student', stderr: '', exitCode: 0 };
      }

      case 'id': {
        return { stdout: 'uid=1001(student) gid=1001(student) groups=1001(student),27(sudo)', stderr: '', exitCode: 0 };
      }

      case 'pwd': {
        return { stdout: '/home/student', stderr: '', exitCode: 0 };
      }

      case 'date': {
        return { stdout: new Date().toUTCString(), stderr: '', exitCode: 0 };
      }

      case 'uptime': {
        return { stdout: ' 04:12:00 up 2 days, 1 user, load average: 0.08, 0.05, 0.01', stderr: '', exitCode: 0 };
      }

      case 'clear': {
        return { stdout: '\x1b[2J\x1b[H', stderr: '', exitCode: 0 };
      }

      case 'ps': {
        return {
          stdout: `  PID TTY          TIME CMD
    1 ?        00:00:01 systemd
  452 ?        00:00:00 sshd
  612 ?        00:00:02 rsyslogd
 1240 pts/0    00:00:00 bash
 1289 pts/0    00:00:00 ps`,
          stderr: '',
          exitCode: 0
        };
      }

      case 'ls': {
        const showAll = args.includes('-la') || args.includes('-l') || args.includes('-a');
        let targetPath = args.find(a => !a.startsWith('-')) || '/home/student';

        // Normalize path
        if (!targetPath.startsWith('/')) {
          targetPath = `/home/student/${targetPath}`.replace('//', '/');
        }

        // Find matching files in session
        const matchingEntries: string[] = [];
        for (const [filePath, meta] of Object.entries(session.currentFiles)) {
          if (filePath.startsWith(targetPath) || targetPath === '/') {
            if (showAll) {
              const perms = meta.permissions;
              matchingEntries.push(`-rw-r--r-- 1 ${meta.owner} 2048 Oct 09 04:00 ${filePath} (mode: ${perms})`);
            } else {
              matchingEntries.push(filePath);
            }
          }
        }

        if (matchingEntries.length === 0) {
          // Check if parent directory exists
          const exists = Object.keys(session.currentFiles).some(k => k.startsWith(targetPath));
          if (!exists) {
            return { stdout: '', stderr: `ls: cannot access '${targetPath}': No such file or directory`, exitCode: 2 };
          }
        }

        return { stdout: matchingEntries.join('\n'), stderr: '', exitCode: 0 };
      }

      case 'cat': {
        if (args.length === 0) {
          return { stdout: '', stderr: 'cat: missing file operand', exitCode: 1 };
        }
        let filePath = args[0];
        if (!filePath.startsWith('/')) {
          filePath = `/home/student/${filePath}`.replace('//', '/');
        }

        const file = session.currentFiles[filePath];
        if (!file) {
          return { stdout: '', stderr: `cat: ${filePath}: No such file or directory`, exitCode: 1 };
        }

        return { stdout: file.content, stderr: '', exitCode: 0 };
      }

      case 'stat': {
        if (args.length === 0) {
          return { stdout: '', stderr: 'stat: missing operand', exitCode: 1 };
        }
        let filePath = args[args.length - 1];
        if (!filePath.startsWith('/')) {
          filePath = `/home/student/${filePath}`.replace('//', '/');
        }

        const file = session.currentFiles[filePath];
        if (!file) {
          return { stdout: '', stderr: `stat: cannot stat '${filePath}': No such file or directory`, exitCode: 1 };
        }

        const formatOctal = args.includes('%a') || args.includes('-c');
        if (formatOctal) {
          return { stdout: file.permissions, stderr: '', exitCode: 0 };
        }

        return {
          stdout: `  File: ${filePath}
  Size: ${file.content.length}        Blocks: 8          IO Block: 4096   regular file
Device: 801h/2049d      Inode: 1441209     Links: 1
Access: (${file.permissions}/-rw-r--r--)  Uid: ( 1001/ student)   Gid: ( 1001/ student)
Access: 2026-10-09 04:10:00.000000000 +0000
Modify: 2026-10-09 04:10:00.000000000 +0000
Change: 2026-10-09 04:10:00.000000000 +0000`,
          stderr: '',
          exitCode: 0
        };
      }

      case 'chmod': {
        if (args.length < 2) {
          return { stdout: '', stderr: 'chmod: missing operand', exitCode: 1 };
        }
        const newMode = args[0];
        let filePath = args[1];
        if (!filePath.startsWith('/')) {
          filePath = `/home/student/${filePath}`.replace('//', '/');
        }

        const file = session.currentFiles[filePath];
        if (!file) {
          return { stdout: '', stderr: `chmod: cannot access '${filePath}': No such file or directory`, exitCode: 1 };
        }

        // Apply state change directly to this isolated lab's file map!
        file.permissions = newMode;
        return { stdout: `mode of '${filePath}' changed to ${newMode}`, stderr: '', exitCode: 0 };
      }

      case 'grep': {
        const flagMatches = args.filter(a => a.startsWith('-'));
        const nonFlagArgs = args.filter(a => !a.startsWith('-'));
        if (nonFlagArgs.length === 0) {
          return { stdout: '', stderr: 'grep: missing pattern', exitCode: 2 };
        }

        const pattern = nonFlagArgs[0].replace(/['"]/g, '');
        let filePath = nonFlagArgs[1];
        if (!filePath) {
          return { stdout: '', stderr: 'grep: missing file operand', exitCode: 2 };
        }
        if (!filePath.startsWith('/')) {
          filePath = `/home/student/${filePath}`.replace('//', '/');
        }

        const file = session.currentFiles[filePath];
        if (!file) {
          return { stdout: '', stderr: `grep: ${filePath}: No such file or directory`, exitCode: 2 };
        }

        const lines = file.content.split('\n');
        const matches: string[] = [];

        try {
          const regex = new RegExp(pattern, 'i');
          for (const line of lines) {
            if (regex.test(line)) {
              matches.push(line);
            }
          }
        } catch {
          // Fallback to substring match
          for (const line of lines) {
            if (line.includes(pattern)) {
              matches.push(line);
            }
          }
        }

        return { stdout: matches.join('\n'), stderr: '', exitCode: matches.length > 0 ? 0 : 1 };
      }

      case 'find': {
        const rootPath = args[0] || '/';
        const matches: string[] = [];
        for (const f of Object.keys(session.currentFiles)) {
          if (f.startsWith(rootPath)) matches.push(f);
        }
        return { stdout: matches.join('\n'), stderr: '', exitCode: 0 };
      }

      case 'echo': {
        const text = args.join(' ');
        return { stdout: text, stderr: '', exitCode: 0 };
      }

      default: {
        return { stdout: '', stderr: `bash: ${command}: command not found`, exitCode: 127 };
      }
    }
  }

  // Automated lab-state verification against the actual live environment
  public gradeLabState(sessionId: string, checkId: string): { success: boolean; feedback: string } {
    const session = db.getLabSessionById(sessionId);
    if (!session) throw new Error('Lab session not found');

    if (checkId === 'check-linux-permissions-hardened') {
      const shadow = session.currentFiles['/etc/shadow'];
      const config = session.currentFiles['/var/www/html/config.php'];

      if (!shadow || !config) {
        return {
          success: false,
          feedback: 'Required system files missing from active sandbox.',
        };
      }

      // Check shadow permission: must be 0640 or 0600 or 640 or 600
      const shadowOk = ['0640', '640', '0600', '600'].includes(shadow.permissions.trim());
      // Check config permission: must not be world writable (e.g. 0640, 0644, 640, 644)
      const configOk = ['0640', '640', '0644', '644', '0600', '600'].includes(config.permissions.trim());

      if (shadowOk && configOk) {
        return {
          success: true,
          feedback: `[VERIFIED] Environment audit passed! /etc/shadow permissions hardened to ${shadow.permissions} and /var/www/html/config.php secured to ${config.permissions}.`,
        };
      } else {
        const issues: string[] = [];
        if (!shadowOk) issues.push(`/etc/shadow is still insecure (current permission: ${shadow.permissions}, expected 0640 or 0600)`);
        if (!configOk) issues.push(`/var/www/html/config.php still permits world write (current permission: ${config.permissions}, expected 0640 or 0644)`);
        return {
          success: false,
          feedback: `[AUDIT FAILED] Remediations incomplete: ${issues.join('; ')}. Use chmod to secure these files and re-test.`,
        };
      }
    }

    return { success: false, feedback: `Unknown lab-state validation rule: ${checkId}` };
  }
}

export const labManager = new LabManager();
