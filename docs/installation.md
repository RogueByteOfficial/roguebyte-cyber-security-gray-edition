# RogueByte Cyber Lab — Installation & Setup Guide
**Creator:** SidoDev-Dz  
**Platform:** RogueByte Cyber Lab (Black Gray Edition v1)

---

## 1. System Prerequisites

The platform is engineered for immediate local execution on:
- **Operating Systems:** Windows 10/11 (with WSL2 or PowerShell), Linux (Ubuntu 20.04+), macOS.
- **Node.js:** v20.x or v22.x LTS.
- **Package Manager:** npm v10+.
- **Docker (Optional for Container Orchestration):** Docker Engine 24+ and Docker Compose v2.

---

## 2. Quick Local Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/RogueByteOfficial/roguebyte-cyber-lab.git
cd roguebyte-cyber-lab
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` if custom parameters are required:
```bash
cp .env.example .env
```

Default runtime values:
- `PORT=3000`
- `NODE_ENV=development`
- `JWT_SECRET=roguebyte_master_signing_key_sidodev_2026_isolated_sec`

### Step 4: Launch Development Server
```bash
npm run dev
```

Navigate your browser to:
```
http://localhost:3000
```

---

## 3. Docker Compose Production Deployment

To run the complete platform with PostgreSQL in Docker containers:

```bash
docker compose up -d --build
```

Verify service status:
```bash
docker compose ps
```

Health check verification:
```bash
curl http://localhost:3000/api/health
```

---

## 4. Default Seed Accounts

The platform automatically bootstraps initial training accounts on first launch:

| Role | Email Identifier | Initial Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@roguebyte.local` | `AdminSidoDev2026!` | Full Admin Center & Root Telemetry |
| **Instructor** | `instructor@roguebyte.local` | `InstructorPass2026!` | Cohort Assignments & Manual Reviews |
| **Student** | `student@roguebyte.local` | `StudentPass2026!` | Missions, Labs, Terminal & Certs |

*Note: For production deployments, change these passwords immediately via the Admin Center or reset scripts.*
