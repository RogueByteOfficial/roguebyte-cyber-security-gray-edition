# RogueByte Cyber Lab — Troubleshooting Guide
**Creator:** SidoDev-Dz

---

## Common Issues & Resolutions

### 1. Port 3000 Conflict
**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`  
**Solution:** Specify an alternate port via the `PORT` environment variable:
```bash
PORT=3005 npm run dev
```

### 2. Lab Session Expired
**Symptom:** Terminal displays `[FATAL] Lab session has expired. Please launch a new session.`  
**Cause:** Student exceeded the maximum time limit (default: 30 minutes).  
**Solution:** Click "Launch Isolated Lab Session" in the mission workspace to start a fresh environment.

### 3. State-Grading Fails on Permission Remediation
**Symptom:** `[AUDIT FAILED] /etc/shadow is still insecure (current permission: 0644, expected 0640 or 0600)`.  
**Solution:** Run the hardening command in the terminal before triggering validation:
```bash
chmod 0640 /etc/shadow
chmod 0640 /var/www/html/config.php
```

### 4. Admin Account Password Reset
If the administrator password is lost, you can reset it by editing `data/roguebyte_db.json` or invoking the reseed command.
