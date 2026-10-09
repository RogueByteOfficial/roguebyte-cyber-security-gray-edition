# RogueByte Cyber Lab — Architecture & System Design
**Creator & Lead Architect:** SidoDev-Dz  
**Product:** RogueByte Cyber Lab (Black Gray Edition v1)

---

## 1. Executive Architecture Summary

RogueByte Cyber Lab is an enterprise-grade cybersecurity training and assessment platform designed to deliver authentic offensive and defensive exercises inside isolated sandboxes. 

The application architecture prioritizes security-by-design, determinism, and zero-mock verification:
- **Client Layer:** High-performance React 19 SPA built with Vite, TypeScript, Tailwind CSS, and full internationalization support (English LTR and Arabic RTL).
- **Application Server Layer:** Versioned RESTful API (`/api/v1/*`) implemented in Node.js / Express with TypeScript, strict schema validation via Zod, JWT bearer token session handling, and role-based access control (RBAC).
- **Lab Orchestration Layer:** Dedicated isolated execution service managing ephemeral execution sandboxes, virtual state maps, process execution timers, and live filesystem manipulation.
- **Grading & Assessment Engine:** Autonomous server-side grading engine validating flag submissions, calculated values, structured JSON threat intelligence, minimum-length triage reports, and live lab environment state checks.
- **Persistence Layer:** Normalized relational data models with Prisma schema definitions for PostgreSQL and an embedded persistent JSON storage engine for zero-setup execution.

---

## 2. Component Diagram

```
+--------------------------------------------------------------------------+
|                           CLIENT BROWSER (UI)                            |
|  - Landing Page     - Missions Catalogue      - Interactive Workspace    |
|  - Student Desk     - Instructor Center       - Root Admin Control       |
|  - Bilingual Engine (EN / AR)                 - Lab Terminal (CLI)       |
+------------------------------------+-------------------------------------+
                                     |
                                     | HTTPS / JSON REST API
                                     v
+------------------------------------+-------------------------------------+
|                         SERVER APPLICATION LAYER                          |
|  - Express 4.x Application Gateway                                       |
|  - Authentication & JWT Session Validator (HMAC-SHA256)                  |
|  - RBAC Guard Middleware (STUDENT | INSTRUCTOR | ADMIN)                  |
|  - Versioned API Routers (/api/v1/auth, /missions, /labs, /admin)        |
+------------------+----------------------------------+--------------------+
                   |                                  |
                   v                                  v
+------------------+---------------+  +---------------+--------------------+
|       LAB ORCHESTRATION SERVICE   |  |      STORAGE & AUDIT SUBSYSTEM     |
|  - Session Factory & TTL Daemon  |  |  - Relational Schema (Prisma)      |
|  - Virtual Filesystem & Context  |  |  - Persistent Store Engine         |
|  - Sandboxed Command Dispatcher  |  |  - Cryptographic Certificate Store |
|  - Live Environment State Grader |  |  - Immutable Security Audit Trail  |
+----------------------------------+  +------------------------------------+
```

---

## 3. Data Flow & Grading Lifecycle

1. **Student Request:** Student selects an unlocked mission from the catalogue. Prerequisites are strictly evaluated by the backend.
2. **Session Provisioning:** When a student requests a lab, `LabManager` instantiates an isolated session with cloned initial files, strict memory and execution boundaries, and an expiration countdown (TTL).
3. **Interactive Terminal Operations:** Commands (`ls`, `cat`, `grep`, `chmod`, `stat`, `nmap`, etc.) execute within the isolated session boundaries. State changes (such as modifying file permissions with `chmod`) persist within that specific session.
4. **State Verification:** When the student clicks "Verify Lab Environment State", the backend queries the live virtual file table and octal modes of the target files inside the active container.
5. **Reward Transaction:** Once verified, XP is awarded atomically, preventing duplicate rewards. The system checks milestone thresholds, awards badges, and generates a verifiable completion certificate.
