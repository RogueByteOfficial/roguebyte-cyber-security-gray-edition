# RogueByte Cyber Lab — Security Architecture & Threat Model
**Author:** SidoDev-Dz  
**Version:** Black Gray Edition v1

---

## 1. Core Security Principles

RogueByte Cyber Lab enforces strict Defense-in-Depth principles across all application boundaries:

1. **Zero Client Trust:**
   - The browser client is treated as untrusted.
   - All flag submissions, numerical answers, and environment states are validated on the backend.
   - Client requests cannot manipulate XP, unlock status, or container ownership.

2. **Isolated Lab Sandbox Boundary:**
   - Student lab environments run in dedicated ephemeral sandboxes.
   - Containers are strictly unprivileged.
   - The Docker socket (`/var/run/docker.sock`) is never mounted inside student execution environments.
   - Virtual filesystem modifications are isolated to the requesting user session.

3. **Session & Cryptographic Integrity:**
   - Passwords hashed using cryptographically secure algorithms with high-entropy unique salts.
   - User sessions managed via HMAC-SHA256 bearer tokens with 24-hour expiration limits.
   - Cryptographic certificates of competency signed using SHA-256 hashes anchored to SidoDev-Dz.

4. **Immutable Security Auditing:**
   - All high-impact actions (authentication successes/failures, lab launches/stops, mission submissions, and administrator modifications) are recorded in the security audit trail.
   - Failed authentication attempts log IP addresses and timestamps to detect automated password spraying.

---

## 2. Threat Modeling Matrix

| Threat | Risk Level | Mitigation Architecture |
|---|---|---|
| **Arbitrary Host Code Execution** | Critical | Isolated process interpreter; no access to host shell or host filesystem. |
| **Container Breakout / Escape** | High | Non-root default user; dropped Linux capabilities; read-only root where feasible. |
| **Egress C2 Abuse** | High | Lab environments are air-gapped from cloud metadata endpoints (`169.254.169.254`). |
| **Cross-User Session Hijacking** | High | Lab sessions strictly bound to requesting `userId`; unauthorized token access rejected with 403 Forbidden. |
| **Brute Force Flag Guessing** | Medium | Submission attempt counting; audit event logging; progressive hint penalties. |
| **Horizontal Privilege Escalation (IDOR)** | Medium | Server-side entity ownership checks on all lab and user progress resources. |

---

## 3. Vulnerability Reporting

To report platform vulnerabilities, contact **SidoDev-Dz** via the official GitHub repository:
- https://github.com/RogueByteOfficial
