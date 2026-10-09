# RogueByte Cyber Lab — Black Gray Edition v1

> **Production-Ready Cybersecurity Training Platform & Isolated Lab Environment**  
> **Project Owner & Creator:** [SidoDev-Dz](https://github.com/RogueByteOfficial)  
> **Support on Ko-fi:** [https://ko-fi.com/roguebyte](https://ko-fi.com/roguebyte)  
> **Official GitHub Organization:** [https://github.com/RogueByteOfficial](https://github.com/RogueByteOfficial)

---

## 🛡️ Overview

**RogueByte Cyber Lab** is a full-stack, enterprise-grade cybersecurity education and hands-on skill evaluation platform. Engineered from the ground up for zero simulation and defense-in-depth, every mission is validated against actual server-side criteria, isolated ephemeral file tables, and authentic threat telemetry.

Designed with an immersive **Black Gray** cybersecurity aesthetic (obsidian slates, emerald cyber accents, and restrained amber highlights), the platform supports both **English (LTR)** and **Arabic (العربية - RTL)** interfaces seamlessly.

---

## ✨ Key Features

- **16 Fully Specified Functional Missions:** Spanning 4 industry domains:
  - 🐧 **Linux Hardening:** File permission audits, SUID binary privilege escalation discovery, automated permission remediation, and authentication log forensics.
  - 🌐 **Network Forensics:** CIDR subnetting, unencrypted PCAP credential sniffing, C2 beaconing detection, and Nmap backdoor enumeration.
  - ⚔️ **Web Application Security:** SQL injection authentication bypass, Stored XSS defense, IDOR access controls, and CSRF token defenses.
  - 🛡️ **SOC & Defensive Threat Hunting:** Impossible Travel detection, SIEM PowerShell deobfuscation, Sigma detection rule mapping, and structured Incident Response triage reporting.
- **Isolated Lab Execution Service:** Real sandboxed container sessions with live filesystem state changes, TTL auto-cleanup, and in-browser interactive terminal.
- **Server-Side Automated State Grader:** Verifies the actual octal file permissions and modified assets inside active lab environments.
- **Student Dashboard & Cryptographic Certificates:** Real-time XP tracking, rank progression (Apprentice to Principal Operative), badge gallery, and verifiable completion certificates signed by SidoDev-Dz.
- **Instructor Operations Portal:** Create cohort assignments, track student progress analytics, and review incident reports with custom scoring.
- **Root Admin Center:** User lifecycle management (suspend/promote), mission authoring studio, live lab monitor (force-kill container sessions), immutable security audit logs, maintenance mode toggle, and 1-click CSV exports.
- **Zero Mock Fallbacks:** Persistent storage, transactional XP awards, and duplicate-submission defenses.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v20.x or v22.x LTS
- **npm** v10+

### 2. Install & Start
```bash
# Clone the repository
git clone https://github.com/RogueByteOfficial/roguebyte-cyber-lab.git
cd roguebyte-cyber-lab

# Install dependencies
npm install

# Start development full-stack server
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 🔑 Default Development Accounts

For instant evaluation, the platform includes pre-configured development roles (accessible via the **Demo Logins** button in the header):

| Role | Username | Email | Password |
|---|---|---|---|
| **Root Administrator** | `SidoDev-Dz` | `admin@roguebyte.local` | `AdminSidoDev2026!` |
| **Cyber Instructor** | `Instructor_Malik` | `instructor@roguebyte.local` | `InstructorPass2026!` |
| **Cadet Student** | `Cadet_Alex` | `student@roguebyte.local` | `StudentPass2026!` |

---

## 🐳 Docker Production Deployment

Run with Docker Compose and PostgreSQL:

```bash
docker compose up -d --build
```

Health check verification:
```bash
curl http://localhost:3000/api/health
```

---

## 📁 Repository Structure

```
├── docs/                   # Complete architecture, security, and setup manuals
│   ├── architecture.md
│   ├── installation.md
│   ├── security.md
│   ├── missions.md
│   ├── operations.md
│   ├── troubleshooting.md
│   └── github-deployment.md
├── prisma/
│   └── schema.prisma       # Full normalized database schema
├── scripts/
│   ├── setup.sh            # Linux / WSL2 automated setup script
│   └── setup.ps1           # Windows PowerShell setup script
├── src/
│   ├── client/             # React 19 Frontend components & context
│   │   ├── components/     # Terminals, dashboards, modals, catalogue
│   │   ├── context/        # Auth & i18n context
│   │   └── i18n.ts         # English & Arabic bilingual dictionary
│   ├── server/             # Express 4.x REST API & Lab execution engine
│   │   ├── db/             # Persistence engine & initial 16 missions seed
│   │   ├── lab/            # Isolated lab sandbox manager & state grader
│   │   └── routes/         # Versioned API routes (auth, missions, labs, admin)
│   └── shared/             # Shared TypeScript models and interfaces
├── server.ts               # Full-stack server entry point (Express + Vite)
├── docker-compose.yml      # Multi-container production deployment configuration
├── Dockerfile              # Multi-stage production container build
└── README.md
```

---

## ⚖️ Responsible Use & Ethical Hacking Agreement

This software is strictly engineered for authorized educational, defensive training, and security research purposes. Never deploy against systems without explicit written consent.

---

## 👨‍💻 Creator & Community

- **Project Lead & Architect:** **SidoDev-Dz**
- **Sponsorship & Donations:** [https://ko-fi.com/roguebyte](https://ko-fi.com/roguebyte)
- **GitHub:** [https://github.com/RogueByteOfficial](https://github.com/RogueByteOfficial)
