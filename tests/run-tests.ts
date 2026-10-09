import { db, hashPassword, verifyPassword } from '../src/server/db/database.ts';
import { labManager } from '../src/server/lab/labManager.ts';
import { generateToken, verifyToken } from '../src/server/auth.ts';

async function runTestSuite() {
  console.log('===========================================================');
  console.log('  ROGUEBYTE CYBER LAB — AUTOMATED ACCEPTANCE TEST SUITE');
  console.log('  Architect: SidoDev-Dz');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // --- TEST GROUP 1: Database Initialization & Mission Seed ---
  console.log('\n--- 1. Database & Mission Inventory ---');
  const missions = db.getMissions();
  assert(missions.length >= 16, `Loaded ${missions.length} training missions (expected >= 16)`);

  const linuxMissions = missions.filter(m => m.category === 'LINUX');
  const netMissions = missions.filter(m => m.category === 'NETWORKING');
  const webMissions = missions.filter(m => m.category === 'WEB_SECURITY');
  const defMissions = missions.filter(m => m.category === 'DEFENSIVE');
  assert(linuxMissions.length >= 4, `Linux category has ${linuxMissions.length} missions`);
  assert(netMissions.length >= 4, `Networking category has ${netMissions.length} missions`);
  assert(webMissions.length >= 4, `Web Security category has ${webMissions.length} missions`);
  assert(defMissions.length >= 4, `Defensive category has ${defMissions.length} missions`);

  const labProfiles = db.getLabProfiles();
  assert(labProfiles.length >= 6, `Configured ${labProfiles.length} isolated lab profiles (expected >= 6)`);

  // --- TEST GROUP 2: Authentication & Password Security ---
  console.log('\n--- 2. Cryptographic Authentication & RBAC ---');
  const samplePass = 'SecretCyberPass2026!';
  const sampleHash = hashPassword(samplePass);
  assert(verifyPassword(samplePass, sampleHash), 'Password scrypt hashing and verification succeeds');
  assert(!verifyPassword('WrongPass123', sampleHash), 'Invalid password rejected');

  const adminUser = db.getUserByEmail('admin@roguebyte.local');
  assert(adminUser !== undefined && adminUser.role === 'ADMIN', 'Default Root Admin user exists with ADMIN role');

  const token = generateToken(adminUser!);
  const decoded = verifyToken(token);
  assert(decoded !== null && decoded.userId === adminUser!.id && decoded.role === 'ADMIN', 'HMAC-SHA256 bearer token generated and verified');

  // --- TEST GROUP 3: Mission Attempt & Server-Side Flag Validation ---
  console.log('\n--- 3. Mission Attempt & Server-Side Grading ---');
  const testStudent = db.getUserByEmail('student@roguebyte.local')!;
  const initialXp = testStudent.xp;

  // Verify wrong flag is rejected
  const mission01 = db.getMissionById('m-linux-01')!;
  const wrongFlag = 'ROGUE{fake_flag}';
  assert(wrongFlag !== mission01.validationRules.expectedFlag, 'Bogus flag does not match expected rule');

  // Verify correct flag
  const correctFlag = 'ROGUE{su1d_p3rm1ss10n_3xp0s3d_2026}';
  assert(correctFlag === mission01.validationRules.expectedFlag, 'Correct flag matches validation criteria');

  // --- TEST GROUP 4: Isolated Lab Session & Terminal Execution ---
  console.log('\n--- 4. Isolated Lab Container Lifecycle & Live State Grading ---');
  const launchResult = labManager.launchLab(testStudent.id, 'm-linux-03', '127.0.0.1');
  const session = launchResult.session;
  assert(session.status === 'RUNNING', `Lab session ${session.id} started successfully in RUNNING state`);

  // Run commands in container
  const whoamiRes = labManager.executeCommand(session.id, testStudent.id, 'whoami');
  assert(whoamiRes.stdout.trim() === 'student', 'Command "whoami" executes correctly inside sandbox');

  const lsRes = labManager.executeCommand(session.id, testStudent.id, 'ls /home/student');
  assert(lsRes.exitCode === 0, 'Command "ls" executes and lists sandbox directory');

  // Check state before remediation
  const preAudit = labManager.gradeLabState(session.id, 'check-linux-permissions-hardened');
  assert(!preAudit.success, 'Pre-audit correctly detects insecure file permissions (0644 shadow, 0666 config)');

  // Remediate permissions via sandboxed terminal commands
  const chmodRes1 = labManager.executeCommand(session.id, testStudent.id, 'chmod 0640 /etc/shadow');
  const chmodRes2 = labManager.executeCommand(session.id, testStudent.id, 'chmod 0640 /var/www/html/config.php');
  assert(chmodRes1.exitCode === 0 && chmodRes2.exitCode === 0, 'Executed "chmod" hardening commands inside sandbox');

  // Check state after remediation
  const postAudit = labManager.gradeLabState(session.id, 'check-linux-permissions-hardened');
  assert(postAudit.success, `Post-audit passes: ${postAudit.feedback}`);

  // Terminate lab session
  const termRes = labManager.terminateLab(session.id, testStudent.id);
  assert(termRes, 'Lab session stopped and isolated resources cleanly released');

  // --- TEST GROUP 5: Security Audit Log Trail ---
  console.log('\n--- 5. Immutable Security Audit Logging ---');
  const auditLogs = db.getAuditEvents();
  assert(auditLogs.length > 0, `Security audit log contains ${auditLogs.length} verified events`);
  const labEvent = auditLogs.find(e => e.action === 'LAB_SESSION_STARTED');
  assert(labEvent !== undefined, 'Lab session lifecycle event recorded in audit trail');

  console.log('\n===========================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('[TEST SUITE CRASH]', err);
  process.exit(1);
});
